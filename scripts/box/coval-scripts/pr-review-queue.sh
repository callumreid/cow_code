#!/bin/zsh
# cow box: run as threads on the always-on server so they show in the office.
export OPENCODE_SERVER_USERNAME=${COW_SERVER_USERNAME:-cow}
export OPENCODE_SERVER_PASSWORD=$(head -1 $HOME/.config/opencode/server-password)
source "$HOME/bin/cow-routine-guard.sh"
routine_acquire "pr-review-queue" || exit 0
set -euo pipefail

mode=${1:-run}
if [[ "${mode}" != "run" && "${mode}" != "--dry-run" ]]; then
  echo "usage: $0 [--dry-run]" >&2
  exit 2
fi

dow=$(date +%u)
hour=$(( 10#$(date +%H) ))
minute=$(( 10#$(date +%M) ))
[[ $dow -ge 6 ]] && exit 0
(( hour < 8 )) && exit 0
(( hour > 18 )) && exit 0
(( hour == 18 && minute > 0 )) && exit 0

LOG_DIR="${HOME}/.coval/logs"
STATE_DIR="${HOME}/.coval/pr-review-queue"
REPORT_DIR="${STATE_DIR}/reports"
LOG_FILE="${LOG_DIR}/pr-review-queue.log"
STATE_FILE="${STATE_DIR}/reviewed-heads.tsv"
LOCK="${STATE_DIR}/lock"
QUEUE_SCRIPT="/Users/bronson/.claude/skills/review-queue/scripts/find-queue.sh"

mkdir -p "${LOG_DIR}" "${REPORT_DIR}"
touch "${STATE_FILE}"

if ! mkdir "${LOCK}" 2>/dev/null; then
  previous_pid=""
  [[ -f "${LOCK}/pid" ]] && previous_pid=$(<"${LOCK}/pid")
  if [[ -n "${previous_pid}" ]] && kill -0 "${previous_pid}" 2>/dev/null; then
    echo "$(date -Iseconds): previous review-queue run still in progress, skipping" >> "${LOG_FILE}"
    exit 0
  fi
  rm -f "${LOCK}/pid"
  rmdir "${LOCK}" 2>/dev/null || {
    echo "$(date -Iseconds): could not reclaim stale review-queue lock" >> "${LOG_FILE}"
    exit 1
  }
  mkdir "${LOCK}"
fi
printf '%s\n' "$$" > "${LOCK}/pid"

for stale_file in "${STATE_DIR}"/queue.*(N) "${STATE_DIR}"/pending.*(N); do
  rm -f "${stale_file}"
done

queue_file=$(mktemp "${STATE_DIR}/queue.XXXXXX")
pending_file=$(mktemp "${STATE_DIR}/pending.XXXXXX")
runner_pid=""
cleanup() {
  if [[ -n "${runner_pid}" ]] && kill -0 "${runner_pid}" 2>/dev/null; then
    kill -TERM "${runner_pid}" 2>/dev/null || true
    sleep 1
    kill -KILL "${runner_pid}" 2>/dev/null || true
  fi
  rm -f "${queue_file}" "${pending_file}" "${LOCK}/pid"
  rmdir "${LOCK}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if ! "${QUEUE_SCRIPT}" > "${queue_file}" 2>> "${LOG_FILE}"; then
  echo "$(date -Iseconds): review-queue discovery failed" >> "${LOG_FILE}"
  exit 1
fi

current_count=0
actionable_count=0
while IFS=$'\t' read -r repo number state author request_kind commit_time last_review review_state classification unresolved title; do
  [[ -z "${repo}" ]] && continue
  if [[ "${classification}" == "CURRENT" ]]; then
    (( current_count += 1 ))
    continue
  fi

  (( actionable_count += 1 ))
  head_sha=$(gh pr view "${number}" --repo "coval-ai/${repo}" --json headRefOid --jq .headRefOid)
  signature="${repo}"$'\t'"${number}"$'\t'"${head_sha}"$'\t'"${classification}"
  if ! grep -Fqx "${signature}" "${STATE_FILE}"; then
    printf '%s\t%s\n' "${signature}" "${title}" >> "${pending_file}"
  fi
done < "${queue_file}"

pending_count=$(wc -l < "${pending_file}" | tr -d ' ')
{
  echo "=== $(date -Iseconds) ==="
  echo "Queue: ${actionable_count} actionable, ${current_count} current, ${pending_count} unseen heads/re-requests"
} >> "${LOG_FILE}"

if (( pending_count == 0 )); then
  exit 0
fi

if [[ "${mode}" == "--dry-run" ]]; then
  cat "${pending_file}"
  exit 0
fi

stamp=$(date +%Y%m%dT%H%M%S)
report="${REPORT_DIR}/${stamp}.log"
pending=$(cat "${pending_file}")

NO_COLOR=1 /Users/bronson/.opencode/bin/opencode run --auto --attach http://127.0.0.1:4096 \
  --title "routine: pr-review-queue $(date +%Y-%m-%dT%H:%M)" "
Run the review queue against exactly these pending PR heads:

${pending}

Each row is repo, PR number, exact head SHA, queue classification, and title. Read and follow:
- /Users/bronson/.claude/skills/review-queue/SKILL.md
- /Users/bronson/.agents/skills/review-pr/SKILL.md

Group related PRs before dispatching and cap concurrency at six. Use a separate temporary git worktree per PR from its exact listed head, fetch fresh origin/main for comparison, and remove every worktree at the end. Do not edit code, commit, push, resolve threads, merge, or enable auto-merge. Verify every finding against current code and anchor it to a changed line. Keep a dispatch ledger and report only agent results that actually returned.

Publish each completed review using /Users/bronson/.agents/skills/review-pr/scripts/post-inline-review.py. Always run its --dry-run first and fix every invalid anchor before the real post. Put code findings inline, not in a wall of body text. Submit APPROVE when there is no definite blocking bug or issue; P3-only nits belong inline on an approval. Submit REQUEST_CHANGES when there is a definite P0, P1, or blocking P2 defect. Do not use COMMENT as the final event. Re-read the stored review and comments after posting. For coval-infra, remember that APPROVE can trigger Atlantis apply and merge: approve only when the exact-head review is clean under this same rule, and never run Atlantis or merge directly.

Return a concise per-PR report containing exact head SHA, verdict, findings, verified-clean areas, checks run, and residual uncertainty. If a listed head moved, report it as stale and do not review or mark the replacement. Immediately after successfully reading back each posted review, print a standalone completion line in this exact format, using the row's values:

REVIEW_QUEUE_POSTED repo number head_sha classification

At the very end, and only if every listed PR returned a complete posted review for its exact listed head, print this exact standalone line:

REVIEW_QUEUE_COMPLETE ${pending_count}
" > "${report}" 2>&1 &
runner_pid=$!
runner_started=$SECONDS
status=0
while kill -0 "${runner_pid}" 2>/dev/null; do
  if (( SECONDS - runner_started >= 2700 )); then
    echo "Review runner exceeded 45 minutes; terminating it." >> "${LOG_FILE}"
    kill -TERM "${runner_pid}" 2>/dev/null || true
    sleep 5
    kill -KILL "${runner_pid}" 2>/dev/null || true
    status=124
    break
  fi
  sleep 10
done
if (( status == 0 )); then
  if wait "${runner_pid}"; then
    status=0
  else
    status=$?
  fi
else
  wait "${runner_pid}" 2>/dev/null || true
fi
runner_pid=""
cat "${report}" >> "${LOG_FILE}"

posted_count=0
while IFS=$'\t' read -r repo number head_sha classification title; do
  if grep -Fqx "REVIEW_QUEUE_POSTED ${repo} ${number} ${head_sha} ${classification}" "${report}"; then
    printf '%s\t%s\t%s\t%s\n' "${repo}" "${number}" "${head_sha}" "${classification}" >> "${STATE_FILE}"
    (( posted_count += 1 ))
  fi
done < "${pending_file}"

echo "Saved report to ${report}; marked ${posted_count}/${pending_count} exact heads posted." >> "${LOG_FILE}"

if (( status != 0 )); then
  echo "Review runner failed with status ${run_status}." >> "${LOG_FILE}"
  exit "${run_status}"
fi
if (( posted_count != pending_count )) || ! grep -Fqx "REVIEW_QUEUE_COMPLETE ${pending_count}" "${report}"; then
  echo "Review runner did not confirm all ${pending_count} posted reviews." >> "${LOG_FILE}"
  exit 1
fi
routine_finish "routine: pr-review-queue"
