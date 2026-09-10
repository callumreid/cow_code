#!/bin/bash
# Box server deploy: stage the new binary at ~/.local/bin/opencode.new, then run this (nohup) on the box.
# Waits until no session is busy and no scheduled job is mid-run, provisions from ~/cow-box, swaps the
# binary, restarts cow-server and verifies. Rolls back if the new build opens a different database
# (the sqlite file is named after the build channel: build with OPENCODE_CHANNEL=feat/cow-ui).
# Set COW_DEPLOY_ALLOW_DB_CHANGE=1 only when a database switch is intended.
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin"
LOG="$HOME/.coval/logs/cow-deploy-server.log"
PW=$(head -1 "$HOME/.config/opencode/server-password")
D="x-opencode-directory: /Users/bronson/coval"
JOBS="dev.coval.pr-review-sweep dev.coval.pr-review-queue dev.coval.pr-review-fixer dev.coval.pr-keep-updated dev.coval.daily-workers-health-audit dev.coval.daily-prod-validation dev.bronson.cow-health"
say() { echo "$(date -Iseconds): $*" >> "$LOG"; }
running_jobs() { for j in $JOBS; do launchctl print "gui/501/$j" 2>/dev/null | grep -q "state = running" && printf '%s ' "$j"; done; }
say "deploy start; staged $(ls -la "$HOME/.local/bin/opencode.new" | awk '{print $5}') bytes"
# Wait (up to 3 hours) until no session is busy and no scheduled job is mid-run, so nothing is cut off.
for i in $(seq 1 360); do
  busy=$(curl -s -m 5 -u "cow:$PW" -H "$D" http://127.0.0.1:4096/session/status)
  jobs=$(running_jobs)
  if { [ "$busy" = "{}" ] || [ -z "$busy" ]; } && [ -z "$jobs" ]; then break; fi
  [ "$i" = 1 ] && say "waiting for idle (busy=$busy jobs=$jobs)"
  sleep 30
done
say "idle (or wait expired: busy=$busy jobs=$(running_jobs)); provisioning"
bash "$HOME/cow-box/provision-mac.sh" >> "$LOG" 2>&1 || say "provision exited $?"
# The server's database is named after the build channel (opencode-<channel>.db); a binary built on
# another channel opens a fresh, empty database and every session "disappears". Record which file
# the live server has open so the swap can be checked and reverted.
db_of() { lsof -p "$1" 2>/dev/null | grep -o '[^ ]*share/opencode/opencode[^ ]*\.db' | head -1; }
db_before=$(db_of "$(pgrep -f 'opencode serve' | head -1)")
say "live database before swap: ${db_before:-unknown}"
say "swapping binary"
cp "$HOME/.local/bin/opencode" "$HOME/.local/bin/opencode.prev"
mv "$HOME/.local/bin/opencode.new" "$HOME/.local/bin/opencode"
chmod 755 "$HOME/.local/bin/opencode"
launchctl kickstart -k gui/501/dev.bronson.cow-server
for i in $(seq 1 30); do
  sleep 2
  h=$(curl -s -m 3 -u "cow:$PW" http://127.0.0.1:4096/global/health)
  if [ -n "$h" ]; then say "healthy: $h"; break; fi
done
db_after=$(db_of "$(pgrep -f 'opencode serve' | head -1)")
say "live database after swap: ${db_after:-unknown}"
if [ -n "$db_before" ] && [ -n "$db_after" ] && [ "$db_before" != "$db_after" ] && [ -z "${COW_DEPLOY_ALLOW_DB_CHANGE:-}" ]; then
  say "DATABASE CHANGED ($db_before -> $db_after): the new build is on another channel; rolling back to opencode.prev"
  cp "$HOME/.local/bin/opencode.prev" "$HOME/.local/bin/opencode"
  launchctl kickstart -k gui/501/dev.bronson.cow-server
  "$HOME/bin/cow-notify.sh" "cow deploy rolled back: the new server build opened $db_after instead of $db_before (build it with OPENCODE_CHANNEL=feat/cow-ui)" >/dev/null 2>&1 || true
  say "deploy done (rolled back)"
  exit 1
fi
r=$(curl -s -m 15 -u "cow:$PW" http://127.0.0.1:4096/global/office/routines | head -c 600)
say "routines route: ${r:-<empty>}"
say "deploy done"
