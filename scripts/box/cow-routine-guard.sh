#!/bin/bash
# Shared guard for the LLM routines on the box (sweep, queue, fixer): only one runs at a time, and
# when a run ends its server sessions are aborted so nothing keeps retrying in the background.
# Usage: source it, then  routine_acquire <name> || exit 0 ; ... ; routine_finish "<title prefix>"
# routine_skip "<why>" records a run as skipped in the Scheduled view (via cow-routine-run.sh).
ROUTINE_LOCK="$HOME/.coval/logs/routine-llm.lock"
routine_skip() {
  echo "$(date -Iseconds): $1"
  [ -n "${COW_ROUTINE_STATUS_FILE:-}" ] && echo skipped > "$COW_ROUTINE_STATUS_FILE"
  return 0
}
routine_acquire() {
  mkdir -p "$HOME/.coval/logs"
  if mkdir "$ROUTINE_LOCK" 2>/dev/null; then echo "$1 $(date -Iseconds)" > "$ROUTINE_LOCK/owner"; trap 'rm -rf "$ROUTINE_LOCK"' EXIT; return 0; fi
  # stale after 90 minutes
  if [ -n "$(find "$ROUTINE_LOCK" -maxdepth 0 -mmin +90 2>/dev/null)" ]; then rm -rf "$ROUTINE_LOCK"; mkdir "$ROUTINE_LOCK" 2>/dev/null && { echo "$1 $(date -Iseconds)" > "$ROUTINE_LOCK/owner"; trap 'rm -rf "$ROUTINE_LOCK"' EXIT; return 0; }; fi
  routine_skip "another LLM routine is running ($(cat "$ROUTINE_LOCK/owner" 2>/dev/null)); skipping $1"
  return 1
}
routine_finish() {  # abort any still-busy server session whose title starts with $1
  local PW; PW=$(head -1 "$HOME/.config/opencode/server-password")
  local D="x-opencode-directory: /Users/bronson/coval"
  curl -s -u "cow:$PW" -H "$D" http://127.0.0.1:4096/session 2>/dev/null | python3 -c "
import json,sys
prefix=sys.argv[1]
for s in json.load(sys.stdin):
    if s.get('title','').startswith(prefix): print(s['id'])" "$1" 2>/dev/null | while read -r sid; do
    curl -s -o /dev/null -u "cow:$PW" -H "$D" -X POST "http://127.0.0.1:4096/session/$sid/abort" 2>/dev/null
  done
}
