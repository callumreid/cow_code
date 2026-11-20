import { quietTitle, sessionId, trim } from "./desk.js"

// A new install can inherit a thread that was already waiting before event delivery began.
export function reconcileWaiting(desk, input) {
  const ready = new Set(Array.isArray(input.directories) ? input.directories : [])
  const waiting = Array.isArray(input.waiting) ? input.waiting : []
  if (!ready.size || !input.project) return
  const before = JSON.stringify(desk.state.cards)
  const previous = new Map(
    desk.state.cards.filter((c) => c.nativeProject === input.project).map((c) => [c.sessionId, c]),
  )
  desk.state.cards = desk.state.cards.filter((c) => c.nativeProject !== input.project || !ready.has(c.directory))
  for (const row of waiting) {
    if (
      !sessionId(row.id) ||
      !ready.has(row.directory) ||
      quietTitle(row.title) ||
      !["waiting-question", "waiting-permission"].includes(row.activity)
    )
      continue
    if (
      Object.values(desk.state.waits).some((w) => w.sessionId === row.id) ||
      desk.state.cards.some((c) => c.sessionId === row.id && c.nativeProject)
    )
      continue
    const prior = previous.get(row.id)
    desk.state.cards.push(
      prior || {
        id: "existing-" + row.id,
        sessionId: row.id,
        title: trim(row.title, 180),
        directory: row.directory,
        nativeProject: input.project,
        kind: row.activity === "waiting-permission" ? "permission" : "question",
        detail: "Open the thread to answer its pending request.",
        at: row.updated || Date.now(),
      },
    )
  }
  if (JSON.stringify(desk.state.cards) !== before) desk.save()
}
