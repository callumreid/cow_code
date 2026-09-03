import { createStore, produce, reconcile } from "solid-js/store"
import { batch, createEffect, createMemo, on, onCleanup } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { usePlatform } from "@/context/platform"
import { useSettings } from "@/context/settings"
import { useServerSDK, type ServerSDK } from "@/context/server-sdk"
import { playSoundById } from "@/utils/sound"
import {
  answerThread,
  ask,
  ensureOverseer,
  getState,
  isOfficeUnavailable,
  markThread,
  promptThread,
  voiceToken,
  type OfficeAnswer,
  type OfficeFetchInit,
} from "./api"
import type { OfficeBucket, OfficeReport, OfficeState, OfficeThread } from "./types"

export const BUCKET_ORDER: OfficeBucket[] = ["needs_you", "failed", "review", "working", "done"]
/** Report kinds that mean a thread is blocked on the user. */
export const NEEDS_YOU_REPORTS = new Set<OfficeReport["kind"]>(["permission", "question"])
const DONE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_REPORTS = 100

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
    const listeners = new Set<ReportListener>()
    const meta = { ensuring: undefined as Promise<Overseer> | undefined }

    const [store, setStore] = createStore({
      threads: {} as Record<string, OfficeThread>,
      reports: [] as OfficeReport[],
      overseer: undefined as Overseer | undefined,
      updated: 0,
      open: false,
      selected: undefined as string | undefined,
      voice: false,
      loading: false,
      loaded: false,
      available: true,
      error: undefined as string | undefined,
    })

    const init = (): OfficeFetchInit => ({ fetch: platform.fetch })

    const threads = createMemo(() => Object.values(store.threads).sort(compareThreads))
    const needsYou = createMemo(() => threads().filter((thread) => thread.bucket === "needs_you"))
    const counts = createMemo(() => {
      const result = emptyCounts()
      threads().forEach((thread) => {
        result[thread.bucket] += 1
      })
      return result
    })

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
      if (!NEEDS_YOU_REPORTS.has(report.kind) || store.open) return
      if (!settings.sounds.permissionsEnabled()) return
      void playSoundById(settings.sounds.permissions())
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
      setStore("open", false)
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

    // The feed needs the farmer's session to subscribe to, so opening the panel
    // is what creates it.
    createEffect(() => {
      if (!store.open || !store.loaded || !store.available || store.overseer) return
      void ensure().catch((error: unknown) => setStore("error", errorText(error)))
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
      needsYou,
      counts,
      thread: (sessionID: string) => store.threads[sessionID],
      reports: () => store.reports,
      overseer: () => store.overseer,
      opened: () => store.open,
      selected: () => store.selected,
      voice: () => store.voice,
      loading: () => store.loading,
      loaded: () => store.loaded,
      available: () => store.available,
      error: () => store.error,
      open() {
        setStore("open", true)
      },
      close() {
        setStore("open", false)
      },
      toggle() {
        setStore("open", (value) => !value)
      },
      select(sessionID: string | undefined) {
        setStore("selected", sessionID)
      },
      next() {
        const items = needsYou()
        const index = items.findIndex((thread) => thread.sessionID === store.selected)
        const target = items[(index + 1) % Math.max(items.length, 1)]
        batch(() => {
          setStore("open", true)
          if (target) setStore("selected", target.sessionID)
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
