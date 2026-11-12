#!/bin/bash
# The MacBook's agent Chrome, the same shape as barn's (scripts/box/cow-browser.sh): one dedicated
# profile so sign-ins persist, DevTools on loopback 9222 so the watch view (cow-eyes) and every
# thread's browser tools share ONE browser, each thread in its own tab.
source "$(dirname "$0")/cow-env.sh"
mkdir -p "$COW_BROWSER_PROFILE"
exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$COW_BROWSER_PROFILE" \
  --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 \
  --no-first-run --no-default-browser-check --hide-crash-restore-bubble --disable-session-crashed-bubble \
  --disable-backgrounding-occluded-windows --disable-renderer-backgrounding \
  --window-size=1280,800 --window-position=40,40 \
  "about:blank"
