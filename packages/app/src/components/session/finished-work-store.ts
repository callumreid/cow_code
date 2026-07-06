import { createEffect, createMemo, type Accessor } from "solid-js"
import { createStore } from "solid-js/store"
import { useSync } from "@/context/sync"
import { getFinishedWork, retainFinished, type FinishedRow } from "./finished-work"

// Session-scoped retained history of finished tools + subagents. Module-level so
// it survives navigating between sessions during a run; keyed by session id
// (globally unique). The pure retainFinished keeps this idempotent by key.
const [store, setStore] = createStore({
  rows: {} as Record<string, FinishedRow[]>,
  clearedAt: {} as Record<string, number>,
})

export const finishedRows = (sessionID: string | undefined): FinishedRow[] =>
  sessionID ? (store.rows[sessionID] ?? []) : []

export const clearFinished = (sessionID: string) => {
  setStore("clearedAt", sessionID, Date.now())
  setStore("rows", sessionID, [])
}

// Single always-mounted observation point (see session.tsx): recomputes when a
// tool part flips to completed/error or a child session goes idle, and retains
// the result. Mount once per session route — the chip/panel visibility must not
// gate history capture.
export function createFinishedWorkRetention(sessionID: Accessor<string | undefined>) {
  const sync = useSync()
  const derived = createMemo(() => {
    const id = sessionID()
    if (!id) return undefined
    return getFinishedWork({
      sessionID: id,
      messages: sync().data.message[id] ?? [],
      parts: (messageID) => sync().data.part[messageID] ?? [],
      sessions: sync().data.session,
      status: (target) => sync().data.session_status[target],
    })
  })
  createEffect(() => {
    const id = sessionID()
    if (!id) return
    const incoming = derived()
    if (!incoming) return
    const existing = store.rows[id] ?? []
    const next = retainFinished(existing, incoming, { clearedBefore: store.clearedAt[id] })
    if (next !== existing) setStore("rows", id, next)
  })
}
