#!/bin/bash
# Watch/take-over view and the agents' CDP bridge for the MacBook's agent Chrome. Loopback only:
# the CowCode app's Browser panel reaches it at 127.0.0.1:4099 when it is on this machine's server.
source "$(dirname "$0")/cow-env.sh"
export COW_EYES_HOST=127.0.0.1
export COW_BROWSER_WINDOW=40,40,1280,800
exec "$HOME/.local/bin/cow-eyes"
