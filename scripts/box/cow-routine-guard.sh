#!/bin/bash
# Shared guard for the LLM routines on the box (sweep, queue, fixer, merge-when-ready): only one runs
# at a time, and when a run ends its server sessions are aborted so nothing keeps retrying in the
# background. Usage: source it, then  routine_acquire <name> || exit 0 ; ... ; routine_finish "<title prefix>"
# routine_skip "<why>" records a run as skipped in the Scheduled view (via cow-routine-run.sh).
ROUTINE_LOCK="$HOME/.coval/logs/routine-llm.lock"
ROUTINE_HELD=""
routine_release() { if [ -n "$ROUTINE_HELD" ]; then rm -rf "$ROUTINE_LOCK"; ROUTINE_HELD=""; fi; }
# zsh runs an EXIT trap that was set inside a function as soon as that function returns, which used
# to release the lock right after taking it. So the release hook is installed here, at top level:
# zshexit() for zsh (it runs at shell exit whatever traps a script sets later), an EXIT trap for bash
# (a bash script that installs its own EXIT trap must call routine_release from it).
if [ -n "${ZSH_VERSION:-}" ]; then zshexit() { routine_release; }; else trap 'routine_release' EXIT; fi
routine_skip() {
  echo "$(date -Iseconds): $1"
  [ -n "${COW_ROUTINE_STATUS_FILE:-}" ] && echo skipped > "$COW_ROUTINE_STATUS_FILE"
  return 0
}
routine_acquire() {
  mkdir -p "$HOME/.coval/logs"
  if mkdir "$ROUTINE_LOCK" 2>/dev/null; then echo "$1 $(date -Iseconds)" > "$ROUTINE_LOCK/owner"; ROUTINE_HELD=1; return 0; fi
  # stale after 90 minutes
  if [ -n "$(find "$ROUTINE_LOCK" -maxdepth 0 -mmin +90 2>/dev/null)" ]; then rm -rf "$ROUTINE_LOCK"; mkdir "$ROUTINE_LOCK" 2>/dev/null && { echo "$1 $(date -Iseconds)" > "$ROUTINE_LOCK/owner"; ROUTINE_HELD=1; return 0; }; fi
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
# The `opencode run --attach` client stops reading when its session goes idle, and in builds since
# 2026-10-13 the final message's last update can arrive after that, so the model's closing text (the
# completion or result line a wrapper greps for) never reaches the report. Read the session's final
# assistant message back from the server and append it to the report.
# usage: routine_append_final <exact session title> <report> [session directory, default ~/coval]
routine_append_final() {
  local title="$1" report="$2" dir="${3:-/Users/bronson/coval}" PW D sid
  PW=$(head -1 "$HOME/.config/opencode/server-password")
  D="x-opencode-directory: $dir"
  sid=$(curl -s -u "cow:$PW" -H "$D" "http://127.0.0.1:4096/session?limit=200" 2>/dev/null | python3 -c "
import json,sys
for s in json.load(sys.stdin):
    if s.get('title') == sys.argv[1]: print(s['id']); break" "$title" 2>/dev/null || true)
  [ -n "$sid" ] || return 0
  {
    echo "=== final message, read back from the server (session $sid) ==="
    curl -s -u "cow:$PW" -H "$D" "http://127.0.0.1:4096/session/$sid/message" 2>/dev/null | python3 -c "
import json,sys
msgs=json.load(sys.stdin)
users=[i for i,m in enumerate(msgs) if m.get('info',{}).get('role')=='user']
replies=[m for m in msgs[(users[-1]+1 if users else 0):] if m.get('info',{}).get('role')=='assistant']
for p in (replies[-1].get('parts',[]) if replies else []):
    if p.get('type')=='text' and p.get('text','').strip(): print(p['text'].strip())" 2>/dev/null || true
  } >> "$report"
  return 0
}
