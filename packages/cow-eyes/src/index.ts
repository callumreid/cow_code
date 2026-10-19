// cow-eyes: the "open the computer" view for the box. Streams the shared Chrome (started with
// --remote-debugging-port=9222 by cow-browser.sh) as a JPEG screencast over a WebSocket and relays
// mouse, wheel, keyboard, and text back through the Chrome DevTools Protocol. Runs with basic auth
// (the cow server password) on 0.0.0.0:4099; the phone reaches it through the gate at /computer/.
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { createHmac, timingSafeEqual } from "node:crypto"
import type { ServerWebSocket } from "bun"
import html from "./index.html" with { type: "text" }

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

async function targets(): Promise<Target[]> {
  const r = await fetch(`${CDP}/json/list`)
  const all = ((await r.json()) as Target[]).filter((t) => t.type === "page")
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
  const r = await fetch(`${CDP}/json/new?${url}`, { method: "PUT" })
  return (await r.json()) as Target
}

async function closeTab(id: string) {
  await fetch(`${CDP}/json/close/${encodeURIComponent(id)}`).catch(() => undefined)
}

function normalizeUrl(input: string) {
  const s = input.trim()
  if (!s) return "about:blank"
  if (/^[a-z]+:\/\//i.test(s) || s.startsWith("about:")) return s
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return `https://${s}`
  return `https://www.google.com/search?q=${encodeURIComponent(s)}`
}

type State = {
  cdp?: WebSocket
  target?: Target
  seq: number
  lastFrameAt: number
  shotTimer?: ReturnType<typeof setTimeout>
  pending: Map<number, (v: unknown) => void>
  call?: (m: string, p?: Record<string, unknown>) => Promise<unknown>
}
type Sock = ServerWebSocket<State>
const send = (ws: Sock, obj: unknown) => {
  try {
    ws.send(JSON.stringify(obj))
  } catch {}
}

async function captureImmediateFrame(ws: Sock, st: State, cdp: WebSocket) {
  if (st.cdp !== cdp || !st.call) return
  const shot = (await st.call("Page.captureScreenshot", { format: "jpeg", quality: 65 }).catch(() => undefined)) as
    | { data?: string }
    | undefined
  if (st.cdp === cdp && shot?.data) {
    st.lastFrameAt = Date.now()
    send(ws, { type: "frame", data: shot.data, meta: { deviceWidth: 1440, deviceHeight: 900 } })
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
      st.pending.set(id, resolve)
      cdp.send(JSON.stringify({ id, method, params }))
    })
  st.call = call
  cdp.onopen = async () => {
    await call("Page.bringToFront")
    await call("Page.enable")
    await call("Page.startScreencast", {
      format: "jpeg",
      quality: 60,
      maxWidth: 1440,
      maxHeight: 900,
      everyNthFrame: 1,
    })
    send(ws, { type: "attached", target: { id: target.id, title: target.title, url: target.url } })
    await captureImmediateFrame(ws, st, cdp)
  }
  cdp.onmessage = (ev) => {
    const msg = JSON.parse(String(ev.data)) as {
      id?: number
      result?: unknown
      error?: unknown
      method?: string
      params?: Record<string, any>
    }
    if (msg.id && st.pending.has(msg.id)) {
      st.pending.get(msg.id)!(msg.result ?? msg.error)
      st.pending.delete(msg.id)
      return
    }
    if (msg.method === "Page.screencastFrame") {
      st.lastFrameAt = Date.now()
      send(ws, { type: "frame", data: msg.params!.data, meta: msg.params!.metadata })
      void call("Page.screencastFrameAck", { sessionId: msg.params!.sessionId })
    } else if (msg.method === "Page.frameNavigated" && !msg.params!.frame.parentId) {
      send(ws, { type: "url", url: msg.params!.frame.url })
      scheduleFallbackShot(ws, st, 250)
    } else if (msg.method === "Page.loadEventFired") {
      scheduleFallbackShot(ws, st, 150)
    }
  }
  cdp.onclose = () => {
    if (st.cdp === cdp) {
      st.cdp = undefined
      send(ws, { type: "detached" })
      setTimeout(() => {
        if (!st.cdp) void attachFirst(ws)
      }, 500)
    }
  }
  cdp.onerror = () => send(ws, { type: "error", message: "could not attach to the browser tab" })
}

