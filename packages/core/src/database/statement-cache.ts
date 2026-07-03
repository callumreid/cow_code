/**
 * Bounded LRU of prepared statements keyed by SQL text.
 *
 * The Bun sqlite driver gets statement caching for free from
 * `Database.query()`; the Node driver (`node:sqlite`, used by the desktop
 * Electron sidecar) has no equivalent, so without this every statement is
 * re-prepared on each execution. Semantics mirror the Bun driver: same key
 * (the exact SQL string), bounded size, invalidated when the database closes.
 */
export interface Cache<T> {
  readonly get: (query: string) => T
  readonly clear: () => void
  readonly size: () => number
  readonly has: (query: string) => boolean
}

export const make = <T>(input: { capacity: number; prepare: (query: string) => T }): Cache<T> => {
  const entries = new Map<string, T>()
  return {
    get(query) {
      const cached = entries.get(query)
      if (cached !== undefined) {
        // Refresh recency: Map iteration order is insertion order, so
        // delete+set moves the entry to the back and the front stays LRU.
        entries.delete(query)
        entries.set(query, cached)
        return cached
      }
      const statement = input.prepare(query)
      entries.set(query, statement)
      if (entries.size > input.capacity) {
        const oldest = entries.keys().next().value
        if (oldest !== undefined) entries.delete(oldest)
      }
      return statement
    },
    clear() {
      entries.clear()
    },
    size() {
      return entries.size
    },
    has(query) {
      return entries.has(query)
    },
  }
}

export * as StatementCache from "./statement-cache"
