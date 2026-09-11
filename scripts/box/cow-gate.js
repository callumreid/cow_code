#!/usr/bin/env node
// Gate proxy for the phone path (port of cow_code desktop's public-companion.ts).
// Public traffic (cloudflared) -> this proxy -> opencode server on 127.0.0.1:4096.
// A request is allowed only with ?_cowcode_gate=<token> (sets a cookie) or that cookie.
// Basic auth for the server is injected here, so the password never leaves the mini.
// Answered here, never proxied: /site.webmanifest (start_url carries the key, so a home-screen icon
// launches with it) and /_cow/ping (the watchdog's probe). Keyless browsers get a friendly 404 page.
// Every request lands in ~/Library/Logs/cow-gate-access.log without its query string.
const http = require("node:http")
const net = require("node:net")
const fs = require("node:fs")
const path = require("node:path")
const { randomBytes, timingSafeEqual } = require("node:crypto")

const HOME = process.env.HOME || "/Users/bronson"
const TARGET_PORT = Number(process.env.COW_TARGET_PORT || 4096)
const LISTEN_PORT = Number(process.env.COW_GATE_PORT || 4098)
const EYES_PORT = Number(process.env.COW_EYES_PORT || 4099)
const PUBLIC_LOG = process.env.COW_PUBLIC_LOG || path.join(HOME, "Library/Logs/cow-public.log")
const ACCESS_LOG = path.join(HOME, "Library/Logs/cow-gate-access.log")
const ACCESS_MAX_BYTES = 5 * 1024 * 1024
// Escape hatch if iOS turns out to honour the manifest but not its start_url query: "0" passes the upstream manifest through.
const MANIFEST_REWRITE = process.env.COW_GATE_MANIFEST_REWRITE !== "0"
// /computer/* goes to cow-eyes (watch/take over the browser); everything else to the cow server.
function route(pathname) {
  if (pathname === "/computer" || pathname.startsWith("/computer/")) return { port: EYES_PORT, path: pathname.replace(/^\/computer/, "") || "/" }
  return { port: TARGET_PORT, path: pathname }
}
const GATE_QUERY = "_cowcode_gate"
const GATE_COOKIE = "cowcode_gate"

const password = fs.readFileSync(path.join(HOME, ".config/opencode/server-password"), "utf8").split("\n")[0].trim()
const gateFile = path.join(HOME, ".config/opencode/gate-token")
if (!fs.existsSync(gateFile) || fs.readFileSync(gateFile, "utf8").trim().length < 32) {
  fs.writeFileSync(gateFile, randomBytes(32).toString("base64url") + "\n", { mode: 0o600 })
}
const gate = fs.readFileSync(gateFile, "utf8").trim()
const username = process.env.COW_SERVER_USERNAME || "cow"
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
const cookie = `${GATE_COOKIE}=${gate}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000`

function safeEqual(value, expected) {
  if (!value) return false
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}
function allowed(url, cookie) {
  if (safeEqual(url.searchParams.get(GATE_QUERY), gate)) return true
  return (cookie || "").split(/;\s*/).some((item) => item.startsWith(`${GATE_COOKIE}=`) && safeEqual(item.slice(GATE_COOKIE.length + 1), gate))
}
// A malformed request target must not take the whole gate down (launchd would only relaunch it after 10 s).
function parse(request) {
  const target = request.url || "/"
  if (!URL.canParse(target, "http://cowcode.local")) return null
  return new URL(target, "http://cowcode.local")
}
function wantsHtml(request) {
  return String(request.headers.accept || "").includes("text/html")
}

