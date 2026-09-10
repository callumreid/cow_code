#!/bin/bash
# provision-mac.sh: make this Mac the always-on cow_code box. Idempotent, user-level (no sudo).
#
# Run ON the box, from a checkout of cow_code:   bash scripts/box/provision-mac.sh
# Assumes: Homebrew, the Tailscale app, Docker Desktop (in /Applications), and a GitHub SSH key
# are already present, and that the cow server binary was built on a Mac with
#   bun run packages/opencode/script/build.ts --single
# and copied to ~/.local/bin/opencode. Secrets are NEVER written by this script:
#   ~/.config/cow/secrets.env         shell exports (Linear, Slack, Datadog, ...)
#   ~/.local/share/opencode/auth.json opencode provider keys
#   ~/.config/opencode/opencode.json  opencode config (farmer agent, providers)
#   ~/coval/frontend/.env.local       frontend env
#   COW_SLACK_BOT_TOKEN / COW_SLACK_APP_TOKEN in secrets.env for the Slack door (slack-manifest.json)
# Re-running is safe: every step checks before it changes anything.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"
log() { printf '\033[1;32m[box]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[box] WARN\033[0m %s\n' "$*"; }
UID_NUM="$(id -u)"

[ "$(uname -m)" = "arm64" ] || warn "not Apple silicon; Rosetta-based amd64 containers will not apply"
command -v brew >/dev/null || { echo "Homebrew is required (https://brew.sh)"; exit 1; }

log "directories"
mkdir -p "$HOME/bin" "$HOME/.config/cow" "$HOME/.config/opencode" "$HOME/.config/git" "$HOME/.local/bin" \
  "$HOME/.local/share/opencode" "$HOME/Library/LaunchAgents" "$HOME/Library/LaunchAgents.disabled" \
  "$HOME/Library/Logs" "$HOME/coval" "$HOME/coval-worktrees"

log "brew packages"
for pkg in cloudflared node gh awscli git; do
  brew list --formula "$pkg" >/dev/null 2>&1 || brew install "$pkg"
done
[ -d /Applications/Docker.app ] || warn "Docker Desktop missing: brew install --cask docker (may ask for admin)"

log "claude code (native installer, user-level)"
if [ ! -x "$HOME/.local/bin/claude" ]; then curl -fsSL https://claude.ai/install.sh | bash; fi
if brew list --cask claude-code >/dev/null 2>&1; then brew uninstall --cask claude-code; fi
[ -e /opt/homebrew/bin/claude ] || ln -s "$HOME/.local/bin/claude" /opt/homebrew/bin/claude

log "cow server binary"
[ -x "$HOME/.local/bin/opencode" ] || warn "~/.local/bin/opencode missing: build on a Mac and copy it here"

