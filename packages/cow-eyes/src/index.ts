// cow-eyes: the "open the computer" view for the box. Streams the shared Chrome (started with
// --remote-debugging-port=9222 by cow-browser.sh) as a JPEG screencast over a WebSocket and relays
// mouse, wheel, keyboard, and text back through the Chrome DevTools Protocol. Runs with basic auth
// (the cow server password) on 0.0.0.0:4099; the phone reaches it through the gate at /computer/.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { createHmac, timingSafeEqual } from "node:crypto"
import type { ServerWebSocket } from "bun"
import html from "./index.html" with { type: "text" }
import { normalizeUrl } from "./cdp"
import { startAgentProxy, type WindowBounds } from "./agent-proxy"
import { createThreadTabs, validSession } from "./threads"

const PORT = Number(process.env.COW_EYES_PORT ?? 4099)
const CDP = (process.env.COW_CDP ?? "http://127.0.0.1:9222").replace(/\/+$/, "")
const passwordFile = process.env.COW_SERVER_PASSWORD_FILE ?? join(homedir(), ".config/opencode/server-password")
const password = readFileSync(passwordFile, "utf8").split("\n")[0].trim()
const expectedAuth = `Basic ${Buffer.from(`${process.env.COW_SERVER_USERNAME ?? "cow"}:${password}`).toString("base64")}`
const sessionToken = createHmac("sha256", password).update("cow-eyes-session").digest("base64url")

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

function validBasicToken(token: string | null | undefined) {
  if (!token) return false
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8")
    const sep = decoded.indexOf(":")
    if (sep === -1) return false
    return safeEqual(decoded.slice(sep + 1), password)
  } catch {
    return false
  }
}

function authed(req: Request, url: URL) {
  const h = req.headers.get("authorization") ?? ""
  if (h && (safeEqual(h, expectedAuth) || (h.startsWith("Basic ") && validBasicToken(h.slice(6).trim())))) return true
  if (validBasicToken(url.searchParams.get("auth_token"))) return true
  const cookies = (req.headers.get("cookie") ?? "").split(/;\s*/)
  return cookies.some(
    (c) =>
      (c.startsWith("cow_eyes=") && safeEqual(c.slice(9), sessionToken)) ||
      (c.startsWith("opencode_auth_token=") && validBasicToken(c.slice(20))),
  )
}

type Target = { id: string; type: string; title: string; url: string; webSocketDebuggerUrl: string }

function dismissManagedProfileNotice(target: Target) {
  try {
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: {
            expression: `(() => {
              const find = (root) => {
                const btn = root.querySelector("#cancel-button");
                if (btn) { btn.click(); return true; }
                for (const el of root.querySelectorAll("*")) {
                  if (el.shadowRoot && find(el.shadowRoot)) return true;
                }
                return false;
              };
              return find(document);
            })()`,
          },
        }),
      )
      setTimeout(() => {
        try {
          ws.close()
        } catch {}
      }, 300)
    }
    ws.onerror = () => {
      try {
        ws.close()
      } catch {}
    }
  } catch {}
}

/** Every page tab Chrome has, including ones the tab picker hides. */
async function pages(): Promise<Target[]> {
  const r = await fetch(`${CDP}/json/list`, { signal: AbortSignal.timeout(5_000) })
  if (!r.ok) throw new Error("Browser is unavailable")
  return ((await r.json()) as Target[]).filter((t) => t.type === "page")
}

async function targets(): Promise<Target[]> {
  const all = await pages()
  for (const t of all) {
    if (t.url.startsWith("chrome://managed-user-profile-notice")) dismissManagedProfileNotice(t)
  }
  const web = all.filter(
    (t) =>
      !t.url.startsWith("chrome://managed-user-profile-notice") &&
      !t.url.startsWith("devtools://") &&
      !t.url.startsWith("chrome-untrusted://"),
  )
  return web.length ? web : all
}

async function newTab(url: string): Promise<Target> {
  const r = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
    signal: AbortSignal.timeout(5_000),
  })
  return (await r.json()) as Target
}

