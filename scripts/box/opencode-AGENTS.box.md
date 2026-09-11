
## The box's browser (cow-eyes)

- This machine is the always-on cow box. Its browser tools (playwright) drive ONE shared Chrome
  with a persistent profile, so sign-ins stick around between threads. Callum can watch that same
  browser live and take it over from the "computer" view (LAN http://192.168.86.25:4099, laptop
  http://100.65.225.30:4099, or the phone link's /computer/ path).
- When a page needs a human — sign-in, 2FA, a CAPTCHA, a payment, an "are you sure" that is not
  yours to answer — do not guess and do not retry. Ask with the question tool: say exactly which
  site is blocked and that Callum should open the computer view and finish that one step. Wait,
  then continue in the same tab.
- Never type Callum's passwords or codes yourself, even if you can find them.

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
