import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

export const trim = (value, limit = 450) => (typeof value === "string" ? value.trim().slice(0, limit) : "")
export const redact = (value) =>
  typeof value === "string"
    ? value
        .replace(
          /\b(?:sk-[A-Za-z0-9_-]{24,}|AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[A-Za-z0-9_]{22,}|xox[baprs]-[A-Za-z0-9-]{18,})\b/g,
          "[redacted]",
        )
        .replace(/(\b(?:bearer|basic)\s+)[A-Za-z0-9+/_=.~-]{18,}/gi, "$1[redacted]")
    : ""
export const sessionId = (id) => typeof id === "string" && /^ses_[a-zA-Z0-9_-]+$/.test(id)
export const quietTitle = (title) =>
  /\b(pr[- ]reviews?(?:[- ]requests)?|review[- ]sweeps?|review(?:ing)? (?:pr|pull request|queue)|(?:pr|pull request) (?:#?\d+ )?(?:review|sweep|stamp|watch|check)|stamp requests?|pr[- ]queue|merge[- ]queue|dependabot|daily (?:maintenance|health|validation)|heartbeat|housekeeping|memory (?:curation|maintenance)|routine upkeep|queue status)\b/i.test(
    title,
  )
const significant =
  /\b(?:ready (?:for (?:you(?:r)?|testing|QA)|to (?:test|try))|available (?:to try|for testing)|needs? (?:your|a decision)|blocked (?:on|by|until)|waiting (?:on|for) (?:you|your)|cannot (?:continue|proceed)|outage|data loss|regression (?:confirmed|found)|(?:fix|feature|release) (?:is )?(?:live|shipped|deployed)|(?:implemented|restored|recovered|delivered|shipped|deployed|fixed)\b)/i
const needs =
  /\b(?:need(?:s)? (?:your|a decision)|blocked (?:on|by|until)|waiting (?:on|for) (?:you|your)|cannot (?:continue|proceed))\b/i
const risk =
  /\b(?:production (?:outage|incident)|confirmed data loss|customer[- ]impacting (?:outage|incident))\b/i
const routineReply =
  /\b(?:no (?:action|changes?|issues?|new|updates?|prs?|work|findings?)|nothing (?:new|to do|needs)|all (?:green|clear)|no further action|routine (?:check|review))\b/i
const actionableLine = (line) =>
  significant.test(line) &&
  !/\b(?:not|never|isn.t|wasn.t|hasn.t|couldn.t|if|once|will be|would be|plan to)\b.{0,30}\b(?:ready|shipped|deployed|fixed|restored|delivered|implemented|blocked)/i.test(
    line,
  )

export function classify({ event, content }, session = {}) {
  const title = trim(content?.sessionTitle || session.title || "Untitled thread", 160)
  const text = content?.reply || content?.error?.message || content?.message || content?.ask?.title || ""
  const quiet = session.quietParent || quietTitle(title) || (session.scheduled && !needs.test(text))
  // A routine job's own decision is still available in All work. A real incident can interrupt.
  if (quiet && !risk.test(text)) return
  const base = { sessionId: event.session.id, title, at: event.at, directory: event.project.directory }
  if (event.type === "permission-asked")
    return {
      ...base,
      kind: "permission",
      detail: trim(
        [content?.action, ...(content?.resources || []).slice(0, 3), content?.message].filter(Boolean).join(" · "),
      ),
      requestId: event.permission?.requestId,
    }
  if (event.type === "question-asked")
    return {
      ...base,
      kind: "question",
      detail: trim(content?.ask?.title || "A thread needs your input."),
      requestId: event.question?.id,
      ask: content?.ask,
    }
  if (event.type === "turn-failed")
    return { ...base, kind: "blocked", detail: trim(text || "The turn failed. Open the thread for its error.") }
  if (event.type !== "turn-finished") return
  const lines = text
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((line) => line.replace(/^[#*\s>-]+/, "").trim())
    .filter(Boolean)
  const line =
    lines.find((line) => needs.test(line) && actionableLine(line)) ||
    lines.find((line) => risk.test(line) || (actionableLine(line) && !routineReply.test(line)))
  if (!line && session.followed && !quiet && lines.length && !routineReply.test(text))
    return { ...base, kind: "milestone", detail: trim(lines[0]) }
  if (!line) return
  return { ...base, kind: needs.test(line) || risk.test(line) ? "blocked" : "milestone", detail: trim(line) }
}

export function newDesk(directory, notify = () => {}) {
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const file = join(directory, "office.json")
  const state = existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8"))
    : { history: [], cards: [], waits: {}, receipts: {}, seen: [], proposals: [] }
  state.followed ??= {}
  const save = () => {
    const tmp = file + ".new"
    writeFileSync(tmp, JSON.stringify(state), { mode: 0o600 })
    renameSync(tmp, file)
    notify()
  }
  const log = (role, text, channel = "chat") => {
    if (trim(text))
      state.history.push({ id: randomUUID(), role, text: trim(redact(text), 6500), channel, at: Date.now() })
    state.history = state.history.slice(-150)
  }
  const handle = (packet, meta = {}) => {
    const e = packet.event
    if (state.seen.includes(e.id)) return
    state.seen = [...state.seen.slice(-999), e.id]
    const sid = e.session.id
    const terminal = ["session-deleted", "session-archived"].includes(e.type)
    if (terminal || ["turn-started", "turn-finished", "turn-failed"].includes(e.type)) {
      for (const [id, item] of Object.entries(state.waits))
        if (item.sessionId === sid && item.at <= e.at) delete state.waits[id]
      state.cards = state.cards.filter(
        (c) => c.sessionId !== sid || c.at > e.at || (!terminal && c.kind === "milestone"),
      )
    }
    const card = classify(packet, { ...meta, followed: state.followed[sid] })
    if (card) card.detail = redact(card.detail)
    if (terminal || (card && e.type === "turn-finished")) delete state.followed[sid]
    if (e.type === "permission-asked" || e.type === "question-asked") {
      const requestId = e.permission?.requestId || e.question?.id
      if (requestId)
        state.waits[requestId] = card || {
          sessionId: sid,
          at: e.at,
          requestId,
          title: packet.content?.sessionTitle || meta.title,
          kind: e.permission ? "permission" : "question",
          detail: trim(packet.content?.message || packet.content?.ask?.title),
          ask: packet.content?.ask,
        }
    }
    if (card) {
      const same = (c) =>
        c.sessionId === sid &&
        c.kind === card.kind &&
        (card.requestId ? card.requestId === c.requestId : card.detail === c.detail)
      const previous = state.cards.find(same)
      state.cards = [
        ...state.cards.filter((c) => !same(c)),
        { ...card, id: previous?.id || e.id, dismissed: Boolean(previous?.dismissed) },
      ].slice(-120)
    }
    save()
  }
  const attention = () =>
    state.cards
      .filter((c) => !c.dismissed)
      .sort((a, b) => Number(a.kind === "milestone") - Number(b.kind === "milestone") || b.at - a.at)
  const propose = (action, label) => {
    const pending = { id: randomUUID(), action, label, at: Date.now() }
    state.proposals = [...state.proposals.filter((p) => Date.now() - p.at < 600000).slice(-7), pending]
    save()
    return pending
  }
  return { state, save, log, handle, attention, propose }
}

export function summarizeSession(s, active = {}) {
  return {
    id: s.id,
    title: trim(s.title || "Untitled thread", 180),
    directory: s.location?.directory || s.directory || null,
    parentId: s.parentID || s.parentId || null,
    scheduled: s.metadata?.openchamber?.kind === "scheduled",
    archived: Boolean(s.time?.archived),
    running: Boolean(active[s.id]),
    updated: s.time?.updated || 0,
    outcome: s.outcome || "",
    agent: s.agent || "",
    model: s.model?.providerID && s.model?.id ? s.model.providerID + "/" + s.model.id : "",
  }
}

export function makeInventory(read) {
  let cache = null
  let pending = null
  async function list(query = "", cursor = "") {
    const params = new URLSearchParams({ limit: "60" })
    if (query) params.set("search", query)
    if (cursor) params.set("cursor", cursor)
    const [page, live] = await Promise.all([read("/api/session?" + params), read("/api/session/active")])
    const active = live.data || {}
    const rows = page.data.map((s) => summarizeSession(s, active)).filter((s) => !s.archived)
    // Active is global, even if the session predates the first page or lives in a different project.
    if (!query && !cursor) {
      const missing = Object.keys(active).filter((id) => !rows.some((s) => s.id === id))
      for (let i = 0; i < missing.length; i += 8) {
        const extra = await Promise.all(
          missing.slice(i, i + 8).map(async (id) => {
            try {
              return summarizeSession((await read("/api/session/" + id)).data, active)
            } catch (err) {
              if (err.status !== 404) throw err
            }
          }),
        )
        rows.push(...extra.filter(Boolean))
      }
    }
    return { rows, cursor: page.cursor?.next || "", activeCount: Object.keys(active).length }
  }
  return {
    list: async (query, cursor) => {
      if (query || cursor) return list(query, cursor)
      if (cache && Date.now() - cache.at < 3500) return cache.value
      if (!pending)
        pending = list()
          .then((value) => {
            cache = { at: Date.now(), value }
            return value
          })
          .finally(() => {
            pending = null
          })
      return pending
    },
    invalidate() {
      cache = null
    },
    async one(id) {
      if (!sessionId(id)) throw new Error("Choose an OpenChamber thread.")
      const row = summarizeSession((await read("/api/session/" + id)).data)
      if (row.archived) throw new Error("That thread has been archived.")
      return row
    },
  }
}