log "server password + phone gate token"
PW="$HOME/.config/opencode/server-password"
if [ ! -s "$PW" ]; then (umask 077; openssl rand -base64 48 | tr -d '/+=\n' | head -c 40 > "$PW"; echo >> "$PW"); fi
chmod 600 "$PW"
GT="$HOME/.config/opencode/gate-token"
if [ ! -s "$GT" ]; then (umask 077; node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64url")+"\n")' > "$GT"); fi
chmod 600 "$GT"

log "secrets"
[ -f "$HOME/.config/cow/secrets.env" ] || warn "~/.config/cow/secrets.env missing: write it by hand (600); the server starts without it"
grep -q 'config/cow/secrets.env' "$HOME/.zshrc" 2>/dev/null || printf '\n# cow box secrets\n[ -f ~/.config/cow/secrets.env ] && source ~/.config/cow/secrets.env\n' >> "$HOME/.zshrc"

log "git identity guard"
if [ -x "$HOME/.config/git/hooks/coval-identity-guard" ]; then
  git config --global core.hooksPath "$HOME/.config/git/hooks"
else
  warn "~/.config/git/hooks (identity guard) missing: copy it from the laptop"
fi
[ "$(git config --global user.email || true)" = "callum@coval.dev" ] || warn "global git user.email is not callum@coval.dev; fix it by hand, never via an agent"

log "services"
changed=0
for f in cow-serve.sh cow-gate.js cow-slack.sh claude-rc.sh cow-browser.sh cow-eyes.sh cow-pipeline.sh; do
  if ! cmp -s "$HERE/$f" "$HOME/bin/$f"; then install -m 755 "$HERE/$f" "$HOME/bin/$f"; changed=1; fi
done
[ -x "$HOME/.local/bin/cow-slack" ] || warn "~/.local/bin/cow-slack missing: build with 'bun run build' in packages/slack and copy it here"
[ -x "$HOME/.local/bin/cow-eyes" ] || warn "~/.local/bin/cow-eyes missing: build with 'bun run build' in packages/cow-eyes and copy it here"
[ -d "/Applications/Google Chrome.app" ] || warn "Google Chrome missing: the box's browser (cow-browser) needs it"
# (Re)load a job only when its plist changed, a script it runs changed, or it is not loaded.
# cow-public is a cloudflared quick tunnel: restarting it rotates the phone URL, so leave it alone when nothing changed.
for j in cow-awake cow-browser cow-eyes cow-server cow-gate cow-public cow-slack claude-rc; do
  src="$HERE/launchd/dev.bronson.$j.plist"; dst="$HOME/Library/LaunchAgents/dev.bronson.$j.plist"
  loaded=0; launchctl print "gui/$UID_NUM/dev.bronson.$j" >/dev/null 2>&1 && loaded=1
  same=0; cmp -s "$src" "$dst" && same=1
  needs=0
  [ "$same" = 1 ] && [ "$loaded" = 1 ] || needs=1
  [ "$j" != cow-public ] && [ "$changed" = 1 ] && needs=1
  [ "$needs" = 1 ] || { log "  $j unchanged, left running"; continue; }
  install -m 644 "$src" "$dst"
  launchctl bootout "gui/$UID_NUM/dev.bronson.$j" >/dev/null 2>&1 || true
  for _ in $(seq 1 20); do launchctl print "gui/$UID_NUM/dev.bronson.$j" >/dev/null 2>&1 || break; sleep 0.5; done
  ok=0
  for _ in $(seq 1 10); do
    if launchctl bootstrap "gui/$UID_NUM" "$dst" 2>/dev/null; then ok=1; break; fi
    sleep 1
  done
  [ "$ok" = 1 ] && log "  $j (re)loaded" || warn "  $j failed to load"
done

log "retire jobs that compete with the box (moved to ~/Library/LaunchAgents.disabled)"
for j in dev.bronson.llama-server ai.openclaw.awake ai.openclaw.sentinel ai.openclaw.ddbd ai.openclaw.watchdog ai.openclaw.morning-brief \
         ai.openclaw.pr-comment-fixer com.bronson.bloviate-driver-desktop-codex com.bronson.bloviate-driver-global-ptt \
         com.bronson.bloviate-driver-phone com.bronson.bloviate-driver-voice-overlay com.bronson.obsidian-auto-push; do
  if [ -f "$HOME/Library/LaunchAgents/$j.plist" ]; then
    launchctl bootout "gui/$UID_NUM/$j" >/dev/null 2>&1 || true
    mv "$HOME/Library/LaunchAgents/$j.plist" "$HOME/Library/LaunchAgents.disabled/"
    log "  disabled $j"
  fi
done
brew services stop ollama >/dev/null 2>&1 || true

log "coval repos"
for r in backend frontend docs sofia-agent sofia-infra coval-infra cli mcp-server internal-docs; do
  d="$HOME/coval/$r"
  if [ ! -d "$d/.git" ]; then git clone -q "git@github.com:coval-ai/$r.git" "$d" && log "  cloned $r"; continue; fi
  git -C "$d" fetch origin main -q || { warn "  $r: fetch failed"; continue; }
  if [ "$(git -C "$d" branch --show-current)" = "main" ]; then
    git -C "$d" merge -q --ff-only origin/main >/dev/null 2>&1 || warn "  $r: main not fast-forwardable (dirty?)"
  fi
done
[ -f "$HOME/coval/backend/.env" ] || install -m 600 "$HERE/backend.env" "$HOME/coval/backend/.env"
[ -f "$HOME/coval/backend/.dev_id" ] || printf 'COVAL_DEV_ID=callum\n' > "$HOME/coval/backend/.dev_id"

log "opencode: shared browser for the agent (playwright over CDP) + box rules"
mkdir -p "$HOME/.config/cow/browser-output"
python3 - <<'PY'
import json, os
p = os.path.expanduser("~/.config/opencode/opencode.json")
try: c = json.load(open(p))
except Exception: c = {}
want = {"type": "local", "enabled": True, "command": ["npx", "-y", "@playwright/mcp@0.0.80", "--cdp-endpoint", "http://127.0.0.1:9222", "--image-responses=allow", "--output-dir", os.path.expanduser("~/.config/cow/browser-output")]}
if (c.get("mcp") or {}).get("playwright") != want:
    c.setdefault("mcp", {})["playwright"] = want
    json.dump(c, open(p, "w"), indent=2); print("  mcp.playwright -> cdp 127.0.0.1:9222")
PY
A="$HOME/.config/opencode/AGENTS.md"
grep -q "cow-eyes" "$A" 2>/dev/null || { cat "$HERE/opencode-AGENTS.box.md" >> "$A"; log "  box rules appended to ~/.config/opencode/AGENTS.md"; }

log "opencode: chatgpt subscription provider (its own id so the openai key keeps gpt-5.6 + voice)"
python3 - <<'PY'
import json, os
p = os.path.expanduser("~/.config/opencode/opencode.json")
c = json.load(open(p))
lim = {"context": 400000, "output": 128000}
want = {"npm": "@ai-sdk/openai", "name": "ChatGPT (Pro/Plus subscription)", "options": {"baseURL": "https://api.openai.com/v1"},
        "models": {"gpt-5.5": {"name": "GPT-5.5 (ChatGPT)", "limit": lim},
                   "gpt-5.3-codex-spark": {"name": "GPT-5.3 Codex Spark (ChatGPT)", "limit": lim}}}  # gpt-5.4 and 5.4-mini: rejected by the Codex backend for ChatGPT accounts (2026-09-09)
if c.setdefault("provider", {}).get("chatgpt") != want:
    c["provider"]["chatgpt"] = want; json.dump(c, open(p, "w"), indent=2); print("  provider.chatgpt written (sign in: POST /provider/chatgpt/oauth/authorize, open the url in the computer view, then POST .../oauth/callback with the same method index)")
PY

log "coval scheduled-job scripts (box versions: attached to the server, routine titles, guard, archived filter)"
mkdir -p "$HOME/coval/scripts"
for f in "$HERE"/coval-scripts/*.sh; do
  b=$(basename "$f")
  if ! cmp -s "$f" "$HOME/coval/scripts/$b"; then install -m 755 "$f" "$HOME/coval/scripts/$b"; log "  installed coval/scripts/$b"; fi
done
for f in cow-routine-guard.sh cow-routine-run.sh cow-notify.sh pr-keep-updated.sh cow-health.sh cow-deploy-server.sh; do
  if ! cmp -s "$HERE/$f" "$HOME/bin/$f"; then install -m 755 "$HERE/$f" "$HOME/bin/$f"; log "  installed bin/$f"; fi
done
# Titles/descriptions/hour windows for the app's Scheduled view (the schedule itself is read from the plists).
mkdir -p "$HOME/.config/opencode"
if ! cmp -s "$HERE/routines.json" "$HOME/.config/opencode/routines.json"; then install -m 644 "$HERE/routines.json" "$HOME/.config/opencode/routines.json"; log "  installed routines.json"; fi
mkdir -p "$HOME/.coval/logs/routines"
for j in dev.coval.pr-review-sweep dev.coval.pr-review-queue dev.coval.pr-review-fixer dev.coval.pr-keep-updated dev.coval.daily-workers-health-audit dev.coval.daily-prod-validation dev.bronson.cow-health; do
  if [ -f "$HERE/launchd/$j.plist" ] && ! cmp -s "$HERE/launchd/$j.plist" "$HOME/Library/LaunchAgents/$j.plist"; then
    install -m 644 "$HERE/launchd/$j.plist" "$HOME/Library/LaunchAgents/$j.plist"
    launchctl bootout "gui/$UID_NUM/$j" >/dev/null 2>&1 || true
    for _ in $(seq 1 10); do launchctl bootstrap "gui/$UID_NUM" "$HOME/Library/LaunchAgents/$j.plist" 2>/dev/null && break; sleep 1; done
    log "  scheduled job $j (re)loaded"
  fi
done

log "tailscale"
TS=/Applications/Tailscale.app/Contents/MacOS/Tailscale
if [ -x "$TS" ]; then
  "$TS" debug prefs 2>/dev/null | grep -q '"RouteAll": true' || warn "tailscale is not accepting routes: tailscale set --accept-routes"
else
  warn "Tailscale app missing"
fi

log "docker"
# Over ssh/launchd there is no GUI keychain session, so the keychain credential helper cannot store
# registry logins ("User interaction is not allowed"); keep registry tokens in ~/.docker/config.json.
python3 - <<'PY'
import json, os
p = os.path.expanduser("~/.docker/config.json")
try: d = json.load(open(p))
except Exception: d = {}
if "credsStore" in d or "credHelpers" in d:
    d.pop("credsStore", None); d.pop("credHelpers", None)
    json.dump(d, open(p, "w"), indent=2); os.chmod(p, 0o600); print("  docker: credential helper disabled (file store)")
PY
open -ga Docker
for _ in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 4; done
docker info >/dev/null 2>&1 && log "  docker $(docker info --format '{{.ServerVersion}} cpus={{.NCPU}} mem={{.MemTotal}}')" || warn "  docker did not come up"
# An amd64 process under Rosetta maps /run/rosetta/rosetta; under qemu it does not.
if docker run --rm --platform linux/amd64 alpine:3.20 grep -q rosetta /proc/self/maps 2>/dev/null; then
  log "  amd64 containers run under Rosetta"
else
  warn "  Rosetta is OFF in Docker Desktop (amd64 images will use qemu, which segfaults the uv binary): enable it in Settings > General"
fi

log "health"
sleep 3
curl -fsS -u "${COW_SERVER_USERNAME:-cow}:$(head -1 "$PW")" http://127.0.0.1:4096/global/health && echo
echo "phone url: run  cow-phone-url  on the laptop (or read ~/Library/Logs/cow-public.log here)"
echo "dev pipeline: cow-pipeline.sh start|stop|status|logs (workers take dev_id=callum runs only)"
log "done"