const PAGE_STYLE = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>cow code</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#080808;color:#e6e6e6;font:17px/1.5 -apple-system,system-ui,sans-serif;text-align:center}p{max-width:22em;margin:0}</style>`
const DOOR_HTML = `<!doctype html><html lang="en"><head>${PAGE_STYLE}</head><body><p>🐄 this door needs its key.<br>open it from the qr in the app, or the link in the cow's slack dm.</p></body></html>`
const AWAY_HTML = `<!doctype html><html lang="en"><head>${PAGE_STYLE}<meta http-equiv="refresh" content="5"></head><body><p>🐄 the cow is getting up, back in a moment.</p></body></html>`
function deny(request, response) {
  if (wantsHtml(request)) {
    response.writeHead(404, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" })
    response.end(DOOR_HTML)
    return
  }
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" })
  response.end("Not found")
}
function away(request, response) {
  if (response.headersSent) return response.destroy()
  const headers = { "cache-control": "no-store", "retry-after": "3" }
  if (wantsHtml(request)) {
    response.writeHead(503, { ...headers, "content-type": "text/html; charset=utf-8" })
    response.end(AWAY_HTML)
    return
  }
  response.writeHead(503, { ...headers, "content-type": "text/plain; charset=utf-8" })
  response.end("CowCode is unavailable")
}

// The quick tunnel's hostname only ever appears in cloudflared's log; the last one wins.
let originCache = { mtime: -1, value: null }
function tunnelOrigin() {
  if (!fs.existsSync(PUBLIC_LOG)) return null
  const mtime = fs.statSync(PUBLIC_LOG).mtimeMs
  if (mtime === originCache.mtime) return originCache.value
  const found = fs.readFileSync(PUBLIC_LOG, "utf8").match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g)
  originCache = { mtime, value: found ? found[found.length - 1] : null }
  return originCache.value
}
function ping(response) {
  response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "set-cookie": cookie })
  response.end(JSON.stringify({ ok: true, origin: tunnelOrigin(), at: Date.now() }))
}

