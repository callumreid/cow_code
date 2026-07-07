# cow_code — access any thread from any device (no QR)

The desktop/web app is already a thin client to whatever engine server it points at, and
the engine serves the web UI at its own URL. So the recipe for "start on my laptop, continue
on my phone, pick up on my work desktop — same live threads" is: **run one always-on engine
with a password, reach it over Tailscale, and point every device at it.** All session state
lives in that one server's SQLite (`opencode.db`), streamed to every client over SSE. No QR.

Your vault already lists an always-on Mac mini on Tailscale (`100.114.57.50` /
`callums-mac-mini.tail3bc1df.ts.net`) — that's the host.

## 1. On the Mac mini (the always-on host) — one time

**Recommended (real HTTPS hostname → installable PWA + secure cookie):**

```bash
# keep the engine on loopback, put Tailscale HTTPS in front of it
OPENCODE_SERVER_PASSWORD='pick-a-secret' \
  opencode serve --hostname 127.0.0.1 --port 4096
# in another shell:
tailscale serve --bg 4096          # serves https://callums-mac-mini.tail3bc1df.ts.net/
caffeinate -s                      # keep it awake; wrap in launchd/pm2 to survive reboots
```

(From a source checkout instead of the installed binary:
`OPENCODE_SERVER_PASSWORD='…' bun run --cwd packages/opencode --conditions=browser ./src/index.ts serve --hostname 127.0.0.1 --port 4096`. Source mode proxies the UI from app.opencode.ai, so the host needs internet; a packaged binary serves the UI fully offline.)

**Simplest (plain HTTP over Tailscale, no HTTPS):**

```bash
OPENCODE_SERVER_PASSWORD='pick-a-secret' opencode serve --hostname 0.0.0.0 --port 4096
```
Devices then use `http://100.114.57.50:4096`. `--hostname 0.0.0.0` is required so the
Tailscale interface accepts connections. Plain HTTP can't install as a PWA on iOS — use the
HTTPS option for the phone.

## 2. On each device — one time

**Laptop / work desktop (the cow_code app or a browser):**
Settings → Servers → **Add Server** → URL = `https://callums-mac-mini.tail3bc1df.ts.net/`
(or `http://100.114.57.50:4096/`), Username = `opencode`, Password = your secret →
**Set as Default.** Credentials are persisted, so it boots straight onto the remote every
launch — no re-entry.

**Phone (browser → PWA):** open this exact URL once —
```
https://callums-mac-mini.tail3bc1df.ts.net/?auth_token=<TOKEN>
```
where `<TOKEN>` = `printf 'opencode:pick-a-secret' | base64`. The token is exchanged for an
HttpOnly cookie and scrubbed from the URL; then **Add to Home Screen**. The installed PWA
reuses the cookie and targets the host automatically. (This is exactly what the QR in the
Remote Access dialog encodes — you're just typing/bookmarking it instead of scanning.)

## Optional: bake the server URL into a self-hosted web build

So a device targets the remote with zero "Add Server" step (password still supplied once via
`?auth_token`):

```bash
VITE_OPENCODE_DEFAULT_SERVER=https://callums-mac-mini.tail3bc1df.ts.net \
  bun run --cwd packages/app build
```
(This is wired via `getDefaultUrl()` in `packages/app/src/entry.tsx`; never bake the password
into a `VITE_` var — it would ship in the JS bundle.)

## Honest limits

- **One server, one shared password.** If the Mac mini is asleep/off/unreachable, nothing
  resumes — there's no offline cache. `caffeinate -s` + a launchd plist keeps it up.
- **Hand-off, not concurrent editing.** Two devices driving the same session at once will
  race. The repo checkout and tool execution live on the host; clients drive the host's repo.
- **Private tailnet only.** The auth cookie has no `Secure` attribute (LAN origin), so don't
  expose the raw HTTP port to the public internet — keep it on Tailscale.
