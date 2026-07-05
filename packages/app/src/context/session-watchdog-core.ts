// Pure stuck-session state machine — no timers, no solid primitives, no router
// imports — so synthetic event streams can drive it directly in unit tests.
// The session-watchdog context owns the interval, the reactive store, and the
// notification/toast fan-out.

// Fires "stuck" when a busy session has produced zero session-scoped events for
// this long. Long-running tools are still legitimate liveness: tool progress
// metadata updates arrive as message.part.updated events and reset the clock.
export const STUCK_SILENCE_MS = 120_000
// Fires "stuck" when the engine retry loop reaches this attempt count. Retry is
// unbounded by design (rate limits carry upsell actions) — we surface, not cap.
export const STUCK_RETRY_ATTEMPTS = 5

export type StuckReason = "silent" | "retry"

export type StuckInfo = {
  directory: string
  sessionID: string
  reason: StuckReason
  attempt?: number
  since: number
}

type WatchdogEvent = { type: string; properties?: unknown }

type TrackedSession = {
  directory: string
  busy: boolean
  waiting: boolean
  lastActivityAt: number
  retryAttempt: number
}

// Session-scoped liveness extraction. Returns undefined for events that must
// NOT count as activity (server.heartbeat, lsp.*, vcs.*, installation.*, ...).
export function watchdogSessionID(event: WatchdogEvent) {
  const props = event.properties as Record<string, unknown> | undefined
  if (!props) return undefined
  switch (event.type) {
    case "message.updated":
      return (props.info as { sessionID?: string } | undefined)?.sessionID
    case "message.part.updated":
      return (props.part as { sessionID?: string } | undefined)?.sessionID
    case "message.part.delta":
    case "message.removed":
    case "message.part.removed":
    case "session.status":
    case "session.idle":
    case "session.error":
    case "session.diff":
    case "todo.updated":
    case "permission.asked":
    case "permission.replied":
    case "question.asked":
    case "question.replied":
    case "question.rejected":
      return typeof props.sessionID === "string" ? props.sessionID : undefined
    default:
      return undefined
  }
}

const BUSY_SIGNALS = new Set(["message.part.delta", "message.part.updated"])
const END_SIGNALS = new Set(["session.idle", "session.error"])
const WAIT_START = new Set(["permission.asked", "question.asked"])
const WAIT_END = new Set(["permission.replied", "question.replied", "question.rejected"])

// The status shape carried by both the live session.status event and the
// GET /session/status snapshot — the discriminated union from the SDK.
export type WatchdogStatus = { type?: string; attempt?: number }

// Fold a status value into a tracked session. Shared by the live session.status
// event and the bootstrap snapshot seed so both read busy/retry/idle the same
// way. Returns false for idle (caller deletes + clears the session).
function applyStatus(tracked: TrackedSession, status: WatchdogStatus | undefined) {
  if (status?.type === "idle") return false
  tracked.busy = true
  tracked.retryAttempt = status?.type === "retry" ? (status.attempt ?? 0) : 0
  if (status?.type === "busy") tracked.waiting = false
  return true
}

