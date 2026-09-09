#!/bin/bash
# cow_code server on the mini. Started by launchd (dev.bronson.cow-server), kept alive.
# caffeinate -i -s: the mini never idle-sleeps while the server runs (covers a lost admin password / pmset).
export HOME=/Users/bronson
export PATH=/opt/homebrew/bin:$HOME/.local/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/bin:/bin:/usr/sbin:/sbin
[ -f "$HOME/.config/cow/secrets.env" ] && source "$HOME/.config/cow/secrets.env"
export OPENCODE_SERVER_USERNAME=opencode
export OPENCODE_SERVER_PASSWORD="$(head -1 "$HOME/.config/opencode/server-password")"
cd "$HOME/coval"
exec /usr/bin/caffeinate -i -s "$HOME/.local/bin/opencode" serve --hostname 0.0.0.0 --port 4096
