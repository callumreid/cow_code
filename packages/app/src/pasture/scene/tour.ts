import * as THREE from "three"
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { PENS, penCenter, type PenID } from "../pens"

/**
 * The screensaver: when nobody is touching the field, the camera drifts
 * through a set of shots. A slow push in on each pen, a wide look at the
 * whole farm, a low pass along the fences, a look at the barn. Every shot
 * eases from wherever the camera is, then glides for its length. Any drag
 * or wheel pauses the tour; it picks up again after a quiet spell.
 */
export type Tour = {
  enabled: boolean
  /** Call from the render loop. Returns true when the tour moved the camera. */
  tick(dt: number, t: number): boolean
  /** A person touched the camera: hold off for a while. */
  interrupt(): void
  setEnabled(on: boolean): void
}

type Pose = { position: THREE.Vector3; target: THREE.Vector3 }

type Shot = {
  /** Seconds of glide once in position. */
  hold: number
  /** Start and end poses; the shot eases between them over `hold`. */
  from: Pose
  to: Pose
}

const pose = (px: number, py: number, pz: number, tx: number, ty: number, tz: number): Pose => ({
  position: new THREE.Vector3(px, py, pz),
  target: new THREE.Vector3(tx, ty, tz),
})

const RESUME_AFTER = 45
const TRANSITION = 5

function penShot(id: PenID, side: number): Shot {
  const c = penCenter(id)
  const { rect } = PENS.find((pen) => pen.id === id)!
  const wide = id === "merged"
  const distance = wide ? 46 : 26
  const height = wide ? 26 : 15
  const a0 = side * 0.55
  const a1 = side * -0.35
  const zf = rect.z1 + (wide ? 8 : 4)
  return {
    hold: wide ? 26 : 20,
    from: pose(c.x + Math.sin(a0) * distance, height, zf + Math.cos(a0) * distance * 0.8, c.x, 1, c.z),
    to: pose(c.x + Math.sin(a1) * distance * 0.85, height * 0.85, zf + Math.cos(a1) * distance * 0.7, c.x, 1, c.z - 2),
  }
}

function shots(): Shot[] {
  return [
    // The whole farm, drifting right to left.
    { hold: 28, from: pose(-30, 44, 88, 0, 1, 0), to: pose(30, 40, 84, 0, 1, -4) },
    penShot("draft", 1),
    penShot("awaiting", -1),
    // A low pass along the front fences, past the signs.
    { hold: 30, from: pose(-58, 6, 40, -20, 2, 10), to: pose(58, 7, 40, 20, 2, 10) },
    penShot("changes", 1),
    penShot("ready", -1),
    // The merged herd and the barn behind it.
    penShot("merged", 1),
    { hold: 24, from: pose(-20, 14, -2, 20, 5, -48), to: pose(30, 18, 8, 20, 5, -48) },
    // Back out wide from the other side.
    { hold: 26, from: pose(60, 38, 70, 0, 1, 0), to: pose(-40, 46, 90, 0, 1, 2) },
  ]
}

export function createTour(camera: THREE.PerspectiveCamera, controls: OrbitControls): Tour {
  const list = shots()
  let enabled = false
  let index = -1
  let phase: "transition" | "hold" = "transition"
  let elapsed = 0
  let quiet = 0
  const start: Pose = pose(0, 0, 0, 0, 0, 0)
  const ease = (u: number) => u * u * (3 - 2 * u)

  const begin = (next: number) => {
    index = next % list.length
    phase = "transition"
    elapsed = 0
    start.position.copy(camera.position)
    start.target.copy(controls.target)
  }

  return {
    get enabled() {
      return enabled
    },
    setEnabled(on) {
      enabled = on
      quiet = on ? RESUME_AFTER : 0
      index = -1
    },
    interrupt() {
      quiet = 0
      index = -1
    },
    tick(dt) {
      if (!enabled) return false
      if (quiet < RESUME_AFTER) {
        quiet += dt
        return false
      }
      if (index < 0) begin(Math.floor(Math.random() * list.length))
      const shot = list[index]
      elapsed += dt
      if (phase === "transition") {
        const u = ease(Math.min(1, elapsed / TRANSITION))
        camera.position.lerpVectors(start.position, shot.from.position, u)
        controls.target.lerpVectors(start.target, shot.from.target, u)
        if (elapsed >= TRANSITION) {
          phase = "hold"
          elapsed = 0
        }
      } else {
        const u = ease(Math.min(1, elapsed / shot.hold))
        camera.position.lerpVectors(shot.from.position, shot.to.position, u)
        controls.target.lerpVectors(shot.from.target, shot.to.target, u)
        if (elapsed >= shot.hold) begin(index + 1)
      }
      camera.lookAt(controls.target)
      return true
    },
  }
}
