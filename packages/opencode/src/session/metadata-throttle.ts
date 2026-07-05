import { Effect } from "effect"

/**
 * Leading+trailing throttle for streaming tool metadata updates.
 *
 * Running tools (notably shell) push a metadata update per output chunk; each
 * update is a durable part write (SQLite transaction + SSE broadcast), so a
 * verbose command amplifies into hundreds of writes per second. Throttling to
 * ~10Hz keeps the running-work panel live while bounding the write rate.
 *
 * Correctness contract: the FINAL update always lands. Bursts coalesce to the
 * latest value and a trailing-edge flush is scheduled for the end of the
 * window, so the last metadata state a tool reports is never lost.
 */
export const INTERVAL_MILLIS = 100

export const make = <T>(input: {
  readonly apply: (value: T) => Effect.Effect<unknown>
  readonly fork: (effect: Effect.Effect<void>) => unknown
  readonly intervalMillis?: number
}) => {
  const interval = input.intervalMillis ?? INTERVAL_MILLIS
  const state = {
    last: 0,
    pending: undefined as { readonly value: T } | undefined,
    scheduled: false,
  }
  // `scheduled` stays true until the flush (including its async apply) fully
  // completes; updates arriving mid-apply re-arm the loop instead of racing a
  // second apply, so an older value can never overwrite a newer one.
  const flush: Effect.Effect<void> = Effect.suspend(() => {
    const pending = state.pending
    if (pending === undefined) {
      state.scheduled = false
      return Effect.void
    }
    state.pending = undefined
    state.last = Date.now()
    return input.apply(pending.value).pipe(
      // A dying apply must not wedge the loop: `scheduled` stays true until
      // this chain settles, so an uncaught defect here would silently swallow
      // every later update for this tool call. The failed value is superseded
      // by the next one; the leading-edge path still surfaces apply failures.
      Effect.catchCause((cause) => Effect.logWarning("throttled metadata flush failed", cause)),
      Effect.flatMap(() =>
        Effect.suspend(() => {
          if (state.pending === undefined) {
            state.scheduled = false
            return Effect.void
          }
          return Effect.sleep(`${interval} millis`).pipe(Effect.flatMap(() => flush))
        }),
      ),
    )
  })
  return (value: T): Effect.Effect<void> =>
    Effect.suspend(() => {
      const elapsed = Date.now() - state.last
      if (!state.scheduled && elapsed >= interval) {
        state.last = Date.now()
        return input.apply(value).pipe(Effect.asVoid)
      }
      state.pending = { value }
      if (!state.scheduled) {
        state.scheduled = true
        input.fork(Effect.sleep(`${Math.max(1, interval - elapsed)} millis`).pipe(Effect.flatMap(() => flush)))
      }
      return Effect.void
    })
}

export * as MetadataThrottle from "./metadata-throttle"
