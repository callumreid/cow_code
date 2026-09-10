#!/bin/bash
# Runs one scheduled job on the box and records the run for the app's Scheduled view.
# Usage (from a launchd plist): cow-routine-run.sh <name> [--log <file>] -- <command...>
#
# While the job runs, ~/.coval/logs/routines/<name>.running holds {name, startedAt, pid}. When it
# ends, one JSON line goes to ~/.coval/logs/routines/ledger.jsonl: started/ended (epoch ms),
# status (ok | failed | skipped), exit code, and a one-line summary — the job's last output line,
# else the last line of the job's own log (--log). A job marks itself skipped by writing "skipped"
# to $COW_ROUTINE_STATUS_FILE (the routine guard does this when another LLM routine holds the lock,
# the review scripts when they are outside their hour window).
routine_home="${HOME:-/Users/bronson}"
name="$1"; shift
job_log=""
if [ "$1" = "--log" ]; then job_log="$2"; shift 2; fi
[ "$1" = "--" ] && shift
[ -n "$name" ] && [ $# -gt 0 ] || { echo "usage: cow-routine-run.sh <name> [--log <file>] -- <command...>" >&2; exit 64; }

DIR="${COW_ROUTINE_LEDGER_DIR:-$routine_home/.coval/logs/routines}"; mkdir -p "$DIR"
started=$(date +%s)
status_file=$(mktemp "${TMPDIR:-/tmp}/cow-routine-status.XXXXXX")
out=$(mktemp "${TMPDIR:-/tmp}/cow-routine-out.XXXXXX")
export COW_ROUTINE_STATUS_FILE="$status_file"
export COW_ROUTINE_NAME="$name"
export COW_ROUTINE_EXECUTION_ID
COW_ROUTINE_EXECUTION_ID=$(python3 -c 'import uuid; print(uuid.uuid4())')
result_file=$(mktemp "${TMPDIR:-/tmp}/cow-routine-result.XXXXXX")
export COW_ROUTINE_RESULT_FILE="$result_file"
trap 'echo canceled > "$status_file"' INT TERM
python3 - "$name" "$started" "$$" "$COW_ROUTINE_EXECUTION_ID" > "$DIR/$name.running" <<'PY'
import json, sys
print(json.dumps(dict(name=sys.argv[1], startedAt=int(sys.argv[2])*1000, pid=int(sys.argv[3]), executionID=sys.argv[4])))
PY

"$@" 2>&1 | tee "$out"
rc=${PIPESTATUS[0]}
ended=$(date +%s)

status=ok
[ "$rc" -ne 0 ] && status=failed
if [ -s "$status_file" ]; then status=$(head -1 "$status_file"); fi
# Summary: the last meaningful line — no colour codes, no tool echoes, no report paths, no daily-capture noise.
last_line() {
  sed -E $'s/\x1b\\[[0-9;]*[A-Za-z]//g' "$1" | grep -v -E '^[[:space:]]*$|^\$ |^→ |^Report: |^=== |^No pending daily entries' | tail -1 | cut -c1-240
}
summary=$(last_line "$out")
if [ -z "$summary" ] && [ -n "$job_log" ] && [ -f "$job_log" ]; then summary=$(last_line "$job_log"); fi
python3 - "$name" "$started" "$ended" "$status" "$rc" "$summary" "$COW_ROUTINE_EXECUTION_ID" "$result_file" "$DIR/ledger.jsonl" <<'PY'
import json, sys, fcntl
name, started, ended, status, rc, summary, execution, result, ledger = sys.argv[1:]
try:
    with open(result) as f: session = json.load(f)
except (ValueError, OSError): session = {}
entry = dict(name=name, startedAt=int(started)*1000, endedAt=int(ended)*1000,
             status=status, rc=int(rc), summary=summary, executionID=execution,
             sessionID=session.get("sessionID"), directory=session.get("directory"))
with open(ledger, "a") as f:
    fcntl.flock(f, fcntl.LOCK_EX)
    f.write(json.dumps(entry)+"\n")
    f.flush()
PY
rm -f "$DIR/$name.running" "$status_file" "$out" "$result_file"
exit "$rc"
