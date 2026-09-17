import * as THREE from "three"
import { describe, expect, test } from "bun:test"
import { createUpsidedown, UPSIDEDOWN_SECONDS, type UpsidedownStage } from "./upsidedown"

function rig() {
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500)
  camera.position.set(0, 40, 80)
  const target = new THREE.Vector3(0, 0, 0)
  let n = 0
  const cows = Array.from({ length: 3 }, () => ({ parts: { group: new THREE.Group() }, rand: () => (n += 0.37) % 1 }))
  const stages: Array<UpsidedownStage | undefined> = []
  const upsidedown = createUpsidedown({ camera, target, cows: () => cows, onStage: (s) => stages.push(s) })
  const run = (seconds: number, touring = true) => {
    for (let i = 0; i < seconds * 60; i++) upsidedown.tick(1 / 60, touring)
  }
  return { camera, cows, stages, upsidedown, run }
}

describe("upsidedown time", () => {
  test("announces, flips the world, drops the cows into the sky, fades, and puts everything back", () => {
    const { camera, cows, stages, upsidedown, run } = rig()
    upsidedown.setEvery(5)
    run(4.9)
    expect(stages).toEqual([])
    run(0.2)
    expect(stages).toEqual(["title"])
    run(2)
    expect(stages.at(-1)).toBe("flip")
    // Rolled right over: the camera's up now points at the ground.
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
    expect(up.y).toBeLessThan(-0.8)
    run(3)
    expect(cows.every((cow) => cow.parts.group.position.y > 5)).toBe(true)
    expect(cows[0].parts.group.rotation.x).not.toBe(0)
    run(2.8)
    expect(stages.at(-1)).toBe("fade")
    run(UPSIDEDOWN_SECONDS - 7.9 + 0.3)
    expect(stages.at(-1)).toBe("restore")
    expect(cows.every((cow) => cow.parts.group.position.y === 0 && cow.parts.group.rotation.x === 0)).toBe(true)
    run(0.6)
    expect(stages.at(-1)).toBeUndefined()
    expect(upsidedown.active()).toBe(false)
    // And it counts down to the next one.
    run(5.1)
    expect(stages.at(-1)).toBe("title")
  })

  test("only counts while the tour is running, and a touch ends it early", () => {
    const { stages, upsidedown, run } = rig()
    upsidedown.setEvery(2)
    run(3, false)
    expect(stages).toEqual([])
    run(2.1, true)
    expect(stages).toEqual(["title"])
    run(0.5, false)
    expect(stages).toEqual(["title", "restore", undefined])
    expect(upsidedown.active()).toBe(false)
  })

  test("a forced one runs without the tour", () => {
    const { stages, upsidedown, run } = rig()
    upsidedown.trigger()
    run(3, false)
    expect(stages).toEqual(["title", "flip"])
  })
})
