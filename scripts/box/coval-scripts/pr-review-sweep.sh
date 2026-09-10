#!/bin/zsh
# cow box: run as threads on the always-on server so they show in the office.
export OPENCODE_SERVER_USERNAME=${COW_SERVER_USERNAME:-cow}
export OPENCODE_SERVER_PASSWORD=$(head -1 $HOME/.config/opencode/server-password)
source "$HOME/bin/cow-routine-guard.sh"
routine_acquire "pr-review-sweep" || exit 0
set -euo pipefail

# dev.coval.pr-review-sweep — launchd-driven full PR review sweep.
# Runs the authoritative pr-review-sweep procedure via headless opencode,
# pinned to GLM 5.3 on the Cloudflare provider. Fires at :09 and :39,
# 08:00-17:59 PT, weekdays (see the plist's StartCalendarInterval; the
# guards below are defense in depth, including launchd wake catch-up).

dow=$(date +%u)
hour=$(( 10#$(date +%H) ))
minute=$(( 10#$(date +%M) ))
[[ $dow -ge 6 ]] && exit 0
(( hour < 8 )) && exit 0
(( hour > 17 )) && exit 0

LOG_DIR="${HOME}/.coval/logs"
STATE_DIR="${HOME}/.coval/pr-review-sweep"
REPORT_DIR="${STATE_DIR}/reports"
LOG_FILE="${LOG_DIR}/pr-review-sweep.log"
LOCK="${STATE_DIR}/lock"

mkdir -p "${LOG_DIR}" "${REPORT_DIR}"

if ! mkdir "${LOCK}" 2>/dev/null; then
  previous_pid=""
  [[ -f "${LOCK}/pid" ]] && previous_pid=$(<"${LOCK}/pid")
  if [[ -n "${previous_pid}" ]] && kill -0 "${previous_pid}" 2>/dev/null; then
    echo "$(date -Iseconds): previous sweep still in progress, skipping this slot" >> "${LOG_FILE}"
    exit 0
  fi
  rm -f "${LOCK}/pid"
  rmdir "${LOCK}" 2>/dev/null || {
    echo "$(date -Iseconds): could not reclaim stale sweep lock" >> "${LOG_FILE}"
    exit 1
  }
  mkdir "${LOCK}"
fi
printf '%s\n' "$$" > "${LOCK}/pid"

runner_pid=""
cleanup() {
  if [[ -n "${runner_pid}" ]] && kill -0 "${runner_pid}" 2>/dev/null; then
    kill -TERM "${runner_pid}" 2>/dev/null || true
    sleep 5
    kill -KILL "${runner_pid}" 2>/dev/null || true
  fi
  rm -f "${LOCK}/pid"
  rmdir "${LOCK}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

stamp=$(date +%Y%m%dT%H%M%S)
report="${REPORT_DIR}/${stamp}.log"

rc=0
NO_COLOR=1 /Users/bronson/.opencode/bin/opencode run --auto --attach http://127.0.0.1:4096 \
  --title "routine: pr-review-sweep $(date +%Y-%m-%dT%H:%M)" \
  -m chatgpt/gpt-5.5 \
  "You are the pr-review-sweep scheduled runner (a launchd-driven headless opencode session). Working directory /Users/bronson/coval — a multi-repo container, NOT a git repo; always git -C <repo>. GitHub login callumreid, org coval-ai. Display all times in PST/PDT, never UTC.

Read, in this order, before doing anything:
1. /Users/bronson/personal/Bronniopollis/agent/retirements.md — negative memory; it OVERRIDES older notes. Read the pr-review-two-dot-diff-scoping entry (its SKILL.md fix has landed; the scoping rules in it remain binding).
2. /Users/bronson/.claude/scheduled-tasks/pr-review-sweep/SKILL.md — the authoritative procedure. Note: this is an opencode run under launchd, NOT a Claude scheduled task — skip any step about confirming or enabling the task via mcp__scheduled-tasks__*; the schedule is launchd's business.
3. /Users/bronson/.claude/skills/review-queue/SKILL.md and /Users/bronson/.agents/skills/review-pr/SKILL.md — every rule applies except the two the sweep SKILL.md explicitly overrides.
4. /Users/bronson/personal/Bronniopollis/agent/reference-pr-sweep-queue-discovery-and-concurrency-2026-09-02.md — queue-discovery lag and concurrent-approval traps.

Then run the sweep per the SKILL.md: build the queue from EVERY source that SKILL.md lists. It is the single source of truth for how many sources there are and what each covers — enumerate them from it, never from memory and never from this prompt, which has drifted behind it twice. Two things in it are easy to miss and both are load-bearing. (a) Source 5, added 2026-09-09: PRs callumreid has ALREADY reviewed whose head has moved since — classification NEW-WORK, discovered because find-queue.sh now unions --reviewed-by with --review-requested. Submitting a review makes GitHub clear you from requested_reviewers, so before this a PR left the queue permanently the moment it was reviewed and no re-review could ever be discovered. Those rows carry request-kind '-' precisely BECAUSE the review consumed the request, so do NOT drop them when you apply Source 1's direct-only filter — that is the exact bug Source 5 exists to close. (b) jakelevi is excluded from the un-tagged sources: review one of his PRs only when callumreid is currently in requested_reviewers. Dedupe by repo#number, and act only on genuinely new heads. Skip any PR with an approval standing at its current head, whatever the approval's source — compare commit_id, never timestamps, and re-check immediately before every post. Dispatch read-only review agents (cap ~6 concurrent, group stacked PRs into one agent), and post per the verdict policy: lean APPROVE, REQUEST_CHANGES only for a confirmed P0/P1 read in the code with a concrete failure scenario. Always run post-inline-review.py with --dry-run first; after any posting error, read the review list back before retrying. Append one TSV row per PR acted on to /Users/bronson/.claude/scheduled-tasks/pr-review-sweep/sweep-log.tsv and remove every worktree you create.

Hard limits: never merge, never enable auto-merge, never push or commit a fix, never run atlantis plan/apply, never review a PR authored by callumreid. The hourly dev.coval.pr-review-queue job also posts reviews for direct requests: if reviews posted by callumreid in the last 45 minutes carry structured bodies (another automated session at work), treat those PRs as held by that session and skip them. If the queue is empty after the discovery genuinely ran (an empty or errored discovery is never evidence — confirm the script exited 0 and GraphQL was healthy or REST was used), print the completion line and stop.

Discovery is MECHANICAL and bounded: build the queue from head/draft/reviews/requested/commit_id/updated_at reads only — do NOT read PR bodies, bot comments, or diffs during queue build (that is the review agents' job, not yours); aim to dispatch wave 1 within the first 15 minutes of the run. Do not debug the environment or investigate tooling: if opencode or a tool misbehaves, state it plainly and exit — the wrapper reports failures; environment debugging is how the 16:09 run lost its whole budget.

Run in waves of at most 6 agents, and POST each completed wave before dispatching the next: when a wave's agents return, validate their findings' anchors with post-inline-review.py --dry-run, re-check each PR's head and existing reviews immediately before posting, post, read back what posted, append sweep-log.tsv rows for PRs acted on, and remove that wave's worktrees — only then may the next wave dispatch. Composed reviews never wait in memory behind another dispatch: a session that dies after wave 1 must still leave wave 1 posted on GitHub. Wave ordering: source-4-only PRs (engineering-requested, standing >=1h, covered by no other source) go in the FIRST wave, before any other source's PRs; the run may never finish, defer, or print its completion line with a source-4-only candidate still unreviewed — if runtime pressure forces triage, defer from the other sources, never from source 4. Bound the run at 12 PRs across at most 2 waves (the cap never truncates source 4); log every deferred PR explicitly as deferred-for-next-slot in the report — no sweep-log row, the next 30-minute slot picks it up. Keep agent briefs tight and require findings-only reports; the session budget is finite and anything not yet posted when the session dies is lost. Print the completion line only when every dispatched PR has been posted or explicitly resolved (stale-head, already-approved-at-head, or held-by-another-session skip) AND no source-4-only candidate remains unreviewed; if anything is unresolved, state plainly what — never print a false completion.

When finished, print one standalone line that starts with PR_REVIEW_SWEEP_COMPLETE followed by the current ISO-8601 local timestamp, e.g. PR_REVIEW_SWEEP_COMPLETE 2026-09-08T10:45:00-0700. Nothing else on that line.
" > "${report}" 2>&1 &
runner_pid=$!
runner_started=$SECONDS

while kill -0 "${runner_pid}" 2>/dev/null; do
  if (( SECONDS - runner_started >= 5400 )); then
    echo "$(date -Iseconds): sweep exceeded 90 minutes; terminating" >> "${LOG_FILE}"
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

# No completion line means the sweep is INCOMPLETE, whatever the runner's own
# exit code was — surface that to launchd instead of a false rc 0.
if ! grep -q '^PR_REVIEW_SWEEP_COMPLETE' "${report}"; then
  if (( rc == 0 )); then
    rc=3
  fi
fi

{
  echo "=== $(date -Iseconds) ==="
  if grep -q '^PR_REVIEW_SWEEP_COMPLETE' "${report}"; then
    echo "Sweep completed cleanly."
  elif (( rc == 124 )); then
    echo "Sweep TIMED OUT after 90 minutes."
  else
    echo "Sweep INCOMPLETE (no completion line); exit ${rc}."
  fi
  echo "Report: ${report}"
} >> "${LOG_FILE}"

routine_finish "routine: pr-review-sweep"
exit "${rc}"
