#!/bin/zsh
# cow box: run as threads on the always-on server so they show in the office.
export OPENCODE_SERVER_USERNAME=${COW_SERVER_USERNAME:-cow}
export OPENCODE_SERVER_PASSWORD=$(head -1 $HOME/.config/opencode/server-password)
source "$HOME/bin/cow-routine-guard.sh"
set -euo pipefail

# dev.bronson.eod-review — launchd-driven nightly end-of-day review.
# Runs the eod-review skill via headless opencode, pinned to GLM 5.3 at medium reasoning on the
# plain Cloudflare Workers AI provider. Fires at 22:00, Mon-Fri (see the
# plist's StartCalendarInterval; the guards below are defense in depth,
# including launchd wake catch-up until midnight).

dow=$(date +%u)
hour=$(( 10#$(date +%H) ))
[[ $dow -ge 6 ]] && { routine_skip "weekend: outside the eod-review window"; exit 0; }
(( hour < 22 )) && { routine_skip "outside the eod-review window (22:00-23:59 PT)"; exit 0; }

# Fire-time date: a wake catch-up at 23:xx still reviews the intended day.
TARGET_DATE=$(date +%F)

LOG_DIR="${HOME}/.coval/logs"
REPORT_DIR="${LOG_DIR}/eod-review"
LOG_FILE="${LOG_DIR}/eod-review.log"
mkdir -p "${LOG_DIR}" "${REPORT_DIR}"

LOCK="${LOG_DIR}/eod-review.lock"
if ! mkdir "${LOCK}" 2>/dev/null; then
  echo "$(date -Iseconds): previous run still in progress, skipping" >> "${LOG_FILE}"
  routine_skip "previous eod-review run still in progress, skipping"
  exit 0
fi
trap 'rmdir "${LOCK}" 2>/dev/null' EXIT

# Once-daily: a merge-queue agent can hold the shared LLM lock at 22:00.
# Wait it out (bounded) instead of losing the day's review.
acquired=""
for _ in 1 2 3 4 5 6; do
  if routine_acquire "eod-review"; then acquired=1; break; fi
  sleep 300
done
if [[ -n "${acquired}" ]]; then
  # clear any "skipped" a failed attempt wrote before we got the lock
  if [[ -n "${COW_ROUTINE_STATUS_FILE:-}" ]]; then : > "${COW_ROUTINE_STATUS_FILE}"; fi
else
  routine_skip "LLM lock busy for 30 minutes, skipping eod-review"
  exit 0
fi

# The eod-review skill's Linear query needs this; launchd does not source .zshrc.
if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  linear_key=$(grep -m1 '^export LINEAR_API_KEY=' "$HOME/.zshrc" 2>/dev/null | cut -d'"' -f2 || true)
  if [[ -n "${linear_key}" ]]; then export LINEAR_API_KEY="${linear_key}"; fi
fi

stamp=$(date +%Y%m%dT%H%M%S)
report="${REPORT_DIR}/${stamp}.log"
title="routine: eod-review $(date +%Y-%m-%dT%H:%M)"

rc=0
runner_pid=""
cd /Users/bronson/coval
NO_COLOR=1 /Users/bronson/.opencode/bin/opencode run --auto --attach http://127.0.0.1:4096 \
  --title "${title}" \
  -m cloudflare-workers-ai/@cf/zai-org/glm-5.3 --variant medium \
  "You are the eod-review scheduled runner (a launchd-driven headless opencode session) on Callum's box, firing at 22:00 PT on weeknights. Working directory /Users/bronson/coval — a multi-repo container, NOT a git repo; the review spans the whole home directory. Target date: ${TARGET_DATE} (resolved at fire time, so a sleep catch-up still reviews the intended day). Display all times in PST/PDT, never UTC.

First flush any queued daily-capture writes so the note is current before you cross-reference: python3 /Users/bronson/.claude/skills/add-note/scripts/daily_capture.py --flush

Then read /Users/bronson/.claude/skills/eod-review/SKILL.md — it is the single source of truth for which sources to check, the gap rules, Callum's entry voice, and formatting — and run the full end-of-day review for ${TARGET_DATE} exactly as it specifies.

Headless adaptations, which override the skill's interactive bits:
- Phase 4c stands: always write the gap entries into #dailyMinutes without asking; never modify or remove existing entries.
- Phase 4d has no user to offer to: when the full picture shows significant gaps in the cow2 bullets, update them in the note per the skill's rules and print the Slack paste-ready block (updated cow2 + existing cow3) in your report for Callum to copy manually.
- Never send anything to Slack, never DM, never edit or delete messages — every send needs Callum's exact-message approval, which an unattended run cannot get.
- If the daily note for ${TARGET_DATE} does not exist, create it via the add-note skill's writer (python3 /Users/bronson/.claude/skills/add-note/scripts/daily_capture.py), then continue the review.
- If a source errors, state plainly what could not be checked and continue with the other sources (LINEAR_API_KEY is already exported for you); never fabricate activity and never debug the environment or tooling.
- If the review changed durable project state, decisions, or open loops, run or follow vault-memory-curate as the skill directs.

Finish by printing the skill's Phase 4a gaps report, then one standalone line starting with EOD_REVIEW_COMPLETE followed by the current ISO-8601 local timestamp, e.g. EOD_REVIEW_COMPLETE ${TARGET_DATE}T22:41:00-0700. Nothing else on that line." > "${report}" 2>&1 &
runner_pid=$!
runner_started=$SECONDS

while kill -0 "${runner_pid}" 2>/dev/null; do
  if (( SECONDS - runner_started >= 3600 )); then
    echo "$(date -Iseconds): eod-review exceeded 60 minutes; terminating" >> "${LOG_FILE}"
    kill -TERM "${runner_pid}" 2>/dev/null || true
    sleep 5
    kill -KILL "${runner_pid}" 2>/dev/null || true
    rc=124
    break
  fi
  sleep 10
done
if (( rc == 0 )); then
  wait "${runner_pid}" || rc=$?
fi
runner_pid=""
routine_append_final "${title}" "${report}"   # the client can drop the closing message

# No completion line means the review is INCOMPLETE, whatever the runner's own
# exit code was — surface that to launchd instead of a false rc 0.
if ! grep -q '^EOD_REVIEW_COMPLETE' "${report}"; then
  if (( rc == 0 )); then
    rc=3
  fi
fi

{
  echo "=== $(date -Iseconds) ==="
  if grep -q '^EOD_REVIEW_COMPLETE' "${report}"; then
    echo "EOD review completed cleanly."
  elif (( rc == 124 )); then
    echo "EOD review TIMED OUT after 60 minutes."
  else
    echo "EOD review INCOMPLETE (no completion line); exit ${rc}."
  fi
  echo "Report: ${report}"
} >> "${LOG_FILE}"

routine_finish "routine: eod-review"
exit "${rc}"
