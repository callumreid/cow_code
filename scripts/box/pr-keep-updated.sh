#!/bin/bash
# Keep Callum's open PRs current with their base branch. Runs hourly on the box.
# Drafts are updated too. Skips PRs labeled cow:no-update, closed/merged PRs, PRs in the merge queue
# or with auto-merge armed, PRs that are already green + approved + conflict-free (CLEAN), and PRs
# that have been active within PR_KEEP_UPDATED_IDLE_SECONDS (default 4h). A conflict (DIRTY, or a
# failed update) is DM'd, never resolved automatically.
#
# TRIGGER: the real commit distance from the base branch (compare.behind_by) - NOT mergeStateStatus.
# GitHub only reports mergeStateStatus BEHIND when the repo enforces "require branches to be up to
# date before merging", which the coval-ai repos do not. Everything else fell through to "current",
# so between 2026-09-21 and 2026-10-05 this job ran 672 times, reported a healthy "current 9" every
# time, and updated exactly nothing - while frontend#7998 drifted 159 commits behind main and
# drafts, documented above as updated, were never touched either. Fixed 2026-10-05.
#
# Usage: pr-keep-updated.sh [--dry-run]
#   --dry-run  report what would be updated, make no writes.
#
# Env:
#   PR_KEEP_UPDATED_MAX           max branches to update per run (default 5). Keeps a backlog from
#                                 firing CI on every PR at once; the next run picks up the remainder.
#   PR_KEEP_UPDATED_IDLE_SECONDS  minimum seconds since a PR's last commit or activity before
#                                 updating it (default 14400 = 4 hours).
export HOME="${COW_KEEP_UPDATED_HOME:-/Users/bronson}"
export PATH="${COW_KEEP_UPDATED_PATH:-$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin}"

DRY_RUN=0
case "${1:-}" in
  --dry-run) DRY_RUN=1 ;;
  "") ;;
  *) echo "usage: $0 [--dry-run]" >&2; exit 2 ;;
esac

MAX_UPDATES=${PR_KEEP_UPDATED_MAX:-5}
IDLE_SECONDS=${PR_KEEP_UPDATED_IDLE_SECONDS:-14400}

LOG_DIR="${COW_KEEP_UPDATED_LOG_DIR:-$HOME/.coval/logs}"; mkdir -p "$LOG_DIR"; LOG="$LOG_DIR/pr-keep-updated.log"
LOCK="$LOG_DIR/pr-keep-updated.lock"

# gh is the only thing this script does; without it every query below fails and the run would
# otherwise report a tidy "current 0, updated 0" that looks exactly like a healthy no-op.
command -v gh >/dev/null 2>&1 || {
  echo "$(date -Iseconds): FATAL gh not found on PATH ($PATH) - setup failure, not an empty queue" >> "$LOG"
  echo "FATAL: gh not found on PATH ($PATH)" >&2
  exit 127
}

if [ "$DRY_RUN" -eq 0 ]; then
  if ! mkdir "$LOCK" 2>/dev/null; then echo "$(date -Iseconds): previous run still going, skipping" >> "$LOG"; exit 0; fi
  trap 'rmdir "$LOCK"' EXIT
fi

say() {  # log, and echo to stdout under --dry-run so a manual run is readable
  echo "$(date -Iseconds): $*" >> "$LOG"
  [ "$DRY_RUN" -eq 1 ] && echo "$*"
}

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

echo "=== $(date -Iseconds) ===$([ "$DRY_RUN" -eq 1 ] && echo ' (DRY RUN)')" >> "$LOG"
[ "$DRY_RUN" -eq 1 ] && echo "=== DRY RUN - no writes, max/run would be $MAX_UPDATES, min idle ${IDLE_SECONDS}s ==="

PR_QUERY='query($owner:String!,$name:String!,$number:Int!){ repository(owner:$owner,name:$name){ pullRequest(number:$number){
  state isDraft updatedAt mergeable mergeStateStatus reviewDecision baseRefName headRefOid
  isInMergeQueue autoMergeRequest{enabledAt} mergeQueueEntry{state position}
  labels(first:30){nodes{name}}
  reviewThreads(first:100){nodes{isResolved}}
  commits(last:1){nodes{commit{committedDate statusCheckRollup{state}}}}
} } }'

