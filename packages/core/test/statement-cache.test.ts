import { describe, expect, test } from "bun:test"
import { StatementCache } from "../src/database/statement-cache"

const tracked = (capacity: number) => {
  const prepared: string[] = []
  const cache = StatementCache.make({
    capacity,
    prepare: (query) => {
      prepared.push(query)
      return { query, handle: prepared.length }
    },
  })
  return { prepared, cache }
}

describe("StatementCache", () => {
  test("prepares once per query and reuses the cached statement", () => {
    const { prepared, cache } = tracked(8)
    const first = cache.get("SELECT 1")
    const second = cache.get("SELECT 1")
    const third = cache.get("SELECT 1")
    expect(prepared).toEqual(["SELECT 1"])
    expect(second).toBe(first)
    expect(third).toBe(first)
  })

  test("keys by exact SQL string", () => {
    const { prepared, cache } = tracked(8)
    cache.get("SELECT 1")
    cache.get("SELECT 2")
    cache.get("SELECT 1")
    expect(prepared).toEqual(["SELECT 1", "SELECT 2"])
    expect(cache.size()).toBe(2)
  })

  test("evicts the least recently used entry when over capacity", () => {
    const { prepared, cache } = tracked(2)
    const a = cache.get("A")
    cache.get("B")
    // Touch A so B becomes least recently used.
    expect(cache.get("A")).toBe(a)
    cache.get("C")
    expect(cache.size()).toBe(2)
    expect(cache.has("A")).toBe(true)
    expect(cache.has("C")).toBe(true)
    expect(cache.has("B")).toBe(false)
    // B was evicted, so it re-prepares; the still-cached C does not.
    cache.get("B")
    cache.get("C")
    expect(prepared).toEqual(["A", "B", "C", "B"])
  })

  test("clear invalidates every entry", () => {
    const { prepared, cache } = tracked(8)
    cache.get("SELECT 1")
    cache.get("SELECT 2")
    cache.clear()
    expect(cache.size()).toBe(0)
    cache.get("SELECT 1")
    expect(prepared).toEqual(["SELECT 1", "SELECT 2", "SELECT 1"])
  })

  test("stays bounded under many distinct queries", () => {
    const { cache } = tracked(16)
    for (let i = 0; i < 1000; i++) cache.get(`SELECT ${i}`)
    expect(cache.size()).toBe(16)
  })
})
