import { createSignal, onCleanup, Show, type JSX } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { errorText } from "./context"
import {
  blobToBase64,
  createRecorder,
  currentEnvironment,
  microphoneBlocked,
  silentWav,
  toBase64,
  type Recording,
} from "./recorder"

export type HoldToTalkProps = {
  /** Full-width bar (phones) instead of the round button beside the composer. */
  bar?: boolean
  disabled?: boolean
  transcribe: (input: { audio: string; mime: string }) => Promise<string>
  /**
   * Hands the transcript to the composer. Resolves with the farmer's reply when
   * the panel sent it, undefined when it only landed in the textarea.
   */
  onTranscript: (text: string) => Promise<string | undefined>
  speak: (text: string) => Promise<{ audio: string; mime: string }>
  speakReplies: boolean
}

type Phase = "idle" | "starting" | "listening" | "transcribing" | "speaking"

/** A press shorter than this is a tap: it opens the mic until the next tap. */
const TAP_MS = 250
/** Anything shorter is a slipped finger, not a sentence. */
const MIN_TAKE_MS = 300
const KEYS = new Set([" ", "Enter"])

/**
 * Press-and-hold microphone for the office composer, no WebRTC: one clip per
 * take goes to `transcribe`, the text goes to the composer, and the farmer's
 * reply (when the panel sent it) is read back through `speak`. A quick tap
 * opens the mic until the next tap, for hands-off talking on a phone.
 */
export const HoldToTalk = (props: HoldToTalkProps): JSX.Element => {
  const blocked = microphoneBlocked(currentEnvironment())
  const [phase, setPhase] = createSignal<Phase>("idle")
  const [open, setOpen] = createSignal(false)
  const [elapsed, setElapsed] = createSignal(0)
  const [error, setError] = createSignal(blocked)
  const [retry, setRetry] = createSignal<() => void>()
  const [hint, setHint] = createSignal<string>()
  const recorder = createRecorder()
  const speaker = createSpeaker()
  const press = { at: 0, take: 0, released: false, closing: false }
  const ticker = { id: 0, from: 0 }

  const stopTicker = () => clearInterval(ticker.id)
  const startTicker = () => {
    stopTicker()
    ticker.from = Date.now()
    setElapsed(0)
    ticker.id = window.setInterval(() => setElapsed(Date.now() - ticker.from), 250)
  }

  const fail = (message: string, again: () => void) => {
    stopTicker()
    setOpen(false)
    setPhase("idle")
    setError(message)
    setRetry(() => again)
  }

  const say = (text: string): Promise<void> => {
    setPhase("speaking")
    return props
      .speak(text)
      .then((reply) => speaker.play(reply.audio, reply.mime))
      .then(() => {
        // A new press interrupts playback and owns the phase from then on.
        if (phase() === "speaking") setPhase("idle")
      })
      .catch((cause: unknown) => fail(errorText(cause), () => void say(text)))
  }

  const transcribe = (take: Recording): Promise<void> => {
    setPhase("transcribing")
    return blobToBase64(take.blob)
      .then((audio) => props.transcribe({ audio, mime: take.mime }))
      .then((text) => {
        const trimmed = text.trim()
        setPhase("idle")
        if (!trimmed) {
          setHint("Didn't catch that.")
          return
        }
        return props.onTranscript(trimmed).then((reply) => {
          if (!reply || !props.speakReplies) return
          return say(reply)
        })
      })
      .catch((cause: unknown) => fail(errorText(cause), () => void transcribe(take)))
  }

  const finish = () => {
    stopTicker()
    setOpen(false)
    press.released = true
    // Still on the permission prompt: `begin` sees the release and drops the take.
    if (phase() !== "listening") return
    setPhase("transcribing")
    void recorder.stop().then((take) => {
      if (take.durationMs < MIN_TAKE_MS || take.blob.size === 0) {
        setPhase("idle")
        setHint("Hold the button while you talk.")
        return
      }
      return transcribe(take)
    })
  }

  const begin = () => {
    speaker.stop()
    setError(undefined)
    setRetry(undefined)
    setHint(undefined)
    press.take += 1
    press.released = false
    const take = press.take
    setPhase("starting")
    recorder
      .start()
      .then(() => {
        if (take !== press.take) return
        if (press.released && !open()) {
          recorder.cancel()
          setPhase("idle")
          setHint("Mic is ready — hold the button while you talk.")
          return
        }
        setPhase("listening")
        startTicker()
      })
      .catch((cause: unknown) => {
        if (take !== press.take) return
        fail(errorText(cause), begin)
      })
  }

  const pressStart = () => {
    if (props.disabled || blocked) return
    // Playback has to be unlocked inside a gesture (iOS), and this is the one we get.
    speaker.unlock()
    press.at = Date.now()
    press.closing = open()
    if (press.closing) {
      finish()
      return
    }
    if (phase() === "starting" || phase() === "listening") return
    begin()
  }

  const pressEnd = () => {
    if (press.closing) return
    if (phase() !== "starting" && phase() !== "listening") return
    if (Date.now() - press.at < TAP_MS) {
      setOpen(true)
      return
    }
    finish()
  }

  onCleanup(() => {
    stopTicker()
    recorder.cancel()
    speaker.dispose()
  })

  const seconds = () => Math.floor(elapsed() / 1000)
  const live = () => phase() === "starting" || phase() === "listening"
  const status = () => {
    if (phase() === "starting") return "starting mic…"
    if (phase() === "listening") return open() ? `listening… ${seconds()}s · tap to stop` : `listening… ${seconds()}s`
    if (phase() === "transcribing") return "transcribing…"
    if (phase() === "speaking") return "speaking…"
    return hint()
  }
  const disabled = () => !!props.disabled || !!blocked || phase() === "transcribing"

  const handlers = {
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault()
      const target = event.currentTarget
      if (target instanceof HTMLElement && !target.hasPointerCapture(event.pointerId)) {
        target.setPointerCapture(event.pointerId)
      }
      pressStart()
    },
    onPointerUp: pressEnd,
    onPointerCancel: () => {
      if (!press.closing) finish()
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.repeat || !KEYS.has(event.key)) return
      event.preventDefault()
      pressStart()
    },
    onKeyUp: (event: KeyboardEvent) => {
      if (!KEYS.has(event.key)) return
      event.preventDefault()
      pressEnd()
    },
    onContextMenu: (event: Event) => event.preventDefault(),
  }

  const failure = () => (
    <div class="flex items-start gap-2 min-w-0">
      <Icon name="warning" size="small" class="text-icon-critical-base shrink-0 mt-0.5" />
      <span class="text-12-regular text-icon-critical-base flex-1 min-w-0 break-words">{error()}</span>
      <Show when={retry()}>
        <Button size="small" icon="reset" onClick={() => retry()?.()}>
          Retry
        </Button>
      </Show>
    </div>
  )

  if (props.bar) {
    return (
      <div class="flex flex-col gap-1.5 min-w-0">
        <Show when={error()}>{failure()}</Show>
        <button
          type="button"
          {...handlers}
          disabled={disabled()}
          aria-pressed={live()}
          aria-label="Hold to talk"
          class="w-full h-14 rounded-lg border border-border-weak-base bg-surface-raised-base px-4 flex items-center justify-center gap-3 touch-none select-none disabled:opacity-50"
          classList={{ "border-border-critical-base bg-surface-critical-weak": live() }}
          style={{ "-webkit-touch-callout": "none" }}
        >
          <span class="relative shrink-0 text-text-base" classList={{ "text-icon-critical-base": live() }}>
            <Icon name="microphone" />
            <Show when={live()}>
              <span class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-icon-critical-base animate-pulse" />
            </Show>
          </span>
          <span class="flex flex-col items-start min-w-0" aria-live="polite">
            <span class="text-14-medium text-text-strong truncate">{status() ?? "Hold to talk"}</span>
            <Show when={!status()}>
              <span class="text-12-regular text-text-weak">tap once for an open mic</span>
            </Show>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div class="flex items-center gap-2 min-w-0 max-w-[50%]">
      <Show
        when={error()}
        fallback={
          <Show when={status()}>
            <span class="text-12-mono text-text-weak truncate" aria-live="polite">
              {status()}
            </span>
          </Show>
        }
      >
        <span class="text-12-regular text-icon-critical-base truncate" title={error()}>
          {error()}
        </span>
        <Show when={retry()}>
          <Button size="small" icon="reset" onClick={() => retry()?.()}>
            Retry
          </Button>
        </Show>
      </Show>
      <button
        type="button"
        {...handlers}
        disabled={disabled()}
        aria-pressed={live()}
        aria-label="Hold to talk"
        title="Hold to talk · tap once for an open mic"
        class="relative size-11 shrink-0 rounded-full border border-border-weak-base bg-surface-raised-base text-text-base inline-flex items-center justify-center touch-none select-none hover:bg-surface-base-hover disabled:opacity-50 disabled:hover:bg-surface-raised-base"
        classList={{
          "border-border-critical-base bg-surface-critical-weak text-icon-critical-base": live(),
          "ring-1 ring-border-strong-selected": open(),
        }}
        style={{ "-webkit-touch-callout": "none" }}
      >
        <Icon name="microphone" />
        <Show when={live()}>
          <span class="absolute top-1 right-1 size-2 rounded-full bg-icon-critical-base animate-pulse" />
        </Show>
      </button>
    </div>
  )
}

