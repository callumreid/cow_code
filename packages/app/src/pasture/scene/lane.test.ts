import { describe, expect, test } from "bun:test"
import { PENS, insidePen } from "../pens"
import { LANE, lanePoint, towardPens, wrapLane } from "./lane"

describe("the lane around the pens", () => {
  test("never enters a pen, whichever way the runner drifts", () => {
    for (let s = 0; s < LANE.length; s += 0.5) {
      for (const offset of [-2.5, 0, 2.5]) {
        const point = lanePoint(s, offset)
        for (const pen of PENS) expect(insidePen(pen.id, point.x, point.z, -1)).toBe(false)
      }
    }
  })

  test("is a closed loop and the heading points along it", () => {
    const start = lanePoint(0)
    const end = lanePoint(LANE.length - 0.001)
    expect(Math.hypot(start.x - end.x, start.z - end.z)).toBeLessThan(0.01)
    for (let s = 0; s < LANE.length; s += 3) {
      const a = lanePoint(s)
      const b = lanePoint(s + 0.5)
      const expected = Math.atan2(b.x - a.x, b.z - a.z)
      if (Math.hypot(b.x - a.x, b.z - a.z) < 0.49) continue // a corner
      expect(Math.abs(Math.atan2(Math.sin(a.heading - expected), Math.cos(a.heading - expected)))).toBeLessThan(0.01)
    }
    expect(wrapLane(-1)).toBeCloseTo(LANE.length - 1)
  })

  test("facing the pens from every side points inward", () => {
    const inward = (s: number) => {
      const p = lanePoint(s)
      const h = towardPens(p.side)
      const x = p.x + Math.sin(h) * 3
      const z = p.z + Math.cos(h) * 3
      return Math.hypot(x, z - (LANE.z0 + LANE.z1) / 2) < Math.hypot(p.x, p.z - (LANE.z0 + LANE.z1) / 2)
    }
    expect(inward(1)).toBe(true)
    expect(inward(LANE.width + 1)).toBe(true)
    expect(inward(LANE.width + LANE.depth + 1)).toBe(true)
    expect(inward(2 * LANE.width + LANE.depth + 1)).toBe(true)
  })
})
