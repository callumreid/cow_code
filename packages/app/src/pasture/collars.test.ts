import { describe, expect, test } from "bun:test"
import { COLLAR_PALETTE, assignCollars, collarIndex } from "./collars"

describe("collars", () => {
  test("everyone on a team of sixteen or fewer gets a different colour, deterministically", () => {
    const team = ["alejandravl", "ben-coval", "borgesius", "callumreid", "cooperr1", "coval-cale", "coval-henry", "jakelevi", "kdmelon", "kobicovaldev", "robyoungsf", "samira-ks", "seribaymadina"]
    const first = assignCollars(team)
    const again = assignCollars([...team].reverse())
    expect(new Set(first.values()).size).toBe(team.length)
    expect([...first]).toEqual([...again].sort((a, b) => a[0].localeCompare(b[0])))
    for (const colour of first.values()) expect(collarIndex(colour)).toBeGreaterThanOrEqual(0)
  })

  test("a bigger team wraps round the palette instead of failing", () => {
    const logins = Array.from({ length: 40 }, (_, i) => `person-${i}`)
    const collars = assignCollars(logins)
    expect(collars.size).toBe(40)
    expect(new Set(collars.values()).size).toBe(COLLAR_PALETTE.length)
  })
})
