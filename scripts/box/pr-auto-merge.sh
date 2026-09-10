#!/bin/bash
# Merge when ready. Runs every 10 minutes on the box for Callum's open PRs that carry the cow:merge
# label (the "Merge when ready" toggle in the Pull requests panel; the toggle is the sign-off, nothing
# here touches a PR without it).
#   - green, approved, conflict-free, no unresolved review comments -> enable GitHub auto-merge (squash),
#     which merges the PR or puts it in the merge queue; when the repo has no auto-merge, merge directly.
#   - removed from the merge queue -> an agent works out why (queue checks, GitHub's reason), fixes the
#     PR in a fresh worktree when the PR caused it, and auto-merge is re-armed. At most 3 bounces per PR,
#     then a DM; the toggle can be flipped off and on to try again.
#   - merged -> one DM with the link. Anything else just waits and is logged.
# Usage: pr-auto-merge.sh [--dry-run [repo number]]   (dry run: decide, never act)
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin
LOG_DIR="$HOME/.coval/logs"; mkdir -p "$LOG_DIR"; LOG="$LOG_DIR/pr-auto-merge.log"
STATE="$LOG_DIR/pr-auto-merge.state.json"
LOCK="$LOG_DIR/pr-auto-merge.lock"
MAX_BOUNCES=3
AGENT_MODEL="chatgpt/gpt-5.5"
AGENT_LIMIT_SECONDS=2400
DRY=0; ONLY=""
if [ "${1:-}" = "--dry-run" ]; then DRY=1; [ $# -ge 3 ] && ONLY="$2 $3"; fi

if ! mkdir "$LOCK" 2>/dev/null; then echo "$(date -Iseconds): previous run still going, skipping" >> "$LOG"; exit 0; fi
source "$HOME/bin/cow-routine-guard.sh"
# The guard installs its own EXIT trap; this one replaces it, so it releases the routine lock too.
trap 'routine_release; rmdir "$LOCK" 2>/dev/null' EXIT
[ -s "$STATE" ] || echo '{}' > "$STATE"

log() { echo "$(date -Iseconds): $*" >> "$LOG"; [ "$DRY" = 1 ] && echo "$*"; }
notify() { [ "$DRY" = 1 ] && { echo "DM: $1"; return; }; "$HOME/bin/cow-notify.sh" "$1" >> "$LOG" 2>&1 || true; }

# GitHub's PR search ignores archived:false, so ask each repo once per run (bash 3.2 friendly).
__archived_list=""
repo_is_archived() {
  local r="$1" v
  case " $__archived_list " in
    *" $r=true "*) return 0 ;;
    *" $r=false "*) return 1 ;;
  esac
  v=$(gh repo view "coval-ai/$r" --json isArchived --jq .isArchived 2>/dev/null || echo false)
  __archived_list="$__archived_list $r=$v"
  [ "$v" = "true" ]
}

state_get() { python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get(sys.argv[2],{}).get(sys.argv[3],sys.argv[4]))' "$STATE" "$1" "$2" "${3:-}"; }
state_update() {  # key k=v ...   (v: "+1" increments, "now" stamps UTC, "" deletes the field)
  python3 - "$STATE" "$@" <<'PY'
import json, sys, datetime
path, key = sys.argv[1], sys.argv[2]
state = json.load(open(path)); mine = state.setdefault(key, {})
for kv in sys.argv[3:]:
    k, v = kv.split("=", 1)
    if v == "+1": mine[k] = int(mine.get(k, 0)) + 1
    elif v == "now": mine[k] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    elif v == "": mine.pop(k, None)
    else: mine[k] = v
json.dump(state, open(path, "w"), indent=1)
PY
}
state_delete() { python3 -c 'import json,sys; p=sys.argv[1]; s=json.load(open(p)); s.pop(sys.argv[2],None); json.dump(s,open(p,"w"),indent=1)' "$STATE" "$1"; }
state_keys() { python3 -c 'import json,sys; print("\n".join(json.load(open(sys.argv[1])).keys()))' "$STATE"; }

