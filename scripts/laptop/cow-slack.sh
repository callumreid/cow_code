#!/bin/bash
# @cowcode's Slack door on standby: off Slack while barn's cow server answers (through the
# dev.bronson.cow-tunnel forward), taking over when barn is down. See packages/slack/src/index.ts.
source "$(dirname "$0")/cow-env.sh"
[ -f "$HOME/.config/cow/slack-tokens.env" ] && source "$HOME/.config/cow/slack-tokens.env"
if [ -z "${COW_SLACK_BOT_TOKEN:-}" ] || [ -z "${COW_SLACK_APP_TOKEN:-}" ]; then
  echo "$(date '+%F %T') cow-slack: no tokens in ~/.config/cow/slack-tokens.env (secret get secrets.yaml cow_slack_bot_token / cow_slack_app_token)"
  sleep 1800
  exit 0
fi
export COW_SLACK_PRIMARY_URL=http://100.65.225.30:4097
export COW_SLACK_PRIMARY_PASSWORD_FILE="$HOME/.config/cow/barn-password"
export COW_SLACK_THREAD_PUSHES=off
export COW_SLACK_WATCH_CHANNELS=${COW_SLACK_WATCH_CHANNELS:-C0BG8R44PN2,C0C9NJZPYTW}
export COW_SLACK_SWEEP_LOOKBACK_MINUTES=60
exec "$HOME/.local/bin/cow-slack"
