#!/bin/bash
# Keep Callum's open PRs current with their base branch. Runs every 30 minutes on the box.
# Drafts are updated too. Skips PRs labeled cow:no-update, closed/merged PRs, and PRs that are not
# behind (GitHub refuses update-branch for queued PRs, which just logs). A conflict (DIRTY, or a
# failed update) is reported by DM once per run, never resolved automatically.
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin
LOG_DIR="$HOME/.coval/logs"; mkdir -p "$LOG_DIR"; LOG="$LOG_DIR/pr-keep-updated.log"
LOCK="$LOG_DIR/pr-keep-updated.lock"
if ! mkdir "$LOCK" 2>/dev/null; then echo "$(date -Iseconds): previous run still going, skipping" >> "$LOG"; exit 0; fi
trap 'rmdir "$LOCK"' EXIT
echo "=== $(date -Iseconds) ===" >> "$LOG"
prs=$(gh search prs --author=callumreid --state=open --owner=coval-ai --limit 100 --json repository,number --jq '.[] | "\(.repository.name) \(.number)"' 2>>"$LOG")
updated=0; conflicts=(); skipped=0; current=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  repo=${line%% *}; number=${line##* }
  info=$(gh pr view "$number" -R "coval-ai/$repo" --json mergeStateStatus,labels,state 2>>"$LOG") || continue
  status=$(printf '%s' "$info" | python3 -c 'import json,sys; d=json.load(sys.stdin); labels=[l["name"] for l in d.get("labels",[])]; print("skip" if "cow:no-update" in labels or d.get("state")!="OPEN" else d.get("mergeStateStatus",""))')
  case "$status" in
    skip) skipped=$((skipped+1)) ;;
    BEHIND)
      out=$(gh api -X PUT "repos/coval-ai/$repo/pulls/$number/update-branch" 2>&1)
      if printf '%s' "$out" | grep -q -i 'conflict'; then conflicts+=("https://github.com/coval-ai/$repo/pull/$number"); echo "$(date -Iseconds): conflict on $repo#$number" >> "$LOG"
      elif printf '%s' "$out" | grep -q -i -E '"message"|HTTP [45]'; then echo "$(date -Iseconds): update failed for $repo#$number: $(printf '%s' "$out" | head -1 | cut -c1-140)" >> "$LOG"
      else updated=$((updated+1)); echo "$(date -Iseconds): updated $repo#$number" >> "$LOG"; fi ;;
    DIRTY) conflicts+=("https://github.com/coval-ai/$repo/pull/$number"); echo "$(date -Iseconds): $repo#$number has merge conflicts" >> "$LOG" ;;
    *) current=$((current+1)) ;;
  esac
done <<< "$prs"
echo "$(date -Iseconds): done — updated $updated, current $current, skipped $skipped, conflicts ${#conflicts[@]}" >> "$LOG"
# DM once per change in the conflict set, not every half hour.
STATE="$LOG_DIR/pr-keep-updated.conflicts"
now_set=$(printf '%s\n' "${conflicts[@]}" | sort)
prev_set=$(cat "$STATE" 2>/dev/null || true)
if [ "$now_set" != "$prev_set" ]; then
  printf '%s' "$now_set" > "$STATE"
  if [ "${#conflicts[@]}" -gt 0 ]; then
    "$HOME/bin/cow-notify.sh" "keep-updated: these PRs conflict with their base and need a manual rebase:
$(printf '%s\n' "${conflicts[@]}")" >> "$LOG" 2>&1
  fi
fi
