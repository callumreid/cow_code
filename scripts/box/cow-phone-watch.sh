#!/bin/bash
# cow-phone-watch.sh: keeps the phone door honest. Runs forever under launchd (dev.bronson.cow-phone-watch).
# Every tick (120 s) it reads the tunnel hostname from cow-public.log and pings the gate locally and through
# the tunnel (the key travels in a Cookie header, never in the URL: cloudflared logs the full URL of failed
# requests), then:
#   - link changed (new hostname or new key): write ~/.config/cow/phone-url and DM it once it answers publicly
#   - public down for 3 ticks and >= 5 min while the gate and the box's internet are fine: restart cow-public
#     once (that rotates the hostname; the new link is DM'd next tick), then wait 10 min before another try.
#     touch ~/.config/cow/cow-phone-watch.no-restart to turn the restart off.
#   - still down after 10 min: DM "stuck" (with what is failing), at most once an hour
# No more than one DM an hour, except a genuine link change. State: ~/.coval/logs/cow-phone-watch.state
# (key=value). One line per tick in ~/Library/Logs/cow-phone-watch.log, kept under 2 MB.
# Slack DMs and tunnel restarts only happen once Callum has said yes: touch ~/.config/cow/cow-phone-watch.armed.
# Until then the watchdog only watches, writes the url file and logs what it would have done.
# Test knobs: WATCH_INTERVAL, WATCH_ONCE=1, COW_GATE_URL, COW_PUBLIC_BASE, COW_PHONE_RESTART_CMD; paths hang off HOME.
export HOME=${HOME:-/Users/bronson}
export PATH=/opt/homebrew/bin:$HOME/bin:/usr/bin:/bin:/usr/sbin:/sbin
umask 077
interval=${WATCH_INTERVAL:-120}
gate_url=${COW_GATE_URL:-http://127.0.0.1:4098}
public_log="$HOME/Library/Logs/cow-public.log"
log="$HOME/Library/Logs/cow-phone-watch.log"
state="$HOME/.coval/logs/cow-phone-watch.state"
url_file="$HOME/.config/cow/phone-url"
token_file="$HOME/.config/opencode/gate-token"
no_restart="$HOME/.config/cow/cow-phone-watch.no-restart"
armed_file="$HOME/.config/cow/cow-phone-watch.armed"
mkdir -p "$(dirname "$log")" "$(dirname "$state")" "$(dirname "$url_file")"

get() { grep "^$1=" "$state" 2>/dev/null | head -1 | cut -d= -f2-; }
save() {
  printf 'origin=%s\nannounced=%s\nfails=%s\ndown_since=%s\nlast_dm=%s\nlast_restart=%s\nstuck_dm=%s\nwould_dm=%s\nrestarts=%s\n' \
    "$origin" "$announced" "$fails" "$down_since" "$last_dm" "$last_restart" "$stuck_dm" "$would_dm" "$restarts" > "$state.tmp" && mv "$state.tmp" "$state"
}
dm() {
  if [ ! -e "$armed_file" ]; then
    # Log each withheld message once, not every tick.
    local would="${1//$token/<key>}"
    [ "$would" = "$(get would_dm)" ] || echo "$(date +%FT%T%z) (not armed) would DM: $would" >> "$log"
    would_dm=$would
    return 1
  fi
  "$HOME/bin/cow-notify.sh" "$1" >/dev/null 2>&1
}
ping_ok() { curl -s -m "$2" -H "Cookie: cowcode_gate=$token" "$1/_cow/ping" 2>/dev/null | grep -q '"ok":true'; }
code() { curl -s -m "$2" -o /dev/null -w '%{http_code}' "$1" 2>/dev/null; }

while :; do
  now=$(date +%s)
  # Truncate in place: launchd holds the log open for stdout, so no rename.
  if [ -f "$log" ] && [ "$(stat -f %z "$log")" -gt 2000000 ]; then tail -n 2000 "$log" > "$log.tmp"; cat "$log.tmp" > "$log"; rm -f "$log.tmp"; fi
  # launchd recreates cow-public.log 644 after a truncation; it can carry request URLs.
  [ -f "$public_log" ] && [ "$(stat -f %Lp "$public_log")" != 600 ] && chmod 600 "$public_log"
  token=$(head -1 "$token_file" 2>/dev/null)
  if [ -z "$token" ]; then
    echo "$(date +%FT%T%z) no gate token at $token_file; nothing to watch" >> "$log"
    [ -n "${WATCH_ONCE:-}" ] && exit 1
    sleep "$interval"; continue
  fi
  origin=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$public_log" 2>/dev/null | tail -1)
  announced=$(get announced)
  fails=$(get fails); fails=${fails:-0}
  down_since=$(get down_since); down_since=${down_since:-0}
  last_dm=$(get last_dm); last_dm=${last_dm:-0}
  last_restart=$(get last_restart); last_restart=${last_restart:-0}
  restarts=$(get restarts)
  stuck_dm=$(get stuck_dm); stuck_dm=${stuck_dm:-0}
  would_dm=$(get would_dm)
  actions=""

  local_ok=down; ping_ok "$gate_url" 8 && local_ok=ok
  public_ok=down; [ -n "$origin" ] && ping_ok "${COW_PUBLIC_BASE:-$origin}" 20 && public_ok=ok

  # The link is (hostname, key): a key rotation needs a new DM as much as a hostname rotation does.
  key=""; url=""
  if [ -n "$origin" ]; then
    key=$(printf '%s' "$origin$token" | shasum -a 256 | cut -c1-16)
    url="$origin/?_cowcode_gate=$token"
    if [ "$(cat "$url_file" 2>/dev/null)" != "$url" ]; then printf '%s\n' "$url" > "$url_file"; chmod 600 "$url_file"; actions="$actions url-file"; fi
  fi
  if [ -n "$key" ] && [ "$key" != "$announced" ] && [ "$public_ok" = ok ]; then
    dm "the barn door moved: $url (open it once on your phone and re-add it to your home screen)" && { announced=$key; last_dm=$now; actions="$actions dm-link"; }
  fi

  wan=-; ready=-
  if [ "$public_ok" = ok ]; then
    if [ "$stuck_dm" = 1 ]; then
      [ $((now - last_dm)) -ge 3600 ] && dm "the barn door is open again: ${origin#https://} answers from the internet" && { last_dm=$now; actions="$actions dm-open"; }
      stuck_dm=0
    fi
    fails=0; down_since=0
  else
    fails=$((fails + 1)); [ "$down_since" = 0 ] && down_since=$now
    down_for=$((now - down_since))
    wan=down; [ "$(code https://www.cloudflare.com/cdn-cgi/trace 10)" = 200 ] && wan=ok
    port=$(grep -o 'metrics server on 127.0.0.1:[0-9]*' "$public_log" 2>/dev/null | tail -1 | grep -o '[0-9]*$')
    [ -n "$port" ] && ready=$(code "http://127.0.0.1:$port/ready" 3)
    restart_note="never restarted"
    [ "$last_restart" != 0 ] && restart_note="restarted $(((now - last_restart) / 60)) min ago"
    [ -e "$no_restart" ] && restart_note="restart off ($no_restart)"
    [ -e "$armed_file" ] || restart_note="restart off (not armed)"
    # Restart timestamps from the last hour, so a flapping edge cannot mint a new hostname every ten minutes.
    recent=""; for t in $(echo "$restarts" | tr , " "); do [ -n "$t" ] && [ $((now - t)) -lt 3600 ] && recent="$recent,$t"; done
    recent=${recent#,}; hour_count=0; [ -n "$recent" ] && hour_count=$(echo "$recent" | tr , "\n" | grep -c .)
    [ "$hour_count" -ge 2 ] && restart_note="restart off (2 already this hour)"
    # Only restart when the box itself is online: with the WAN down a restart just burns the hostname.
    if [ "$local_ok" = ok ] && [ "$fails" -ge 3 ] && [ "$down_for" -ge 300 ] && [ $((now - last_restart)) -ge 600 ] && [ "$wan" = ok ] && [ ! -e "$no_restart" ] && [ -e "$armed_file" ] && [ "$hour_count" -lt 2 ]; then
      ${COW_PHONE_RESTART_CMD:-launchctl kickstart -k gui/$(id -u)/dev.bronson.cow-public} >> "$log" 2>&1
      last_restart=$now; recent="${recent:+$recent,}$now"; actions="$actions restart"
    fi
    restarts=$recent
    if [ "$down_for" -gt 600 ] && [ $((now - last_dm)) -ge 3600 ]; then
      what="no answer from ${origin:-the tunnel (no hostname in cow-public.log)} for $((down_for / 60)) min; gate on the box $local_ok, box internet $wan, tunnel ready=$ready, $restart_note"
      dm "the barn door is stuck: $what" && { last_dm=$now; stuck_dm=1; actions="$actions dm-stuck"; }
    fi
  fi
  save
  actions=${actions# }
  echo "$(date +%FT%T%z) origin=${origin:-none} local=$local_ok public=$public_ok fails=$fails down=$(( (down_since > 0 ? now - down_since : 0) / 60 ))m wan=$wan ready=$ready actions=${actions:-none}" >> "$log"
  [ -n "${WATCH_ONCE:-}" ] && exit 0
  sleep "$interval"
done
