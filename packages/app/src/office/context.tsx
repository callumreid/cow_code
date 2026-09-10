import { createStore, produce, reconcile } from "solid-js/store"
import { setOfficeOpen } from "@/office/presence"
import { batch, createEffect, createMemo, createSignal, on, onCleanup, untrack } from "solid-js"
import { useLocation, useNavigate } from "@solidjs/router"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { usePlatform } from "@/context/platform"
import { useLanguage } from "@/context/language"
import { useSettings } from "@/context/settings"
import { useServer, ServerConnection, serverName } from "@/context/server"
import { type ServerSDK } from "@/context/server-sdk"
import { useGlobal } from "@/context/global"
import { sessionHref, legacySessionHref } from "@/utils/session-route"
import { persisted } from "@/utils/persist"
import { playSoundById } from "@/utils/sound"
import {
  answerThread,
  attention,
  requestOffice,
  requestStatus,
  replay,
  acknowledge,
  brief,
  ensureOverseer,
  getState,
  isOfficeUnavailable,
  markThread,
  promptThread,
  speak,
  transcribe,
  voiceToken,
  type OfficeAnswer,
  type OfficeFetchInit,
  type OfficeSdk,
} from "./api"
import { latestOfKind, NEEDS_YOU_KINDS, nextNeedsYou, unreadReports } from "./stream"
import type { OfficeBucket, OfficeCardAction, OfficeReport, OfficeState, OfficeThread, OfficeOutcome } from "./types"

export const BUCKET_ORDER: OfficeBucket[] = ["needs_you", "failed", "review", "working", "done"]
/** A strip chip: a bucket of cow threads, or the read-only Claude rows. */
export type OfficeChip = OfficeBucket | "claude" | "codex"
export type BriefState = "idle" | "pending" | "skipped" | "done" | "error"
const DONE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_REPORTS = 100
/** How long launch autoselect gets to navigate away from the root before the office opens anyway. */
const LAUNCH_GRACE_MS = 3000
/** How still the route must be after a launch navigation before the office opens. */
const LAUNCH_SETTLE_MS = 750

type Overseer = { sessionID: string; directory: string }
type ReportListener = (report: OfficeReport) => void

export function compareThreads(a: OfficeThread, b: OfficeThread) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
  return b.time.updated - a.time.updated
}

export function emptyCounts(): Record<OfficeBucket, number> {
  return { needs_you: 0, failed: 0, review: 0, working: 0, done: 0 }
}

/** A "done" row older than a day is noise; the server may still send it, so the client drops it. */
export function staleDone(thread: OfficeThread, now: number) {
  return thread.bucket === "done" && now - thread.time.updated > DONE_TTL_MS
}

