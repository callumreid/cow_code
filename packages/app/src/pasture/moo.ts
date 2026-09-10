/**
 * A synthesised moo, so no audio asset is needed. Two voices: a low body tone
 * and a nasal upper voice, both swept through a resonant filter; bigger cows
 * moo lower. Resolves when the sound has finished.
 */
export function moo(size = 1): Promise<void> {
  const Ctx = globalThis.AudioContext
  if (!Ctx) return Promise.resolve()
  const ctx = new Ctx()
  const now = ctx.currentTime
  const base = 138 / Math.max(0.6, size)
  const length = 1.15

  const body = ctx.createOscillator()
  body.type = "sawtooth"
  body.frequency.setValueAtTime(base * 1.12, now)
  body.frequency.linearRampToValueAtTime(base * 1.02, now + 0.35)
  body.frequency.exponentialRampToValueAtTime(base * 0.74, now + length)

  const nasal = ctx.createOscillator()
  nasal.type = "square"
  nasal.frequency.setValueAtTime(base * 2.01, now)
  nasal.frequency.exponentialRampToValueAtTime(base * 1.5, now + length)
  const nasalGain = ctx.createGain()
  nasalGain.gain.value = 0.18

  const vibrato = ctx.createOscillator()
  vibrato.frequency.value = 5.5
  const vibratoGain = ctx.createGain()
  vibratoGain.gain.value = base * 0.035
  vibrato.connect(vibratoGain)
  vibratoGain.connect(body.frequency)

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.Q.value = 5
  filter.frequency.setValueAtTime(320, now)
  filter.frequency.exponentialRampToValueAtTime(1100, now + 0.28)
  filter.frequency.exponentialRampToValueAtTime(260, now + length)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.45, now + 0.09)
  gain.gain.setValueAtTime(0.45, now + 0.55)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length)

  body.connect(filter)
  nasal.connect(nasalGain)
  nasalGain.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  body.start(now)
  nasal.start(now)
  vibrato.start(now)
  const stop = now + length + 0.05
  body.stop(stop)
  nasal.stop(stop)
  vibrato.stop(stop)

  return new Promise((resolve) => {
    body.onended = () => {
      void ctx.close()
      resolve()
    }
  })
}
