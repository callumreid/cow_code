# Browser workspace

Open the Browser panel beside a task to watch the shared Barn Chrome. The managed
Playwright tools use the same selected tab as every connected viewer. When the
agent navigates or uses a tab, the panel follows it. Signed-in state stays in the
existing Chrome profile.

Choose **Take control** before clicking, typing, pasting, navigating, or switching
tabs. New managed agent browser actions are rejected while you have control;
commands already sent to Chrome can finish. Ownership survives a dropped
connection. Choose **Return to agent** explicitly, then ask the task to continue
if it stopped to wait for you. The agent should inspect the page again before
acting because your actions may have changed it.

The managed tools retain Playwright's DOM and accessibility snapshots and include
bounding boxes, visual interaction and PDF capabilities. The ownership boundary
applies to those configured tools and the local CDP bridge. A separate tool pointed
directly at Chrome's original debugging port is outside this boundary.

**Attach screenshot** captures a PNG into the current task's draft. It does not
send the message. Downloads remain available below the browser. **Record** saves
the frames you see to a local WebM/MP4, bounded to five minutes or 50 MB; stop it
before closing the panel. Recordings contain browser video only, not audio, and
are downloaded when they stop. Model image compatibility is checked by the
composer when the screenshot is submitted.

Agents can call **browser_recording_start** and **browser_recording_stop** to
record the same visible stream without keeping the app open. This records only
the shared visible tab as it changes, not all open tabs. The encoder needs
`ffmpeg` on the machine running the managed wrapper. It saves a VP9 WebM under
`~/.config/cow/browser-output` and returns the exact server file path plus an MCP
resource link. On Barn connections the file lives on the Barn; the agent can use
that file as its video artifact. This tool does not automatically download it to
the laptop. Stop remains available during human takeover. Recordings end after
five minutes or about 50 MB; a dropped stream stops the encoder and removes its
incomplete temporary file. No audio or other desktop applications are recorded.

The stream reconnects after a network loss and keeps the shared target. Localhost
URLs are treated as HTTP preview addresses rather than web searches. They refer
to the machine running Chrome: with Barn Chrome, that is the Barn, not the laptop.
A separate native laptop preview surface is not implemented by this bridge.

## Install the managed bridge

Build `packages/cow-eyes` with `bun run build`, then install both
`dist/cow-eyes` and `dist/cow-browser-agent` in `~/.local/bin` on the Barn.
Restart only `dev.bronson.cow-eyes`. The existing Chrome profile and Chrome process
stay in place. The managed agent entry point needs Node and `npx`; it pins
`@playwright/mcp@0.0.80`.

Configure the existing `mcp.playwright.command` to
`["/Users/bronson/.local/bin/cow-browser-agent"]`. Reconnect that MCP integration
so new tool calls use the bridge. `scripts/box/provision-mac.sh` carries this
configuration for future provisions; it performs other setup too, so it is not
a narrowly scoped browser deployment command.

- Authenticated viewer: `4099`, also proxied under `/computer/`.
- Managed agent CDP: loopback-only `127.0.0.1:4100`. Browser-origin requests are rejected.
- Existing Chrome CDP: `127.0.0.1:9222`.
- Health: authenticated `/computer/api/health` reports real Chrome reachability,
  current tab, control owner and managed agent port. A running bridge with an
  unreachable browser returns 503.

## Verification

From `packages/cow-eyes`, run `bun run test:integration`. Tests run a separate
Chrome profile and local fixture servers. They verify navigation follows the
agent, DOM input, takeover rejection, human input, resuming, screenshot bytes,
reconnect ownership, authentication and actual managed Playwright tool calls.
The agent-video check uses `ffmpeg` and `ffprobe` to verify decoded frames in the
returned WebM, and disconnects only its isolated fixture to verify cleanup.
Set `COW_TEST_CHROME` if Chrome is installed elsewhere. Playwright runs under Node;
Bun runs the bridge. No production browser or session is used.
