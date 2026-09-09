// cow_code Slack door: a Bolt bot (Socket Mode, no inbound port) that talks to the Farmer's Office
// on the always-on cow server. Mention the bot or DM it and the farmer answers in the thread.
// Threads that need Callum (permission, question, failure) are pushed to a channel as they happen.
//
// env: COW_SLACK_BOT_TOKEN (xoxb), COW_SLACK_APP_TOKEN (xapp, connections:write), optional
//      COW_SLACK_NOTIFY_CHANNEL (channel/DM id for pushes), COW_SERVER_URL (default
//      http://127.0.0.1:4096), COW_SERVER_PASSWORD_FILE (default ~/.config/opencode/server-password).
import { App } from "@slack/bolt"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const bot = process.env.COW_SLACK_BOT_TOKEN
const appToken = process.env.COW_SLACK_APP_TOKEN
if (!bot || !appToken) {
  console.error("cow-slack: COW_SLACK_BOT_TOKEN and COW_SLACK_APP_TOKEN are required (see scripts/box/slack-manifest.json)")
  process.exit(2)
}
const server = (process.env.COW_SERVER_URL ?? "http://127.0.0.1:4096").replace(/\/+$/, "")
const passwordFile = process.env.COW_SERVER_PASSWORD_FILE ?? join(homedir(), ".config/opencode/server-password")
const password = readFileSync(passwordFile, "utf8").split("\n")[0].trim()
const auth = `Basic ${Buffer.from(`${process.env.COW_SERVER_USERNAME ?? "opencode"}:${password}`).toString("base64")}`
const notify = process.env.COW_SLACK_NOTIFY_CHANNEL

const app = new App({ token: bot, appToken, socketMode: true })

type AskResult = { text: string; sessionID: string }
async function ask(text: string): Promise<AskResult> {
  const res = await fetch(`${server}/global/office/ask`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth, "x-opencode-directory": "global" },
    body: JSON.stringify({ text, source: "text" }),
  })
  if (!res.ok) throw new Error(`office/ask ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return (await res.json()) as AskResult
}

function slackify(text: string) {
  // Slack mrkdwn: bold is *x* not **x**, headings become bold lines, keep it under the 40k limit.
  return text
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
    .slice(0, 39000)
}

let botUserId: string | undefined
async function handle(text: string, channel: string, thread: string, say: (m: { text: string; thread_ts: string }) => Promise<unknown>) {
  const clean = text.replace(/<@[A-Z0-9]+>/g, "").trim()
  if (!clean) return
  try {
    await app.client.reactions.add({ channel, timestamp: thread, name: "eyes" }).catch(() => {})
    const reply = await ask(clean)
    await say({ text: slackify(reply.text) || "(no reply)", thread_ts: thread })
  } catch (error) {
    await say({ text: `the farmer is unreachable: ${error instanceof Error ? error.message : String(error)}`, thread_ts: thread })
  }
}

app.event("app_mention", async ({ event, say }) => {
  await handle(event.text ?? "", event.channel, (event as { thread_ts?: string }).thread_ts ?? event.ts, say)
})

app.message(async ({ message, say }) => {
  const m = message as { channel_type?: string; subtype?: string; text?: string; channel: string; ts: string; thread_ts?: string; user?: string }
  if (m.subtype || !m.text) return
  if (m.channel_type !== "im") return // channels only respond to mentions
  if (botUserId && m.user === botUserId) return
  await handle(m.text, m.channel, m.thread_ts ?? m.ts, say)
})

// Push threads that need Callum. One line per (thread, waiting item); silence otherwise.
const pushed = new Set<string>()
async function watch() {
  if (!notify) return
  for (;;) {
    try {
      const res = await fetch(`${server}/global/event`, { headers: { authorization: auth, accept: "text/event-stream" } })
      if (!res.ok || !res.body) throw new Error(`event stream ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let idx: number
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)
          const data = chunk.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("")
          if (!data) continue
          try {
            await onEvent(JSON.parse(data))
          } catch {}
        }
      }
    } catch (error) {
      console.error("cow-slack: event stream dropped", error instanceof Error ? error.message : error)
    }
    await new Promise((r) => setTimeout(r, 5000))
  }
}

type ThreadEvent = {
  type?: string
  properties?: { sessionID?: string; title?: string; bucket?: string; muted?: boolean; projectName?: string; waiting?: { kind: string; id?: string; message?: string; title?: string; permission?: string } }
}
async function onEvent(raw: unknown) {
  const e = raw as { payload?: ThreadEvent } & ThreadEvent
  const ev = e.payload ?? e
  if (ev.type !== "office.thread" || !ev.properties) return
  const t = ev.properties
  if (t.muted) return
  if (t.bucket !== "needs_you" && t.bucket !== "failed") return
  const key = `${t.sessionID}:${t.bucket}:${t.waiting?.id ?? t.waiting?.message ?? ""}`
  if (pushed.has(key)) return
  pushed.add(key)
  if (pushed.size > 500) pushed.delete(pushed.values().next().value as string)
  const why =
    t.waiting?.kind === "permission" ? `needs permission: ${t.waiting.title ?? t.waiting.permission ?? ""}` :
    t.waiting?.kind === "question" ? "has a question" :
    t.waiting?.kind === "error" ? `failed: ${t.waiting.message ?? ""}` :
    t.bucket === "failed" ? "failed" : "needs you"
  await app.client.chat.postMessage({ channel: notify!, text: `${t.projectName ?? ""} · ${t.title ?? t.sessionID} — ${why}`.trim() })
}

await app.start()
botUserId = (await app.client.auth.test()).user_id
console.log(`cow-slack: connected as ${botUserId}; farmer at ${server}; pushes ${notify ? "on" : "off"}`)
void watch()
