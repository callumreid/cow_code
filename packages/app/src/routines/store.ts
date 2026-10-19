import { createEffect, createSignal, on, onCleanup } from "solid-js"
import { isOfficeUnavailable, type OfficeSdk } from "@/office/api"
import { errorText } from "@/office/context"
import { getRoutines, routineLog, runRoutine, type RoutineLog } from "./api"
import type { RoutinesSnapshot } from "./types"

export type RoutinesStore = {
  data: () => RoutinesSnapshot | undefined
  error: () => string | undefined
  loading: () => boolean
  /** False once the server answered 404 (older build without the route). */
  available: () => boolean
  runningCount: () => number
  refresh: () => Promise<void>
  /** Resolves with launchctl's error text, or nothing when the job started. */
  run: (name: string) => Promise<string | undefined>
  log: (name: string, lines?: number) => Promise<RoutineLog>
}

const OPEN_MS = 15_000
const IDLE_MS = 60_000

/**
 * Scheduled-jobs feed for the sidebar badge and the Scheduled panel. Polls
 * every 15s while the panel is open and once a minute otherwise, so the
 * "running" dot in the sidebar stays honest without hammering launchctl.
 */
export function createRoutinesStore(
  sdk: () => OfficeSdk,
  fetcher: () => typeof fetch | undefined,
  active: () => boolean,
): RoutinesStore {
  const [data, setData] = createSignal<RoutinesSnapshot>()
  const [error, setError] = createSignal<string>()
  const [loading, setLoading] = createSignal(false)
  const [available, setAvailable] = createSignal(true)
  const init = () => ({ fetch: fetcher() })
  let inflight: Promise<void> | undefined
  let owner: OfficeSdk | undefined
  let controller: AbortController | undefined

  const refresh = () => {
    const current = sdk()
    if (inflight && owner === current) return inflight
    if (owner !== current) {
      controller?.abort()
      setData(undefined)
      setError(undefined)
      setAvailable(true)
    }
    owner = current
    controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)])
    setLoading(true)
    const request = getRoutines(current, { ...init(), signal })
      .then(
        (snapshot) => {
          // A server switch mid-flight makes this response someone else's.
          if (sdk() !== current) return
          setData(snapshot)
          setError(undefined)
          setAvailable(true)
        },
        (cause: unknown) => {
          if (sdk() !== current) return
          if (isOfficeUnavailable(cause)) {
            setAvailable(false)
            setData(undefined)
            return
          }
          setError(errorText(cause))
        },
      )
      .finally(() => {
        if (inflight !== request) return
        inflight = undefined
        setLoading(false)
      })
    inflight = request
    return request
  }

  createEffect(
    on([sdk, active], () => {
      void refresh()
    }),
  )

  let timer: ReturnType<typeof setInterval> | undefined
  createEffect(() => {
    const ms = active() ? OPEN_MS : IDLE_MS
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      if (!available() || document.hidden) return
      void refresh()
    }, ms)
  })
  const visible = () => {
    if (!document.hidden) void refresh()
  }
  document.addEventListener("visibilitychange", visible)
  window.addEventListener("online", visible)
  onCleanup(() => {
    controller?.abort()
    if (timer) clearInterval(timer)
    document.removeEventListener("visibilitychange", visible)
    window.removeEventListener("online", visible)
  })

  const run = async (name: string) => {
    const result = await runRoutine(sdk(), name, init()).catch((cause: unknown) => ({ error: errorText(cause) }))
    // launchd starts the job asynchronously; give it a moment before showing it as running.
    setTimeout(() => void refresh(), 1_500)
    return "error" in result ? result.error : undefined
  }

  const log = (name: string, lines = 80) => routineLog(sdk(), name, lines, init())
  const runningCount = () => data()?.routines.filter((routine) => routine.running).length ?? 0

  return { data, error, loading, available, runningCount, refresh, run, log }
}
