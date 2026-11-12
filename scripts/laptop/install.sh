#!/bin/bash
# Make the MacBook a full stand-in for barn: the same Slack door (on standby), the same shared agent
# Chrome with per-thread tabs and its watch view, and the same browser tools. Re-running is safe.
# Run from the repo: bash scripts/laptop/install.sh   (builds packages/slack and packages/cow-eyes)
# The CowCode desktop app must be restarted afterwards to pick up the browser tool change.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
log() { printf '\033[1;32m[laptop]\033[0m %s\n' "$*"; }
UID_NUM="$(id -u)"

log "build the Slack door and the browser bridge"
(cd "$ROOT/packages/slack" && bun run build >/dev/null)
(cd "$ROOT/packages/cow-eyes" && bun run build >/dev/null)
mkdir -p "$HOME/.local/bin" "$HOME/bin/cow-laptop" "$HOME/.coval/state" "$HOME/.coval/logs"
for b in "$ROOT/packages/slack/dist/cow-slack" "$ROOT/packages/cow-eyes/dist/cow-eyes" "$ROOT/packages/cow-eyes/dist/cow-browser-agent"; do
  install -m 755 "$b" "$HOME/.local/bin/$(basename "$b").new"
  mv "$HOME/.local/bin/$(basename "$b").new" "$HOME/.local/bin/$(basename "$b")"
done
for f in cow-env.sh cow-browser.sh cow-eyes.sh cow-slack.sh; do install -m 755 "$HERE/$f" "$HOME/bin/cow-laptop/$f"; done

log "Slack tokens"
if [ ! -s "$HOME/.config/cow/slack-tokens.env" ]; then
  mkdir -p "$HOME/.config/cow"
  ( umask 077
    { echo "export COW_SLACK_BOT_TOKEN=$(secret get secrets.yaml cow_slack_bot_token)"
      echo "export COW_SLACK_APP_TOKEN=$(secret get secrets.yaml cow_slack_app_token)"; } > "$HOME/.config/cow/slack-tokens.env" )
fi

log "browser tools go through the shared agent Chrome"
python3 - <<'PY'
import json, os, shutil, time
p = os.path.expanduser("~/.config/opencode/opencode.json")
c = json.load(open(p))
want = {"type": "local", "enabled": True, "command": [os.path.expanduser("~/.local/bin/cow-browser-agent")],
        "environment": {"COW_BROWSER_OUTPUT_DIR": os.path.expanduser("~/Library/Application Support/CowCode/browser-output")}}
if (c.get("mcp") or {}).get("playwright") != want:
    shutil.copy2(p, p + time.strftime(".bak-%Y%m%d-%H%M%S-pre-cow-laptop"))
    c.setdefault("mcp", {})["playwright"] = want
    json.dump(c, open(p + ".tmp", "w"), indent=2); os.replace(p + ".tmp", p)
    print("  mcp.playwright -> cow-browser-agent (restart CowCode to use it)")
PY

log "agent rules"
A="$HOME/.config/opencode/AGENTS.md"
grep -q "cow-slack say" "$A" 2>/dev/null || cat "$HERE/opencode-AGENTS.laptop.md" >> "$A"

log "services"
for j in cow-browser cow-eyes cow-slack; do
  src="$HERE/launchd/dev.bronson.$j.plist"; dst="$HOME/Library/LaunchAgents/dev.bronson.$j.plist"
  cp "$src" "$dst"
  launchctl bootout "gui/$UID_NUM/dev.bronson.$j" 2>/dev/null || true
  launchctl bootstrap "gui/$UID_NUM" "$dst"
  log "  $j loaded"
done
