#!/bin/bash
# Stable transports require prior authorization. This script does not change DNS,
# tailnet policy or gate access. launchd owns the foreground transport process.
set -euo pipefail
directory="${COW_PHONE_CONFIG_DIR:-$HOME/.config/cow}"
config="$directory/tunnel.yml"
origin="$directory/phone-origin"
transport=cloudflare
[ ! -f "$directory/phone-transport" ] || transport=$(head -1 "$directory/phone-transport")
if [ "$transport" != cloudflare ] && [ "$transport" != funnel ]; then
  echo 'phone-transport must be cloudflare or funnel' >&2
  exit 1
fi

if [ "$transport" = funnel ]; then
  if [ ! -s "$origin" ]; then
    echo 'Funnel phone access requires phone-origin' >&2
    exit 1
  fi
  address=$(head -1 "$origin")
  if ! [[ "$address" =~ ^https://([a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.ts\.net)(:(443|8443|10000))?/?$ ]]; then
    echo 'Funnel phone-origin must use this device’s ts.net hostname and HTTPS port 443, 8443 or 10000' >&2
    exit 1
  fi
  hostname=${BASH_REMATCH[1]}
  port=${BASH_REMATCH[3]:-443}
  tailscale="${COW_TAILSCALE_BIN:-/Applications/Tailscale.app/Contents/MacOS/Tailscale}"
  # Funnel always serves the local node. Refuse a plausible but different hostname.
  "$tailscale" status --json | python3 -c 'import json, sys; status=json.load(sys.stdin); sys.exit(0 if status.get("BackendState") == "Running" and status.get("Self", {}).get("DNSName", "").rstrip(".").lower() == sys.argv[1].lower() else "Funnel phone-origin does not match this running Tailscale device")' "$hostname"
  # Never replace another service, or take over a background/foreground owner.
  # An operator must explicitly migrate an existing CowCode background port first.
  "$tailscale" serve status --json | python3 -c '
import json, sys
config = json.load(sys.stdin) or {}
hostname, port = sys.argv[1:]
for current in [config, *(config.get("Foreground") or {}).values()]:
    tcp = (current.get("TCP") or {}).get(port)
    web = {key: value for key, value in (current.get("Web") or {}).items() if key.endswith(":" + port)}
    funnel = {key: value for key, value in (current.get("AllowFunnel") or {}).items() if key.endswith(":" + port) and value}
    if tcp is None and not web and not funnel:
        continue
    owned = tcp == {"HTTPS": True} and web == {hostname + ":" + port: {"Handlers": {"/": {"Proxy": "http://127.0.0.1:4098"}}}} and all(key == hostname + ":" + port for key in funnel)
    sys.exit("CowCode Funnel port already has an owner; explicitly stop only this port before moving it to launchd" if owned else "Funnel port is occupied by another service; existing routes were not changed")
' "$hostname" "$port"
  exec "$tailscale" funnel --yes "--https=$port" http://127.0.0.1:4098
fi

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
  exec "${COW_CLOUDFLARED_BIN:-/opt/homebrew/bin/cloudflared}" tunnel --no-autoupdate --config "$config" run
fi
exec "${COW_CLOUDFLARED_BIN:-/opt/homebrew/bin/cloudflared}" tunnel --no-autoupdate --metrics 127.0.0.1:0 --url http://127.0.0.1:4098
