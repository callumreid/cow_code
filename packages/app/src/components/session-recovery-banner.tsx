import { createEffect, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Button } from "@opencode-ai/ui/button"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useSDK } from "@/context/sdk"
import { useServerProtocol, useServerSDK } from "@/context/server-sdk"
import { useSync } from "@/context/sync"
import { command, officeFetch } from "@/office/api"

type Checkpoint = {
  state: "running" | "retrying" | "blocked" | "completed" | "canceled"
  lastProgressAt: number
  deadline: number
  attempt?: number
  next?: number
  reason?: string
}

export function SessionRecoveryBanner(props: { sessionID: string }) {
  const language = useLanguage()
  const server = useServerSDK()
  const sdk = useSDK()
  const sync = useSync()
  const platform = usePlatform()
  const protocol = useServerProtocol()
  const [state, setState] = createStore({
    checkpoint: undefined as Checkpoint | undefined,
    error: "",
    pending: false,
    stale: false,
  })
  let generation = 0
  let refresh = async () => {}
  createEffect(() => {
    generation++
    const current = server()
    const directory = sdk().directory
    const sessionID = props.sessionID
    const supported = protocol() === "v1"
    const controller = new AbortController()
    setState({ checkpoint: undefined, error: "", pending: false, stale: false })
    let inflight = false
    const update = async () => {
      if (!supported || inflight || document.hidden || controller.signal.aborted) return
      inflight = true
      try {
        const response = await officeFetch(
          current,
          `/session/${encodeURIComponent(sessionID)}/recovery?directory=${encodeURIComponent(directory)}`,
          {
            fetch: platform.fetch,
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
          },
        )
        const checkpoint = (await response.json()) as Checkpoint | null
        if (!controller.signal.aborted) setState({ checkpoint: checkpoint ?? undefined, stale: false })
      } catch {
        if (!controller.signal.aborted) setState("stale", true)
      } finally {
        inflight = false
      }
    }
    refresh = update
    void update()
    const timer = setInterval(() => void update(), 10_000)
    document.addEventListener("visibilitychange", update)
    onCleanup(() => {
      generation++
      controller.abort()
      clearInterval(timer)
      document.removeEventListener("visibilitychange", update)
    })
  })
  createEffect(() => {
    sync().data.session_status[props.sessionID]
    void refresh()
  })
  const waiting = () =>
    !!sync().data.permission[props.sessionID]?.length || !!sync().data.question[props.sessionID]?.length
  const phase = () =>
    waiting()
      ? "waiting"
      : sync().data.session_status[props.sessionID]?.type === "retry"
        ? "retrying"
        : (state.checkpoint?.state ?? "running")
  const act = async (intent: "resume" | "cancel") => {
    const run = generation
    setState({ pending: true, error: "" })
    try {
      const receipt = await command(
        server(),
        { id: crypto.randomUUID(), intent, sessionID: props.sessionID, text: "" },
        { fetch: platform.fetch },
      )
      if (receipt.status !== "accepted") throw new Error(receipt.reason ?? receipt.status)
      if (run === generation) await refresh()
    } catch (error) {
      if (run === generation) setState("error", error instanceof Error ? error.message : String(error))
    } finally {
      if (run === generation) setState("pending", false)
    }
  }
  return (
    <Show when={state.checkpoint && !["completed", "canceled"].includes(state.checkpoint.state)}>
      <div
        role="status"
        class="flex items-center gap-3 px-4 py-2 border-b border-border-weak-base bg-surface-base text-12-regular"
      >
        <div class="flex-1 min-w-0">
          <span class="text-text-strong font-medium">{language.t("recovery." + phase())}</span>
          <span class="text-text-weak">
            {" "}
            ·{" "}
            {language.t("recovery.progress", { time: new Date(state.checkpoint!.lastProgressAt).toLocaleTimeString() })}
          </span>
          <Show when={state.checkpoint?.next && phase() === "retrying"}>
            <span class="text-text-weak">
              {" "}
              · {language.t("recovery.next", { time: new Date(state.checkpoint!.next!).toLocaleTimeString() })}
            </span>
          </Show>
          <Show when={state.checkpoint?.reason}>
            <div class="text-text-weak break-words">{state.checkpoint!.reason}</div>
          </Show>
          <Show when={state.stale}>
            <div class="text-icon-warning-base">{language.t("recovery.stale")}</div>
          </Show>
          <Show when={state.error}>
            <div class="text-icon-critical-base">{state.error}</div>
          </Show>
        </div>
        <Show when={phase() === "blocked"}>
          <Button
            size="small"
            variant="secondary"
            disabled={state.pending || state.stale}
            onClick={() => void act("resume")}
          >
            {language.t("recovery.resume")}
          </Button>
        </Show>
        <Show when={phase() !== "blocked"}>
          <Button size="small" variant="ghost" disabled={state.pending} onClick={() => void act("cancel")}>
            {language.t("recovery.stop")}
          </Button>
        </Show>
      </div>
    </Show>
  )
}
