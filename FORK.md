# cow_code 🐄

Fork of [sst/opencode](https://github.com/sst/opencode) focused on bringing the desktop app
to parity with the Claude / Codex desktop apps. Repo: `callumreid/cow_code`,
branch `coval-desktop-parity` (off `dev`).

## What changed and why

| # | Complaint | Fix |
|---|-----------|-----|
| 1 | No movement indicator while thinking — is it stuck? | Persistent status line above the composer: spinner + phase + live elapsed ("Thinking… 12s", "Running bash… 34s", retry countdown). Same phase+elapsed as a tooltip on the sidebar spinner. |
| 2 | Gets stuck silently, no needs-attention signal | Client-side watchdog: session busy + no events for 120s (or retry attempt ≥ 5) → persistent toast with go-to-session, pulsing amber sidebar badge, dock badge/bounce. Error notifications now default ON; child-session errors roll up to the parent; connection-loss and dead-sidecar states are surfaced instead of console-only. |
| 3 | No way to pin important threads | First-class `time.pinned` (real DB column cloning the archive pattern, schema → migration → API → SDK → UI). Pin/Unpin from the session menu; pinned sessions sort above everything and get a "Pinned" group on Home. Pinning never bumps `time.updated`, so pinning doesn't reorder other sessions. |
| 4 | Can't rename from sidebar; threads stay "New session" | Dropdown + right-click menu on every session row (sidebar and Home): Rename (inline editor), Pin/Unpin, Archive. Auto-title now retries every turn (bounded to the first 5) while the title is still default, grounded on the first real user message — a single failed title generation no longer leaves "New session" forever. |
| 5 | No visibility into subagents, subprocesses, token use | "Running work" side-panel tab: live subagents (status, elapsed, per-child tokens/cost, click-through) and running tools (name + elapsed). Context-usage tooltip gains a separate subagents token/cost line. |
| 6 | No remote handoff / phone access to threads | Settings → Servers → "Remote access": toggles the local server onto the LAN (default off, never persisted, random password kept) and shows a QR code; scanning it opens the full app UI as a PWA on your phone, live-synced into the same threads. Off-LAN: pair with Tailscale. |
| 7 | No in-IDE browser/terminal/files | Terminal (PTY + ghostty-web, ctrl+`) and the file tree/diff-review stack already shipped upstream after 1.17.9 — upgrade and use them. In-app browser panel is scoped (WebContentsView plan) but not built yet. |
| 8 | Meaningfully slow vs other harnesses | **Fixed the biggest renderer cause**: streaming markdown re-lexed the whole message on every delta (O(n²)) — a 54KB message cost ~101ms of main-thread lexing per 16ms flush, freezing the UI during long outputs. Now incremental (frozen-prefix reuse): flat ~40µs/delta at any length (21×–2,430× measured), byte-identical output guarded by a 28-test equivalence suite. Two other suspects (renderable() trim, projection map rebuilds) were measured and refuted — left alone. Engine-side candidates (git snapshot on stream tap, LSP waits in edit tools, sqlite write amplification) still need live sidecar profiling. |
| 9 | Way less trace data | Engine-level trace export (see below) + the existing upstream OTLP layer. TTFT and turn→step→tool span topology added — things a plugin can never derive. |
| + | Steering (Codex parity) | While the agent is running: **Enter queues, Shift+Enter steers** — sends immediately so the in-flight run picks it up. Idle behavior unchanged. |
| 🐄 | Cow theme | The app icon is a cow (full icns/ico/png ladder, beta + dev). A couple of subtle easter eggs. Moo. |

## Traces

Two layers:

1. **Upstream engine spans** (already in opencode, off by default): set
   `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` in your login-shell env and
   `{ "experimental": { "openTelemetry": true } }` in `~/.config/opencode/opencode.json`.
2. **Fork additions** (`experimental.traceExport: true` in opencode.json, default off):
   first-class turn/step/tool spans with `gen_ai.*` token attrs, cost and `ttft_ms`, exported
   to `OTEL_EXPORTER_OTLP_ENDPOINT` (default `http://localhost:4318`). Uses the same
   deterministic span-ID scheme as the `datadog-otel.js` plugin so both line up in one trace —
   and because the engine emits a superset (step spans + TTFT) with *correct* turn end times
   (the plugin treats mid-turn `finish` as terminal), set `OPENCODE_OTEL_DISABLED=1` for the
   plugin when this is on. Tool args/results are never exported (names/durations/status only).

## Verification state

All 9 touched packages typecheck (`bun run typecheck`); `packages/app` unit suite 566/566;
`packages/opencode` new tests (title retry, pin round-trip through real server+sqlite) pass.
QR encoder verified module-for-module against the python `qrcode` reference and decoded with
OpenCV. Not yet manually exercised: a full `electron-vite dev` interactive pass.

## Still open

- Perf fixes (profile the Electron sidecar first — `bun run test:bench` in packages/app)
- In-app browser panel (WebContentsView, desktop-only)
- Moo sound easter egg (no audio pipeline yet)
