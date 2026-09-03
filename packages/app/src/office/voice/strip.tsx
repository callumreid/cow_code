import { createMediaQuery } from "@solid-primitives/media"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { createSignal, For, onCleanup, onMount, Show, type JSX } from "solid-js"
import type { OfficeReport, VoiceToken } from "../types"
import { createVoiceClient, errorMessage, isMicrophoneAccessError, type VoicePhase } from "./client"
import { estimateCost, formatCost } from "./cost"

export type VoiceStripProps = {
  token: () => Promise<VoiceToken>
  ask: (text: string) => Promise<string>
  subscribeReports: (cb: (report: OfficeReport) => void) => () => void
  onStop: () => void
}

type StripPhase = VoicePhase | "error"

const PHASE_META: Record<StripPhase, { label: string; dot: string }> = {
  connecting: { label: "Connecting", dot: "bg-surface-raised-stronger animate-pulse motion-reduce:animate-none" },
  listening: { label: "Listening", dot: "bg-surface-success-strong" },
  thinking: { label: "Thinking", dot: "bg-surface-warning-strong animate-pulse motion-reduce:animate-none" },
  speaking: { label: "Speaking", dot: "bg-surface-info-strong" },
  error: { label: "Error", dot: "bg-surface-critical-strong" },
}

const BARS = 5
const IDLE_LEVELS = Array.from({ length: BARS }, () => 0)

function directive(report: OfficeReport) {
  return `Office report (${report.kind}) for thread "${report.title}": ${report.summary}. Tell Callum in one or two sentences. If it needs a decision, ask him what to do.`
}

function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

/**
 * Bottom-of-panel voice strip: owns the realtime session from mount to
 * cleanup, shows what the farmer heard and is saying, and speaks office
 * reports as they arrive.
 */
