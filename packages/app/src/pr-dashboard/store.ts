import { createSignal, onCleanup } from "solid-js"
import type { OpenPullRequest, PrAutomationKey, PrDashboard, PrDashboardPlatform, PrMergedHistory } from "./types"

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
  /** Flip keep-updated / auto-fix for one PR. Optimistic; the next refresh confirms. */
  setAutomation: (pr: OpenPullRequest, key: PrAutomationKey, on: boolean) => Promise<void>
}

/**
 * Polls the dashboard on an interval and on demand.
 *
 * The interval is cleared on cleanup. A background refresh that lands while
 * one is already in flight is dropped rather than queued — the panel is a
 * status readout, so the newest single result is always the right answer —
 * but a forced refresh (the refresh button, an automation flip) is chained
 * behind whatever is running, so a click always ends in a reload of fresh
 * values instead of being swallowed.
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
  let pendingForce = false
  let mergedPendingForce = false
  let mergedRequested = false
  let disposed = false

  const refresh = (force = false) => {
    const api = platform()
    if (!api || disposed) return
    if (inflight) {
      if (force) pendingForce = true
      return
    }
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
        const queued = pendingForce
        pendingForce = false
        // A forced refresh that arrived mid-flight runs now and keeps the
        // loading state up; when it takes over, inflight is true again.
        if (queued && !disposed) refresh(true)
        if (inflight) return
        if (!disposed) setLoading(false)
      })
  }

  const loadMerged = (force = false) => {
    const api = platform()
    if (!api || disposed) return
    if (mergedInflight) {
      if (force) mergedPendingForce = true
      return
    }
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
        const queued = mergedPendingForce
        mergedPendingForce = false
        if (queued && !disposed) loadMerged(true)
        if (mergedInflight) return
        if (!disposed) setMergedLoading(false)
      })
  }

  const setAutomation = async (pr: OpenPullRequest, key: PrAutomationKey, on: boolean) => {
    const api = platform()
    if (!api?.setAutomation) return
    setData((prev) =>
      prev
        ? {
            ...prev,
            groups: prev.groups.map((group) => ({
              ...group,
              items: group.items.map((item) =>
                item.repo === pr.repo && item.number === pr.number ? { ...item, automation: { ...item.automation, [key]: on } } : item,
              ),
            })),
          }
        : prev,
    )
    try {
      await api.setAutomation(pr.repo, pr.number, key, on)
    } finally {
      refresh(true)
    }
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

  return { data, merged, loading, mergedLoading, refresh, loadMerged, setAutomation }
}
