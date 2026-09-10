import { createMediaQuery } from "@solid-primitives/media"
import { Button } from "@opencode-ai/ui/button"
import { createStore } from "solid-js/store"
import { For, onCleanup, onMount, Show, type JSX } from "solid-js"
import { useLanguage } from "@/context/language"
import type { OfficeOutcome, VoiceToken } from "../types"
import { createVoiceClient, errorMessage, type VoicePhase } from "./client"
import { estimateCost, formatCost } from "./cost"

export type VoiceStripProps = {
  token: () => Promise<VoiceToken>
  ask: (text: string, inputID: string) => Promise<string>
  attention: (mode: "active" | "paused" | "off") => Promise<void>
  catchUp: () => Promise<unknown>
  subscribeOutcomes: (cb: (outcome: OfficeOutcome) => void) => () => void
  current: (outcome: OfficeOutcome) => boolean
  acknowledge: (id: string, channel: "display" | "spoken") => Promise<unknown>
  onStop: () => void
}
const BARS = 5
const IDLE_LEVELS = Array.from({ length: BARS }, () => 0)
const PHASE_KEY = {
  connecting: "office.voice.connecting",
  listening: "office.voice.listening",
  thinking: "office.voice.admitting",
  speaking: "office.voice.speaking",
  paused: "office.voice.paused",
  error: "office.voice.error",
} as const