export const VoiceStrip = (props: VoiceStripProps): JSX.Element => {
  const reducedMotion = createMediaQuery("(prefers-reduced-motion: reduce)")
  const [phase, setPhase] = createSignal<StripPhase>("connecting")
  const [fatal, setFatal] = createSignal<string>()
  const [notice, setNotice] = createSignal<string>()
  const [token, setToken] = createSignal<VoiceToken>()
  const [userCaption, setUserCaption] = createSignal("")
  const [assistantCaption, setAssistantCaption] = createSignal("")
  const [muted, setMuted] = createSignal(false)
  const [holding, setHolding] = createSignal(false)
  const [cost, setCost] = createSignal(0)
  const [levels, setLevels] = createSignal(IDLE_LEVELS)
  const [started, setStarted] = createSignal<number>()
  const [now, setNow] = createSignal(Date.now())

  const client = createVoiceClient({ ask: props.ask })
  const meter = { stop: () => {} }
  const lifecycle = { disposed: false }

  const fail = (message: string) => {
    meter.stop()
    setLevels(IDLE_LEVELS)
    setPhase("error")
    setFatal(message)
  }

  const start = () => {
    meter.stop()
    setFatal(undefined)
    setNotice(undefined)
    setStarted(undefined)
    setUserCaption("")
    setAssistantCaption("")
    setLevels(IDLE_LEVELS)
    setPhase("connecting")
    props
      .token()
      .then((next) => {
        setToken(next)
        return client.connect(next)
      })
      .then(() => {
        if (lifecycle.disposed) return
        setStarted(Date.now())
        const stream = client.stream()
        if (stream) meter.stop = createMeter(stream, reducedMotion, setLevels)
      })
      .catch((error: unknown) => {
        if (lifecycle.disposed) return
        fail(errorMessage(error))
      })
  }

  const stop = () => {
    meter.stop()
    client.disconnect()
    props.onStop()
  }

  const pttDown = (event: Event) => {
    event.preventDefault()
    if (holding() || phase() === "error" || phase() === "connecting") return
    setHolding(true)
    client.pttDown()
  }

  const pttUp = () => {
    if (!holding()) return
    setHolding(false)
    client.pttUp()
  }

  onMount(() => {
    onCleanup(
      client.on((event) => {
        if (lifecycle.disposed) return
        switch (event.type) {
          case "phase":
            if (fatal()) return
            setPhase(event.phase)
            return
          case "user":
            setUserCaption(event.text)
            return
          case "assistant":
            setNotice(undefined)
            setAssistantCaption(event.text)
            return
          case "usage":
            setCost((total) => total + estimateCost(event.usage, token()?.model ?? ""))
            return
          case "error":
            setNotice(event.message)
            return
          case "closed":
            setHolding(false)
            if (event.reason === "channel closed") fail("Voice session ended: the OpenAI control channel closed.")
            return
          default:
            return
        }
      }),
    )
    onCleanup(props.subscribeReports((report) => client.speak(directive(report))))
    const ticker = setInterval(() => setNow(Date.now()), 1000)
    onCleanup(() => clearInterval(ticker))
    onCleanup(() => {
      lifecycle.disposed = true
      meter.stop()
      client.disconnect()
    })
    start()
  })

  const elapsed = () => {
    const from = started()
    if (!from) return "00:00"
    return clock(now() - from)
  }

  return (
    <div class="shrink-0 flex flex-col gap-1.5 border-t border-border-weak-base bg-surface-base px-3 py-2">
      <div class="flex items-center gap-3 min-w-0">
        <span class="flex items-center gap-2 w-24 shrink-0" aria-live="polite">
          <span class={`size-2 rounded-full shrink-0 ${PHASE_META[phase()].dot}`} />
          <span class="text-12-medium text-text-strong truncate">{PHASE_META[phase()].label}</span>
        </span>

        <span class="flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
          <For each={levels()}>
            {(level) => (
              <span
                class={`w-1 rounded-sm transition-[height] duration-75 motion-reduce:transition-none ${muted() ? "bg-surface-raised-stronger" : "bg-surface-success-strong"}`}
                style={{ height: `${Math.round(15 + level * 85)}%` }}
              />
            )}
          </For>
        </span>

        <span class="flex flex-col flex-1 min-w-0">
          <span class="text-12-regular text-text-base truncate" title={userCaption()}>
            <Show when={userCaption()} fallback={<span class="opacity-60">Say something, or hold to talk.</span>}>
              You: {userCaption()}
            </Show>
          </span>
          <Show when={assistantCaption()}>
            <span class="text-12-regular text-text-strong truncate" title={assistantCaption()}>
              Farmer: {assistantCaption()}
            </span>
          </Show>
        </span>

        <Button
          size="small"
          variant={muted() ? "primary" : "secondary"}
          aria-pressed={muted()}
          disabled={phase() === "error"}
          onClick={() => {
            const next = !muted()
            setMuted(next)
            client.setMuted(next)
          }}
        >
          {muted() ? "Unmute" : "Mute"}
        </Button>

        <Button
          size="small"
          variant={holding() ? "primary" : "secondary"}
          aria-pressed={holding()}
          disabled={phase() === "error" || phase() === "connecting"}
          onPointerDown={pttDown}
          onPointerUp={pttUp}
          onPointerLeave={pttUp}
          onPointerCancel={pttUp}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.repeat || (event.key !== " " && event.key !== "Enter")) return
            pttDown(event)
          }}
          onKeyUp={(event: KeyboardEvent) => {
            if (event.key !== " " && event.key !== "Enter") return
            pttUp()
          }}
        >
          {holding() ? "Talking…" : "Hold to talk"}
        </Button>

        <Tooltip placement="top" gutter={2} value="Stop voice">
          <IconButton icon="stop" variant="ghost" aria-label="Stop voice" onClick={stop} />
        </Tooltip>
      </div>

      <div class="flex items-center gap-2 text-12-mono text-text-weak min-w-0">
        <span class="truncate">
          {token()?.model ?? "…"} · {token()?.voice ?? "…"} · {elapsed()} · {formatCost(cost())}
        </span>
        <Show when={notice()}>
          <span class="text-surface-warning-strong truncate" title={notice()}>
            · {notice()}
          </span>
        </Show>
      </div>

      <Show when={fatal()}>
        <div class="flex items-start gap-2 min-w-0">
          <Icon name="warning" size="small" class="text-icon-critical-base shrink-0 mt-0.5" />
          <span class="text-12-regular text-icon-critical-base flex-1 min-w-0 break-words">
            {isMicrophoneAccessError(fatal()) ? "Microphone: " : ""}
            {fatal()}
          </span>
          <Button size="small" icon="reset" onClick={start}>
            Retry
          </Button>
        </div>
      </Show>
    </div>
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
