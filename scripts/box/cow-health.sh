#!/bin/bash
# Box health check: prints a report; if anything is wrong, asks the farmer to tell Callum
# (which becomes a needs-you card in the office and a DM from the cow bot).
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/bin:/bin:/usr/sbin:/sbin
PW=$(head -1 "$HOME/.config/opencode/server-password")
USER_=${COW_SERVER_USERNAME:-cow}
problems=()
avail_gb=$(df -g / | tail -1 | awk '{print $4}')
[ "${avail_gb:-0}" -lt 20 ] && problems+=("disk: only ${avail_gb} GB free")
for j in cow-awake cow-browser cow-eyes cow-server cow-gate cow-public cow-slack claude-rc; do
  launchctl print "gui/$(id -u)/dev.bronson.$j" >/dev/null 2>&1 || problems+=("service dev.bronson.$j is not loaded")
done
curl -s -m 8 -u "$USER_:$PW" http://127.0.0.1:4096/global/health | grep -q '"healthy":true' || problems+=("cow server unhealthy on :4096")
curl -s -m 8 -u "$USER_:$PW" http://127.0.0.1:4099/api/health | grep -q '"ok":true' || problems+=("computer view unhealthy on :4099")
curl -s -m 5 http://127.0.0.1:9222/json/version >/dev/null || problems+=("browser DevTools not answering on :9222")
docker info >/dev/null 2>&1 || problems+=("docker is down")
origin=$(grep -o "https://[a-z0-9-]*\.trycloudflare\.com" "$HOME/Library/Logs/cow-public.log" 2>/dev/null | tail -1)
[ -n "$origin" ] || problems+=("no public tunnel origin (phone path down)")
swap=$(sysctl -n vm.swapusage | sed -E 's/.*used = ([0-9.]+)M.*/\1/')
awk -v s="${swap:-0}" 'BEGIN{exit !(s>4096)}' && problems+=("swap in use: ${swap} MB")
echo "$(date '+%F %T') box health: ${#problems[@]} problem(s); disk ${avail_gb} GB free; swap ${swap:-?} MB; phone origin ${origin:-none}"
for p in "${problems[@]}"; do echo "  - $p"; done
if [ "${#problems[@]}" -gt 0 ] && [ "${1:-}" != "--quiet" ]; then
  report=$(printf '%s\n' "${problems[@]}")
  opencode run --attach http://127.0.0.1:4096 --dir "$HOME/coval" --title "routine: box health $(date '+%Y-%m-%d %H:%M')" \
    "The box health check on this machine found problems: $report. Use the question tool to tell Callum, one line per problem, and suggest the fix. Do not try to fix anything yourself." >/dev/null 2>&1 || echo "  (could not reach the farmer to report)"
fi
