import { describe, expect, test } from "bun:test"
import { PENS, insidePen, penCenter, penForState } from "./pens"

describe("pasture pens", () => {
  test("every dashboard state lands in exactly one pen", () => {
    expect(penForState("draft")).toBe("draft")
    expect(penForState("ready")).toBe("ready")
    expect(penForState("merge-queue")).toBe("ready")
    expect(penForState("changes-requested")).toBe("changes")
    expect(penForState("re-requested")).toBe("changes")
    expect(penForState("awaiting-review")).toBe("awaiting")
    expect(penForState("unresolved")).toBe("awaiting")
    expect(penForState("checks-failing")).toBe("awaiting")
  })

  test("pens do not overlap and their centres sit inside them", () => {
    for (const pen of PENS) {
      const centre = penCenter(pen.id)
      expect(insidePen(pen.id, centre.x, centre.z, 1)).toBe(true)
      for (const other of PENS) {
        if (other === pen) continue
        expect(insidePen(other.id, centre.x, centre.z)).toBe(false)
      }
    }
  })
})