prs=$(gh search prs --author=callumreid --state=open --owner=coval-ai --archived=false --limit 100 \
  --json repository,number --jq '.[] | "\(.repository.name) \(.number)"' 2>>"$LOG")
if [ -z "$prs" ]; then
  say "no open PRs returned by search - nothing to do (if this is unexpected, check gh auth)"
fi

updated=0; conflicts=(); skipped=0; current=0; errors=0; unknown=0; deferred=0; active=0; ready=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  repo=${line%% *}; number=${line##* }
  repo_is_archived "$repo" && { skipped=$((skipped+1)); continue; }

  info=$(gh api graphql -f query="$PR_QUERY" -F owner=coval-ai -F name="$repo" -F number="$number" 2>>"$LOG")
  if [ -z "$info" ]; then
    # Previously a bare `|| continue`, which dropped the PR from every counter - the run looked
    # complete while silently having skipped it.
    errors=$((errors+1)); say "ERROR could not read $repo#$number"; continue
  fi

  parsed=$(python3 - "$info" "$IDLE_SECONDS" "${PR_KEEP_UPDATED_NOW:-}" <<'PY' 2>>"$LOG"
import datetime, json, sys
info_raw, idle_req_str, now_override = sys.argv[1:4]
idle_req = int(idle_req_str)
now = datetime.datetime.fromisoformat(now_override.replace("Z", "+00:00")).timestamp() if now_override else datetime.datetime.now(datetime.timezone.utc).timestamp()
d = (json.loads(info_raw).get("data") or {}).get("repository", {}).get("pullRequest") or {}
if not d:
    print("error\t\t\tmissing PR payload")
    sys.exit(0)
labels = [l["name"] for l in (d.get("labels") or {}).get("nodes") or [] if l and l.get("name")]
state = d.get("state") or ""
merge_state = d.get("mergeStateStatus") or ""
mergeable = d.get("mergeable") or ""
base = d.get("baseRefName") or ""
head = d.get("headRefOid") or ""
if "cow:no-update" in labels or state != "OPEN":
    print(f"skip\t{base}\t{head}\tlabeled or closed")
    sys.exit(0)
if merge_state == "DIRTY" or mergeable == "CONFLICTING":
    print(f"dirty\t{base}\t{head}\tmerge conflicts")
    sys.exit(0)
if d.get("isInMergeQueue") or d.get("mergeQueueEntry"):
    print(f"ready\t{base}\t{head}\tin merge queue")
    sys.exit(0)
if d.get("autoMergeRequest"):
    print(f"ready\t{base}\t{head}\tauto-merge armed")
    sys.exit(0)
commits = (d.get("commits") or {}).get("nodes") or []
commit = (commits[0].get("commit") if commits and commits[0] else None) or {}
checks = ((commit.get("statusCheckRollup") or {}).get("state")) or "NONE"
unresolved = sum(1 for t in ((d.get("reviewThreads") or {}).get("nodes") or []) if t and not t.get("isResolved"))
if not d.get("isDraft") and d.get("reviewDecision") == "APPROVED" and unresolved == 0 and checks == "SUCCESS" and merge_state == "CLEAN":
    print(f"ready\t{base}\t{head}\tgreen and approved")
    sys.exit(0)
def parse_ts(s):
    if not s: return 0.0
    try: return datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
    except Exception: return 0.0
last_touch = max(parse_ts(d.get("updatedAt")), parse_ts(commit.get("committedDate")))
if idle_req > 0 and last_touch > 0:
    age = int(max(0.0, now - last_touch))
    if age < idle_req:
        print(f"active\t{base}\t{head}\tactive {age // 60}m ago (<{idle_req // 60}m)")
        sys.exit(0)
print(f"check\t{base}\t{head}\t{merge_state}")
PY
)
  IFS=$'\t' read -r status base head detail <<< "$parsed"

  if [ "$status" = "error" ] || [ -z "$status" ]; then
    errors=$((errors+1)); say "ERROR could not parse $repo#$number (${detail:-empty})"; continue
  fi
  if [ "$status" = "skip" ]; then skipped=$((skipped+1)); continue; fi
  if [ "$status" = "dirty" ]; then
    conflicts+=("https://github.com/coval-ai/$repo/pull/$number")
    say "$repo#$number has merge conflicts"
    continue
  fi
  if [ -z "$base" ] || [ -z "$head" ]; then
    errors=$((errors+1)); say "ERROR missing base/head for $repo#$number"; continue
  fi

  # The real question, asked of the live base branch rather than of mergeStateStatus.
  behind=$(gh api "repos/coval-ai/$repo/compare/$base...$head" --jq '.behind_by' 2>>"$LOG")
  case "$behind" in
    ''|*[!0-9]*)
      # Never let an unanswerable compare count as "current" - that is the bug this script had.
      unknown=$((unknown+1)); say "UNKNOWN behind-count for $repo#$number (base $base) - not counted as current" ;;
    0)
      current=$((current+1)) ;;
    *)
      if [ "$status" = "ready" ]; then
        ready=$((ready+1)); say "skipping $repo#$number ($behind behind $base) - $detail"
        continue
      fi
      if [ "$status" = "active" ]; then
        active=$((active+1)); say "skipping $repo#$number ($behind behind $base) - $detail"
        continue
      fi
      if [ "$updated" -ge "$MAX_UPDATES" ]; then
        deferred=$((deferred+1)); say "deferred $repo#$number ($behind behind $base) - per-run cap $MAX_UPDATES reached"
        continue
      fi
      if [ "$DRY_RUN" -eq 1 ]; then
        updated=$((updated+1)); say "WOULD UPDATE $repo#$number - $behind commits behind $base"
        continue
      fi
      # Branch on gh's EXIT CODE (0 for 2xx, 1 otherwise), not on the body. A successful
      # update-branch is a 202 whose body is {"message":"Updating pull request branch.", ...} - the
      # old `grep '"message"'` matched that and logged all seven real updates of 2026-10-05 as
      # failures, which also kept `updated` at 0 so the per-run cap never engaged.
      out=$(gh api -X PUT "repos/coval-ai/$repo/pulls/$number/update-branch" 2>&1); rc=$?
      if [ "$rc" -eq 0 ]; then
        updated=$((updated+1)); say "updated $repo#$number ($behind commits behind $base)"
      elif printf '%s' "$out" | grep -q -i 'conflict'; then
        conflicts+=("https://github.com/coval-ai/$repo/pull/$number"); say "conflict on $repo#$number"
      elif printf '%s' "$out" | grep -q -i 'merge queue'; then
        ready=$((ready+1)); say "skipping $repo#$number ($behind behind $base) - in merge queue"
      else
        errors=$((errors+1)); say "update failed for $repo#$number: $(printf '%s' "$out" | head -1 | cut -c1-140)"
      fi ;;
  esac
