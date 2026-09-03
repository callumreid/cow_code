import { createSignal, onCleanup } from "solid-js"
import type { PrDashboard, PrDashboardPlatform, PrMergedHistory } from "./types"

/** Matches the main-process cache window, so a tick never does redundant work. */
export const PR_REFRESH_MS = 15 * 60_000

export type PrDashboardStore = {
  data: () => PrDashboard | undefined
  merged: () => PrMergedHistory | undefined
  loading: () => boolean
  mergedLoading: () => boolean
  refresh: (force?: boolean) => void
  /** Loads merged history on first call; subsequent calls are no-ops unless forced. */
  loadMerged: (force?: boolean) => void
}

/**
 * Polls the dashboard on an interval and on demand.
 *
 * The interval is cleared on cleanup, and a refresh that lands while one is
 * already in flight is dropped rather than queued — the panel is a status
 * readout, so the newest single result is always the right answer.
 */
export function createPrDashboardStore(
  platform: () => PrDashboardPlatform | undefined,
  intervalMs = PR_REFRESH_MS,
): PrDashboardStore {
  const [data, setData] = createSignal<PrDashboard | undefined>()
  const [merged, setMerged] = createSignal<PrMergedHistory | undefined>()
  const [loading, setLoading] = createSignal(false)
  const [mergedLoading, setMergedLoading] = createSignal(false)
  let inflight = false
  let mergedInflight = false
  let mergedRequested = false
  let disposed = false

  const refresh = (force = false) => {
    const api = platform()
    if (!api || inflight || disposed) return
    inflight = true
    setLoading(true)
    api
      .fetch(force)
      .then((next) => {
        if (!disposed) setData(next)
      })
      .catch((error: unknown) => {
        if (disposed) return
        const message = error instanceof Error ? error.message : String(error)
        // Keep the last good payload; only annotate it.
        setData((prev) =>
          prev
            ? { ...prev, error: message }
            : {
                groups: [],
                openCount: 0,
                readyCount: 0,
                fetchedAt: Date.now(),
                error: message,
                unavailable: true,
              },
        )
      })
      .finally(() => {
        inflight = false
        if (!disposed) setLoading(false)
      })
  }

  const loadMerged = (force = false) => {
    const api = platform()
    if (!api || mergedInflight || disposed) return
    if (mergedRequested && !force) return
    mergedRequested = true
    mergedInflight = true
    setMergedLoading(true)
    api
      .fetchMerged(force)
      .then((next) => {
        if (!disposed) setMerged(next)
      })
      .catch((error: unknown) => {
        if (disposed) return
        const message = error instanceof Error ? error.message : String(error)
        setMerged((prev) => (prev ? { ...prev, error: message } : { items: [], fetchedAt: Date.now(), error: message }))
      })
      .finally(() => {
        mergedInflight = false
        if (!disposed) setMergedLoading(false)
      })
  }

  refresh()
  const timer = setInterval(() => {
    refresh(true)
    // Only keep merged history warm once the user has actually opened it.
    if (mergedRequested) loadMerged(true)
  }, intervalMs)

  onCleanup(() => {
    disposed = true
    clearInterval(timer)
  })

  return { data, merged, loading, mergedLoading, refresh, loadMerged }
}