FACTS='query($owner:String!,$name:String!,$number:Int!){ repository(owner:$owner,name:$name){ pullRequest(number:$number){
  state isDraft mergeable mergeStateStatus reviewDecision url title headRefOid headRefName
  autoMergeRequest{enabledAt} isInMergeQueue mergeQueueEntry{state position}
  commits(last:1){nodes{commit{statusCheckRollup{state}}}}
  reviewThreads(first:100){nodes{isResolved}}
  timelineItems(last:8, itemTypes:[ADDED_TO_MERGE_QUEUE_EVENT, REMOVED_FROM_MERGE_QUEUE_EVENT]){nodes{__typename ... on RemovedFromMergeQueueEvent{createdAt reason} ... on AddedToMergeQueueEvent{createdAt}}}
} } }'

# decide <facts-json> <key>  ->  "action<TAB>detail<TAB>extra"
decide() {
  python3 - "$1" "$2" "$STATE" <<'PY'
import json, sys
facts, key, state_path = sys.argv[1:4]
pr = json.loads(facts)["data"]["repository"]["pullRequest"]
mine = json.load(open(state_path)).get(key, {})
def out(action, detail="", extra=""): print(action + "\t" + detail + "\t" + extra); sys.exit(0)
if pr["state"] != "OPEN": out("closed", pr["state"])
if mine.get("paused"): out("paused", mine.get("reason", ""))
if pr.get("isInMergeQueue") or pr.get("mergeQueueEntry"): out("queued", f"position {(pr.get('mergeQueueEntry') or {}).get('position')}")
events = [e for e in pr["timelineItems"]["nodes"] if e]
removed = [e for e in events if e.get("__typename") == "RemovedFromMergeQueueEvent"]
if removed:
    latest = removed[-1]
    if latest["createdAt"] > mine.get("lastActionAt", "") and latest["createdAt"] > mine.get("lastBounceAt", ""):
        out("bounced", latest.get("reason") or "no reason given", latest["createdAt"])
unresolved = sum(1 for t in pr["reviewThreads"]["nodes"] if not t["isResolved"])
commit = ((pr["commits"]["nodes"] or [{}])[0].get("commit") or {})
checks = (commit.get("statusCheckRollup") or {}).get("state") or "NONE"
if pr["isDraft"]: out("wait", "draft")
if pr["mergeable"] == "CONFLICTING": out("wait", "merge conflicts")
if pr["reviewDecision"] != "APPROVED": out("wait", f"review {pr['reviewDecision'] or 'pending'}")
if unresolved: out("wait", f"{unresolved} unresolved comment(s)")
if checks in ("FAILURE", "ERROR"): out("wait", f"checks {checks.lower()}")
if checks in ("PENDING", "EXPECTED"): out("wait", "checks running")
if pr["mergeable"] != "MERGEABLE": out("wait", f"mergeable {pr['mergeable']}")
if pr.get("autoMergeRequest"): out("armed", pr.get("mergeStateStatus") or "")
out("enqueue", pr.get("mergeStateStatus") or "")
PY
}

# arm <repo> <number> <url>: enable auto-merge (squash, else merge commit); merge directly when the repo has no auto-merge.
arm() {
  local repo="$1" number="$2" url="$3" out
  [ "$DRY" = 1 ] && { log "would arm auto-merge on $url"; return 0; }
  if out=$(gh pr merge "$number" -R "coval-ai/$repo" --squash --auto 2>&1); then log "armed auto-merge (squash) on $url"; return 0; fi
  case "$out" in
    *"already enabled"*|*"already"*"auto-merge"*) log "auto-merge already armed on $url"; return 0 ;;
    *"squash"*"not"*|*"not allowed"*|*"merge method"*)
      if out=$(gh pr merge "$number" -R "coval-ai/$repo" --merge --auto 2>&1); then log "armed auto-merge (merge commit) on $url"; return 0; fi ;;
  esac
  if printf '%s' "$out" | grep -q -i 'auto-merge'; then
    if out=$(gh pr merge "$number" -R "coval-ai/$repo" --squash 2>&1); then log "merged directly (no auto-merge on this repo): $url"; return 0; fi
  fi
  log "could not arm auto-merge on $url: $(printf '%s' "$out" | head -1 | cut -c1-160)"
  return 1
}

