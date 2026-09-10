#!/bin/bash
# DM Callum through the cow Slack bot. Usage: cow-notify.sh "text"
export HOME=/Users/bronson
[ -f "$HOME/.config/cow/slack-tokens.env" ] && source "$HOME/.config/cow/slack-tokens.env"
[ -n "${COW_SLACK_BOT_TOKEN:-}" ] && [ -n "${COW_SLACK_NOTIFY_CHANNEL:-}" ] || { echo "cow-notify: no slack tokens" >&2; exit 1; }
python3 - "$COW_SLACK_BOT_TOKEN" "$COW_SLACK_NOTIFY_CHANNEL" "$1" <<'PY'
import json, sys, urllib.request
tok, ch, text = sys.argv[1:4]
req = urllib.request.Request("https://slack.com/api/chat.postMessage", data=json.dumps({"channel": ch, "text": text}).encode(),
  headers={"authorization": f"Bearer {tok}", "content-type": "application/json"})
print("slack:", json.load(urllib.request.urlopen(req, timeout=20)).get("ok"))
PY