export function errorText(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

function field(value: unknown, key: string) {
  if (typeof value !== "object" || value === null) return undefined
  return (value as Record<string, unknown>)[key]
}

function clientIdentity() {
  try {
    const stored = sessionStorage.getItem("office.client.v1")
    if (stored) return stored
    const id = crypto.randomUUID()
    sessionStorage.setItem("office.client.v1", id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export const { use: useOffice, provider: OfficeProvider } = createSimpleContext({
  name: "Office",
  gate: false,
  init: () => {
    const servers = useServer()
    const global = useGlobal()
    // Office ownership survives navigation and selected-server remounts. Worker
    // views have their own host; the one coordinator stays where it started.
    const owner = servers.current!
    const ownerContext = global.ensureServerCtx(owner)
    const sdk = () => ownerContext.sdk
    const hostRoutes = new Map<string, OfficeSdk>()
    const platform = usePlatform()
    const settings = useSettings()
    const language = useLanguage()
    const clientID = clientIdentity()
    const outcomeListeners = new Set<(outcome: OfficeOutcome) => void>()
    const observedOutcomes = new Set<string>()
    const spoken = new Set<string>()
    const connection = { generation: Date.now(), mode: "off" as "active" | "paused" | "off", disposed: false }
    const navigate = useNavigate()
    const location = useLocation()
    const listeners = new Set<ReportListener>()
    const meta = { ensuring: undefined as Promise<Overseer> | undefined, briefed: false, launched: false }

    const [store, setStore] = createStore({
      threads: {} as Record<string, OfficeThread>,
      remote: {} as Record<
        string,
        {
          hostID: string
          name: string
          status: "loading" | "available" | "stale" | "unavailable"
          observedAt: number
          state?: OfficeState
        }
      >,
      sources: {} as NonNullable<OfficeState["sources"]>,
      recovery: [] as NonNullable<OfficeState["recovery"]>,
      outcomes: [] as OfficeOutcome[],
      host: undefined as OfficeState["host"],
      seeded: false,
      attention: "off" as "active" | "paused" | "off",
      reports: [] as OfficeReport[],
      overseer: undefined as Overseer | undefined,
      updated: 0,
      open: false,
      voice: false,
      loading: false,
      loaded: false,
      available: true,
      error: undefined as string | undefined,
      expanded: undefined as OfficeChip | undefined,
      actions: {} as Record<string, OfficeCardAction>,
      focus: undefined as { id: string; seq: number } | undefined,
      brief: "idle" as BriefState,
      briefError: undefined as string | undefined,
    })
    // When the panel was last closed; the stream's divider and the unread badge hang off it.
    const [seen, setSeen, , seenReady] = persisted("office.lastSeen.v1", createStore({ at: 0 }))
    // Mirror the open flag for the notification layer, which sits outside this context.
    createEffect(() => setOfficeOpen(store.open))

    const init = (): OfficeFetchInit => ({ fetch: platform.fetch })

    const threads = createMemo(() => {
      const byHost = new Map<string, OfficeThread>()
      for (const row of Object.values(store.remote)) {
        if (row.hostID === store.host?.id) continue
        for (const thread of row.state?.threads ?? [])
          byHost.set(row.hostID + ":" + thread.source + ":" + thread.sessionID, {
            ...thread,
            hostID: row.hostID,
            hostName: row.name,
            availability: row.status === "available" ? thread.availability : "stale",
          })
      }
      for (const thread of Object.values(store.threads))
        byHost.set((thread.hostID ?? "") + ":" + thread.source + ":" + thread.sessionID, {
          ...thread,
          hostName: store.host?.name,
        })
      return [...byHost.values()].sort(compareThreads)
    })
    const findThread = (sessionID: string, hostID?: string) => {
      const matches = threads().filter(
        (thread) => thread.sessionID === sessionID && (!hostID || thread.hostID === hostID),
      )
      return matches.length === 1 ? matches[0] : undefined
    }
    const allReports = createMemo(() => {
      const reports = Object.values(store.remote)
        .filter((row) => row.hostID !== store.host?.id)
        .flatMap((row) =>
          (row.state?.reports ?? []).map((report) => ({ ...report, hostID: row.hostID, hostName: row.name })),
        )
      return [
        ...reports,
        ...store.reports.map((report) => ({ ...report, hostID: store.host?.id, hostName: store.host?.name })),
      ]
        .sort((a, b) => a.time - b.time)
        .slice(-MAX_REPORTS)
    })
    const cow = createMemo(() => threads().filter((thread) => thread.source === "cow"))
    const claude = createMemo(() => threads().filter((thread) => thread.source === "claude"))
    const codex = createMemo(() => threads().filter((thread) => thread.source === "codex"))
    const needsYou = createMemo(() => cow().filter((thread) => thread.bucket === "needs_you"))
    // Chips count cow threads only; Claude rows are read-only and get their own chip.
    const counts = createMemo(() => {
      const result = emptyCounts()
      cow().forEach((thread) => {
        result[thread.bucket] += 1
      })
      return result
    })
    const unread = createMemo(() => unreadReports(allReports(), seen.at))
    const latest = createMemo(() => latestOfKind(allReports()))

    const applyState = (state: OfficeState) => {
      const now = Date.now()
      const fresh = state.threads
        .filter((thread) => !staleDone(thread, now))
        .map((thread) => ({ ...thread, hostID: state.host?.id }))
      if (state.host) hostRoutes.set(state.host.id, sdk())
      batch(() => {
        setStore("threads", reconcile(Object.fromEntries(fresh.map((thread) => [thread.sessionID, thread]))))
        setStore("reports", state.reports.slice(-MAX_REPORTS))
        setStore("overseer", state.overseer ?? undefined)
        setStore("updated", state.updated)
        setStore("host", state.host)
        setStore(
          "outcomes",
          (state.outcomes ?? store.outcomes).filter((outcome) => !outcome.clientID || outcome.clientID === clientID),
        )
        setStore("sources", state.sources ?? {})
        setStore("recovery", state.recovery ?? [])
        setStore("seeded", state.seeded !== false)
        setStore("available", true)
        setStore("error", undefined)
      })
    }

    const load = async (current: ServerSDK) => {
      setStore("loading", true)
      const result = await getState(current, init()).then(
        (state) => ({ state }),
        (error: unknown) => ({ error }),
      )
      // A server switch mid-flight makes this response someone else's.
      if (sdk() !== current) return
      batch(() => {
        setStore("loading", false)
        setStore("loaded", true)
        if ("state" in result) {
          applyState(result.state)
          return
        }
        if (isOfficeUnavailable(result.error)) {
          setStore("available", false)
          setStore("error", undefined)
          return
        }
        setStore("error", errorText(result.error))
      })
      return "state" in result ? result.state : undefined
    }

    const upsertThread = (input: OfficeThread) => {
      const thread = { ...input, hostID: input.hostID ?? store.host?.id }
      if (staleDone(thread, Date.now())) {
        setStore(
          "threads",
          produce((draft) => {
            delete draft[thread.sessionID]
          }),
        )
        return
      }
      // reconcile rather than merge so a cleared `waiting` actually goes away.
      setStore("threads", thread.sessionID, reconcile(thread))
    }

    const addReport = (report: OfficeReport) => {
      if (store.reports.some((item) => item.id === report.id)) return
      setStore("reports", (list) => [...list, report].slice(-MAX_REPORTS))
      listeners.forEach((listener) => listener(report))
      if (!NEEDS_YOU_KINDS.has(report.kind) || store.open) return
      if (!settings.sounds.permissionsEnabled()) return
      void playSoundById(settings.sounds.permissions())
    }

    const open = () => {
      if (store.open) return
      setStore("open", true)
    }

    const close = () => {
      if (!store.open) return
      batch(() => {
        setStore("open", false)
        setStore("expanded", undefined)
        setStore("focus", undefined)
        setStore("brief", "idle")
        setStore("briefError", undefined)
      })
      meta.briefed = false
      if (seenReady()) setSeen("at", Date.now())
    }

    const outcomeCurrent = (outcome: OfficeOutcome) => {
      if (outcome.clientID && outcome.clientID !== clientID) return false
      if (outcome.generation !== undefined && outcome.generation !== connection.generation) return false
      if (Date.now() - outcome.time > 60_000) return false
      return outcome.observations.every((seen) => {
        const thread = store.threads[seen.sessionID]
        return thread && thread.lifecycle?.runID === seen.runID && thread.time.updated <= seen.updated
      })
    }
    const acknowledgeOutcome = (eventID: string, channel: "display" | "spoken") => {
      if (channel === "spoken") spoken.add(eventID)
      return acknowledge(sdk(), { clientID, eventID, channel }, init())
    }
    const handleEvent = (type: string, properties: unknown) => {
      if (type === "office.seeded") {
        void load(sdk())
        return
      }
      if (type === "office.outcome") {
        const outcome = properties as OfficeOutcome
        if (!outcome.id || observedOutcomes.has(outcome.id) || (outcome.clientID && outcome.clientID !== clientID))
          return
        observedOutcomes.add(outcome.id)
        setStore("outcomes", (items) => [...items, outcome].slice(-100))
        if (connection.mode === "active" && !spoken.has(outcome.id) && outcomeCurrent(outcome))
          outcomeListeners.forEach((listener) => listener(outcome))
        return
      }
      const sessionID = field(properties, "sessionID")
      if (typeof sessionID !== "string") return
      if (type === "office.removed") {
        setStore(
          "threads",
          produce((threads) => {
            delete threads[sessionID]
          }),
        )
        return
      }
      if (type === "office.thread") return upsertThread(properties as OfficeThread)
      if (type === "office.report") return addReport(properties as OfficeReport)
      const directory = field(properties, "directory")
      if (typeof directory !== "string") return
      if (type === "office.overseer") return setStore("overseer", { sessionID, directory })
      if (type !== "office.navigate") return
      const targetClient = field(properties, "clientID")
      const requestID = field(properties, "requestID")
      const time = field(properties, "time")
      if (
        targetClient !== clientID ||
        typeof requestID !== "string" ||
        typeof time !== "number" ||
        Date.now() - time > 15_000
      )
        return
      const generation = field(properties, "generation")
      if (generation !== undefined && (generation !== connection.generation || connection.mode !== "active")) return
      const current = sdk()
      if (!settings.general.newLayoutDesigns()) servers.setActive(ServerConnection.key(owner))
      const href = settings.general.newLayoutDesigns()
        ? sessionHref(ServerConnection.key(owner), sessionID)
        : legacySessionHref(directory, sessionID)
      close()
      navigate(href)
      requestAnimationFrame(() => {
        if (sdk() !== current || location.pathname !== href) return
        void acknowledge(
          current,
          { clientID, eventID: "navigation:" + requestID, channel: "navigation", sessionID, directory },
          init(),
        ).catch(() => undefined)
      })
    }

    createEffect(
      on(sdk, (current) => {
        const feed = { disposed: false, polling: false, initialized: false, cursor: 0, epoch: "", snapshotCursor: 0 }
        const key = "office.cursor.v1:" + clientID + ":" + current.url
        const poll = async () => {
          if (!feed.initialized || feed.disposed || feed.polling || sdk() !== current) return
          feed.polling = true
          try {
            const result = await replay(current, { clientID, after: feed.cursor, checkpoint: feed.cursor }, init())
            if (feed.disposed || sdk() !== current) return
            if (feed.epoch && feed.epoch !== result.epoch) {
              const state = await load(current)
              if (state) feed.snapshotCursor = state.cursor ?? 0
            }
            feed.epoch = result.epoch
            for (const id of result.delivered) if (id.startsWith("spoken:")) spoken.add(id.slice(7))
            for (const event of result.events) {
              if (
                event.cursor > feed.snapshotCursor ||
                !["office.thread", "office.removed", "office.report"].includes(event.kind)
              )
                handleEvent(event.kind, event.value)
              feed.cursor = event.cursor
            }
            try {
              sessionStorage.setItem(key, String(feed.cursor))
            } catch {}
            if (result.more)
              queueMicrotask(() => {
                void poll()
              })
          } catch (error) {
            if (!feed.disposed && sdk() === current && !isOfficeUnavailable(error)) setStore("error", errorText(error))
          } finally {
            feed.polling = false
          }
        }
        void load(current).then((state) => {
          if (!state || feed.disposed || sdk() !== current) return
          feed.snapshotCursor = state.cursor ?? 0
          feed.cursor = feed.snapshotCursor
          try {
            const cached = sessionStorage.getItem(key)
            if (cached !== null) feed.cursor = Math.min(Number(cached) || 0, feed.snapshotCursor)
          } catch {}
          feed.epoch = state.epoch ?? ""
          feed.initialized = true
          void poll()
        })
        const unsub = current.event.listen((e) => {
          if (e.name !== "global") return
          const type: string = e.details.type
          if (type === "server.connected" || type === "office.seeded") {
            void load(current).then((state) => {
              if (state) feed.snapshotCursor = state.cursor ?? 0
              void poll()
            })
            return
          }
          if (type.startsWith("office.")) void poll()
        })
        const timer = setInterval(() => void poll(), 2_000)
        const refresh = setInterval(() => {
          void load(current).then((state) => {
            if (state) feed.snapshotCursor = state.cursor ?? 0
          })
        }, 10_000)
        onCleanup(() => {
          feed.disposed = true
          unsub()
          clearInterval(timer)
          clearInterval(refresh)
          meta.ensuring = undefined
          connection.generation += 1
          connection.mode = "off"
          setStore("voice", false)
          setStore("attention", "off")
          void attention(current, { clientID, generation: connection.generation, mode: "off" }, init()).catch(
            () => undefined,
          )
        })
      }),
    )

    createEffect(() => {
      const list = servers.list
      const current = sdk()
      const cancel = new AbortController()
      let polling = false
      const poll = async () => {
        if (polling || cancel.signal.aborted) return
        polling = true
        await Promise.allSettled(
          list
            .filter((server) => server.http.url !== current.url)
            .map(async (server) => {
              const key = ServerConnection.key(server)
              const target = { server, url: server.http.url }
              if (!store.remote[key])
                setStore("remote", key, {
                  hostID: "legacy:" + key,
                  name: serverName(server),
                  status: "loading",
                  observedAt: 0,
                })
              try {
                const state = await getState(target, {
                  ...init(),
                  signal: AbortSignal.any([cancel.signal, AbortSignal.timeout(8000)]),
                })
                if (cancel.signal.aborted) return
                const hostID = state.host?.id ?? "legacy:" + key
                hostRoutes.set(hostID, target)
                setStore(
                  "remote",
                  key,
                  reconcile({
                    hostID,
                    name: serverName(server),
                    status: "available" as const,
                    observedAt: Date.now(),
                    state,
                  }),
                )
              } catch {
                if (!cancel.signal.aborted)
                  setStore("remote", key, "status", store.remote[key]?.state ? "stale" : "unavailable")
              }
            }),
        )
        polling = false
      }
      untrack(() => void poll())
      const timer = setInterval(() => void poll(), 10_000)
      onCleanup(() => {
        cancel.abort()
        clearInterval(timer)
      })
    })

    const targetFor = async (sessionID: string, hostID?: string) => {
      const thread = findThread(sessionID, hostID)
      if (!thread || thread.source !== "cow") throw new Error(language.t("office.host.observeOnly"))
      const target = thread.hostID ? hostRoutes.get(thread.hostID) : sdk()
      if (!target) throw new Error(language.t("office.host.unavailable"))
      const fresh = await getState(target, { ...init(), signal: AbortSignal.timeout(8000) })
      if (fresh.host?.id && fresh.host.id !== thread.hostID) throw new Error(language.t("office.host.changed"))
      if (!fresh.threads.some((item) => item.sessionID === sessionID && item.source === "cow"))
        throw new Error(language.t("office.host.missing"))
      return target
    }

    const openThread = async (thread: { sessionID: string; directory: string; hostID?: string }) => {
      const target = await targetFor(thread.sessionID, thread.hostID)
      const key = ServerConnection.key(target.server)
      servers.setActive(key)
      close()
      navigate(
        settings.general.newLayoutDesigns()
          ? sessionHref(key, thread.sessionID)
          : legacySessionHref(thread.directory, thread.sessionID),
      )
    }

    const setAttention = (mode: "active" | "paused" | "off") => {
      connection.generation = Math.max(Date.now(), connection.generation + 1)
      connection.mode = mode
      setStore("attention", mode)
      return attention(sdk(), { clientID, generation: connection.generation, mode }, init()).then(() => undefined)
    }
    const admitVoice = async (text: string, inputID: string) => {
      if (connection.disposed || connection.mode !== "active") throw new Error(language.t("office.voice.paused"))
      const current = sdk()
      const generation = connection.generation
      const result = await requestOffice(
        current,
        { id: clientID + ":" + generation + ":" + inputID, text, source: "voice", clientID, generation },
        init(),
      )
      if (sdk() !== current || generation !== connection.generation || connection.mode !== "active") return ""
      if (result.status !== "accepted" && result.status !== "processing" && result.status !== "completed")
        throw new Error(result.reason ?? language.t("office.request.failed"))
      return language.t("office.request.accepted")
    }
    const askRequest = async (text: string) => {
      const current = sdk()
      const input = { id: crypto.randomUUID(), text, source: "text" as const, clientID }
      const accepted = await requestOffice(current, input, init())
      if (accepted.status === "rejected") throw new Error(accepted.reason ?? language.t("office.request.failed"))
      // Text and explicit hold-to-talk callers await their own result; this does
      // not hold a server admission lock or the persistent voice microphone.
      for (;;) {
        if (sdk() !== current || connection.disposed) throw new Error(language.t("office.request.serverChanged"))
        const result = await requestStatus(current, input.id, init())
        if (result.status === "completed") return result.text ?? ""
        if (["failed", "rejected", "reconciliation_required"].includes(result.status))
          throw new Error(result.reason ?? language.t("office.request.failed"))
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    onCleanup(() => {
      connection.disposed = true
      connection.mode = "off"
      connection.generation += 1
      void attention(sdk(), { clientID, generation: connection.generation, mode: "off" }, init()).catch(() => undefined)
    })

    const ensure = () => {
      if (store.overseer) return Promise.resolve(store.overseer)
      if (meta.ensuring) return meta.ensuring
      const current = sdk()
      meta.ensuring = ensureOverseer(current, init())
        .then((overseer) => {
          if (sdk() === current) setStore("overseer", overseer)
          return overseer
        })
        .finally(() => {
          meta.ensuring = undefined
        })
      return meta.ensuring
    }

    // The stream needs the farmer's session to subscribe to, so opening the
    // panel is what creates it.
    createEffect(() => {
      if (!store.open || !store.loaded || !store.available || store.overseer) return
      void ensure().catch((error: unknown) => setStore("error", errorText(error)))
    })

    const runBrief = () => {
      const current = sdk()
      batch(() => {
        setStore("brief", "pending")
        setStore("briefError", undefined)
      })
      return brief(current, { since: seen.at, clientID }, init()).then(
        (result) => {
          if (sdk() === current) setStore("brief", result.skipped ? "skipped" : "done")
          return result
        },
        (error: unknown) => {
          if (sdk() === current) {
            batch(() => {
              setStore("brief", "error")
              setStore("briefError", errorText(error))
            })
          }
          throw error
        },
      )
    }

    // "Since you last looked": one brief per open, only when something was
    // reported meanwhile. The reply shows up in the stream as a farmer message.
    createEffect(() => {
      if (!store.open || !store.available || !seenReady() || meta.briefed || connection.mode === "active") return
      meta.briefed = true
      if (unread().length === 0) return
      void runBrief().catch(() => undefined)
    })

    // Open once per launch, after the first state load. Launch autoselect
    // navigates once the project list loads (to the project, then on to its
    // last session) and the layout closes overlays on every navigation, so
    // open only once the route has been still for a moment — or after a grace
    // when the app stays at the root.
    const [settled, setSettled] = createSignal(false)
    createEffect(
      on(
        () => location.pathname,
        (pathname) => {
          if (meta.launched) return
          setSettled(false)
          const timer = setTimeout(() => setSettled(true), pathname === "/" ? LAUNCH_GRACE_MS : LAUNCH_SETTLE_MS)
          onCleanup(() => clearTimeout(timer))
        },
      ),
    )
    createEffect(() => {
      if (meta.launched || !store.loaded || !store.available || !settings.ready() || !settled()) return
      meta.launched = true
      if (!settings.office.openOnLaunch()) return
      open()
    })

    const mark = async (sessionID: string, input: { pinned?: boolean; muted?: boolean }, hostID?: string) => {
      const target = await targetFor(sessionID, hostID)
      await markThread(target, { sessionID, ...input }, init())
      if (target.url !== sdk().url) return
      if (!store.threads[sessionID]) return
      batch(() => {
        if (input.pinned !== undefined) setStore("threads", sessionID, "pinned", input.pinned)
        if (input.muted !== undefined) setStore("threads", sessionID, "muted", input.muted)
      })
    }

    return {
      threads,
      clientID,
      sync: () => ownerContext.sync,
      host: () => store.host,
      seeded: () => store.seeded,
      attention: () => store.attention,
      setAttention,
      admitVoice,
      outcomeCurrent,
      acknowledgeOutcome,
      outcomes: () => store.outcomes,
      onOutcome(listener: (outcome: OfficeOutcome) => void) {
        outcomeListeners.add(listener)
        return () => {
          outcomeListeners.delete(listener)
        }
      },
      status: async () => {
        const current = await getState(sdk(), init())
        return language.t("office.status.summary", current.counts)
      },
      cow,
      claude,
      codex,
      needsYou,
      counts,
      unread,
      latest,
      thread: findThread,
      reports: allReports,
      openThread,
      recovery: () => store.recovery,
      sources: () => store.sources,
      hosts: () => [
        {
          hostID: store.host?.id ?? "",
          name: store.host?.name ?? servers.name,
          status: store.error || !store.available ? "unavailable" : store.loading ? "loading" : "available",
          observedAt: store.updated,
        },
        ...Object.values(store.remote).filter((row) => row.hostID !== store.host?.id),
      ],
      overseer: () => store.overseer,
      opened: () => store.open,
      voice: () => store.voice,
      loading: () => store.loading,
      loaded: () => store.loaded,
      available: () => store.available,
      error: () => store.error,
      lastSeen: () => seen.at,
      markSeen() {
        if (seenReady()) setSeen("at", Date.now())
      },
      briefState: () => store.brief,
      briefError: () => store.briefError,
      brief: runBrief,
      catchUp: () => brief(sdk(), { since: seen.at, clientID }, init()),
      expandedBucket: () => store.expanded,
      toggleBucket(chip: OfficeChip) {
        setStore("expanded", (current) => (current === chip ? undefined : chip))
      },
      collapse() {
        setStore("expanded", undefined)
      },
      cardAction: (reportID: string) => store.actions[reportID],
      recordAction(reportID: string, action: OfficeCardAction) {
        setStore("actions", reportID, action)
      },
      focus: () => store.focus,
      clearFocus() {
        setStore("focus", undefined)
      },
      open,
      close,
      toggle() {
        if (store.open) return close()
        open()
      },
      /** Jump to the next live needs-you card in the stream, opening the panel if needed. */
      next() {
        const target = nextNeedsYou(allReports(), findThread, latest(), store.focus?.id)
        batch(() => {
          if (target) setStore("focus", { id: target.id, seq: (store.focus?.seq ?? 0) + 1 })
          open()
        })
      },
      refresh: () => load(sdk()),
      ensureOverseer: ensure,
      ask: (text: string, _source: "text" | "voice" = "text") => askRequest(text),
      prompt: async (sessionID: string, text: string, mode: "steer" | "context", hostID?: string) =>
        promptThread(await targetFor(sessionID, hostID), { sessionID, text, mode }, init()),
      answer: async (input: OfficeAnswer) =>
        answerThread(await targetFor(input.sessionID, input.hostID), input, init()),
      mark,
      setVoice(value: boolean) {
        setStore("voice", value)
      },
      toggleVoice() {
        setStore("voice", (value) => !value)
      },
      voiceToken: () =>
        voiceToken(sdk(), { model: settings.office.voiceModel(), voice: settings.office.voice() }, init()),
      transcribe: (input: { audio: string; mime: string }) =>
        transcribe(sdk(), input, init()).then((result) => result.text),
      speak: (text: string) => speak(sdk(), { text, voice: settings.office.voice() }, init()),
      onReport(listener: ReportListener) {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    }
  },
})