export function createWatchdogCore(input: {
  onStuck: (info: StuckInfo) => void
  onClear: (info: { directory: string; sessionID: string }) => void
  silenceMs?: number
  retryAttempts?: number
}) {
  const silenceMs = input.silenceMs ?? STUCK_SILENCE_MS
  const retryAttempts = input.retryAttempts ?? STUCK_RETRY_ATTEMPTS
  const sessions = new Map<string, TrackedSession>()
  const stuck = new Map<string, StuckInfo>()
  // While the event stream is down, no liveness signals arrive, so silence is
  // meaningless — freeze detection until it reconnects. Defaults to true so
  // callers/tests that never touch connection state behave exactly as before.
  let connected = true

  const clear = (sessionID: string) => {
    const current = stuck.get(sessionID)
    if (!current) return
    stuck.delete(sessionID)
    input.onClear({ directory: current.directory, sessionID })
  }

  const evaluate = (sessionID: string, now: number) => {
    // Stream down: no event can refresh liveness or advance the retry count, so
    // neither rule can distinguish a stuck engine from a dead pipe. Freeze
    // entirely — do not fire new alerts, and (critically) do not clear existing
    // ones, so a genuine stuck survives a blip.
    if (!connected) return
    const tracked = sessions.get(sessionID)
    const current = stuck.get(sessionID)
    const next = (() => {
      if (!tracked || !tracked.busy || tracked.waiting) return undefined
      if (tracked.retryAttempt >= retryAttempts)
        return {
          directory: tracked.directory,
          sessionID,
          reason: "retry" as const,
          attempt: tracked.retryAttempt,
          since: current?.since ?? now,
        }
      if (now - tracked.lastActivityAt >= silenceMs)
        return { directory: tracked.directory, sessionID, reason: "silent" as const, since: current?.since ?? now }
      return undefined
    })()

    if (next && !current) {
      stuck.set(sessionID, next)
      input.onStuck(next)
      return
    }
    // Already fired: keep the record fresh without re-notifying.
    if (next && current) {
      stuck.set(sessionID, next)
      return
    }
    if (!next && current) clear(sessionID)
  }

  return {
    handleEvent(directory: string, event: WatchdogEvent, now = Date.now()) {
      const sessionID = watchdogSessionID(event)
      if (!sessionID) return

      if (END_SIGNALS.has(event.type)) {
        sessions.delete(sessionID)
        clear(sessionID)
        return
      }

      const tracked = sessions.get(sessionID) ?? {
        directory,
        busy: false,
        waiting: false,
        lastActivityAt: now,
        retryAttempt: 0,
      }
      tracked.directory = directory
      tracked.lastActivityAt = now

      if (event.type === "session.status") {
        const status = (event.properties as { status?: WatchdogStatus }).status
        if (!applyStatus(tracked, status)) {
          sessions.delete(sessionID)
          clear(sessionID)
          return
        }
      }
      if (BUSY_SIGNALS.has(event.type)) tracked.busy = true
      if (WAIT_START.has(event.type)) tracked.waiting = true
      if (WAIT_END.has(event.type)) tracked.waiting = false

      sessions.set(sessionID, tracked)
      evaluate(sessionID, now)
    },
    sweep(now = Date.now()) {
      const ids = [...sessions.keys()]
      ids.forEach((sessionID) => evaluate(sessionID, now))
    },
    // Seed tracked sessions from a GET /session/status snapshot so a session
    // that was already busy-silent before this run subscribed to events still
    // starts its silence timer. Never clobbers a session the live stream is
    // already tracking (that has a fresher lastActivityAt).
    seed(directory: string, statuses: Record<string, WatchdogStatus>, now = Date.now()) {
      Object.entries(statuses).forEach(([sessionID, status]) => {
        if (sessions.has(sessionID)) return
        const tracked: TrackedSession = {
          directory,
          busy: false,
          waiting: false,
          lastActivityAt: now,
          retryAttempt: 0,
        }
        if (!applyStatus(tracked, status)) return
        sessions.set(sessionID, tracked)
        evaluate(sessionID, now)
      })
    },
    setConnected(next: boolean, now = Date.now()) {
      if (next === connected) return
      connected = next
      // On reconnect the silence accrued while the stream was down is not
      // evidence of a hung engine, so give every not-yet-flagged busy session a
      // fresh window. Already-stuck sessions keep their state (their old clock
      // still reads past the threshold, so they are not cleared).
      if (next) sessions.forEach((tracked, sessionID) => {
        if (!stuck.has(sessionID)) tracked.lastActivityAt = now
      })
    },
    stuckFor(sessionID: string) {
      return stuck.get(sessionID)
    },
    dispose() {
      sessions.clear()
      stuck.clear()
    },
  }
}
