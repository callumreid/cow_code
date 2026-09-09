#!/bin/bash
# Slack door for the farmer, kept alive by launchd (dev.bronson.cow-slack).
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin
[ -f "$HOME/.config/cow/secrets.env" ] && source "$HOME/.config/cow/secrets.env"
[ -f "$HOME/.config/cow/slack-tokens.env" ] && source "$HOME/.config/cow/slack-tokens.env"
if [ -z "${COW_SLACK_BOT_TOKEN:-}" ] || [ -z "${COW_SLACK_APP_TOKEN:-}" ]; then
  echo "$(date '+%F %T') cow-slack: waiting for COW_SLACK_BOT_TOKEN / COW_SLACK_APP_TOKEN in ~/.config/cow/slack-tokens.env (written by: slack run in packages/slack)"
  sleep 1800
  exit 0
fi
exec "$HOME/.local/bin/cow-slack"
