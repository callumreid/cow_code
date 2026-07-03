import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { MetadataThrottle } from "@/session/metadata-throttle"

const waitFor = async (check: () => boolean, timeoutMillis: number) => {
  const stop = Date.now() + timeoutMillis
  while (Date.now() < stop) {
    if (check()) return true
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  return check()
}

const harness = (intervalMillis: number) => {
  const applied: number[] = []
  const update = MetadataThrottle.make<number>({
    intervalMillis,
    fork: (effect) => Effect.runFork(effect),
    apply: (value) => Effect.sync(() => applied.push(value)),
  })
  return { applied, update }
}

describe("MetadataThrottle", () => {
  test("applies the first update immediately (leading edge)", async () => {
    const { applied, update } = harness(1000)
    await Effect.runPromise(update(1))
    expect(applied).toEqual([1])
  })

  test("coalesces a burst and always flushes the FINAL value (trailing edge)", async () => {
    const { applied, update } = harness(50)
    await Effect.runPromise(
      Effect.gen(function* () {
        for (let i = 1; i <= 100; i++) yield* update(i)
      }),
    )
    // Leading edge applied, burst suppressed while inside the window.
    expect(applied).toEqual([1])
    // Trailing flush lands the final value without any further calls.
    expect(await waitFor(() => applied.length === 2, 1000)).toBe(true)
    expect(applied).toEqual([1, 100])
    // No stray extra flushes afterwards.
    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(applied).toEqual([1, 100])
  })

  test("bounds the apply rate to roughly one per interval during a sustained stream", async () => {
    const { applied, update } = harness(50)
    const start = Date.now()
    let sent = 0
    while (Date.now() - start < 300) {
      sent += 1
      await Effect.runPromise(update(sent))
      await new Promise((resolve) => setTimeout(resolve, 2))
    }
    await waitFor(() => applied.at(-1) === sent, 1000)
    expect(sent).toBeGreaterThan(50)
    // ~300ms / 50ms interval => ~7 applies; allow generous slack for CI timers.
    expect(applied.length).toBeLessThanOrEqual(12)
    // Final chunk state landed (trailing edge).
    expect(applied.at(-1)).toBe(sent)
    // Order preserved and strictly increasing (no stale value overwrote a newer one).
    expect([...applied].sort((a, b) => a - b)).toEqual(applied)
  })

  test("spaced updates all apply immediately", async () => {
    const { applied, update } = harness(20)
    for (const value of [1, 2, 3]) {
      await Effect.runPromise(update(value))
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    expect(applied).toEqual([1, 2, 3])
  })
})
