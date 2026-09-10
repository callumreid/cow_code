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
export HOME=${HOME:-/Users/bronson}
name="$1"; shift
job_log=""
if [ "$1" = "--log" ]; then job_log="$2"; shift 2; fi
[ "$1" = "--" ] && shift
[ -n "$name" ] && [ $# -gt 0 ] || { echo "usage: cow-routine-run.sh <name> [--log <file>] -- <command...>" >&2; exit 64; }

DIR="$HOME/.coval/logs/routines"; mkdir -p "$DIR"
started=$(date +%s)
status_file=$(mktemp "${TMPDIR:-/tmp}/cow-routine-status.XXXXXX")
out=$(mktemp "${TMPDIR:-/tmp}/cow-routine-out.XXXXXX")
export COW_ROUTINE_STATUS_FILE="$status_file"
printf '{"name":"%s","startedAt":%s,"pid":%s}\n' "$name" "$((started * 1000))" "$$" > "$DIR/$name.running"

"$@" 2>&1 | tee "$out"
rc=${PIPESTATUS[0]}
ended=$(date +%s)

status=ok
[ "$rc" -ne 0 ] && status=failed
if [ -s "$status_file" ]; then status=$(head -1 "$status_file"); fi
summary=$(grep -v -E '^[[:space:]]*$|^Report: |^=== ' "$out" | tail -1 | cut -c1-240)
if [ -z "$summary" ] && [ -n "$job_log" ] && [ -f "$job_log" ]; then
  summary=$(grep -v -E '^[[:space:]]*$|^Report: |^=== ' "$job_log" | tail -1 | cut -c1-240)
fi
python3 - "$name" "$started" "$ended" "$status" "$rc" "$summary" >> "$DIR/ledger.jsonl" <<'PY'
import json, sys
name, started, ended, status, rc, summary = sys.argv[1:7]
print(json.dumps({"name": name, "startedAt": int(started) * 1000, "endedAt": int(ended) * 1000,
                  "status": status, "rc": int(rc), "summary": summary}))
PY
rm -f "$DIR/$name.running" "$status_file" "$out"
exit "$rc"
