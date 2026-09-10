import { createEffect, createSignal, on, onCleanup } from "solid-js"
import type { PrDashboardPlatform } from "@/pr-dashboard/types"
import type { PastureHerd } from "./types"

export type PastureStore = {
  days: () => number
  setDays: (days: number) => void
  herd: () => PastureHerd | undefined
  loading: () => boolean
  available: () => boolean
  refresh: (force?: boolean) => Promise<void>
}

/**
 * Callum's merged pull requests behind the pasture. Fetched when the panel opens and
 * whenever the timeframe changes; a stale answer that lands after the
 * settings moved on is dropped.
 */
export function createPastureStore(platform: () => PrDashboardPlatform | undefined, active: () => boolean): PastureStore {
  // Today by default: the merged pen is a daily scoreboard, the week is a click away.
  const [days, setDays] = createSignal(1)
  const [herd, setHerd] = createSignal<PastureHerd>()
  const [loading, setLoading] = createSignal(false)
  let token = 0

  const refresh = async (force = false) => {
    const api = platform()
    if (!api?.fetchPasture) return
    const mine = ++token
    // Only Callum's own merges graze here.
    const request = { days: days(), scope: "mine" as const }
    setLoading(true)
    try {
      const next = await api.fetchPasture(request, force)
      if (mine === token) setHerd(next)
    } catch (cause) {
      if (mine !== token) return
      setHerd({
        items: [],
        fetchedAt: Date.now(),
        ...request,
        error: cause instanceof Error ? cause.message : String(cause),
      })
    } finally {
      if (mine === token) setLoading(false)
    }
  }

  createEffect(
    on([active, days], ([open]) => {
      if (open) void refresh()
    }),
  )
  // While the field is open, look for new merges every couple of minutes so
  // the hand of god has something to do.
  createEffect(() => {
    if (!active()) return
    const timer = setInterval(() => void refresh(true), 2 * 60_000)
    onCleanup(() => clearInterval(timer))
  })

  return { days, setDays, herd, loading, available: () => !!platform()?.fetchPasture, refresh }
}
