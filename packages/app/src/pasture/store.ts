import { createEffect, createSignal, on, onCleanup } from "solid-js"
import type { PrDashboardPlatform } from "@/pr-dashboard/types"
import type { PastureExtras, PastureHerd } from "./types"

/** What the field remembers between opens. */
export type PastureSettings = { mooOnMove: boolean; tour: boolean }

const SETTINGS_KEY = "pasture.settings"
const DEFAULT_SETTINGS: PastureSettings = { mooOnMove: false, tour: false }

function readSettings(): PastureSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as Partial<PastureSettings> | null
    return {
      mooOnMove: typeof stored?.mooOnMove === "boolean" ? stored.mooOnMove : DEFAULT_SETTINGS.mooOnMove,
      tour: typeof stored?.tour === "boolean" ? stored.tour : DEFAULT_SETTINGS.tour,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export type PastureStore = {
  days: () => number
  setDays: (days: number) => void
  herd: () => PastureHerd | undefined
  /** Closed PRs, alerts, the party and who is signed in; undefined until the desktop answers. */
  extras: () => PastureExtras | undefined
  settings: () => PastureSettings
  update: (patch: Partial<PastureSettings>) => void
  loading: () => boolean
  available: () => boolean
  refresh: (force?: boolean) => Promise<void>
  refreshExtras: (force?: boolean) => Promise<void>
}

/**
 * Callum's merged pull requests behind the pasture, plus the extras the field
 * needs (closed PRs, firing alerts, the event on right now). Fetched when the
 * panel opens and whenever the timeframe changes; a stale answer that lands
 * after the settings moved on is dropped.
 */
export function createPastureStore(platform: () => PrDashboardPlatform | undefined, active: () => boolean): PastureStore {
  // Today by default: the merged pen is a daily scoreboard, the week is a click away.
  const [days, setDays] = createSignal(1)
  const [herd, setHerd] = createSignal<PastureHerd>()
  const [extras, setExtras] = createSignal<PastureExtras>()
  const [settings, setSettings] = createSignal<PastureSettings>(readSettings())
  const [loading, setLoading] = createSignal(false)
  let token = 0
  let extrasToken = 0

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

  const refreshExtras = async (force = false) => {
    const api = platform()
    if (!api?.fetchPastureExtras) return
    const mine = ++extrasToken
    try {
      const next = await api.fetchPastureExtras({ days: days(), scope: "mine" }, force)
      if (mine === extrasToken) setExtras(next)
    } catch {
      // The desktop keeps the last good answer; a missed poll changes nothing on the field.
    }
  }

  const update = (patch: Partial<PastureSettings>) => {
    const next = { ...settings(), ...patch }
    setSettings(next)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    } catch {
      // Storage can be locked down; the setting still holds for this open.
    }
  }

  createEffect(
    on([active, days], ([open]) => {
      if (!open) return
      void refresh()
      void refreshExtras()
    }),
  )
  // While the field is open, look for new merges every couple of minutes so
  // the hand of god has something to do, and for alerts every minute so the
  // wolves come and go on time.
  createEffect(() => {
    if (!active()) return
    const timer = setInterval(() => void refresh(true), 2 * 60_000)
    const quick = setInterval(() => void refreshExtras(), 60_000)
    onCleanup(() => {
      clearInterval(timer)
      clearInterval(quick)
    })
  })

  return { days, setDays, herd, extras, settings, update, loading, available: () => !!platform()?.fetchPasture, refresh, refreshExtras }
}