done <<< "$prs"

summary="done — updated $updated, current $current, active $active, ready $ready, skipped $skipped, conflicts ${#conflicts[@]}, deferred $deferred, unknown $unknown, errors $errors"
echo "$(date -Iseconds): $summary" >> "$LOG"
[ "$DRY_RUN" -eq 1 ] && echo "$summary"
[ "$DRY_RUN" -eq 1 ] && exit 0

# DM when the conflict set changes, and re-raise an unchanged backlog weekly - the old script
# notified only on change, so the six PRs stuck since 2026-09-29 went silent for a week.
STATE="$LOG_DIR/pr-keep-updated.conflicts"
STAMP="$LOG_DIR/pr-keep-updated.conflicts.notified"
now_set=""
[ "${#conflicts[@]}" -gt 0 ] && now_set=$(printf '%s\n' "${conflicts[@]}" | sort)
prev_set=$(cat "$STATE" 2>/dev/null || true)

should_notify=0
[ "$now_set" != "$prev_set" ] && should_notify=1
if [ "$should_notify" -eq 0 ] && [ -n "$now_set" ]; then
  last=$(cat "$STAMP" 2>/dev/null || echo 0)
  case "$last" in ''|*[!0-9]*) last=0 ;; esac
  [ $(( $(date +%s) - last )) -ge 604800 ] && should_notify=1
fi

if [ "$should_notify" -eq 1 ]; then
  printf '%s' "$now_set" > "$STATE"
  if [ "${#conflicts[@]}" -gt 0 ]; then
    date +%s > "$STAMP"
    "$HOME/bin/cow-notify.sh" "keep-updated: these PRs conflict with their base and need a manual rebase:
$(printf '%s\n' "${conflicts[@]}")" >> "$LOG" 2>&1
  fi
fi