// iOS launches a home-screen web app at the manifest's start_url, in a cookie jar of its own, so the key has to be in it.
// Upstream fields (icons, colours, scope, display) are kept; if the server is mid-restart these defaults stand in.
const MANIFEST = {
  name: "cow code",
  short_name: "cow code",
  id: "/",
  start_url: "/",
  scope: "/",
  icons: [
    { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  theme_color: "#080808",
  background_color: "#080808",
  display: "standalone",
}
function parseManifest(text) {
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}
function sendManifest(response, upstream) {
  if (response.headersSent) return
  const keyed = `/?${GATE_QUERY}=${gate}`
  const body = JSON.stringify({ ...MANIFEST, ...upstream, name: MANIFEST.name, short_name: MANIFEST.short_name, id: keyed, start_url: keyed }, null, 2)
  response.writeHead(200, { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "no-store", "set-cookie": cookie })
  response.end(body)
}
function manifest(response) {
  // A stalled server must not hold the phone's manifest fetch: after 3 s the defaults stand in.
  const upstream = http.request({ host: "127.0.0.1", port: TARGET_PORT, method: "GET", path: "/site.webmanifest", headers: { host: `127.0.0.1:${TARGET_PORT}`, authorization }, timeout: 3000 })
  upstream.on("timeout", () => upstream.destroy())
  upstream.on("response", (up) => {
    const chunks = []
    up.on("data", (chunk) => chunks.push(chunk))
    up.on("end", () => sendManifest(response, up.statusCode === 200 ? parseManifest(Buffer.concat(chunks).toString("utf8")) : null))
    up.on("error", () => sendManifest(response, null))
  })
  upstream.on("error", () => sendManifest(response, null))
  upstream.end()
}

// Access log: ISO time, method, path (never the query), status, ms, first 60 chars of the user-agent.
// Rotates to .1 at 5 MB. Identical (method, path, status) lines within 10 s collapse into one plus a
// "repeated Nx" line: the app retries /global/event every 250 ms while the door is shut.
fs.mkdirSync(path.dirname(ACCESS_LOG), { recursive: true })
if (fs.existsSync(ACCESS_LOG)) fs.chmodSync(ACCESS_LOG, 0o600)
let accessBytes = fs.existsSync(ACCESS_LOG) ? fs.statSync(ACCESS_LOG).size : 0
let accessStream = openAccessLog()
let repeat = { key: "", at: 0, count: 0 }
function openAccessLog() {
  const stream = fs.createWriteStream(ACCESS_LOG, { flags: "a", mode: 0o600 })
  stream.on("error", (error) => console.error(`cow-gate access log: ${error.message}`))
  return stream
}
function accessLine(line) {
  if (accessBytes + line.length > ACCESS_MAX_BYTES) {
    accessStream.end()
    if (fs.existsSync(ACCESS_LOG)) fs.renameSync(ACCESS_LOG, `${ACCESS_LOG}.1`)
    accessStream = openAccessLog()
    accessBytes = 0
  }
  accessBytes += Buffer.byteLength(line)
  accessStream.write(line)
}
function access(request, status, started) {
  const now = Date.now()
  const url = parse(request)
  const key = `${request.method} ${(url ? url.pathname : "-").slice(0, 200)} ${status}`
  if (key === repeat.key && now - repeat.at < 10_000) {
    repeat.count += 1
    return
  }
  if (repeat.count) accessLine(`${new Date(now).toISOString()} ${repeat.key} repeated ${repeat.count}x\n`)
  const agent = String(request.headers["user-agent"] || "-").slice(0, 60).replace(/[^\x20-\x7e]/g, "?")
  accessLine(`${new Date(now).toISOString()} ${key} ${now - started}ms "${agent}"\n`)
  repeat = { key, at: now, count: 0 }
}

const server = http.createServer((request, response) => {
  const started = Date.now()
  let logged = false
  const done = () => {
    if (logged) return
    logged = true
    // 499: the client went away before anything was sent (a phone losing signal mid-walk).
    access(request, response.headersSent ? response.statusCode : 499, started)
  }
  response.once("finish", done)
  response.once("close", done)
  const incoming = parse(request)
  if (!incoming || !allowed(incoming, request.headers.cookie)) return deny(request, response)
  if (incoming.pathname === "/_cow/ping") return ping(response)
  if (MANIFEST_REWRITE && incoming.pathname === "/site.webmanifest" && request.method === "GET") return manifest(response)
  incoming.searchParams.delete(GATE_QUERY)
  const r = route(incoming.pathname)
  const headers = { ...request.headers }
  delete headers["accept-encoding"]
  delete headers.authorization
  headers.host = `127.0.0.1:${r.port}`
  headers.authorization = authorization
  const upstream = http.request({ host: "127.0.0.1", port: r.port, method: request.method, path: `${r.path}${incoming.search}`, headers })
  upstream.on("response", (up) => {
    const outgoing = { ...up.headers }
    delete outgoing["content-length"]
    delete outgoing["content-encoding"]
    const existing = outgoing["set-cookie"]
    outgoing["set-cookie"] = existing ? [...(Array.isArray(existing) ? existing : [existing]), cookie] : [cookie]
    response.writeHead(up.statusCode || 502, up.statusMessage, outgoing)
    up.pipe(response)
  })
  upstream.on("error", () => away(request, response))
  request.pipe(upstream)
})
server.on("upgrade", (request, socket, head) => {
  const started = Date.now()
  const incoming = parse(request)
  if (!incoming || !allowed(incoming, request.headers.cookie)) {
    access(request, 404, started)
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
    socket.destroy()
    return
  }
  incoming.searchParams.delete(GATE_QUERY)
  const r = route(incoming.pathname)
  let connected = false
  const upstream = net.connect(r.port, "127.0.0.1", () => {
    connected = true
    access(request, 101, started)
    const headers = { ...request.headers }
    delete headers.authorization
    headers.host = `127.0.0.1:${r.port}`
    headers.authorization = authorization
    let raw = `${request.method} ${r.path}${incoming.search} HTTP/1.1\r\n`
    for (const [k, v] of Object.entries(headers)) raw += `${k}: ${Array.isArray(v) ? v.join(", ") : v}\r\n`
    upstream.write(raw + "\r\n")
    if (head && head.length) upstream.write(head)
    socket.pipe(upstream).pipe(socket)
  })
  upstream.on("error", () => {
    if (!connected) access(request, 503, started)
    socket.destroy()
  })
  socket.on("error", () => upstream.destroy())
})
server.keepAliveTimeout = 255_000
server.headersTimeout = 260_000
server.listen(LISTEN_PORT, "127.0.0.1", () => console.log(`cow-gate listening on 127.0.0.1:${LISTEN_PORT} -> ${TARGET_PORT}`))