// The owner lives above both layouts, outside OfficePanel. Pause closes capture
// immediately. Resume and renewal use fresh connections and never replay input.
export const VoiceStrip = (props: VoiceStripProps): JSX.Element => {
  const language = useLanguage()
  const reducedMotion = createMediaQuery("(prefers-reduced-motion: reduce)")
  const [state, setState] = createStore({
    phase: "connecting" as VoicePhase | "paused" | "error",
    user: "",
    assistant: "",
    error: undefined as string | undefined,
    holding: false,
    details: false,
    cost: 0,
    token: undefined as VoiceToken | undefined,
    levels: IDLE_LEVELS,
  })
  const client = createVoiceClient({ ask: props.ask })
  let element: HTMLElement | undefined
  const lifecycle = {
    disposed: false,
    generation: 0,
    stopMeter: () => {},
    renewal: undefined as ReturnType<typeof setTimeout> | undefined,
    awaiting: [] as OfficeOutcome[],
    spokenReports: new Set<string>(),
  }
  const showOutcome = (outcome: OfficeOutcome) => {
    if (lifecycle.disposed || state.phase === "paused" || state.phase === "error" || !props.current(outcome)) return
    if (!client.connected()) {
      lifecycle.awaiting.push(outcome)
      return
    }
    if (
      !outcome.requestID &&
      outcome.reportIDs.length &&
      outcome.reportIDs.every((id) => lifecycle.spokenReports.has(id))
    )
      return
    setState("assistant", outcome.text)
    requestAnimationFrame(() => {
      if (!lifecycle.disposed && props.current(outcome))
        void props.acknowledge(outcome.id, "display").catch(() => undefined)
    })
    client.speak(outcome.text, {
      id: outcome.id,
      current: () => !lifecycle.disposed && state.phase !== "paused" && props.current(outcome),
      delivered: () => {
        outcome.reportIDs.forEach((id) => lifecycle.spokenReports.add(id))
        void props.acknowledge(outcome.id, "spoken").catch(() => undefined)
      },
    })
  }
  const pause = () => {
    lifecycle.generation += 1
    clearTimeout(lifecycle.renewal)
    lifecycle.stopMeter()
    lifecycle.awaiting = []
    client.disconnect()
    setState({ phase: "paused", holding: false, levels: IDLE_LEVELS, error: undefined, user: "", assistant: "" })
    void props.attention("paused").catch((error) => setState("error", errorMessage(error)))
  }
  const start = async () => {
    const generation = ++lifecycle.generation
    clearTimeout(lifecycle.renewal)
    lifecycle.stopMeter()
    client.disconnect()
    lifecycle.awaiting = []
    setState({ phase: "connecting", error: undefined, user: "", assistant: "", holding: false, levels: IDLE_LEVELS })
    const alive = () => !lifecycle.disposed && generation === lifecycle.generation
    try {
      await props.attention("active")
      if (!alive()) return
      const token = await props.token()
      if (!alive()) return
      setState("token", token)
      await client.connect(token)
      if (!alive()) {
        client.disconnect()
        return
      }
      const stream = client.stream()
      if (stream) lifecycle.stopMeter = createMeter(stream, reducedMotion, (levels) => setState("levels", levels))
      for (const outcome of lifecycle.awaiting.splice(0)) showOutcome(outcome)
      void props.catchUp().catch((error) => {
        if (alive()) setState("error", errorMessage(error))
      })
      // Client-secret expiry governs connection establishment, not call length.
      // Renew well before the documented 60-minute session limit.
      lifecycle.renewal = setTimeout(() => {
        void start()
      }, 50 * 60_000)
    } catch (error) {
      if (!alive()) return
      client.disconnect()
      lifecycle.stopMeter()
      setState({ phase: "error", error: errorMessage(error), levels: IDLE_LEVELS })
      void props.attention("paused").catch(() => undefined)
    }
  }
  const stop = () => {
    pause()
    void props.attention("off").catch(() => undefined)
    props.onStop()
  }
  const pttDown = (event: Event) => {
    event.preventDefault()
    if (["connecting", "paused", "error"].includes(state.phase) || state.holding) return
    setState("holding", true)
    client.pttDown()
  }
  const pttUp = () => {
    if (!state.holding) return
    setState("holding", false)
    client.pttUp()
  }
  onMount(() => {
    const resize = new ResizeObserver(() =>
      document.documentElement.style.setProperty(
        "--office-voice-inset",
        String((element?.getBoundingClientRect().height ?? 48) + 24) + "px",
      ),
    )
    if (element) resize.observe(element)
    onCleanup(() => {
      resize.disconnect()
      document.documentElement.style.removeProperty("--office-voice-inset")
    })
    onCleanup(
      client.on((event) => {
        if (lifecycle.disposed || state.phase === "paused") return
        if (event.type === "phase") {
          if (state.phase !== "error") setState("phase", event.phase)
          return
        }
        if (event.type === "user") {
          setState("user", event.text)
          return
        }
        if (event.type === "assistant") {
          setState("assistant", event.text)
          return
        }
        if (event.type === "usage") {
          setState("cost", (total) => total + estimateCost(event.usage, state.token?.model ?? ""))
          return
        }
        if (event.type === "error") {
          setState("error", event.message)
          return
        }
        if (event.type === "closed" && event.reason === "channel closed") {
          pause()
          setState("error", language.t("office.voice.disconnected"))
        }
      }),
    )
    onCleanup(props.subscribeOutcomes(showOutcome))
    void start()
  })
  onCleanup(() => {
    lifecycle.disposed = true
    lifecycle.generation += 1
    clearTimeout(lifecycle.renewal)
    lifecycle.stopMeter()
    client.disconnect()
    void props.attention("off").catch(() => undefined)
  })
  return (
    <section
      ref={element}
      data-component="office-voice"
      aria-label={language.t("office.voice.title")}
      class="fixed bottom-3 inset-x-3 md:inset-x-auto md:end-4 z-[70] md:w-[min(720px,calc(100vw-2rem))] rounded-lg border border-border-base bg-surface-base shadow-lg px-3 py-2 flex flex-col gap-2"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-12-medium shrink-0" aria-live="polite">
          {language.t(PHASE_KEY[state.phase])}
        </span>
        <span class="flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
          <For each={state.levels}>
            {(level) => (
              <span
                class="w-1 rounded-full bg-icon-info-base"
                style={{ height: String(Math.max(2, level * 16)) + "px" }}
              />
            )}
          </For>
        </span>
        <span class="min-w-0 flex-1 text-12-regular truncate" title={state.assistant || state.user}>
          {state.assistant || state.user || language.t("office.voice.ready")}
        </span>
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            if (state.phase === "paused" || state.phase === "error") void start()
            else pause()
          }}
        >
          {state.phase === "paused" || state.phase === "error"
            ? language.t("office.voice.resume")
            : language.t("office.voice.pause")}
        </Button>
        <Button
          size="small"
          class="max-sm:hidden"
          variant={state.holding ? "primary" : "secondary"}
          aria-pressed={state.holding}
          disabled={["paused", "error", "connecting"].includes(state.phase)}
          onPointerDown={pttDown}
          onPointerUp={pttUp}
          onPointerCancel={pttUp}
          onPointerLeave={pttUp}
          onKeyDown={(event: KeyboardEvent) => {
            if (!event.repeat && [" ", "Enter"].includes(event.key)) pttDown(event)
          }}
          onKeyUp={(event: KeyboardEvent) => {
            if ([" ", "Enter"].includes(event.key)) pttUp()
          }}
        >
          {language.t(state.holding ? "office.voice.talking" : "office.voice.hold")}
        </Button>
        <Button size="small" variant="ghost" onClick={stop}>
          {language.t("office.voice.stop")}
        </Button>
        <Button
          size="small"
          variant="ghost"
          aria-expanded={state.details}
          onClick={() => setState("details", !state.details)}
        >
          {language.t("office.voice.details")}
        </Button>
      </div>
      <Show when={state.details}>
        <div class="text-12-mono text-text-weak">
          {state.token?.model} · {state.token?.voice} · {formatCost(state.cost)}
        </div>
      </Show>
      <Show when={state.error}>
        <div class="text-12-regular text-icon-critical-base" role="alert">
          {state.error}
        </div>
      </Show>
    </section>
  )
}

/**
 * Five-bar mic level meter off an AnalyserNode. Runs on requestAnimationFrame
 * but only samples 4 times a second when the user prefers reduced motion.
 */
function createMeter(stream: MediaStream, reducedMotion: () => boolean, onLevels: (levels: number[]) => void) {
  const context = new AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.6
  context.createMediaStreamSource(stream).connect(analyser)
  const data = new Uint8Array(analyser.frequencyBinCount)
  const loop = { frame: 0, last: 0 }
  const tick = (time: number) => {
    loop.frame = requestAnimationFrame(tick)
    if (reducedMotion() && time - loop.last < 250) return
    loop.last = time
    analyser.getByteFrequencyData(data)
    onLevels(bands(data))
  }
  loop.frame = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(loop.frame)
    void context.close().catch(() => {})
  }
}

/** Speech lives in the bottom ~7.5 kHz, so the first 40 bins are split five ways. */
function bands(data: Uint8Array) {
  const width = 8
  return Array.from({ length: BARS }, (_, index) => {
    const slice = data.subarray(index * width, (index + 1) * width)
    const mean = slice.reduce((sum, value) => sum + value, 0) / (slice.length || 1)
    return Math.min(1, mean / 160)
  })
}
