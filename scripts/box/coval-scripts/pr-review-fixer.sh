#!/bin/zsh
# cow box: run as threads on the always-on server so they show in the office.
#
# dev.coval.pr-review-fixer — fixes review comments on Callum's open PRs. Every unresolved review
# thread that a reviewer (bot OR coworker) opened and Callum has not answered yet gets triaged, fixed
# where valid, replied to with evidence, resolved, and the reviewers who requested changes get their
# review re-requested. One opencode session per PR, run in parallel (COW_FIXER_MAX_PARALLEL, default 4),
# pinned to GLM 5.3 at medium reasoning effort. Fires every :00/:30, 08:00-18:00 PT, weekdays.
#
# The fixer holds its own lock instead of the shared LLM-routine lock: the 90-minute review sweep used
# to starve it (5 of 6 slots skipped on 2026-09-16), and the two never touch the same PRs — the sweep
# never reviews Callum's PRs, the fixer only works on them.
export OPENCODE_SERVER_USERNAME=${COW_SERVER_USERNAME:-cow}
export OPENCODE_SERVER_PASSWORD=$(head -1 $HOME/.config/opencode/server-password)
source "$HOME/bin/cow-routine-guard.sh"   # routine_skip / routine_finish only; no routine_acquire (see above)
set -euo pipefail

