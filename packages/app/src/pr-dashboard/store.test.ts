import { describe, expect, test } from "bun:test"
import { createRoot } from "solid-js"
import { createPrDashboardStore } from "./store"
import type { PrDashboard, PrDashboardPlatform, PrMergedHistory } from "./types"

const open = (over: Partial<PrDashboard> = {}): PrDashboard => ({
  groups: [],
  openCount: 0,
  readyCount: 0,
  fetchedAt: 1,
  ...over,
})
const history = (over: Partial<PrMergedHistory> = {}): PrMergedHistory => ({
  items: [],
  fetchedAt: 1,
  ...over,
})

/** Merged defaults to a stub that fails loudly if the store calls it unasked. */
function platform(over: Partial<PrDashboardPlatform> = {}): PrDashboardPlatform {
  return {
    fetch: async () => open(),
    fetchMerged: async () => {
      throw new Error("fetchMerged should not be called unless requested")
    },
    ...over,
  }
}

const tick = () => new Promise((r) => setTimeout(r, 0))

describe("createPrDashboardStore", () => {
  test("fetches open PRs once on creation", async () => {
    let calls = 0
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetch: async () => {
            calls++
            return open({ openCount: 3 })
          },
        }),
      )
      await tick()
      expect(calls).toBe(1)
      expect(store.data()?.openCount).toBe(3)
      dispose()
    })
  })

  test("does NOT fetch merged history until asked", async () => {
    let merged = 0
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetchMerged: async () => {
            merged++
            return history()
          },
        }),
      )
      await tick()
      expect(merged).toBe(0)
      expect(store.merged()).toBeUndefined()
      dispose()
    })
  })

  test("loadMerged fetches once, then is a no-op without force", async () => {
    let merged = 0
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetchMerged: async () => {
            merged++
            return history()
          },
        }),
      )
      await tick()
      store.loadMerged()
      await tick()
      store.loadMerged()
      await tick()
      expect(merged).toBe(1)
      store.loadMerged(true)
      await tick()
      expect(merged).toBe(2)
      dispose()
    })
  })

  test("drops an open refresh that overlaps one in flight", async () => {
    let calls = 0
    let release: (v: PrDashboard) => void = () => {}
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetch: () => {
            calls++
            return new Promise<PrDashboard>((r) => {
              release = r
            })
          },
        }),
      )
      store.refresh()
      store.refresh()
      expect(calls).toBe(1)
      release(open())
      await tick()
      expect(store.loading()).toBe(false)
      dispose()
    })
  })

  test("keeps the last good payload when a refresh fails", async () => {
    let mode: "ok" | "fail" = "ok"
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetch: async () => {
            if (mode === "fail") throw new Error("gh exploded")
            return open({ openCount: 7 })
          },
        }),
      )
      await tick()
      expect(store.data()?.openCount).toBe(7)
      mode = "fail"
      store.refresh(true)
      await tick()
      expect(store.data()?.openCount).toBe(7)
      expect(store.data()?.error).toBe("gh exploded")
      dispose()
    })
  })

  test("marks a first failed fetch unavailable instead of reporting zero open", async () => {
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetch: async () => {
            throw new Error("offline")
          },
        }),
      )
      await tick()
      expect(store.data()?.unavailable).toBe(true)
      expect(store.data()?.error).toBe("offline")
      dispose()
    })
  })

  test("annotates merged history on failure without clearing it", async () => {
    let mode: "ok" | "fail" = "ok"
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() =>
        platform({
          fetchMerged: async () => {
            if (mode === "fail") throw new Error("rate limited")
            return history({
              items: [{ repo: "o/r", number: 1, title: "t", url: "u", mergedAt: "2026-08-01T00:00:00Z" }],
            })
          },
        }),
      )
      store.loadMerged()
      await tick()
      expect(store.merged()?.items).toHaveLength(1)
      mode = "fail"
      store.loadMerged(true)
      await tick()
      expect(store.merged()?.items).toHaveLength(1)
      expect(store.merged()?.error).toBe("rate limited")
      dispose()
    })
  })

  test("is inert when the platform offers no dashboard", async () => {
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(() => undefined)
      await tick()
      expect(store.data()).toBeUndefined()
      expect(store.loading()).toBe(false)
      dispose()
    })
  })

  test("polling refreshes open, and merged only once it has been opened", async () => {
    let opens = 0
    let merges = 0
    await createRoot(async (dispose) => {
      const store = createPrDashboardStore(
        () =>
          platform({
            fetch: async () => {
              opens++
              return open()
            },
            fetchMerged: async () => {
              merges++
              return history()
            },
          }),
        5,
      )
      await new Promise((r) => setTimeout(r, 30))
      expect(opens).toBeGreaterThan(1)
      expect(merges).toBe(0)
      store.loadMerged()
      await new Promise((r) => setTimeout(r, 30))
      expect(merges).toBeGreaterThan(1)
      dispose()
    })
  })

  test("stops polling after dispose", async () => {
    let calls = 0
    await createRoot(async (dispose) => {
      createPrDashboardStore(
        () =>
          platform({
            fetch: async () => {
              calls++
              return open()
            },
          }),
        5,
      )
      await tick()
      dispose()
      const after = calls
      await new Promise((r) => setTimeout(r, 25))
      expect(calls).toBe(after)
    })
  })
})
