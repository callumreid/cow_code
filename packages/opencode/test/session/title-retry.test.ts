import { describe, expect, test } from "bun:test"
import { TITLE_MAX_ATTEMPT_TURNS, shouldAttemptTitle } from "@/session/title-retry"

describe("shouldAttemptTitle", () => {
  test("attempts on the first turn of a root session with a default title", () => {
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: true, realUserMessageCount: 1 })).toBe(true)
  })

  test("retries on later turns while the title is still default (the old exactly-one guard blocked these)", () => {
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: true, realUserMessageCount: 2 })).toBe(true)
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: true, realUserMessageCount: 3 })).toBe(true)
    expect(
      shouldAttemptTitle({
        isChildSession: false,
        hasDefaultTitle: true,
        realUserMessageCount: TITLE_MAX_ATTEMPT_TURNS,
      }),
    ).toBe(true)
  })

  test("stops retrying past the turn bound", () => {
    expect(
      shouldAttemptTitle({
        isChildSession: false,
        hasDefaultTitle: true,
        realUserMessageCount: TITLE_MAX_ATTEMPT_TURNS + 1,
      }),
    ).toBe(false)
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: true, realUserMessageCount: 100 })).toBe(false)
  })

  test("never attempts when the session already has a real title", () => {
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: false, realUserMessageCount: 1 })).toBe(false)
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: false, realUserMessageCount: 3 })).toBe(false)
  })

  test("never attempts for child sessions", () => {
    expect(shouldAttemptTitle({ isChildSession: true, hasDefaultTitle: true, realUserMessageCount: 1 })).toBe(false)
    expect(shouldAttemptTitle({ isChildSession: true, hasDefaultTitle: true, realUserMessageCount: 2 })).toBe(false)
  })

  test("never attempts without a real user message", () => {
    expect(shouldAttemptTitle({ isChildSession: false, hasDefaultTitle: true, realUserMessageCount: 0 })).toBe(false)
  })
})
