import { createStore, produce, reconcile } from "solid-js/store"
import { setOfficeOpen } from "@/office/presence"
import { batch, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js"
import { useLocation, useNavigate } from "@solidjs/router"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { usePlatform } from "@/context/platform"
import { useSettings } from "@/context/settings"
import { useServerSDK, type ServerSDK } from "@/context/server-sdk"
import { persisted } from "@/utils/persist"
import { playSoundById } from "@/utils/sound"
import {
  answerThread,
  ask,
  brief,
  ensureOverseer,
  getState,
  isOfficeUnavailable,
  markThread,
  promptThread,
  voiceToken,
  type OfficeAnswer,
  type OfficeFetchInit,
} from "./api"
import { latestOfKind, NEEDS_YOU_KINDS, nextNeedsYou, unreadReports } from "./stream"
import type { OfficeBucket, OfficeCardAction, OfficeReport, OfficeState, OfficeThread } from "./types"

export const BUCKET_ORDER: OfficeBucket[] = ["needs_you", "failed", "review", "working", "done"]
/** A strip chip: a bucket of cow threads, or the read-only Claude rows. */
export type OfficeChip = OfficeBucket | "claude"
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

export const { use: useOffice, provider: OfficeProvider } = createSimpleContext({
  name: "Office",
  gate: false,
  init: () => {
    const sdk = useServerSDK()
    const platform = usePlatform()
    const settings = useSettings()
    const navigate = useNavigate()
    const location = useLocation()
    const listeners = new Set<ReportListener>()
    const meta = { ensuring: undefined as Promise<Overseer> | undefined, briefed: false, launched: false }

    const [store, setStore] = createStore({
      threads: {} as Record<string, OfficeThread>,
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

    const threads = createMemo(() => Object.values(store.threads).sort(compareThreads))
    const cow = createMemo(() => threads().filter((thread) => thread.source === "cow"))
    const claude = createMemo(() => threads().filter((thread) => thread.source === "claude"))
    const needsYou = createMemo(() => cow().filter((thread) => thread.bucket === "needs_you"))
    // Chips count cow threads only; Claude rows are read-only and get their own chip.
    const counts = createMemo(() => {
      const result = emptyCounts()
      cow().forEach((thread) => {
        result[thread.bucket] += 1
      })
      return result
    })
    const unread = createMemo(() => unreadReports(store.reports, seen.at))
    const latest = createMemo(() => latestOfKind(store.reports))

    const applyState = (state: OfficeState) => {
      const now = Date.now()
      const fresh = state.threads.filter((thread) => !staleDone(thread, now))
      batch(() => {
        setStore("threads", reconcile(Object.fromEntries(fresh.map((thread) => [thread.sessionID, thread]))))
        setStore("reports", state.reports.slice(-MAX_REPORTS))
        setStore("overseer", state.overseer ?? undefined)
        setStore("updated", state.updated)
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
    }

    const upsertThread = (thread: OfficeThread) => {
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

    const handleEvent = (type: string, properties: unknown) => {
      const sessionID = field(properties, "sessionID")
      if (typeof sessionID !== "string") return
      if (type === "office.thread") return upsertThread(properties as OfficeThread)
      if (type === "office.report") return addReport(properties as OfficeReport)
      const directory = field(properties, "directory")
      if (typeof directory !== "string") return
      if (type === "office.overseer") return setStore("overseer", { sessionID, directory })
      if (type !== "office.navigate") return
      close()
      navigate(`/${base64Encode(directory)}/session/${sessionID}`)
    }

    createEffect(
      on(sdk, (current) => {
        void load(current)
        const unsub = current.event.listen((e) => {
          if (e.name !== "global") return
          const type: string = e.details.type
          if (type === "server.connected") {
            void load(current)
            return
          }
          if (!type.startsWith("office.")) return
          handleEvent(type, e.details.properties)
        })
        onCleanup(unsub)
      }),
    )

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
      return brief(current, { since: seen.at }, init()).then(
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
      if (!store.open || !store.available || !seenReady() || meta.briefed) return
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

    const mark = async (sessionID: string, input: { pinned?: boolean; muted?: boolean }) => {
      await markThread(sdk(), { sessionID, ...input }, init())
      if (!store.threads[sessionID]) return
      batch(() => {
        if (input.pinned !== undefined) setStore("threads", sessionID, "pinned", input.pinned)
        if (input.muted !== undefined) setStore("threads", sessionID, "muted", input.muted)
      })
    }

    return {
      threads,
      cow,
      claude,
      needsYou,
      counts,
      unread,
      latest,
      thread: (sessionID: string) => store.threads[sessionID],
      reports: () => store.reports,
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
        const target = nextNeedsYou(store.reports, (id) => store.threads[id], latest(), store.focus?.id)
        batch(() => {
          if (target) setStore("focus", { id: target.id, seq: (store.focus?.seq ?? 0) + 1 })
          open()
        })
      },
      refresh: () => load(sdk()),
      ensureOverseer: ensure,
      ask: (text: string, source: "text" | "voice" = "text") =>
        ask(sdk(), { text, source }, init()).then((result) => result.text),
      prompt: (sessionID: string, text: string, mode: "steer" | "context") =>
        promptThread(sdk(), { sessionID, text, mode }, init()),
      answer: (input: OfficeAnswer) => answerThread(sdk(), input, init()),
      mark,
      setVoice(value: boolean) {
        setStore("voice", value)
      },
      toggleVoice() {
        setStore("voice", (value) => !value)
      },
      voiceToken: () =>
        voiceToken(sdk(), { model: settings.office.voiceModel(), voice: settings.office.voice() }, init()),
      onReport(listener: ReportListener) {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    }
  },
})
