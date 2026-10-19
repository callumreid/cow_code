#!/bin/bash
# Stage ~/.local/bin/opencode.new, then run this on the box. This script only
# replaces cow-server: it never provisions the machine or sends notifications.
# --allow-busy explicitly permits interrupting known active work. It does not
# bypass health, status inspection, snapshot, version, PID or database checks.
set -euo pipefail
umask 077
export PATH="$PATH:/usr/sbin"
ROOT="${COW_DEPLOY_ROOT:-$HOME}"
LOG="$ROOT/.coval/logs/cow-deploy-server.log"
BIN="$ROOT/.local/bin/opencode"
SERVICE="${COW_DEPLOY_SERVICE:-gui/$(id -u)/dev.bronson.cow-server}"
DOMAIN="${SERVICE%/*}"
JOBS="${COW_DEPLOY_JOBS:-dev.coval.pr-review-sweep dev.coval.pr-review-fixer dev.coval.pr-keep-updated dev.coval.daily-workers-health-audit dev.coval.daily-prod-validation dev.bronson.cow-health}"
WAIT_ATTEMPTS="${COW_DEPLOY_WAIT_ATTEMPTS:-360}"
WAIT_SECONDS="${COW_DEPLOY_WAIT_SECONDS:-30}"
HEALTH_ATTEMPTS="${COW_DEPLOY_HEALTH_ATTEMPTS:-30}"
HEALTH_SECONDS="${COW_DEPLOY_HEALTH_SECONDS:-2}"
# Override with a newline-separated absolute directory list. Keep the legacy
# singular setting for the primary workspace, and check Office by default too.
DIRECTORIES="${COW_DEPLOY_DIRECTORY:-/Users/bronson/coval}"$'\n'"$ROOT/.local/share/opencode/office"
DIRECTORIES="${COW_DEPLOY_DIRECTORIES-$DIRECTORIES}"
swapped=0
committed=0
locked=0
allow_busy=0
mkdir -p "$ROOT/.coval/logs"
say() { echo "$(date -Iseconds): $*" >> "$LOG"; }
fail() { say "ABORT: $*"; echo "cow deploy: $* (see $LOG)" >&2; exit 1; }
for argument in "$@"; do
  case "$argument" in
    --allow-busy) allow_busy=1 ;;
    *) fail "unknown argument; only --allow-busy is supported" ;;
  esac
done
health() {
  curl -fsS -m 5 -u "cow:$PW" http://127.0.0.1:4096/global/health |
    python3 -c 'import json,sys; d=json.load(sys.stdin); sys.exit(0 if isinstance(d,dict) and d.get("healthy") is True and d.get("version")==sys.argv[1] else 1)' "$1"
}
service_pid() {
  launchctl print "$SERVICE" | python3 -c 'import re,sys; p=re.findall(r"^\s*pid = ([1-9][0-9]*)\s*$",sys.stdin.read(),re.M); sys.exit(1) if len(p)!=1 else print(p[0])'
}
database() {
  local pid
  pid=${1:-$(service_pid)}
  [ -n "$pid" ] || return 1
  lsof -a -p "$pid" -Fn 2>/dev/null | python3 -c 'import os,sys; p=sorted(set(os.path.realpath(s[1:].rstrip("\n")) for s in sys.stdin if s.startswith("n") and os.path.basename(s[1:].rstrip("\n")).startswith("opencode") and s.rstrip("\n").endswith(".db"))); sys.exit(1) if len(p)!=1 else print(p[0])'
}
verify() {
  local expected="$1" previous="${2:-}" actual pid i
  for ((i=1; i<=HEALTH_ATTEMPTS; i++)); do
    if health "$expected" 2>/dev/null; then
      pid=$(service_pid) || pid=""
      actual=$(database "$pid") || actual=""
      [ -n "$pid" ] && [ "$pid" != "$previous" ] && [ "$actual" = "$db_before" ] && return 0
    fi
    sleep "$HEALTH_SECONDS"
  done
  return 1
}
cleanup() {
  local result=$?
  trap - EXIT
  if [ "$swapped" = 1 ] && [ "$committed" = 0 ]; then
    say "new server failed verification; restoring saved binary (database snapshot retained at $backup/database.sqlite)"
    if cp "$backup/opencode" "$BIN.rollback" && mv "$BIN.rollback" "$BIN" && launchctl kickstart -k "$SERVICE" && verify "$old_version"; then
      say "rollback verified: original version and database restored"
    else
      say "ROLLBACK NEEDS ATTENTION: original binary or database could not be verified; inspect snapshot before any database restore"
      echo "cow deploy: rollback needs attention; snapshot: $backup/database.sqlite" >&2
    fi
    result=1
  fi
  [ "$locked" = 0 ] || rmdir "$ROOT/.coval/cow-deploy.lock"
  exit "$result"
}
trap cleanup EXIT
for value in "$WAIT_ATTEMPTS" "$HEALTH_ATTEMPTS"; do
  [[ "$value" =~ ^[1-9][0-9]*$ ]] || fail "attempt count must be a positive integer"