# fix_bounce <repo> <number> <url> <head> <branch> <reason> <bounced-at>: an agent explains the bounce and fixes the PR if the PR caused it.
fix_bounce() {
  local repo="$1" number="$2" url="$3" head="$4" branch="$5" reason="$6" at="$7" key="$1#$2"
  local report="$LOG_DIR/pr-auto-merge-$(date +%Y%m%dT%H%M%S)-$repo-$number.log"
  local prompt="You are the merge-when-ready agent on the cow box. PR: $url (coval-ai/$repo #$number, branch $branch, head $head). It carries the cow:merge label, so Callum has authorized merging it. The merge queue removed it at $at with this reason: \"$reason\".
Do this:
1. Find out why the queue removed it: read the reason, look at the merge-group checks (gh run list -R coval-ai/$repo, the merge-group runs for this PR, and gh pr checks $number -R coval-ai/$repo) and read the failing job logs.
2. Classify: (a) caused by this PR's changes -> fix it: work in a fresh git worktree checked out on the PR branch ($branch) under /Users/bronson/coval-worktrees/, make the smallest correct change, run the relevant checks locally when practical, commit with a plain message, push to the PR branch (never force-push, never rebase, never set a git identity), reply in-thread to any bot comment your change addresses, then remove the worktree. (b) a flake, or a failure in another PR ahead in the queue, or infrastructure -> change nothing. (c) something only Callum can resolve (a product decision, a conflicting PR, missing access) -> change nothing and explain.
Rules: never merge, never enable auto-merge yourself, never touch other PRs, never resolve review threads, keep the PR's scope. Follow /Users/bronson/.config/opencode/AGENTS.md.
Finish with exactly one line in this format, using one of the three words: AUTO_MERGE_RESULT fixed|flake|needs-human <one-sentence reason>"
  [ "$DRY" = 1 ] && { log "would run the fix agent for $url ($reason)"; return 0; }
  NO_COLOR=1 "$HOME/.opencode/bin/opencode" run --auto --attach http://127.0.0.1:4096 --dir "$HOME/coval/$repo" -m "$AGENT_MODEL" \
    --title "routine: pr-auto-merge $repo#$number $(date +%Y-%m-%dT%H:%M)" "$prompt" > "$report" 2>&1 &
  local pid=$! started=$SECONDS
  while kill -0 "$pid" 2>/dev/null; do
    if (( SECONDS - started > AGENT_LIMIT_SECONDS )); then
      kill -TERM "$pid" 2>/dev/null; sleep 5; kill -KILL "$pid" 2>/dev/null
      log "fix agent for $url exceeded $((AGENT_LIMIT_SECONDS / 60)) min and was stopped"
      break
    fi
    sleep 20
  done
  wait "$pid" 2>/dev/null
  routine_finish "routine: pr-auto-merge $repo#$number"
  local result verdict why
  result=$(grep -a -o 'AUTO_MERGE_RESULT .*' "$report" | tail -1)
  verdict=$(printf '%s' "$result" | awk '{print $2}')
  why=$(printf '%s' "$result" | cut -d' ' -f3- | cut -c1-200)
  log "fix agent for $url: ${result:-no result line} (report: $report)"
  case "$verdict" in
    fixed|flake)
      state_update "$key" "bounces=+1" "lastAction=$verdict" "lastActionAt=now" "lastBounceAt=$at"
      arm "$repo" "$number" "$url" ;;
    *)
      state_update "$key" "bounces=+1" "lastBounceAt=$at" "paused=1" "reason=${why:-the agent gave no verdict}"
      notify "merge when ready: $url was removed from the merge queue ($reason) and the agent says it needs you: ${why:-no verdict}. Fix it, then flip the merge toggle off and on to retry." ;;
  esac
}

