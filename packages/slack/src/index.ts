// cow_code Slack door: a Bolt bot (Socket Mode, no inbound port) on the always-on cow server.
// DM it and the farmer answers. Mention it in a channel and it does the work: one cow session per
// Slack thread on the headless worker model, with a reaction on the mention for its state and the
// result posted to the thread (see work.ts). It answers Callum and nobody else: DMs and mentions
// from anyone not in COW_SLACK_WORK_USERS, and from other bots, are dropped without a reply.
// Threads that need Callum (permission, question, failure) are pushed to a channel as they happen.
//
// env: COW_SLACK_BOT_TOKEN (xoxb), COW_SLACK_APP_TOKEN (xapp, connections:write), optional
//      COW_SLACK_NOTIFY_CHANNEL (channel/DM id for pushes), COW_SERVER_URL (default
//      http://127.0.0.1:4096), COW_SERVER_PASSWORD_FILE (default ~/.config/opencode/server-password),
//      COW_SLACK_WORK_USERS (comma-separated Slack user ids the bot answers; default Callum),
//      COW_SLACK_WORK_MODEL (default cloudflare-workers-ai/@cf/zai-org/glm-5.3),
//      COW_SLACK_WORK_VARIANT (default medium), COW_SLACK_WORK_DIR (default ~/coval),
//      COW_SLACK_VERDICT_BOTS (bot user ids whose thread replies go to an active job; default the Coval app),
//      COW_SLACK_THREAD_PUSHES (off: no "needs you" DMs for this server's threads),
//      COW_SLACK_WATCH_CHANNELS (channels swept for missed top-level mentions even before any work there),
//      COW_SLACK_SWEEP_LOOKBACK_MINUTES (how far back a channel's first sweep looks; default 10).
//
// Standby (the MacBook covering for barn): with COW_SLACK_PRIMARY_URL set, the door stays off Slack
// while that server answers its health check, takes over once it has failed for three checks in a
// row, and leaves again (exit 0, launchd waits it out) when the primary is back and this machine has
// no job of its own still running. COW_SLACK_PRIMARY_USERNAME / COW_SLACK_PRIMARY_PASSWORD_FILE
// authenticate the check. Slack hands each event to one connection, so a brief overlap while both
// are up never answers a mention twice.
import { App, LogLevel, SocketModeReceiver, type Logger } from "@slack/bolt"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir, hostname } from "node:os"
import { join } from "node:path"
import { browser, covalSignedIn, openSignIn, signInWhere } from "./browser"
import { say } from "./say"
import { COVAL_APP, createWorker, messageText, slackify } from "./work"

// `cow-slack say <channel> <thread_ts>`: a one-shot post as the bot (see say.ts), not the door.
if (process.argv[2] === "say") process.exit(await say(process.argv.slice(3), await Bun.stdin.text()))
// `cow-slack browser`: is the box browser signed in to the Coval app (see browser.ts).
if (process.argv[2] === "browser") process.exit(await browser())

