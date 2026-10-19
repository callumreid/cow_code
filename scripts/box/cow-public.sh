#!/bin/bash
# A named tunnel keeps the phone address through restarts. Its hostname must already
# route to this tunnel; this script neither provisions DNS nor changes gate access.
set -euo pipefail
config="$HOME/.config/cow/tunnel.yml"
origin="$HOME/.config/cow/phone-origin"
if [ -f "$config" ] || [ -f "$origin" ]; then
  if [ ! -s "$config" ] || [ ! -s "$origin" ]; then
    echo 'Stable phone access requires both ~/.config/cow/tunnel.yml and ~/.config/cow/phone-origin' >&2
    exit 1
  fi
  address=$(head -1 "$origin")
  if ! [[ "$address" =~ ^https://[a-zA-Z0-9.-]+(:[0-9]+)?/?$ ]]; then
    echo 'phone-origin must contain one HTTPS origin without credentials, paths or query parameters' >&2
    exit 1
  fi
  exec /opt/homebrew/bin/cloudflared tunnel --no-autoupdate --config "$config" run
fi
exec /opt/homebrew/bin/cloudflared tunnel --no-autoupdate --metrics 127.0.0.1:0 --url http://127.0.0.1:4098
