import { describe, expect, test } from "bun:test"
import { COW_TYPE_COUNT, cowTypeForSeed } from "./cow-variant"

describe("cowTypeForSeed", () => {
  test("keeps a thread on the same cow type", () => {
    expect(cowTypeForSeed("session-callum")).toBe(cowTypeForSeed("session-callum"))
  })

  test("spreads thread ids across every available cow type", () => {
    const assigned = new Set(Array.from({ length: 100 }, (_, index) => cowTypeForSeed(`session-${index}`)))
    expect(assigned).toEqual(new Set(Array.from({ length: COW_TYPE_COUNT }, (_, index) => index)))
  })
})
