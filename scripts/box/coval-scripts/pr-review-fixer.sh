#!/bin/zsh
# cow box: run as threads on the always-on server so they show in the office.
export OPENCODE_SERVER_USERNAME=${COW_SERVER_USERNAME:-cow}
export OPENCODE_SERVER_PASSWORD=$(head -1 $HOME/.config/opencode/server-password)
source "$HOME/bin/cow-routine-guard.sh"
routine_acquire "pr-review-fixer" || exit 0
set -euo pipefail

dow=$(date +%u)
hour=$(( 10#$(date +%H) ))
minute=$(( 10#$(date +%M) ))
[[ $dow -ge 6 ]] && { routine_skip "weekend: outside the fixer window"; exit 0; }
(( hour < 8 || hour > 18 || (hour == 18 && minute > 0) )) && { routine_skip "outside the fixer window (08:00-18:00 PT)"; exit 0; }

LOG_DIR="${HOME}/.coval/logs"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/pr-review-fixer.log"

LOCK="${LOG_DIR}/pr-review-fixer.lock"
if ! mkdir "${LOCK}" 2>/dev/null; then
  echo "$(date -Iseconds): previous run still in progress, skipping" >> "${LOG_FILE}"
  routine_skip "previous fixer run still in progress, skipping"
  exit 0
fi
trap 'rmdir "${LOCK}"' EXIT


# GitHub's PR search ignores archived:false, so ask each repo once per run (bash 3.2 friendly).
__archived_list=""
repo_is_archived() {  # usage: repo_is_archived <name>  -> exit 0 when archived
  local r="$1" v
  case " $__archived_list " in
    *" $r=true "*) return 0 ;;
    *" $r=false "*) return 1 ;;
  esac
  v=$(gh repo view "coval-ai/$r" --json isArchived --jq .isArchived 2>/dev/null || echo false)
  __archived_list="$__archived_list $r=$v"
  [ "$v" = "true" ]
}
BOT_REGEX='coderabbit|greptile|sourcery|qodo|codium|pr-agent|ellipsis|korbit|bito|deepsource|codacy|sider|copilot|coval-sofia'

prs=$(gh search prs --author=callumreid --state=open --owner=coval-ai --archived=false --limit 100 \
  --json repository,number --jq '.[] | "\(.repository.name) \(.number)"')

flagged=()
while IFS= read -r line; do
  [[ -z "${line}" ]] && continue
  repo=${line%% *}
  number=${line##* }
  repo_is_archived "${repo}" && continue
  if gh pr view "${number}" -R "coval-ai/${repo}" --json labels --jq '.labels[].name' 2>/dev/null | grep -q '^cow:no-autofix$'; then continue; fi
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
  }' -F owner=coval-ai -F repo="${repo}" -F number="${number}" \
    --jq "[.data.repository.pullRequest.reviewThreads.nodes[]
           | select(.isResolved == false)
           | select(.comments.nodes[0].author.login | test(\"${BOT_REGEX}\"; \"i\"))
           | select(.comments.nodes[-1].author.login | test(\"${BOT_REGEX}\"; \"i\"))]
          | length" 2>/dev/null || echo 0)
  if [[ "${count}" -gt 0 ]]; then
    flagged+=("coval-ai/${repo} #${number} (${count} unresolved bot threads)")
  fi
done <<< "${prs}"

{
  echo "=== $(date -Iseconds) ==="
  if (( ${#flagged[@]} == 0 )); then
    echo "No unresolved bot review comments. Nothing to do."
    exit 0
  fi
  echo "Flagged PRs: ${flagged[*]}"
  cd /Users/bronson/coval
  /Users/bronson/.opencode/bin/opencode run --auto --attach http://127.0.0.1:4096 -m cloudflare-workers-ai/@cf/zai-org/glm-5.3 --title "routine: pr-review-fixer $(date +%Y-%m-%dT%H:%M)" "
Apply my fix-review-comments skill at ~/.agents/skills/fix-review-comments/SKILL.md to each of these PRs, which currently have unresolved automated review-bot comments:

$(printf '%s\n' "${flagged[@]}")

For each PR follow the skill end to end: first record every human reviewer whose standing review is CHANGES_REQUESTED (pulls reviews via the GitHub API, dedupe, skip bots) as that PR's re-request list, then gather the UNRESOLVED bot review threads (GraphQL reviewThreads), set up a fresh git worktree from the PR head branch (repo checkouts live in /Users/bronson/coval/<repo> but their working trees may be dirty - never commit there), triage every comment against the actual current code, apply minimal fixes for valid ones, run only the affected tests plus ruff, commit with the PR's [COVAL-XXXX] prefix and push to the PR branch, verify the remote branch head is your fix commit, reply to every comment via the REST replies API with evidence, do NOT resolve the threads, then remove the worktree. After all fixes and replies: if no required check is known failed, re-request review from every login on the re-request list via POST to the pulls requested_reviewers API, then verify the PR's requested reviewers through the GitHub API and report their exact logins.

If more than one PR is listed, fix them concurrently using parallel subagents. If a fix would require large or risky changes, skip it, reply explaining, and flag it in your report. End with a per-PR summary table (comment, file, triage, action, commit hash) plus each PR's re-requested reviewer logins."
} >> "${LOG_FILE}" 2>&1
routine_finish "routine: pr-review-fixer"