done
for value in "$WAIT_SECONDS" "$HEALTH_SECONDS"; do
  [[ "$value" =~ ^[0-9]+$ ]] || fail "wait interval must be a nonnegative integer"
done
mkdir "$ROOT/.coval/cow-deploy.lock" 2>/dev/null || fail "another deployment holds the lock"
locked=1
[ -x "$BIN" ] && [ -f "$BIN.new" ] || fail "installed binary or staged binary is missing"
[ -r "$ROOT/.config/opencode/server-password" ] || fail "server password file is missing"
PW=$(head -1 "$ROOT/.config/opencode/server-password")
[ -n "$PW" ] || fail "server password is empty"
chmod 755 "$BIN.new"
old_version=$("$BIN" --version) || fail "cannot read installed binary version"
new_version=$("$BIN.new" --version) || fail "cannot read staged binary version"
[[ "$old_version" =~ ^[[:alnum:]][[:alnum:]./_+-]*$ ]] || fail "installed version is not a single version token"
[[ "$new_version" =~ ^[[:alnum:]][[:alnum:]./_+-]*$ ]] || fail "staged version is not a single version token"
[ -z "${COW_DEPLOY_EXPECTED_VERSION:-}" ] || [ "$new_version" = "$COW_DEPLOY_EXPECTED_VERSION" ] || fail "staged version does not match the requested version"
health "$old_version" 2>/dev/null || fail "current server is not healthy at the installed binary version"
pid_before=$(service_pid) || fail "cannot identify cow-server PID"
db_before=$(database "$pid_before") || fail "cannot identify exactly one database opened by cow-server"
[ -f "$db_before" ] || fail "live database is not a regular file"
say "deploy start: $old_version -> $new_version; database $db_before; idle checks cover configured workspaces only"
check_idle() {
  health "$old_version" 2>/dev/null || fail "current server health changed while waiting"
  count=0
  scope_counts=""
  while IFS= read -r directory; do
    [[ "$directory" = /* ]] || fail "configured workspace directory must be an absolute path"
    status=$(curl -fsS -m 5 -u "cow:$PW" -H "x-opencode-directory: $directory" http://127.0.0.1:4096/session/status) || fail "cannot read session status for $directory"
    directory_count=$(printf '%s' "$status" | python3 -c 'import json,sys; d=json.load(sys.stdin); valid=isinstance(d,dict) and all(isinstance(s,dict) and s.get("type") in ("busy","retry","idle") for s in d.values()); sys.exit(1) if not valid else print(len(d))') || fail "session status for $directory is not a JSON object with known states"
    count=$((count + directory_count))
    scope_counts="${scope_counts:+$scope_counts; }$directory=$directory_count"
  done <<< "$DIRECTORIES"
  jobs=0
  active_jobs=""
  for job in $JOBS; do
    if state=$(launchctl print "$DOMAIN/$job" 2>&1); then
      # launchctl also prints nested resource states; only the outer job state
      # can establish whether this scheduled process is running.
      job_state=$(printf '%s' "$state" | python3 -c 'import re,sys; rows=re.findall(r"^([ \t]*)state = ([^\r\n]+)$",sys.stdin.read(),re.M); depth=min((len(p) for p,s in rows),default=-1); states=[s.strip() for p,s in rows if len(p)==depth]; sys.exit(1) if len(states)!=1 else print(states[0])') || fail "unknown job state for $job"
      case "$job_state" in
        running) jobs=$((jobs + 1)); active_jobs="${active_jobs:+$active_jobs,}$job" ;;
        'not running'|waiting|exited) ;;
        *) fail "unknown job state for $job" ;;
      esac
    elif ! printf '%s' "$state" | grep -q 'Could not find service'; then
      fail "cannot inspect job $job"
    fi
  done
}
idle=0
for ((i=1; i<=WAIT_ATTEMPTS; i++)); do
  check_idle
  if [ "$count" = 0 ] && [ "$jobs" = 0 ]; then idle=1; break; fi
  if [ "$allow_busy" = 1 ]; then
    say "explicit --allow-busy: proceeding with $count session entries, scheduled jobs active=$jobs [$active_jobs]; configured workspaces [$scope_counts]; active work may be interrupted"
    idle=1
    break
  fi
  [ "$i" != 1 ] || say "waiting for idle: $count session entries, scheduled jobs active=$jobs [$active_jobs]; configured workspaces [$scope_counts]"
  sleep "$WAIT_SECONDS"
done
[ "$idle" = 1 ] || fail "idle deadline expired; staged binary left untouched"
[ "$(database)" = "$db_before" ] || fail "live database changed while waiting"
backup="$ROOT/.coval/backups/cow-server-$(date +%Y%m%d-%H%M%S)-$$"
mkdir -p "$backup"
cp -p "$BIN" "$backup/opencode"
python3 - "$db_before" "$backup/database.sqlite" <<'PY'
import pathlib, sqlite3, sys, time
deadline = time.monotonic() + 60
def progress(status, remaining, total):
    if time.monotonic() > deadline:
        raise TimeoutError("database snapshot exceeded 60 seconds")
with sqlite3.connect(pathlib.Path(sys.argv[1]).as_uri() + "?mode=ro", uri=True, timeout=10) as source:
    # Pin the WAL snapshot before copying pages. Otherwise each concurrent
    # commit can restart the backup and exhaust the deadline on a busy server.
    source.execute("BEGIN")
    source.execute("SELECT name FROM sqlite_schema LIMIT 1").fetchone()
    with sqlite3.connect(sys.argv[2]) as target:
        source.backup(target, pages=1024, progress=progress)
        if target.execute("PRAGMA quick_check").fetchall() != [("ok",)]:
            raise RuntimeError("database snapshot failed quick_check")
PY
printf '%s\n' "$db_before" > "$backup/database-path.txt"
printf '%s\n' "$old_version" > "$backup/version.txt"
say "verified SQLite snapshot and binary rollback copy: $backup"
# The snapshot is not restored automatically: doing so could erase requests
# admitted during cutover. Retain it for explicit recovery if migrations fail.
check_idle
if [ "$count" != 0 ] || [ "$jobs" != 0 ]; then
  [ "$allow_busy" = 1 ] || fail "work appeared during snapshot; leaving staged binary for a later attempt"
  say "explicit --allow-busy at final recheck: $count session entries, scheduled jobs active=$jobs [$active_jobs]; configured workspaces [$scope_counts]; active work may be interrupted"
fi
say "final state checked: configured workspaces [$scope_counts], scheduled jobs active=$jobs [$active_jobs]"
[ "$(service_pid)" = "$pid_before" ] && [ "$(database)" = "$db_before" ] || fail "server changed during snapshot"
cp -p "$backup/opencode" "$BIN.prev"
swapped=1
mv "$BIN.new" "$BIN"
launchctl kickstart -k "$SERVICE"
verify "$new_version" "$pid_before" || fail "new server health, version or database did not verify"
committed=1
say "deploy verified: $new_version; original database $db_before; rollback copy $backup"
