#!/bin/bash
# The box's own Chrome: a dedicated profile (logins persist here), DevTools protocol on loopback
# 9222 so cow-eyes (watch/take over) and the agent's Playwright tools share ONE browser.
export HOME=/Users/bronson
PROFILE="$HOME/.config/cow/browser-profile"
mkdir -p "$PROFILE"
exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$PROFILE" \
  --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 \
  --no-first-run --no-default-browser-check --hide-crash-restore-bubble --disable-session-crashed-bubble \
  --window-size=1440,900 --window-position=0,0 \
  "about:blank"
