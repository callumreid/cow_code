// The "moo" easter egg: a fully synthesized gentle cow moo (no audio asset).
// Trigger logic is pure so it can be unit tested; the audio call takes an
// injected AudioContext factory so callers/tests can no-op it.

export type MooTrigger = {
  enabled: boolean
  visible: boolean
  focused: boolean
}

// Mirrors the turn-complete OS notification condition (entry.tsx notify):
// only fire while the window is not in view.
export const shouldMoo = (input: MooTrigger) => input.enabled && !(input.visible && input.focused)

export type MooContextFactory = () => AudioContext | undefined

const defaultContext: MooContextFactory = () =>
  typeof AudioContext === "undefined" ? undefined : new AudioContext()

// One "syllable": a sawtooth (rich harmonics, like a vocal buzz) gliding down
// in pitch through a closing lowpass filter — the mouth shutting on the "oo".
const syllable = (
  ctx: AudioContext,
  start: number,
  duration: number,
  pitch: { from: number; to: number },
  peak: number,
) => {
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(pitch.from, start)
  osc.frequency.exponentialRampToValueAtTime(pitch.to, start + duration)
  filter.type = "lowpass"
  filter.Q.value = 3
  filter.frequency.setValueAtTime(700, start)
  filter.frequency.exponentialRampToValueAtTime(220, start + duration)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.09)
  gain.gain.setValueAtTime(peak, start + duration * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

// A gentle two-part moo: a short "m-oo" onset, then a longer descending "ooo".
export const playMoo = (create: MooContextFactory = defaultContext) => {
  const ctx = create()
  if (!ctx) return
  const now = ctx.currentTime
  syllable(ctx, now, 0.5, { from: 155, to: 135 }, 0.16)
  syllable(ctx, now + 0.42, 0.95, { from: 130, to: 82 }, 0.2)
  setTimeout(() => void ctx.close().catch(() => undefined), 2000)
}
