// cow-eyes: the "open the computer" view for the box. Streams the shared Chrome (started with
// --remote-debugging-port=9222 by cow-browser.sh) as a JPEG screencast over a WebSocket and relays
// mouse, wheel, keyboard, and text back through the Chrome DevTools Protocol. Runs with basic auth
// (the cow server password) on 0.0.0.0:4099; the phone reaches it through the gate at /computer/.
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { randomBytes, timingSafeEqual } from "node:crypto"
import type { ServerWebSocket } from "bun"
import html from "./index.html" with { type: "text" }

const PORT = Number(process.env.COW_EYES_PORT ?? 4099)
const CDP = (process.env.COW_CDP ?? "http://127.0.0.1:9222").replace(/\/+$/, "")
const passwordFile = process.env.COW_SERVER_PASSWORD_FILE ?? join(homedir(), ".config/opencode/server-password")
const password = readFileSync(passwordFile, "utf8").split("\n")[0].trim()
const expectedAuth = `Basic ${Buffer.from(`${process.env.COW_SERVER_USERNAME ?? "cow"}:${password}`).toString("base64")}`
const sessionToken = randomBytes(24).toString("base64url")

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
function authed(req: Request) {
  const h = req.headers.get("authorization") ?? ""
  if (h && safeEqual(h, expectedAuth)) return true
  return (req.headers.get("cookie") ?? "").split(/;\s*/).some((c) => c.startsWith("cow_eyes=") && safeEqual(c.slice(9), sessionToken))
}

type Target = { id: string; type: string; title: string; url: string; webSocketDebuggerUrl: string }
async function targets(): Promise<Target[]> {
  const r = await fetch(`${CDP}/json/list`)
  return ((await r.json()) as Target[]).filter((t) => t.type === "page")
}
async function newTab(url: string): Promise<Target> {
  const r = await fetch(`${CDP}/json/new?${url}`, { method: "PUT" })
  return (await r.json()) as Target
}
function normalizeUrl(input: string) {
  const s = input.trim()
  if (!s) return "about:blank"
  if (/^[a-z]+:\/\//i.test(s) || s.startsWith("about:")) return s
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return `https://${s}`
  return `https://www.google.com/search?q=${encodeURIComponent(s)}`
}

type State = { cdp?: WebSocket; target?: Target; seq: number; pending: Map<number, (v: unknown) => void>; call?: (m: string, p?: Record<string, unknown>) => Promise<unknown> }
type Sock = ServerWebSocket<State>
const send = (ws: Sock, obj: unknown) => { try { ws.send(JSON.stringify(obj)) } catch {} }

function attach(ws: Sock, target: Target) {
  const st = ws.data
  if (st.cdp) { const old = st.cdp; st.cdp = undefined; try { old.close() } catch {} }
  const cdp = new WebSocket(target.webSocketDebuggerUrl)
  st.cdp = cdp
  st.target = target
  st.seq = 0
  st.pending = new Map()
  const call = (method: string, params: Record<string, unknown> = {}) =>
    new Promise<unknown>((resolve) => {
      if (cdp.readyState !== WebSocket.OPEN) return resolve(undefined)
      const id = ++st.seq
      st.pending.set(id, resolve)
      cdp.send(JSON.stringify({ id, method, params }))
    })
  st.call = call
  cdp.onopen = async () => {
    await call("Page.enable")
    await call("Page.startScreencast", { format: "jpeg", quality: 55, maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 })
    send(ws, { type: "attached", target: { id: target.id, title: target.title, url: target.url } })
  }
  cdp.onmessage = (ev) => {
    const msg = JSON.parse(String(ev.data)) as { id?: number; result?: unknown; error?: unknown; method?: string; params?: Record<string, any> }
    if (msg.id && st.pending.has(msg.id)) { st.pending.get(msg.id)!(msg.result ?? msg.error); st.pending.delete(msg.id); return }
    if (msg.method === "Page.screencastFrame") {
      send(ws, { type: "frame", data: msg.params!.data, meta: msg.params!.metadata })
      void call("Page.screencastFrameAck", { sessionId: msg.params!.sessionId })
    } else if (msg.method === "Page.frameNavigated" && !msg.params!.frame.parentId) {
      send(ws, { type: "url", url: msg.params!.frame.url })
    }
  }
  cdp.onclose = () => { if (st.cdp === cdp) { st.cdp = undefined; send(ws, { type: "detached" }) } }
  cdp.onerror = () => send(ws, { type: "error", message: "could not attach to the browser tab" })
}

async function attachFirst(ws: Sock) {
  try {
    const list = await targets()
    if (list.length) return attach(ws, list[0]!)
    attach(ws, await newTab("about:blank"))
  } catch (error) {
    send(ws, { type: "error", message: `browser unreachable at ${CDP}: ${error instanceof Error ? error.message : String(error)}` })
  }
}


Bun.serve<State>({
  hostname: "0.0.0.0",
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url)
    if (!authed(req)) return new Response("cow: auth required", { status: 401, headers: { "www-authenticate": 'Basic realm="cow"' } })
    if (url.pathname.endsWith("/ws")) {
      if (server.upgrade(req, { data: { seq: 0, pending: new Map() } })) return undefined as unknown as Response
      return new Response("upgrade failed", { status: 400 })
    }
    if (url.pathname.endsWith("/api/tabs")) return Response.json(await targets())
    if (url.pathname.endsWith("/api/health")) return Response.json({ ok: true, cdp: CDP })
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "set-cookie": `cow_eyes=${sessionToken}; HttpOnly; SameSite=Lax; Path=/` } })
  },
  websocket: {
    open(ws) { void attachFirst(ws) },
    message(ws, raw) {
      let m: any
      try { m = JSON.parse(String(raw)) } catch { return }
      const st = ws.data
      switch (m.type) {
        case "tabs": void targets().then((t) => send(ws, { type: "tabs", tabs: t.map(({ id, title, url }) => ({ id, title, url })), current: st.target?.id })); break
        case "tab": void targets().then((t) => { const x = t.find((y) => y.id === m.id); if (x) attach(ws, x) }); break
        case "newtab": void newTab(normalizeUrl(m.url ?? "")).then((t) => attach(ws, t)); break
        case "navigate": void st.call?.("Page.navigate", { url: normalizeUrl(m.url ?? "") }); break
        case "back": void st.call?.("Runtime.evaluate", { expression: "history.back()" }); break
        case "reload": void st.call?.("Page.reload"); break
        case "mouse": void st.call?.("Input.dispatchMouseEvent", { type: m.kind, x: m.x, y: m.y, button: m.button ?? "left", buttons: m.buttons ?? 0, clickCount: m.clickCount ?? 1, modifiers: m.modifiers ?? 0 }); break
        case "wheel": void st.call?.("Input.dispatchMouseEvent", { type: "mouseWheel", x: m.x, y: m.y, deltaX: m.deltaX ?? 0, deltaY: m.deltaY ?? 0 }); break
        case "key": void st.call?.("Input.dispatchKeyEvent", m.event ?? {}); break
        case "text": void st.call?.("Input.insertText", { text: String(m.text ?? "") }); break
      }
    },
    close(ws) { try { ws.data.cdp?.close() } catch {} },
  },
})
console.log(`cow-eyes on 0.0.0.0:${PORT} -> ${CDP}`)
