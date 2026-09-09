#!/usr/bin/env node
// Gate proxy for the phone path (port of cow_code desktop's public-companion.ts).
// Public traffic (cloudflared) -> this proxy -> opencode server on 127.0.0.1:4096.
// A request is allowed only with ?_cowcode_gate=<token> (sets a cookie) or that cookie.
// Basic auth for the server is injected here, so the password never leaves the mini.
const http = require("node:http")
const net = require("node:net")
const fs = require("node:fs")
const path = require("node:path")
const { randomBytes, timingSafeEqual } = require("node:crypto")

const HOME = process.env.HOME || "/Users/bronson"
const TARGET_PORT = Number(process.env.COW_TARGET_PORT || 4096)
const LISTEN_PORT = Number(process.env.COW_GATE_PORT || 4098)
const EYES_PORT = Number(process.env.COW_EYES_PORT || 4099)
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
const authorization = `Basic ${Buffer.from(`opencode:${password}`).toString("base64")}`

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

const server = http.createServer((request, response) => {
  const incoming = new URL(request.url || "/", "http://cowcode.local")
  if (!allowed(incoming, request.headers.cookie)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    response.end("Not found")
    return
  }
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
    const cookie = `${GATE_COOKIE}=${gate}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000`
    const existing = outgoing["set-cookie"]
    outgoing["set-cookie"] = existing ? [...(Array.isArray(existing) ? existing : [existing]), cookie] : [cookie]
    response.writeHead(up.statusCode || 502, up.statusMessage, outgoing)
    up.pipe(response)
  })
  upstream.on("error", () => {
    if (response.headersSent) return response.destroy()
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" })
    response.end("CowCode is unavailable")
  })
  request.pipe(upstream)
})
server.on("upgrade", (request, socket, head) => {
  const incoming = new URL(request.url || "/", "http://cowcode.local")
  if (!allowed(incoming, request.headers.cookie)) { socket.write("HTTP/1.1 404 Not Found\r\n\r\n"); socket.destroy(); return }
  incoming.searchParams.delete(GATE_QUERY)
  const r = route(incoming.pathname)
  const upstream = net.connect(r.port, "127.0.0.1", () => {
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
  upstream.on("error", () => socket.destroy())
  socket.on("error", () => upstream.destroy())
})
server.keepAliveTimeout = 255_000
server.headersTimeout = 260_000
server.listen(LISTEN_PORT, "127.0.0.1", () => console.log(`cow-gate listening on 127.0.0.1:${LISTEN_PORT} -> ${TARGET_PORT}`))