dow=$(date +%u)
hour=$(( 10#$(date +%H) ))
minute=$(( 10#$(date +%M) ))
[[ $dow -ge 6 ]] && { routine_skip "weekend: outside the fixer window"; exit 0; }
(( hour < 8 || hour > 18 || (hour == 18 && minute > 0) )) && { routine_skip "outside the fixer window (08:00-18:00 PT)"; exit 0; }

ME=callumreid
ORG=coval-ai
MODEL=cloudflare-workers-ai/@cf/zai-org/glm-5.3
VARIANT=medium
MAX_PARALLEL=${COW_FIXER_MAX_PARALLEL:-4}
PER_PR_TIMEOUT=${COW_FIXER_PR_TIMEOUT:-2700}   # seconds; one PR's session is killed past this
OPENCODE=/Users/bronson/.opencode/bin/opencode
SKILL=/Users/bronson/.claude/skills/fix-review-comments/SKILL.md

LOG_DIR="${HOME}/.coval/logs"
STATE_DIR="${HOME}/.coval/pr-review-fixer"
REPORT_DIR="${STATE_DIR}/reports"
LOG_FILE="${LOG_DIR}/pr-review-fixer.log"
LOCK="${LOG_DIR}/pr-review-fixer.lock"
mkdir -p "${LOG_DIR}" "${REPORT_DIR}"

if ! mkdir "${LOCK}" 2>/dev/null; then
  previous_pid=""
  [[ -f "${LOCK}/pid" ]] && previous_pid=$(<"${LOCK}/pid")
  if [[ -n "${previous_pid}" ]] && kill -0 "${previous_pid}" 2>/dev/null; then
    echo "$(date -Iseconds): previous fixer run still in progress, skipping" >> "${LOG_FILE}"
    routine_skip "previous fixer run still in progress, skipping"
    exit 0
  fi
  rm -f "${LOCK}/pid"
  rmdir "${LOCK}" 2>/dev/null || { echo "$(date -Iseconds): could not reclaim stale fixer lock" >> "${LOG_FILE}"; exit 1; }
  mkdir "${LOCK}"
fi
printf '%s\n' "$$" > "${LOCK}/pid"

typeset -A running_pid running_start running_report
cleanup() {
  local key pid
  for key in ${(k)running_pid}; do
    pid=${running_pid[$key]}
    if kill -0 "${pid}" 2>/dev/null; then
      kill -TERM "${pid}" 2>/dev/null || true
      sleep 2
      kill -KILL "${pid}" 2>/dev/null || true
    fi
  done
  rm -f "${LOCK}/pid"
  rmdir "${LOCK}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# GitHub's PR search ignores archived:false, so ask each repo once per run.
__archived_list=""
repo_is_archived() {  # usage: repo_is_archived <name>  -> exit 0 when archived
  local r="$1" v
  case " $__archived_list " in
    *" $r=true "*) return 0 ;;
    *" $r=false "*) return 1 ;;
  esac
  v=$(gh repo view "${ORG}/$r" --json isArchived --jq .isArchived 2>/dev/null || echo false)
  __archived_list="$__archived_list $r=$v"
  [ "$v" = "true" ]
}

prs=$(gh search prs --author="${ME}" --state=open --owner="${ORG}" --archived=false --limit 100 \
  --json repository,number --jq '.[] | "\(.repository.name) \(.number)"')

# A thread needs the fixer when it is unresolved, somebody other than Callum opened it (review bot or
# coworker alike), and Callum has not answered it yet (last comment is not his).
flagged=()
while IFS= read -r line; do
  [[ -z "${line}" ]] && continue
  repo=${line%% *}
  number=${line##* }
  repo_is_archived "${repo}" && continue
  if gh pr view "${number}" -R "${ORG}/${repo}" --json labels --jq '.labels[].name' 2>/dev/null | grep -q '^cow:no-autofix$'; then continue; fi
  count=$(gh api graphql -f query='
  query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$number) {
        reviewThreads(first:100) {
          nodes {
            isResolved
            comments(first:50) { nodes { author { login } } }
          }
        }
      }
    }
  }' -F owner="${ORG}" -F repo="${repo}" -F number="${number}" \
    --jq "[.data.repository.pullRequest.reviewThreads.nodes[]
           | select(.isResolved == false)
           | select((.comments.nodes | length) > 0)
           | select((.comments.nodes[0].author.login // \"\") != \"${ME}\")
           | select((.comments.nodes[-1].author.login // \"\") != \"${ME}\")]
          | length" 2>/dev/null || echo 0)
  if [[ "${count}" -gt 0 ]]; then
    flagged+=("${repo} ${number} ${count}")
  fi
done <<< "${prs}"

echo "=== $(date -Iseconds) ===" >> "${LOG_FILE}"
if (( ${#flagged[@]} == 0 )); then
  echo "No unanswered review comments on open PRs. Nothing to do." | tee -a "${LOG_FILE}"
  exit 0
fi
echo "Flagged PRs (${#flagged[@]}), up to ${MAX_PARALLEL} in parallel: ${(j:, :)flagged}" >> "${LOG_FILE}"

stamp=$(date +%Y%m%dT%H%M%S)

launch_one() {  # usage: launch_one <repo> <number> <count>  -> starts one opencode session in the background
  local repo="$1" number="$2" count="$3" pid
  local key="${repo}#${number}"
  local report="${REPORT_DIR}/${stamp}-${repo}-${number}.log"
  (
    cd /Users/bronson/coval
    NO_COLOR=1 "${OPENCODE}" run --auto --attach http://127.0.0.1:4096 \
      -m "${MODEL}" --variant "${VARIANT}" \
      --title "routine: pr-review-fixer ${key} $(date +%Y-%m-%dT%H:%M)" "
Apply my fix-review-comments skill at ${SKILL} to exactly ONE pull request: ${ORG}/${repo} #${number} (https://github.com/${ORG}/${repo}/pull/${number}). It currently has ${count} unresolved review thread(s) that nobody has answered. Other PRs are being handled by sibling sessions — do not touch any other PR.

Follow the skill end to end for this PR. The non-negotiable parts:
1. FIRST record the re-request list: every human reviewer whose latest review on the PR is CHANGES_REQUESTED (dedupe by login, skip bots). Capture it before any fix lands.
2. Gather every UNRESOLVED review thread whose first comment is not by ${ME} and whose last comment is not by ${ME}. Review-bot threads AND coworker threads alike — a coworker's comment gets exactly the same triage and fix as a bot's.
3. Set up a fresh git worktree from the PR head branch (repo checkouts live in /Users/bronson/coval/<repo>; their working trees may be dirty — never commit there). Triage every comment against the actual current code, apply minimal fixes for the valid ones, run only the affected tests plus the repo's linter, commit with the PR's [COVAL-XXXX] prefix, push to the PR branch, and verify the remote branch head is your fix commit before replying.
4. Reply to every thread through the REST replies API with evidence (the commit hash for fixes). Then RESOLVE the thread (resolveReviewThread with the thread's GraphQL node id) for every comment you fixed, showed already fixed, or rejected as a bot false positive, and read isResolved back to confirm. The only threads left open are a coworker's you disagree with and comments you skipped as too large or risky — reply explaining, and flag them in your report.
5. After the fixes are pushed and every reply is posted, re-request review from every login on the re-request list (POST pulls/${number}/requested_reviewers), then read requested_reviewers back and report the exact logins. Never request anyone who is not on that list; if the list is empty say so.
6. Remove the worktree and any temporary branch.

Do not merge, do not enable auto-merge, do not promote the draft state, do not debug the environment — if a tool misbehaves, state it plainly and stop. End with a summary table (comment, author, file, triage, action, commit hash, resolved yes/no) plus the re-requested reviewer logins."
  ) > "${report}" 2>&1 &
  # zsh 5.9 leaves `assoc[$key]=$!` as the literal text "$!"; capture the pid into a plain variable first.
  pid=$!
  running_pid[$key]=${pid}
  running_start[$key]=$SECONDS
  running_report[$key]="${report}"
  echo "$(date -Iseconds): started ${key} (${count} threads) pid ${running_pid[$key]} -> ${report}" >> "${LOG_FILE}"
}

ok=0; failed=0; timed_out=0
pending=("${flagged[@]}")
while (( ${#pending[@]} > 0 || ${#running_pid[@]} > 0 )); do
  while (( ${#pending[@]} > 0 && ${#running_pid[@]} < MAX_PARALLEL )); do
    item=${pending[1]}
    shift pending
    launch_one ${=item}
  done
  for key in ${(k)running_pid}; do
    pid=${running_pid[$key]}
    if ! kill -0 "${pid}" 2>/dev/null; then
      rc=0; wait "${pid}" || rc=$?
      if (( rc == 0 )); then ok=$((ok + 1)); else failed=$((failed + 1)); fi
      echo "$(date -Iseconds): finished ${key} rc=${rc} after $(( SECONDS - running_start[$key] ))s; report ${running_report[$key]}" >> "${LOG_FILE}"
      unset "running_pid[$key]" "running_start[$key]" "running_report[$key]"
    elif (( SECONDS - running_start[$key] >= PER_PR_TIMEOUT )); then
      kill -TERM "${pid}" 2>/dev/null || true
      sleep 5
      kill -KILL "${pid}" 2>/dev/null || true
      wait "${pid}" 2>/dev/null || true
      timed_out=$((timed_out + 1))
      echo "$(date -Iseconds): ${key} TIMED OUT after ${PER_PR_TIMEOUT}s; killed; report ${running_report[$key]}" >> "${LOG_FILE}"
      unset "running_pid[$key]" "running_start[$key]" "running_report[$key]"
    fi
  done
  sleep 10
done

routine_finish "routine: pr-review-fixer"

rc=0
(( failed > 0 || timed_out > 0 )) && rc=1
summary="PR_REVIEW_FIXER_COMPLETE $(date +%Y-%m-%dT%H:%M:%S%z) prs=${#flagged[@]} ok=${ok} failed=${failed} timed_out=${timed_out}"
echo "${summary}" >> "${LOG_FILE}"
echo "${summary}"
exit "${rc}"
