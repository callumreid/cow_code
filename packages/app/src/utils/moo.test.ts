import { describe, expect, test } from "bun:test"
import { playMoo, shouldMoo } from "./moo"

describe("shouldMoo", () => {
  test("never moos while disabled", () => {
    expect(shouldMoo({ enabled: false, visible: false, focused: false })).toBe(false)
    expect(shouldMoo({ enabled: false, visible: true, focused: true })).toBe(false)
    expect(shouldMoo({ enabled: false, visible: true, focused: false })).toBe(false)
  })

  test("stays quiet while the window is in view (visible and focused)", () => {
    expect(shouldMoo({ enabled: true, visible: true, focused: true })).toBe(false)
  })

  test("moos when the window is hidden", () => {
    expect(shouldMoo({ enabled: true, visible: false, focused: false })).toBe(true)
  })

  test("moos when the window is visible but unfocused", () => {
    expect(shouldMoo({ enabled: true, visible: true, focused: false })).toBe(true)
  })

  test("moos when the window is focused but not visible (edge)", () => {
    expect(shouldMoo({ enabled: true, visible: false, focused: true })).toBe(true)
  })
})

describe("playMoo", () => {
  test("no-ops when the injected context factory yields nothing", () => {
    expect(playMoo(() => undefined)).toBeUndefined()
  })
})