log "=== run ==="
if [ -n "$ONLY" ]; then prs="$ONLY"
else prs=$(gh search prs --author=callumreid --state=open --owner=coval-ai --label=cow:merge --limit 50 --json repository,number --jq '.[] | "\(.repository.name) \(.number)"' 2>>"$LOG")
fi
seen=""
while IFS= read -r line; do
  line=$(printf '%s' "$line" | tr -s ' \t' ' ' | sed -e 's/^ //' -e 's/ $//')
  [ -z "$line" ] && continue
  repo=${line%% *}; number=${line##* }; key="$repo#$number"; seen="$seen $key"
  repo_is_archived "$repo" && { log "$key: repo archived, ignoring"; continue; }
  facts=$(gh api graphql -f query="$FACTS" -F owner=coval-ai -F name="$repo" -F number="$number" 2>>"$LOG") || { log "$key: could not read the PR"; continue; }
  url=$(printf '%s' "$facts" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["repository"]["pullRequest"]["url"])')
  head=$(printf '%s' "$facts" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["repository"]["pullRequest"]["headRefOid"])')
  branch=$(printf '%s' "$facts" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["repository"]["pullRequest"]["headRefName"])')
  IFS=$'\t' read -r action detail extra <<< "$(decide "$facts" "$key")"
  [ "$DRY" = 1 ] || state_update "$key" "url=$url"
  case "$action" in
    enqueue)
      log "$key: mergeable ($detail); arming auto-merge"
      arm "$repo" "$number" "$url" && state_update "$key" "lastAction=enqueue" "lastActionAt=now" ;;
    bounced)
      bounces=$(state_get "$key" bounces 0)
      if [ "$bounces" -ge "$MAX_BOUNCES" ]; then
        state_update "$key" "paused=1" "reason=$detail"
        notify "merge when ready: giving up on $url after $bounces merge-queue bounces (last reason: $detail). Fix it by hand, then flip the merge toggle off and on to retry."
      else
        # Only the fix step needs the box's one-LLM-at-a-time lock; a busy lock just means next cycle.
        if COW_ROUTINE_STATUS_FILE= routine_acquire "pr-auto-merge"; then
          log "$key: removed from the merge queue at $extra ($detail); investigating (bounce $((bounces + 1)) of $MAX_BOUNCES)"
          fix_bounce "$repo" "$number" "$url" "$head" "$branch" "$detail" "$extra"
        else
          log "$key: bounced ($detail) but another agent routine is running; next cycle"
        fi
      fi ;;
    wait) log "$key: waiting ($detail)" ;;
    armed) log "$key: auto-merge armed, GitHub will merge or queue it ($detail)" ;;
    queued) log "$key: in the merge queue ($detail)" ;;
    paused) log "$key: paused until the toggle is flipped again ($detail)" ;;
    closed) log "$key: $detail" ;;
  esac
done <<< "$prs"

# PRs that dropped out of the labeled set: merged (say so once), closed, or toggle switched off.
for key in $(state_keys); do
  case " $seen " in *" $key "*) continue ;; esac
  repo=${key%%#*}; number=${key##*#}
  info=$(gh pr view "$number" -R "coval-ai/$repo" --json state,url 2>/dev/null) || continue
  st=$(printf '%s' "$info" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("state",""))')
  url=$(printf '%s' "$info" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("url",""))')
  case "$st" in
    MERGED) log "$key: merged"; [ "$DRY" = 1 ] || notify "merge when ready: merged $url" ;;
    *) log "$key: no longer labeled ($st); forgetting it" ;;
  esac
  [ "$DRY" = 1 ] || state_delete "$key"
done
log "done"
