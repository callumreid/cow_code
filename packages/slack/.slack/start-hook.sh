#!/bin/sh
# Called by `slack run`: the CLI hands the bot and app-level tokens to this process.
# Persist them for the box (never printed) and exit; the app itself runs on the mini.
out="$HOME/.config/cow/slack-tokens.env"
mkdir -p "$HOME/.config/cow"
umask 077
{
  echo "export COW_SLACK_BOT_TOKEN=$SLACK_CLI_XOXB"
  echo "export COW_SLACK_APP_TOKEN=$SLACK_CLI_XAPP"
} > "$out"
echo "tokens written to $out (bot ${#SLACK_CLI_XOXB} chars, app ${#SLACK_CLI_XAPP} chars)"
sleep 2
