# Browser workspace

Open the Browser panel beside a task to watch the shared Barn Chrome. Every thread
has its own tab: the panel shows the tab of the thread you are looking at, and
switching threads switches the tab. A thread that has not used the browser shows
an empty state. Signed-in state stays in the one shared Chrome profile, so you
sign in once for every thread.

## One tab per thread

- The server sends the session id (and the thread's root session id) with each
  browser tool call. The managed wrapper runs one Playwright process per session,
  and each process connects to the bridge under its session's name.
- The bridge shows a session's connection only the tabs that session opened, plus
  popups its pages opened. Other threads' tabs, and tabs you opened yourself, are
  never announced to it, and raw protocol requests that name them are refused. Two
  threads working at once cannot act on each other's tab.
- Each thread tab is the only tab of its own Chrome window, so no thread's page is
  ever a hidden background tab with paused timers and animation frames.
- A subagent session has its own tab, shown under its parent thread.
- A thread's tabs close when its session is archived or deleted, or after two hours
  without browser use (`COW_BROWSER_TAB_IDLE_MINUTES`). Only tabs opened for a
  thread are closed; tabs you opened in the whole-browser view are left alone.
- The whole-browser view (`/computer/` without a thread, as on the phone) still
  lists every tab and follows whichever tab any agent used last.

Choose **Take control** before clicking, typing, pasting, navigating, or switching
tabs. Taking control in a thread's panel pauses only that thread's agent, including
its subagents; other threads keep working. Taking control in the whole-browser view
pauses every thread. New managed agent browser actions are rejected while you have
control; commands already sent to Chrome can finish. Ownership survives a dropped
connection. Choose **Return to agent** explicitly, then ask the task to continue
if it stopped to wait for you. The agent should inspect the page again before
acting because your actions may have changed it. A tab you open from a thread's
panel becomes that thread's tab, so its agent can carry on in it.

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
the calling thread's tab as it changes, not other threads' tabs. The encoder needs
`ffmpeg` on the machine running the managed wrapper. It saves a VP9 WebM under
`~/.config/cow/browser-output` and returns the exact server file path plus an MCP
resource link. On Barn connections the file lives on the Barn; the agent can use
that file as its video artifact. This tool does not automatically download it to
the laptop. Stop remains available during human takeover. Recordings end after
five minutes or about 50 MB; a dropped stream stops the encoder and removes its
incomplete temporary file. No audio or other desktop applications are recorded.

The stream reconnects after a network loss and keeps the thread's tab. Localhost
URLs are treated as HTTP preview addresses rather than web searches. They refer
to the machine running Chrome: with Barn Chrome, that is the Barn, not the laptop.
A separate native laptop preview surface is not implemented by this bridge.

## Install the managed bridge

Build `packages/cow-eyes` with `bun run build`, then install both
`dist/cow-eyes` and `dist/cow-browser-agent` in `~/.local/bin` on the Barn.
Restart only `dev.bronson.cow-eyes`. The existing Chrome profile and Chrome process
stay in place. The managed agent entry point needs Node and `npx`; it pins
`@playwright/mcp@0.0.80`. Per-thread tabs also need a server build that sends the
session id with tool calls; with an older server every thread shares one session's
tab, as before. Tab ownership is kept in `~/.config/cow/browser-threads.json` so it
survives a bridge restart.

Configure the existing `mcp.playwright.command` to
`["/Users/bronson/.local/bin/cow-browser-agent"]`. Reconnect that MCP integration
so new tool calls use the bridge. `scripts/box/provision-mac.sh` carries this
configuration for future provisions; it performs other setup too, so it is not
a narrowly scoped browser deployment command.

- Authenticated viewer: `4099`, also proxied under `/computer/`.
- Managed agent CDP: loopback-only `127.0.0.1:4100`. Browser-origin requests are rejected.
- Existing Chrome CDP: `127.0.0.1:9222`.
- Health: authenticated `/computer/api/health` reports real Chrome reachability,
  current tab, control owner, managed agent port and how many threads have tabs;
  `/computer/api/threads` lists each session's tabs. A running bridge with an
  unreachable browser returns 503.

## Verification

From `packages/cow-eyes`, run `bun run test:integration`. Tests run a separate
Chrome profile and local fixture servers. They verify navigation follows the
agent, DOM input, takeover rejection, human input, resuming, screenshot bytes,
reconnect ownership, authentication and actual managed Playwright tool calls. They
also drive two threads at once and check that each stays on its own tab, that the
view follows the thread it is asked for, and that archived threads' tabs close.
`bun run test` covers the tab registry and the wrapper's routing without a browser.
The agent-video check uses `ffmpeg` and `ffprobe` to verify decoded frames in the
returned WebM, and disconnects only its isolated fixture to verify cleanup.
Set `COW_TEST_CHROME` if Chrome is installed elsewhere. Playwright runs under Node;
Bun runs the bridge. No production browser or session is used.
