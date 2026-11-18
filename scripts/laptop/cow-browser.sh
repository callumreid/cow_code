#!/bin/bash
# The MacBook's agent Chrome, the same shape as barn's (scripts/box/cow-browser.sh): one dedicated
# profile so sign-ins persist, DevTools on loopback 9222 so the watch view (cow-eyes) and every
# thread's browser tools share ONE browser, each thread in its own tab.
# Unlike barn it must stay out of Callum's way, because he uses Chrome on this machine:
# - It is Chrome for Testing (cow-agent-chrome-install.sh), not Google Chrome.app. Two processes
#   from one app bundle confused macOS: his Dock clicks and links went to the agent browser.
# - It runs windowless (--headless=new): no Dock icon, no window per thread. Watch it and take
#   control from the Browser panel in CowCode.
source "$(dirname "$0")/cow-env.sh"
APP="$(ls -d "$COW_AGENT_CHROME_ROOT"/*/chrome-mac-arm64/"Google Chrome for Testing.app" 2>/dev/null | sort -V | tail -1)"
if [ -z "$APP" ]; then
  echo "no Chrome for Testing under $COW_AGENT_CHROME_ROOT: run scripts/laptop/cow-agent-chrome-install.sh" >&2
  exit 1
fi
mkdir -p "$COW_BROWSER_PROFILE"
exec "$APP/Contents/MacOS/Google Chrome for Testing" \
  --headless=new \
  --user-data-dir="$COW_BROWSER_PROFILE" \
  --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 \
  --no-first-run --no-default-browser-check --hide-crash-restore-bubble --disable-session-crashed-bubble \
  --disable-backgrounding-occluded-windows --disable-renderer-backgrounding \
  --window-size=1280,800 \
  "about:blank"
