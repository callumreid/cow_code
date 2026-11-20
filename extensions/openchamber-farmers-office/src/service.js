import { createServer } from "node:http"
import { createServiceHost, readSessionEventRequest } from "@openchamber/sdk"
import { makeInventory, newDesk, quietTitle } from "./desk.js"
import { createOffice } from "./office.js"
import { reconcileWaiting } from "./reconcile.js"
import { publishMarks } from "./marks.js"
import { voiceCalls } from "./live.js"

const env = process.env
if (!env.OPENCHAMBER_SERVICE_TOKEN || !env.OPENCHAMBER_OPENCODE_URL || !env.OPENCHAMBER_SERVICE_DATA_DIR)
  throw new Error("Start Farmer’s Office through an approved OpenChamber extension.")
const host = createServiceHost({ env })
const read = async (path) => {
  const url = new URL(path, env.OPENCHAMBER_OPENCODE_URL)
  // The capability URL includes the service-specific proxy prefix.
  const route = env.OPENCHAMBER_OPENCODE_URL.replace(/\/$/, "") + url.pathname + url.search
  const res = await fetch(route, {
    headers: { Authorization: "Bearer " + env.OPENCHAMBER_SERVICE_TOKEN },
    signal: AbortSignal.timeout(7000),
    redirect: "error",
  })
  if (!res.ok)
    throw Object.assign(new Error("OpenChamber could not read this thread (" + res.status + ")."), {
      status: res.status,
    })
  return res.json()
}
let emitTimer
const desk = newDesk(env.OPENCHAMBER_SERVICE_DATA_DIR, () => {
  if (!emitTimer)
    emitTimer = setTimeout(() => {
      emitTimer = null
      host.emit("changed", {}).catch(() => {})
    }, 150)
})
publishMarks(desk, host)
const inventory = makeInventory(read)
const office = createOffice({ desk, inventory, read, host })
const voice = voiceCalls(office, desk)
const metadata = new Map()
const jobs = new Map()
const routes = {
  "/reconcile": (b) => {
    reconcileWaiting(desk, b)
    return { ok: true }
  },
  "/worker-selection": (b) => office.workerSelection(b),
  "/follow": async (b) => {
    await inventory.one(b.id)
    if (b.follow) desk.state.followed[b.id] = true
    else delete desk.state.followed[b.id]
    desk.save()
    return { ok: true }
  },
  "/state": () => office.snapshot(),
  "/work": (b) => inventory.list(String(b.query || "").slice(0, 160), String(b.cursor || "").slice(0, 4096)),
  "/detail": (b) => office.detail(b.id),
  "/action": (b) => office.direct(b),
  "/confirm": (b) => office.confirm(b.proposalId, "chat"),
  "/cancel": (b) => office.cancel(b.proposalId),
  "/dismiss": (b) => office.dismiss(b.id),
  "/answer": (b) => office.answer(b),
  "/chat": (b) => {
    if (!/^[a-zA-Z0-9-]{8,100}$/.test(b.requestId || "")) throw new Error("Invalid request ID.")
    const prior = desk.state.receipts[b.requestId]
    if (!prior && !jobs.has(b.requestId)) {
      jobs.set(b.requestId, true)
      office
        .chat(b)
        .catch((error) => {
          desk.log("farmer", error.message)
          desk.save()
        })
        .finally(() => jobs.delete(b.requestId))
    }
    return { accepted: true }
  },
  "/chat-status": (b) => ({
    pending: jobs.has(b.requestId),
    text: desk.state.receipts[b.requestId]?.result?.text,
    error: desk.state.receipts[b.requestId]?.error,
  }),
  "/voice/open": (b) => voice.open(b),
  "/voice/text": (b) => voice.textInput(b),
  "/voice/exchange": (b) => voice.exchange(b),
  "/voice/close": (b) => voice.close(b.id),
}
createServer(async (req, res) => {
  const json = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" })
    res.end(JSON.stringify(data))
  }
  if (req.headers.authorization !== "Bearer " + env.OPENCHAMBER_SERVICE_TOKEN)
    return json(401, { error: "Unauthorized" })
  if (req.method === "GET" && req.url === "/health") return json(200, { ok: true })
  if (req.method !== "POST") return json(405, { error: "POST required" })
  try {
    const chunks = []
    let size = 0
    for await (const part of req) {
      size += part.length
      if (size > 190000) return json(413, { error: "Request too large" })
      chunks.push(part)
    }
    const raw = Buffer.concat(chunks).toString()
    if (req.url === "/session-events") {
      const packet = readSessionEventRequest(raw)
      if (!packet) return json(400, { ok: false, error: "Invalid session event" })
      const sid = packet.event.session.id
      inventory.invalidate()
      let meta = metadata.get(sid)
      if (!meta && !["session-deleted", "session-archived"].includes(packet.event.type)) {
        try {
          meta = await inventory.one(sid)
          if (metadata.size > 1500) metadata.delete(metadata.keys().next().value)
          metadata.set(sid, meta)
        } catch {}
      }
      const parentId = meta?.parentId || packet.event.session.parentId
      if (parentId && meta && meta.quietParent === undefined) {
        try {
          const parent = metadata.get(parentId) || (await inventory.one(parentId))
          meta.quietParent = quietTitle(parent.title) || parent.scheduled
        } catch {}
      }
      desk.handle(packet, meta)
      return json(200, { ok: true })
    }
    const route = Object.hasOwn(routes, req.url) && routes[req.url]
    if (!route) return json(404, { error: "Unknown office route." })
    const result = await route(JSON.parse(raw || "{}"))
    json(200, result)
  } catch (error) {
    json(400, { error: error.message || "The Office request failed." })
  }
}).listen(Number(env.OPENCHAMBER_SERVICE_PORT), "127.0.0.1")
