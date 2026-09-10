import { soundSrc } from "@/utils/sound"

/**
 * The cow's moo: the app's own moo sound (the same one notifications use),
 * pitched by breed size so a Dexter squeaks and a Chianina rumbles. Falls
 * back to a synthesised moo when the asset is missing. Resolves when done.
 */
export async function moo(size = 1): Promise<void> {
  const src = await soundSrc("moo-01").catch(() => undefined)
  if (!src || typeof Audio === "undefined") return synthMoo(size)
  return new Promise((resolve) => {
    const audio = new Audio(src)
    const withPitch = audio as HTMLAudioElement & { preservesPitch?: boolean; mozPreservesPitch?: boolean }
    withPitch.preservesPitch = false
    withPitch.mozPreservesPitch = false
    audio.playbackRate = Math.min(1.5, Math.max(0.7, 1.05 / Math.max(0.6, size)))
    audio.volume = 0.9
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve()
    }
    audio.onended = finish
    audio.onerror = finish
    audio.play().catch(finish)
  })
}

function synthMoo(size: number): Promise<void> {
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
  filter.connect(gain)
  gain.connect(ctx.destination)
  body.start(now)
  body.stop(now + length + 0.05)
  return new Promise((resolve) => {
    body.onended = () => {
      void ctx.close()
      resolve()
    }
  })
}