async function closeTab(id: string) {
  await fetch(`${CDP}/json/close/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(5_000) })
}

type State = {
  reconnectTimer?: ReturnType<typeof setTimeout>
  closed?: boolean
  /** The thread (root session) this viewer follows; without one it follows the whole browser. */
  thread?: string
  showing: number
  cdp?: WebSocket
  target?: Target
  seq: number
  lastFrameAt: number
  shotTimer?: ReturnType<typeof setTimeout>
  pending: Map<number, { resolve: (v: unknown) => void; timer: ReturnType<typeof setTimeout> }>
  call?: (m: string, p?: Record<string, unknown>) => Promise<unknown>
}
type Sock = ServerWebSocket<State>
const send = (ws: Sock, obj: unknown) => {
  try {
    ws.send(JSON.stringify(obj))
  } catch {}
}

const viewers = new Set<Sock>()
// The tab a viewer without a thread shows: the one any agent used last.
let selectedTarget = ""
let targetSelection = 0

const threadsFile = process.env.COW_BROWSER_THREADS_FILE ?? join(homedir(), ".config/cow/browser-threads.json")
let saving: ReturnType<typeof setTimeout> | undefined
const threads = createThreadTabs({
  changed(thread) {
    // Tab ownership outlives a bridge restart, so idle and archived threads still get cleaned up.
    saving ??= setTimeout(() => {
      saving = undefined
      try {
        mkdirSync(dirname(threadsFile), { recursive: true })
        writeFileSync(`${threadsFile}.tmp`, JSON.stringify(threads.snapshot()))
        renameSync(`${threadsFile}.tmp`, threadsFile)
      } catch {}
    }, 500)
    for (const viewer of viewers) if (threadOf(viewer) === thread) void show(viewer)
  },
})
try {
  threads.load(JSON.parse(readFileSync(threadsFile, "utf8")))
} catch {}

// Ownership survives transport reconnect. Returning to the agent is always explicit.
// A person takes over one thread's browser from that thread's panel, or every thread's from the
// whole-browser view.
let humanAll = false
const humanThreads = new Set<string>()
const human = (session: string) => humanAll || humanThreads.has(threads.thread(session))
// A viewer may name any session of a thread (the app can be looking at a subagent's session).
const threadOf = (ws: Sock) => (ws.data.thread ? threads.thread(ws.data.thread) : undefined)
const viewerHuman = (ws: Sock) => humanAll || humanThreads.has(threadOf(ws) ?? "")
const controlState = (ws: Sock) => ({
  type: "control",
  owner: viewerHuman(ws) ? "human" : "agent",
  target: ws.data.target?.id ?? "",
  thread: threadOf(ws),
})
const broadcastControl = () => {
  for (const viewer of viewers) send(viewer, controlState(viewer))
}
async function selectTarget(id: string, agent = false) {
  if (selectedTarget === id) return
  const revision = ++targetSelection
  const target = (await targets()).find((item) => item.id === id)
  if (!target || revision !== targetSelection || (agent && humanAll)) return
  selectedTarget = id
  for (const viewer of viewers) {
    if (viewer.data.thread) continue
    attach(viewer, target)
    send(viewer, controlState(viewer))
  }
}
const windowBounds = ((): WindowBounds | undefined => {
  const value = process.env.COW_BROWSER_WINDOW ?? "0,0,1440,900"
  const [left, top, width, height] = value.split(",").map(Number)
  if ([left, top, width, height].some((part) => !Number.isFinite(part))) return
  return { left: left!, top: top!, width: width!, height: height! }
})()
const agentProxy = startAgentProxy({
  cdp: CDP,
  port: Number(process.env.COW_AGENT_CDP_PORT ?? 4100),
  threads,
  human,
  bounds: windowBounds,
  acted: (target) => {
    threads.act(target)
    void selectTarget(target, true).catch(() => undefined)
  },
})

async function captureImmediateFrame(ws: Sock, st: State, cdp: WebSocket) {
  if (st.cdp !== cdp || !st.call) return
  const shot = (await st.call("Page.captureScreenshot", { format: "jpeg", quality: 65 }).catch(() => undefined)) as
    | { data?: string }
    | undefined
  if (st.cdp === cdp && shot?.data) {
    st.lastFrameAt = Date.now()
    const metrics = (await st.call("Page.getLayoutMetrics").catch(() => undefined)) as
      | { cssLayoutViewport?: { clientWidth: number; clientHeight: number } }
      | undefined
    if (st.cdp !== cdp || st.closed) return
    const viewport = metrics?.cssLayoutViewport
    send(ws, {
      type: "frame",
      data: shot.data,
      meta: { deviceWidth: viewport?.clientWidth ?? 1440, deviceHeight: viewport?.clientHeight ?? 900 },
    })
  }
}

function scheduleFallbackShot(ws: Sock, st: State, delayMs = 200) {
  const cdp = st.cdp
  if (!cdp) return
  const before = st.lastFrameAt
  if (st.shotTimer) clearTimeout(st.shotTimer)
  st.shotTimer = setTimeout(() => {
    st.shotTimer = undefined
    if (st.cdp === cdp && st.lastFrameAt === before) void captureImmediateFrame(ws, st, cdp)
  }, delayMs)
}

function attach(ws: Sock, target: Target) {
  const st = ws.data
  if (st.closed) return
  if (st.reconnectTimer) clearTimeout(st.reconnectTimer)
  st.reconnectTimer = undefined
  for (const pending of st.pending.values()) {
    clearTimeout(pending.timer)
    pending.resolve(undefined)
  }
  st.pending.clear()
  if (st.shotTimer) {
    clearTimeout(st.shotTimer)
    st.shotTimer = undefined
  }
  if (st.cdp) {
    const old = st.cdp
    st.cdp = undefined
    try {
      old.close()
    } catch {}
  }
  const cdp = new WebSocket(target.webSocketDebuggerUrl)
  st.cdp = cdp
  st.target = target
  st.seq = 0
  st.lastFrameAt = 0
  st.pending = new Map()
  const call = (method: string, params: Record<string, unknown> = {}) =>
    new Promise<unknown>((resolve) => {
      if (cdp.readyState !== WebSocket.OPEN) return resolve(undefined)
      const id = ++st.seq
      const timer = setTimeout(() => {
        st.pending.delete(id)
        resolve(undefined)
        send(ws, { type: "error", message: "Browser command timed out; reconnect if the page is unresponsive" })
      }, 10_000)
      st.pending.set(id, { resolve, timer })
      cdp.send(JSON.stringify({ id, method, params }))
    })
  st.call = call
  cdp.onopen = async () => {
    if (st.cdp !== cdp || st.closed) return
    await call("Page.bringToFront")
    await call("Page.enable")
    // Navigation can finish while this viewer's CDP socket is still connecting.
    const tree = (await call("Page.getFrameTree")) as { frameTree?: { frame?: { url?: string } } } | undefined
    if (st.cdp !== cdp || st.closed) return
    target.url = tree?.frameTree?.frame?.url ?? target.url
    await call("Page.startScreencast", {
      format: "jpeg",
      quality: 60,
      maxWidth: 1440,
      maxHeight: 900,
      everyNthFrame: 1,
    })
    if (st.cdp !== cdp || st.closed) return
    send(ws, { type: "attached", target: { id: target.id, title: target.title, url: target.url } })
    await captureImmediateFrame(ws, st, cdp)
  }
  cdp.onmessage = (ev) => {
    if (st.cdp !== cdp || st.closed) return
    const msg = JSON.parse(String(ev.data)) as {
      id?: number
      result?: unknown
      error?: unknown
      method?: string
      params?: Record<string, any>
    }
    if (msg.id && st.pending.has(msg.id)) {
      const pending = st.pending.get(msg.id)!
      clearTimeout(pending.timer)
      pending.resolve(msg.result)
      if (msg.error) send(ws, { type: "error", message: "Browser command failed" })
      st.pending.delete(msg.id)
      return
    }
    if (msg.method === "Page.screencastFrame") {
      st.lastFrameAt = Date.now()
      send(ws, { type: "frame", data: msg.params!.data, meta: msg.params!.metadata })
      void call("Page.screencastFrameAck", { sessionId: msg.params!.sessionId })
    } else if (msg.method === "Page.frameNavigated" && !msg.params!.frame.parentId) {
      target.url = msg.params!.frame.url
      send(ws, { type: "url", url: msg.params!.frame.url })
      scheduleFallbackShot(ws, st, 250)
    } else if (msg.method === "Page.loadEventFired") {
      scheduleFallbackShot(ws, st, 150)
    }
  }
  cdp.onclose = () => {
    if (st.cdp === cdp && !st.closed) {
      st.cdp = undefined
      send(ws, { type: "detached" })
      setTimeout(() => {
        if (!st.cdp && !st.closed) void show(ws)
      }, 500)
    }
  }
  cdp.onerror = () => send(ws, { type: "error", message: "could not attach to the browser tab" })
}

function release(ws: Sock) {
  const st = ws.data
  for (const pending of st.pending.values()) {
    clearTimeout(pending.timer)
    pending.resolve(undefined)
  }
  st.pending.clear()
  if (st.shotTimer) clearTimeout(st.shotTimer)
  st.shotTimer = undefined
  const old = st.cdp
  st.cdp = undefined
  st.target = undefined
  st.call = undefined
  try {
    old?.close()
  } catch {}
}

const tabList = (list: Target[], thread: string | undefined) => {
  const own = thread ? new Set(threads.tabs(thread)) : undefined
  return list.filter((item) => !own || own.has(item.id)).map(({ id, title, url }) => ({ id, title, url }))
}

/** Point a viewer at the tab its scope calls for: its thread's tab, or the last tab any agent used. */
async function show(ws: Sock) {
  const revision = ++ws.data.showing
  try {
    const all = await pages()
    if (ws.data.closed || revision !== ws.data.showing) return
    const thread = threadOf(ws)
    if (thread) {
      const current = threads.current(thread)
      const target = all.find((item) => item.id === current?.target)
      // The tab is gone; dropping it re-runs this for the thread's next tab, or the empty state.
      if (current && !target) return threads.drop(current.target)
      if (!target) {
        release(ws)
        send(ws, { type: "empty", thread })
        send(ws, { type: "tabs", tabs: [], current: "" })
        return
      }
      if (ws.data.target?.id !== target.id || !ws.data.cdp) attach(ws, target)
      send(ws, { type: "tabs", tabs: tabList(all, thread), current: target.id })
      return
    }
    const list = await targets()
    if (ws.data.closed || revision !== ws.data.showing) return
    const target = list.find((item) => item.id === selectedTarget) ?? list[0] ?? (await newTab("about:blank"))
    selectedTarget = target.id
    if (ws.data.target?.id !== target.id || !ws.data.cdp) attach(ws, target)
    send(ws, {
      type: "tabs",
      tabs: list.length ? tabList(list, undefined) : [{ id: target.id, title: target.title, url: target.url }],
      current: selectedTarget,
    })
  } catch (error) {
    if (!ws.data.closed && !ws.data.reconnectTimer)
      ws.data.reconnectTimer = setTimeout(() => {
        ws.data.reconnectTimer = undefined
        if (!ws.data.closed) void show(ws)
      }, 2_000)
    send(ws, {
      type: "error",
      message: `browser unreachable at ${CDP}: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

// A thread's tab closes when its session is archived or deleted, or after a long idle period.
// Only tabs recorded as opened for a thread are ever closed here.
const idleMs = Number(process.env.COW_BROWSER_TAB_IDLE_MINUTES ?? 120) * 60_000
const serverUrl = (process.env.COW_SERVER_URL ?? "http://127.0.0.1:4096").replace(/\/+$/, "")
async function closeThreadTabs(session: string) {
  for (const target of threads.get(session)?.tabs ?? []) await agentProxy.close(target)
  threads.remove(session)
}
async function sessionEnded(session: string) {
  if (!session.startsWith("ses")) return false
  const response = await fetch(`${serverUrl}/session/${encodeURIComponent(session)}`, {
    headers: { authorization: expectedAuth },
    signal: AbortSignal.timeout(5_000),
  }).catch(() => undefined)
  if (!response) return false
  const info = (await response.json().catch(() => undefined)) as
    | { id?: string; name?: string; time?: { archived?: number } }
    | undefined
  // Only the CowCode server's own answers count; anything else on that port must not close tabs.
  if (response.status === 404) return info?.name === "NotFoundError"
  return response.ok && info?.id === session && typeof info.time?.archived === "number"
}
let sweeps = 0
async function sweep() {
  const all = await pages().catch(() => undefined)
  if (!all) return
  threads.prune(new Set(all.map((item) => item.id)))
  for (const entry of threads.idle(idleMs)) {
    if (human(entry.session)) continue
    await closeThreadTabs(entry.session)
  }
  if (sweeps++ % 5 !== 0) return
  const ended = new Map<string, boolean>()
  const check = async (session: string) => {
    if (!ended.has(session)) ended.set(session, await sessionEnded(session))
    return ended.get(session)!
  }
  for (const entry of threads.list())
    if ((await check(entry.session)) || (await check(entry.thread))) await closeThreadTabs(entry.session)
}
setInterval(() => void sweep().catch(() => undefined), Number(process.env.COW_BROWSER_SWEEP_SECONDS ?? 60) * 1_000)

/** A person opens a tab: in a thread's view it becomes that thread's tab, so its agent can use it. */
async function openTab(ws: Sock, url: string) {
  const thread = threadOf(ws)
  if (!thread) return selectTarget((await newTab(url)).id)
  await agentProxy.open(threads.current(thread)?.session ?? thread, url, thread)
}

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
}

const server = Bun.serve<State>({
  hostname: process.env.COW_EYES_HOST ?? "0.0.0.0",
  port: PORT,
  async fetch(req, server) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
    const url = new URL(req.url)
    if (!authed(req, url))
      return new Response("cow: auth required", {
        status: 401,
        headers: { ...corsHeaders, "www-authenticate": 'Basic realm="cow"' },
      })
    if (url.pathname.endsWith("/ws")) {
      const thread = url.searchParams.get("thread")
      if (
        server.upgrade(req, {
          data: {
            seq: 0,
            lastFrameAt: 0,
            showing: 0,
            pending: new Map(),
            thread: validSession(thread) ? thread : undefined,
          },
        })
      )
        return undefined as unknown as Response
      return new Response("upgrade failed", { status: 400, headers: corsHeaders })
    }
    if (url.pathname.endsWith("/api/tabs")) {
      const list = await targets().catch(() => [])
      return Response.json(list, { headers: corsHeaders })
    }
    if (url.pathname.endsWith("/api/threads"))
      return Response.json(threads.list(), { headers: { ...corsHeaders, "cache-control": "no-store" } })
    if (url.pathname.endsWith("/api/health")) {
      const list = await targets().catch(() => undefined)
      return Response.json(
        {
          ok: !!list,
          browser: list ? "reachable" : "unavailable",
          tabs: list?.length ?? 0,
          target: selectedTarget,
          control: humanAll ? "human" : "agent",
          agentProxyPort: agentProxy.port,
          threads: threads.list().filter((entry) => entry.tabs.length).length,
          humanThreads: [...humanThreads],
        },
        { status: list ? 200 : 503, headers: { ...corsHeaders, "cache-control": "no-store" } },
      )
    }
    // Bun’s explicit text loader returns a string; its generic HTML declaration describes HTMLBundle.
    return new Response(html as unknown as string, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": `cow_eyes=${sessionToken}; HttpOnly; SameSite=Lax; Path=/`,
      },
    })
  },
  websocket: {
    open(ws) {
      viewers.add(ws)
      send(ws, controlState(ws))
      void show(ws)
    },
    message(ws, raw) {
      let m: any
      try {
        m = JSON.parse(String(raw))
      } catch {
        return
      }
      const st = ws.data
      if (m.type === "control") {
        const thread = threadOf(ws)
        if (m.owner === "human") {
          if (thread) humanThreads.add(thread)
          else humanAll = true
        } else {
          // Returning to the agent from any view also ends a whole-browser takeover, so the
          // button can never be stuck on a pause this viewer did not start.
          humanAll = false
          if (thread) humanThreads.delete(thread)
        }
        broadcastControl()
        return
      }
      if (m.type === "ping") {
        send(ws, { type: "pong", at: Date.now() })
        return
      }
      if (m.type === "copy") {
        void st
          .call?.("Runtime.evaluate", {
            expression: `(() => { const el = document.activeElement; return el && typeof el.selectionStart === "number" ? el.value.slice(el.selectionStart, el.selectionEnd) : window.getSelection()?.toString() ?? "" })()`,
            returnByValue: true,
          })
          .then((result) => {
            const text = (result as { result?: { value?: unknown } } | undefined)?.result?.value
            if (typeof text === "string") send(ws, { type: "clipboard", text })
          })
        return
      }
      if (m.type === "screenshot") {
        void st.call?.("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }).then((shot) => {
          const data = (shot as { data?: string } | undefined)?.data
          if (data) send(ws, { type: "screenshot", data, target: st.target, request: m.request })
        })
        return
      }
      if (m.type !== "tabs" && !viewerHuman(ws)) {
        send(ws, { type: "error", message: "Take control before interacting with the browser" })
        return
      }
      switch (m.type) {
        case "tabs":
          void (st.thread ? pages() : targets())
            .then((t) => send(ws, { type: "tabs", tabs: tabList(t, threadOf(ws)), current: st.target?.id }))
            .catch(() => undefined)
          break
        case "tab":
          // A thread's viewer switches only between that thread's tabs.
          if (st.thread) {
            if (threads.tabs(threadOf(ws)!).includes(String(m.id))) threads.act(String(m.id))
            break
          }
          void targets()
            .then((t) => {
              const x = t.find((y) => y.id === m.id)
              if (x) void selectTarget(x.id)
            })
            .catch(() => undefined)
          break
        case "newtab":
          void openTab(ws, normalizeUrl(String(m.url ?? ""))).catch((err) =>
            send(ws, { type: "error", message: String(err) }),
          )
          break
        case "closetab": {
          const id = String(m.id ?? st.target?.id ?? "")
          if (st.thread) {
            if (threads.tabs(threadOf(ws)!).includes(id)) void agentProxy.close(id)
            break
          }
          void closeTab(id)
            .then(() => show(ws))
            .catch(() => send(ws, { type: "error", message: "Could not close browser tab" }))
          break
        }
        case "navigate": {
          const targetUrl = normalizeUrl(String(m.url ?? ""))
          if (!st.cdp) {
            void openTab(ws, targetUrl).catch(() => show(ws))
            break
          }
          void st.call?.("Page.navigate", { url: targetUrl }).then(() => scheduleFallbackShot(ws, st, 250))
          break
        }
        case "back":
          void st
            .call?.("Runtime.evaluate", { expression: "history.back()" })
            .then(() => scheduleFallbackShot(ws, st, 250))
          break
        case "forward":
          void st
            .call?.("Runtime.evaluate", { expression: "history.forward()" })
            .then(() => scheduleFallbackShot(ws, st, 250))
          break
        case "reload":
          if (!st.cdp) {
            void show(ws)
            break
          }
          void st.call?.("Page.reload").then(() => scheduleFallbackShot(ws, st, 250))
          break
        case "mouse":
          void st
            .call?.("Input.dispatchMouseEvent", {
              type: m.kind,
              x: m.x,
              y: m.y,
              button: m.button ?? "left",
              buttons: m.buttons ?? 0,
              clickCount: m.clickCount ?? 1,
              modifiers: m.modifiers ?? 0,
            })
            .then(() => {
              if (m.kind === "mouseReleased") scheduleFallbackShot(ws, st, 150)
            })
          break
        case "wheel":
          void st
            .call?.("Input.dispatchMouseEvent", {
              type: "mouseWheel",
              x: m.x,
              y: m.y,
              deltaX: m.deltaX ?? 0,
              deltaY: m.deltaY ?? 0,
            })
            .then(() => scheduleFallbackShot(ws, st, 150))
          break
        case "key":
          void st.call?.("Input.dispatchKeyEvent", m.event ?? {}).then(() => scheduleFallbackShot(ws, st, 120))
          break
        case "text":
          void st
            .call?.("Input.insertText", { text: String(m.text ?? "") })
            .then(() => scheduleFallbackShot(ws, st, 120))
          break
      }
    },
    close(ws) {
      if (ws.data.reconnectTimer) clearTimeout(ws.data.reconnectTimer)
      viewers.delete(ws)
      ws.data.closed = true
      for (const pending of ws.data.pending.values()) {
        clearTimeout(pending.timer)
        pending.resolve(undefined)
      }
      ws.data.pending.clear()
      if (ws.data.shotTimer) clearTimeout(ws.data.shotTimer)
      try {
        ws.data.cdp?.close()
      } catch {}
    },
  },
})
console.log(`cow-eyes on ${server.hostname}:${server.port} -> ${CDP}; agent CDP on 127.0.0.1:${agentProxy.port}`)