/**
 * One reusable `<audio>` element. `unlock` plays a silent clip inside the
 * user's gesture so iOS lets the reply play later, outside any gesture.
 * Sources are data URIs: the sidecar's CSP allows `media-src 'self' data:`
 * and nothing else, so a blob URL would be refused on the phone.
 */
function createSpeaker() {
  const state = { audio: undefined as HTMLAudioElement | undefined, settle: undefined as (() => void) | undefined }
  const element = () => {
    if (state.audio) return state.audio
    const audio = new Audio()
    audio.preload = "auto"
    audio.setAttribute("playsinline", "")
    state.audio = audio
    return audio
  }
  const stop = () => {
    state.audio?.pause()
    state.settle?.()
  }
  return {
    stop,
    unlock() {
      if (state.audio) return
      const audio = element()
      audio.src = `data:audio/wav;base64,${toBase64(silentWav())}`
      void audio.play().catch(() => undefined)
    },
    play(base64: string, mime: string) {
      stop()
      const audio = element()
      audio.src = `data:${mime};base64,${base64}`
      return new Promise<void>((resolve, reject) => {
        const done = (outcome: () => void) => {
          audio.onended = null
          audio.onerror = null
          state.settle = undefined
          outcome()
        }
        state.settle = () => done(resolve)
        audio.onended = () => done(resolve)
        audio.onerror = () => done(() => reject(new Error("Could not play the reply.")))
        audio.play().catch((cause: unknown) => done(() => reject(new Error(errorText(cause)))))
      })
    },
    dispose() {
      stop()
      if (state.audio) state.audio.removeAttribute("src")
      state.audio = undefined
    },
  }
}
