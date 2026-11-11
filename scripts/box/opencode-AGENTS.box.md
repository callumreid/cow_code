## The box's browser (cow-eyes)

- This machine is the always-on cow box. Its browser tools (playwright) drive ONE shared Chrome
  with a persistent profile, so sign-ins stick around between threads. Each thread has its own
  tab: you see and drive only the tabs your session opened, never another thread's or Callum's.
  Callum can watch your tab live and take it over from the Browser button in the top-right of CowCode (or at
  /computer/ on the server / phone link, laptop http://100.65.225.30:4099, LAN http://192.168.4.215:4099).
- Use the managed Playwright tools (`cow-browser-agent` through the loopback CDP bridge
  on port 4100). They include DOM/accessibility snapshots, visual controls and screenshots.
  Do not bypass the bridge by connecting another browser tool directly to port 9222.
  The Browser panel follows your thread's active tab. When Callum chooses Take control, your
  browser actions pause; wait for Return to agent, then take a fresh snapshot before
  continuing. Do not retry around human takeover or create a different invisible browser.
  Your tabs close when the thread is archived or after two hours without browser use; sign-ins
  are not affected, so just open the page again.
- When a page needs a human — sign-in, 2FA, a CAPTCHA, a payment, an "are you sure" that is not
  yours to answer — do not guess and do not retry. Ask with the question tool: say exactly which
  site is blocked and that Callum should open the computer view and finish that one step. Wait,
  then continue in the same tab.
- Never type Callum's passwords or codes yourself, even if you can find them.
- The profile is shared by every thread and holds Callum's sign-ins. Never clear its cookies or
  storage, never sign out of anything in it (no `context.clearCookies()`, no `Clerk.signOut()`), and
  never leave a network stub behind: scope `page.route` to a tab you opened, and `unrouteAll` and
  close that tab before you finish. Do local or test auth work in a separate browser context. On
  2026-11-10 one thread cleared cookies to debug localhost and signed every job out of the Coval app.
- `~/.local/bin/cow-slack browser` says whether the browser is signed in to app.coval.dev without
  touching a tab. Run it before work that needs the Coval UI, and tell Callum at once if it is not.

## Mentioning pull requests

- Any message that names a PR (Slack, the office, a DM, a routine report) includes its full GitHub
  URL, e.g. https://github.com/coval-ai/backend/pull/7279, as plain text. Never a bare "#7279".
- Archived repositories (today: coval-ai/sofia-infra) are dead: never list, mention, review, or
  update their PRs. Filter searches with `archived:false` / `--archived=false`.

## Default model for headless workers

- Headless Farmer-dispatched workers and the PR review routines run on the Cloudflare Workers AI
  provider's plain `cloudflare-workers-ai/@cf/zai-org/glm-5.3` by default. Use another model only
  when Callum explicitly names it for that job. The `-flash` variant
  (`@cf/zai-org/glm-5.3-flash`) is reserved for when Callum explicitly asks for flash.
- Never route any work to the API-billed `openai/gpt-5.6-sol`. It was the Farmer coordinator model
  until 2026-09-11 and every call bills the OpenAI API key. Farmer itself runs on the ChatGPT
  subscription provider as `chatgpt/gpt-5.5`.

## Office communication

- After accepting work, send no admission receipts ("started", "received", "I'll update you") and
  no routine progress messages. Stay silent unless there is a completed outcome, a blocker or
  error that needs Callum, or a decision. An explicitly requested status check still answers
  immediately.

## Slack threads started by @cowcode

- A thread whose first prompt begins "Callum mentioned you (cowcode) in a Slack thread" is a Slack
  work job. Its final reply is posted to that Slack thread for it, as the cowcode app.
- If Callum asks such a thread for an update in Slack before the job is done, post it as cowcode:
  pipe the text to `~/.local/bin/cow-slack say <channel> <thread_ts>` (both ids are in the job's
  first prompt). It only posts in threads where Callum mentioned cowcode.
- Never post those updates with `~/.slack_token`: that is Callum's own token and the message
  appears as him.
