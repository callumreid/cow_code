import * as THREE from "three"

/**
 * Upsidedown time. Every so often, while the tour is running, big shaking
 * letters announce it, the whole world rolls over, gravity goes with it and
 * every cow peels off the ground and falls into the sky. It fades to black,
 * and when the lights come back up everything is exactly as it was and
 * nobody mentions it.
 */
export type UpsidedownStage = "title" | "flip" | "fade" | "restore"

/** Seconds of tour between events. */
export const UPSIDEDOWN_EVERY = 15 * 60
/** How long the world stays wrong. */
export const UPSIDEDOWN_SECONDS = 10

const TITLE_UNTIL = 1.2
const FLIP_SECONDS = 0.7
const FADE_AT = 7.8
const RESTORE_AT = UPSIDEDOWN_SECONDS
const DONE_AT = UPSIDEDOWN_SECONDS + 0.6
const GRAVITY = 9

export type Faller = { parts: { group: THREE.Group }; rand: () => number }
type Fall = { start: number; spinX: number; spinZ: number }

export type Upsidedown = {
  /** Seconds of tour between events; 0 turns it off. */
  setEvery(seconds: number): void
  /** Right now, tour or no tour. */
  trigger(): void
  /** Once per frame, after the tour has placed the camera. `touring` says whether it did. */
  tick(dt: number, touring: boolean): void
  active(): boolean
}

export function createUpsidedown(opts: {
  camera: THREE.Camera
  target: THREE.Vector3
  cows: () => Iterable<Faller>
  onStage: (stage: UpsidedownStage | undefined) => void
}): Upsidedown {
  let every = UPSIDEDOWN_EVERY
  let countdown = every
  let run: { t: number; stage: UpsidedownStage | undefined; forced: boolean; falls: Map<Faller, Fall> } | undefined
  const ease = (u: number) => u * u * (3 - 2 * u)

  const stage = (next: UpsidedownStage | undefined) => {
    if (!run || run.stage === next) return
    run.stage = next
    opts.onStage(next)
  }
  const start = (forced: boolean) => {
    run = { t: 0, stage: undefined, forced, falls: new Map() }
    stage("title")
  }
  /** Everything back where it was, while nobody can see. */
  const restore = () => {
    if (!run) return
    for (const cow of opts.cows()) {
      cow.parts.group.position.y = 0
      cow.parts.group.rotation.x = 0
      cow.parts.group.rotation.z = 0
    }
    run.falls.clear()
    stage("restore")
  }
  const finish = () => {
    if (!run) return
    stage(undefined)
    run = undefined
    countdown = every
  }

  return {
    setEvery(seconds) {
      every = Math.max(0, seconds)
      countdown = every
    },
    trigger() {
      if (!run) start(true)
    },
    active: () => !!run,
    tick(dt, touring) {
      if (!run) {
        if (!touring || every <= 0) return
        countdown -= dt
        if (countdown <= 0) start(false)
        return
      }
      if (!touring && !run.forced && run.stage !== "restore") {
        // Somebody grabbed the camera: the lights come straight back up.
        restore()
        finish()
        return
      }
      run.t += dt
      const t = run.t
      if (t >= DONE_AT) {
        finish()
        return
      }
      if (t >= RESTORE_AT) {
        if (run.stage !== "restore") restore()
        return
      }
      if (t >= FADE_AT) stage("fade")
      else if (t >= TITLE_UNTIL) stage("flip")
      if (t < TITLE_UNTIL) return
      // The world rolls over.
      const roll = Math.PI * ease(Math.min(1, (t - TITLE_UNTIL) / FLIP_SECONDS))
      opts.camera.lookAt(opts.target)
      opts.camera.rotateZ(roll)
      // Gravity goes with it: cow by cow they peel off the ground and fall into the sky.
      const flipAt = TITLE_UNTIL + FLIP_SECONDS * 0.6
      for (const cow of opts.cows()) {
        let fall = run.falls.get(cow)
        if (!fall) {
          fall = { start: Math.max(t, flipAt + cow.rand() * 1.6), spinX: (cow.rand() - 0.5) * 2.4, spinZ: (cow.rand() - 0.5) * 2.4 }
          run.falls.set(cow, fall)
        }
        const age = t - fall.start
        if (age <= 0) continue
        const group = cow.parts.group
        group.position.y = 0.5 * GRAVITY * age * age
        group.rotation.x = fall.spinX * age
        group.rotation.z = fall.spinZ * age
      }
    },
  }
}
