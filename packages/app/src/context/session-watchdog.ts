import { createEffect, createMemo, createRoot, getOwner, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { useParams, useSearchParams } from "@solidjs/router"
import { createSimpleContext } from "@opencode-ai/ui/context"
import type { ServerSDK } from "./server-sdk"
import { useGlobal } from "./global"
import { ServerConnection, useServer } from "./server"
import { useNotification } from "./notification"
import { type DraftTab, useTabs } from "./tabs"
import { requireServerKey } from "@/utils/session-route"
import type { ServerScope } from "@/utils/server-scope"
import { createWatchdogCore, type StuckInfo } from "./session-watchdog-core"

export {
  createWatchdogCore,
  STUCK_RETRY_ATTEMPTS,
  STUCK_SILENCE_MS,
  watchdogSessionID,
  type StuckInfo,
  type StuckReason,
} from "./session-watchdog-core"

const SWEEP_INTERVAL_MS = 15_000

export type WatchdogFire =
  | ({ type: "stuck"; scope: ServerScope } & StuckInfo)
  | { type: "clear"; scope: ServerScope; directory: string; sessionID: string }

type WatchdogState = ReturnType<typeof createServerWatchdogState>

function createServerWatchdogState(input: {
  sdk: ServerSDK
  onStuck: (info: StuckInfo) => void
  onClear: (info: { directory: string; sessionID: string }) => void
}) {
  const [store, setStore] = createStore({ stuck: {} as Record<string, StuckInfo | undefined> })

  const core = createWatchdogCore({
    onStuck: (info) => {
      setStore("stuck", info.sessionID, info)
      input.onStuck(info)
    },
    onClear: (info) => {
      setStore("stuck", info.sessionID, undefined)
      input.onClear(info)
    },
  })

  const unsub = input.sdk.event.listen((e) => core.handleEvent(e.name, e.details))
  const timer = setInterval(() => core.sweep(), SWEEP_INTERVAL_MS)

  // Mirror the event-stream connection state into the core so the silence rule
  // is suppressed while the stream is down and resumes cleanly on reconnect.
  createEffect(() => core.setConnected(input.sdk.event.connection() === "connected"))

  // Seed already-busy sessions from the status snapshot so a session that was
  // busy-silent before this window subscribed still starts its silence timer
  // (e.g. reconnecting to a shared server where another device left a run
  // going). The snapshot has no directory, so resolve each non-idle session's
  // directory directly; the busy-at-connect set is tiny. Fire-and-forget.
  void input.sdk.client.session
    .status()
    .then((snapshot) =>
      Promise.all(
        Object.entries(snapshot.data ?? {})
          .filter(([, status]) => status?.type !== "idle")
          .map(([sessionID, status]) =>
            input.sdk.client.session
              .get({ sessionID })
              .then((got) => {
                const directory = got.data?.directory
                if (directory) core.seed(directory, { [sessionID]: status })
              })
              .catch(() => undefined),
          ),
      ),
    )
    .catch(() => undefined)

  onCleanup(() => {
    clearInterval(timer)
    unsub()
    core.dispose()
  })

  return {
    stuck: (sessionID: string) => store.stuck[sessionID],
    directoryStuck: (directory: string) => Object.values(store.stuck).some((info) => info?.directory === directory),
  }
}

export const { use: useSessionWatchdog, provider: SessionWatchdogProvider } = createSimpleContext({
  name: "SessionWatchdog",
  gate: false,
  init: () => {
    const params = useParams<{ serverKey?: string; dir?: string; id?: string }>()
    const [search] = useSearchParams<{ draftId?: string }>()
    const global = useGlobal()
    const server = useServer()
    const tabs = useTabs()
    const notification = useNotification()
    const owner = getOwner()
    const states = new Map<ServerScope, { dispose: () => void; state: WatchdogState }>()
    const listeners = new Set<(event: WatchdogFire) => void>()
    const emit = (event: WatchdogFire) => listeners.forEach((listener) => listener(event))

    const activeServer = createMemo(() => {
      if (params.serverKey) return requireServerKey(params.serverKey)
      if (search.draftId) {
        const draft = tabs.store.find((tab): tab is DraftTab => tab.type === "draft" && tab.draftID === search.draftId)
        if (draft) return draft.server
      }
      return server.key
    })

    const ensure = (key: ServerConnection.Key) => {
      const conn = global.servers.list().find((item) => ServerConnection.key(item) === key)
      if (!conn) throw new Error(`Watchdog server not found: ${key}`)
      const ctx = global.ensureServerCtx(conn)
      const existing = states.get(ctx.sdk.scope)
      if (existing) return existing.state
      const root = createRoot(
        (dispose) => ({
          dispose,
          state: createServerWatchdogState({
            sdk: ctx.sdk,
            onStuck: (info) => {
              notification.ensureServerState(key).reportStuck(info)
              emit({ type: "stuck", scope: ctx.sdk.scope, ...info })
            },
            onClear: (info) => {
              emit({ type: "clear", scope: ctx.sdk.scope, ...info })
            },
          }),
        }),
        owner ?? undefined,
      )
      states.set(ctx.sdk.scope, root)
      return root.state
    }

    createEffect(() => {
      global.servers.list().forEach((conn) => ensure(ServerConnection.key(conn)))
    })

    createEffect(() => {
      const scopes = new Set(global.servers.list().map((conn) => server.scope(ServerConnection.key(conn))))
      states.forEach((value, scope) => {
        if (scopes.has(scope)) return
        value.dispose()
        states.delete(scope)
      })
    })

    onCleanup(() => states.forEach((value) => value.dispose()))

    const selected = () => ensure(activeServer())

    return {
      listen(listener: (event: WatchdogFire) => void) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      session: {
        stuck: (sessionID: string) => selected().stuck(sessionID),
      },
      project: {
        stuck: (directory: string) => selected().directoryStuck(directory),
      },
    }
  },
})