async function attachFirst(ws: Sock) {
  try {
    const list = await targets()
    if (list.length) {
      attach(ws, list[0]!)
      send(ws, {
        type: "tabs",
        tabs: list.map(({ id, title, url }) => ({ id, title, url })),
        current: list[0]!.id,
      })
      return
    }
    const created = await newTab("about:blank")
    attach(ws, created)
    send(ws, {
      type: "tabs",
      tabs: [{ id: created.id, title: created.title, url: created.url }],
      current: created.id,
    })
  } catch (error) {
    send(ws, {
      type: "error",
      message: `browser unreachable at ${CDP}: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
}

Bun.serve<State>({
  hostname: "0.0.0.0",
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
      if (server.upgrade(req, { data: { seq: 0, lastFrameAt: 0, pending: new Map() } }))
        return undefined as unknown as Response
      return new Response("upgrade failed", { status: 400, headers: corsHeaders })
    }
    if (url.pathname.endsWith("/api/tabs")) {
      const list = await targets().catch(() => [])
      return Response.json(list, { headers: corsHeaders })
    }
    if (url.pathname.endsWith("/api/health")) return Response.json({ ok: true, cdp: CDP }, { headers: corsHeaders })
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": `cow_eyes=${sessionToken}; HttpOnly; SameSite=Lax; Path=/`,
      },
    })
  },
  websocket: {
    open(ws) {
      void attachFirst(ws)
    },
    message(ws, raw) {
      let m: any
      try {
        m = JSON.parse(String(raw))
      } catch {
        return
      }
      const st = ws.data
      switch (m.type) {
        case "tabs":
          void targets()
            .then((t) =>
              send(ws, {
                type: "tabs",
                tabs: t.map(({ id, title, url }) => ({ id, title, url })),
                current: st.target?.id,
              }),
            )
            .catch(() => undefined)
          break
        case "tab":
          void targets()
            .then((t) => {
              const x = t.find((y) => y.id === m.id)
              if (x) attach(ws, x)
            })
            .catch(() => undefined)
          break
        case "newtab":
          void newTab(normalizeUrl(m.url ?? ""))
            .then((t) => attach(ws, t))
            .catch((err) => send(ws, { type: "error", message: String(err) }))
          break
        case "closetab":
          void closeTab(String(m.id ?? st.target?.id ?? "")).then(() => attachFirst(ws))
          break
        case "navigate": {
          const targetUrl = normalizeUrl(m.url ?? "")
          if (!st.cdp) {
            void newTab(targetUrl)
              .then((t) => attach(ws, t))
              .catch(() => attachFirst(ws))
            break
          }
          void st.call?.("Page.navigate", { url: targetUrl }).then(() => scheduleFallbackShot(ws, st, 250))
          break
        }
        case "back":
          void st.call
            ?.("Runtime.evaluate", { expression: "history.back()" })
            .then(() => scheduleFallbackShot(ws, st, 250))
          break
        case "forward":
          void st.call
            ?.("Runtime.evaluate", { expression: "history.forward()" })
            .then(() => scheduleFallbackShot(ws, st, 250))
          break
        case "reload":
          if (!st.cdp) {
            void attachFirst(ws)
            break
          }
          void st.call?.("Page.reload").then(() => scheduleFallbackShot(ws, st, 250))
          break
        case "mouse":
          void st.call
            ?.("Input.dispatchMouseEvent", {
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
          void st.call
            ?.("Input.dispatchMouseEvent", {
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
          void st.call
            ?.("Input.insertText", { text: String(m.text ?? "") })
            .then(() => scheduleFallbackShot(ws, st, 120))
          break
      }
    },
    close(ws) {
      if (ws.data.shotTimer) clearTimeout(ws.data.shotTimer)
      try {
        ws.data.cdp?.close()
      } catch {}
    },
  },
})
console.log(`cow-eyes on 0.0.0.0:${PORT} -> ${CDP}`)