const bot = process.env.COW_SLACK_BOT_TOKEN
const appToken = process.env.COW_SLACK_APP_TOKEN
if (!bot || !appToken) {
  console.error(
    "cow-slack: COW_SLACK_BOT_TOKEN and COW_SLACK_APP_TOKEN are required (see scripts/box/slack-manifest.json)",
  )
  process.exit(2)
}
const server = (process.env.COW_SERVER_URL ?? "http://127.0.0.1:4096").replace(/\/+$/, "")
const passwordFile = process.env.COW_SERVER_PASSWORD_FILE ?? join(homedir(), ".config/opencode/server-password")
const password = readFileSync(passwordFile, "utf8").split("\n")[0].trim()
const auth = `Basic ${Buffer.from(`${process.env.COW_SERVER_USERNAME ?? "cow"}:${password}`).toString("base64")}`
const notify = process.env.COW_SLACK_NOTIFY_CHANNEL
const threadPushes = (process.env.COW_SLACK_THREAD_PUSHES ?? "on") !== "off"
const watchChannels = (process.env.COW_SLACK_WATCH_CHANNELS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)
const lookback = Number(process.env.COW_SLACK_SWEEP_LOOKBACK_MINUTES ?? 10) * 60
const primary = process.env.COW_SLACK_PRIMARY_URL?.replace(/\/+$/, "")
const primaryAuth = (() => {
  if (!primary) return undefined
  const file = process.env.COW_SLACK_PRIMARY_PASSWORD_FILE
  const secret = file ? readFileSync(file, "utf8").split("\n")[0].trim() : ""
  return `Basic ${Buffer.from(`${process.env.COW_SLACK_PRIMARY_USERNAME ?? "cow"}:${secret}`).toString("base64")}`
})()
async function localUp() {
  try {
    const res = await fetch(`${server}/global/health`, {
      headers: { authorization: auth },
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok
  } catch {
    return false
  }
}
async function primaryUp() {
  if (!primary) return false
  try {
    const res = await fetch(`${primary}/global/health`, {
      headers: { authorization: primaryAuth! },
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok && ((await res.json()) as { healthy?: boolean }).healthy === true
  } catch {
    return false
  }
}

// The receiver is built by hand so the Socket Mode client is reachable: launchd keeps this process
// alive, but a wedged client (2026-09-10: a "server explicit disconnect" during the handshake left
// the state machine reconnecting 76 times a minute for a day, answering nobody) never dies on its
// own. So: leave on any uncaught error, on a reconnect storm, or after three minutes without a
// connection, and let launchd start a clean process. A heartbeat file lets the box's watchdog
// notice a door that is up but not connected.
// The Socket Mode client only says WHY it reconnects at DEBUG: the WebSocket close code and reason,
// Slack's own "disconnect" message and its reason, and its missed ping/pong verdicts. Six days of INFO
// logs (2026-09-17: 908 reconnects, 92 storm exits) could not tell those apart, so this logger runs
// the client at DEBUG, keeps exactly those lines, drops the rest of the debug chatter, and stamps
// every line with the time (the launchd log has no timestamps of its own).
const REASON = /WebSocket close event|"disconnect"|explicit disconnect|pings not received|pongs not received/i
let socketLevel: LogLevel = LogLevel.DEBUG
const stamp = () => new Date().toISOString()
const socketLogger: Logger = {
  debug: (...msg: unknown[]) => {
    const line = msg.map(String).join(" ")
    if (REASON.test(line)) console.log(`${stamp()} [socket] ${line}`)
  },
  info: (...msg: unknown[]) => console.log(`${stamp()} [INFO]`, ...msg),
  warn: (...msg: unknown[]) => console.warn(`${stamp()} [WARN]`, ...msg),
  error: (...msg: unknown[]) => console.error(`${stamp()} [ERROR]`, ...msg),
  setLevel: (level: LogLevel) => {
    socketLevel = level
  },
  getLevel: () => socketLevel,
  setName: () => {},
}
const receiver = new SocketModeReceiver({ appToken, logger: socketLogger, logLevel: LogLevel.DEBUG })
const app = new App({ token: bot, receiver })
const heartbeat = process.env.COW_SLACK_HEARTBEAT ?? join(homedir(), ".coval/logs/cow-slack.heartbeat")
mkdirSync(join(heartbeat, ".."), { recursive: true })
let leaving = false
function leave(why: string) {
  if (leaving) return
  leaving = true
  console.error(`${stamp()} cow-slack: ${why}; exiting so launchd starts a clean process`)
  setTimeout(() => process.exit(3), 500)
}
process.on("uncaughtException", (error) =>
  leave(`uncaught error: ${error instanceof Error ? error.message : String(error)}`),
)
process.on("unhandledRejection", (error) =>
  leave(`unhandled rejection: ${error instanceof Error ? error.message : String(error)}`),
)
app.error(async (error) => console.error("cow-slack: bolt error", error.message))
const socket = receiver.client
const reconnects: number[] = []
let connected = false
let lastConnected = Date.now()
let started = false
socket.on("connected", () => {
  connected = true
  lastConnected = Date.now()
})
socket.on("disconnected", () => {
  connected = false
})
socket.on("reconnecting", () => {
  const now = Date.now()
  reconnects.push(now)
  while (reconnects.length && reconnects[0] < now - 60_000) reconnects.shift()
  if (reconnects.length >= 8) leave("reconnect storm (8 reconnects in a minute)")
})
setInterval(() => {
  if (connected) {
    lastConnected = Date.now()
    writeFileSync(heartbeat, `${lastConnected}\n`)
    return
  }
  // A door on standby has not connected on purpose.
  if (!started) lastConnected = Date.now()
  if (Date.now() - lastConnected > 3 * 60_000) leave("no Slack connection for three minutes")
}, 30_000)

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

// The bot acts with Callum's credentials on the box, so it answers only him.
const workers = new Set(
  (process.env.COW_SLACK_WORK_USERS ?? "U0A71JFNCAZ")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
)
let botUserId: string | undefined
let takeover = false
async function handle(
  text: string,
  channel: string,
  thread: string,
  say: (m: { text: string; thread_ts: string }) => Promise<unknown>,
) {
  const clean = text.replace(/<@[A-Z0-9]+>/g, "").trim()
  if (!clean) return
  try {
    await app.client.reactions.add({ channel, timestamp: thread, name: "eyes" }).catch(() => {})
    const reply = await ask(clean)
    await say({ text: slackify(reply.text) || "(no reply)", thread_ts: thread })
  } catch (error) {
    await say({
      text: `the farmer is unreachable: ${error instanceof Error ? error.message : String(error)}`,
      thread_ts: thread,
    })
  }
}

// Channel mentions are work.
const names = new Map<string, string>()
async function nameOf(user: string) {
  const known = names.get(user)
  if (known) return known
  const info = await app.client.users.info({ user }).catch(() => undefined)
  const name = info?.user?.profile?.display_name || info?.user?.real_name || info?.user?.name || user
  names.set(user, name)
  return name
}
const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})
type ThreadMessage = Parameters<typeof messageText>[0] & {
  ts?: string
  user?: string
  bot_id?: string
  username?: string
  bot_profile?: { name?: string }
}
async function threadContext(channel: string, thread: string, range: { after?: string; skip: string }) {
  const lines: string[] = []
  let cursor: string | undefined
  for (let page = 0; page < 5; page++) {
    const res = await app.client.conversations.replies({ channel, ts: thread, oldest: range.after, limit: 200, cursor })
    for (const m of (res.messages ?? []) as ThreadMessage[]) {
      if (!m.ts || m.ts === range.skip || m.user === botUserId) continue
      if (range.after && Number(m.ts) <= Number(range.after)) continue
      const who = m.user ? await nameOf(m.user) : (m.bot_profile?.name ?? m.username ?? "a bot")
      const text = messageText(m).replaceAll(`<@${botUserId}>`, "@cowcode")
      lines.push(`[${clock.format(new Date(Number(m.ts) * 1000))} PT] ${who}${m.bot_id ? " (bot)" : ""}: ${text}`)
    }
    cursor = res.response_metadata?.next_cursor || undefined
    if (!cursor) break
  }
  return lines.join("\n\n").slice(-60_000)
}
const worker = createWorker({
  server,
  auth,
  directory: process.env.COW_SLACK_WORK_DIR ?? join(homedir(), "coval"),
  model: process.env.COW_SLACK_WORK_MODEL ?? "cloudflare-workers-ai/@cf/zai-org/glm-5.3",
  variant: process.env.COW_SLACK_WORK_VARIANT ?? "medium",
  stateFile: process.env.COW_SLACK_WORK_STATE ?? join(homedir(), ".coval/state/cow-slack-work.json"),
  slack: {
    react: async (channel, timestamp, name) => void (await app.client.reactions.add({ channel, timestamp, name })),
    unreact: async (channel, timestamp, name) => void (await app.client.reactions.remove({ channel, timestamp, name })),
    post: async (channel, thread_ts, text) =>
      void (await app.client.chat.postMessage({
        channel,
        thread_ts,
        text: slackify(text) || "(no reply)",
        unfurl_links: false,
      })),
    context: threadContext,
  },
})

// Socket Mode delivers a mention once: one that arrives while the door is restarting or
// reconnecting is gone (2026-11-10: a redeploy and a reconnect storm each cost one). Every mention
// the door takes gets its reaction at once, so a mention from Callum without one was missed. The
// sweep reads the threads the door works in (active ones every 30 seconds, recent ones and their
// channels every 3 minutes), takes those, and hands the Coval app's replies to the job they follow.
const verdictBots = new Set(
  (process.env.COW_SLACK_VERDICT_BOTS ?? COVAL_APP)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
)
type Swept = ThreadMessage & { thread_ts?: string; reactions?: { users?: string[] }[] }
const request = (text: string) => text.replace(/<@[A-Z0-9]+>/g, "").trim()
const missed = (m: Swept) =>
  Boolean(
    m.ts &&
      m.user &&
      !m.bot_id &&
      workers.has(m.user) &&
      m.text?.includes(`<@${botUserId}>`) &&
      request(m.text) &&
      !m.reactions?.some((reaction) => reaction.users?.includes(botUserId!)) &&
      !worker.owns(m.ts),
  )
async function sweep(all: boolean) {
  for (const t of worker.threads(all)) {
    try {
      const res = await app.client.conversations.replies({
        channel: t.channel,
        ts: t.thread,
        oldest: t.after,
        limit: 200,
      })
      for (const m of (res.messages ?? []) as Swept[]) {
        if (!m.ts || (t.after && Number(m.ts) <= Number(t.after))) continue
        if (missed(m)) {
          console.log(`${stamp()} cow-slack: picking up a missed mention ${m.ts} in ${t.key}`)
          void worker.submit({ channel: t.channel, thread: t.thread, ts: m.ts, text: request(m.text!) })
          continue
        }
        if (t.active && m.user && verdictBots.has(m.user))
          worker.nudge(t.key, { ts: m.ts, text: messageText(m), who: m.bot_profile?.name ?? (await nameOf(m.user)) })
      }
    } catch (error) {
      console.error(`${stamp()} cow-slack: sweep of ${t.key} failed`, error instanceof Error ? error.message : error)
    }
  }
  if (!all) return
  for (const c of worker.channels(watchChannels)) {
    try {
      const oldest = c.after ?? String(Date.now() / 1000 - lookback)
      const res = await app.client.conversations.history({ channel: c.channel, oldest, limit: 100 })
      let newest = oldest
      for (const m of (res.messages ?? []) as Swept[]) {
        if (!m.ts) continue
        if (Number(m.ts) > Number(newest)) newest = m.ts
        if (m.thread_ts && m.thread_ts !== m.ts) continue
        if (!missed(m)) continue
        console.log(`${stamp()} cow-slack: picking up a missed mention ${m.ts} in ${c.channel}`)
        void worker.submit({ channel: c.channel, thread: m.ts, ts: m.ts, text: request(m.text!) })
      }
      worker.swept(c.channel, newest)
    } catch (error) {
      console.error(
        `${stamp()} cow-slack: sweep of ${c.channel} failed`,
        error instanceof Error ? error.message : error,
      )
    }
  }
}
// The Coval sign-in in the box browser: tell Callum once when it is lost, and wake the jobs that
// were waiting for it the moment it is back.
const signInFile = join(homedir(), ".coval/state/cow-browser-coval")
async function watchBrowser() {
  const now = await covalSignedIn()
  if (now === undefined) return
  const before = (() => {
    try {
      return readFileSync(signInFile, "utf8").trim() === "in"
    } catch {
      return undefined
    }
  })()
  if (before === now) return
  writeFileSync(signInFile, now ? "in\n" : "out\n")
  console.log(`${stamp()} cow-slack: box browser is now signed ${now ? "in to" : "out of"} app.coval.dev`)
  if (now) return worker.notice("The box browser is signed in to app.coval.dev again.")
  await openSignIn()
  if (notify)
    await app.client.chat
      .postMessage({
        channel: notify,
        text: `The agent browser is signed out of app.coval.dev. Sign in ${signInWhere()}. It is a separate browser from your everyday Chrome, so signing in there does not help. cowcode jobs that need the Coval UI wait until then.`,
      })
      .catch(() => {})
}

let sweeping = false
let sweeps = 0
async function tick() {
  if (sweeping || !botUserId) return
  sweeping = true
  await sweep(sweeps++ % 6 === 0).catch(() => {})
  sweeping = false
}

app.event("app_mention", async ({ event }) => {
  const e = event as { user?: string; bot_id?: string; text?: string; channel: string; ts: string; thread_ts?: string }
  if (e.bot_id || !e.user || !workers.has(e.user)) {
    console.log(`${stamp()} cow-slack: ignored a mention from ${e.user ?? e.bot_id ?? "unknown"} in ${e.channel}`)
    return
  }
  const text = (e.text ?? "").replace(/<@[A-Z0-9]+>/g, "").trim()
  if (!text) return
  void worker.submit({ channel: e.channel, thread: e.thread_ts ?? e.ts, ts: e.ts, text })
})

app.message(async ({ message, say }) => {
  const m = message as {
    channel_type?: string
    subtype?: string
    text?: string
    channel: string
    ts: string
    thread_ts?: string
    user?: string
  }
  if (m.subtype || !m.text) return
  if (m.channel_type !== "im") return // channels only respond to mentions
  if (botUserId && m.user === botUserId) return
  if (!m.user || !workers.has(m.user)) {
    console.log(`${stamp()} cow-slack: ignored a DM from ${m.user ?? "unknown"}`)
    return
  }
  await handle(m.text, m.channel, m.thread_ts ?? m.ts, say)
})

// Push threads that need Callum. At most one DM per thread per bucket, and never more than one
// failure DM per thread every 15 minutes: a provider retry storm must not become a DM storm.
const pushed = new Set<string>()
const lastFailure = new Map<string, number>()
const FAILURE_COOLDOWN_MS = 15 * 60_000
async function watch() {
  if (!notify || !threadPushes) return
  for (;;) {
    try {
      const res = await fetch(`${server}/global/event`, {
        headers: { authorization: auth, accept: "text/event-stream" },
      })
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
          const data = chunk
            .split("\n")
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim())
            .join("")
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
  properties?: {
    sessionID?: string
    title?: string
    bucket?: string
    muted?: boolean
    projectName?: string
    waiting?: { kind: string; id?: string; message?: string; title?: string; permission?: string }
  }
}
async function onEvent(raw: unknown) {
  const e = raw as { payload?: ThreadEvent } & ThreadEvent
  const ev = e.payload ?? e
  if (ev.type !== "office.thread" || !ev.properties) return
  const t = ev.properties
  if (t.muted) return
  if (t.bucket !== "needs_you" && t.bucket !== "failed") return
  const key = `${t.sessionID}:${t.bucket}:${t.waiting?.kind === "permission" || t.waiting?.kind === "question" ? t.waiting.id : ""}`
  if (pushed.has(key)) return
  if (t.bucket === "failed" || t.waiting?.kind === "error") {
    const last = lastFailure.get(t.sessionID!) ?? 0
    if (Date.now() - last < FAILURE_COOLDOWN_MS) return
    lastFailure.set(t.sessionID!, Date.now())
    // A rate-limited routine will be retried by its schedule; one line is enough.
    if (/Too Many Requests|rate limit/i.test(t.waiting?.message ?? "")) {
      pushed.add(key)
      await app.client.chat.postMessage({
        channel: notify!,
        text: `${t.title ?? t.sessionID} — hit the model's rate limit; the next scheduled run retries`,
      })
      return
    }
  }
  pushed.add(key)
  if (pushed.size > 500) pushed.delete(pushed.values().next().value as string)
  const why =
    t.waiting?.kind === "permission"
      ? `needs permission: ${t.waiting.title ?? t.waiting.permission ?? ""}`
      : t.waiting?.kind === "question"
        ? "has a question"
        : t.waiting?.kind === "error"
          ? `failed: ${t.waiting.message ?? ""}`
          : t.bucket === "failed"
            ? "failed"
            : "needs you"
  await app.client.chat.postMessage({
    channel: notify!,
    text: `${t.projectName ?? ""} · ${t.title ?? t.sessionID} — ${why}`.trim(),
  })
}

const dm = (text: string) =>
  notify
    ? app.client.chat.postMessage({ channel: notify, text }).then(
        () => undefined,
        () => undefined,
      )
    : Promise.resolve()

if (primary && !worker.active()) {
  // Standby: stay off Slack while the primary is healthy. The heartbeat keeps saying "alive".
  let down = 0
  let waiting = false
  console.log(`${stamp()} cow-slack: standby for ${primary}`)
  while (down < 3) {
    writeFileSync(heartbeat, `${Date.now()}\n`)
    down = (await primaryUp()) ? 0 : down + 1
    if (down && down < 3) console.log(`${stamp()} cow-slack: primary failed its health check (${down}/3)`)
    // Nothing to take over with while this machine's own server (the CowCode app) is not running.
    if (down >= 3 && !(await localUp())) {
      if (!waiting) console.log(`${stamp()} cow-slack: primary is down but ${server} is not answering; waiting for it`)
      waiting = true
      down = 2
    }
    if (down < 3) await new Promise((r) => setTimeout(r, 30_000))
  }
  console.log(`${stamp()} cow-slack: primary is down; taking over Slack`)
  takeover = true
}
await app.start()
started = true
botUserId = (await app.client.auth.test()).user_id
console.log(
  `cow-slack: connected as ${botUserId}; farmer at ${server}; pushes ${notify && threadPushes ? "on" : "off"}`,
)
if (takeover)
  await dm(
    `barn's cow server is not answering, so this machine (${hostname()}) has taken over @cowcode. Threads it starts show in CowCode on this machine.`,
  )
if (primary) {
  // Hand back when the primary is healthy again and nothing of ours is still running.
  let up = 0
  setInterval(async () => {
    up = (await primaryUp()) ? up + 1 : 0
    if (up < 2 || worker.active()) return
    console.log(`${stamp()} cow-slack: primary is back and no local job is running; handing Slack back`)
    await dm(`barn is back, so ${hostname()} has handed @cowcode back to it.`)
    process.exit(0)
  }, 60_000)
}
worker.resume()
void watchBrowser()
setInterval(() => void watchBrowser(), 2 * 60_000)
void tick()
setInterval(() => void tick(), 30_000)
void watch()
