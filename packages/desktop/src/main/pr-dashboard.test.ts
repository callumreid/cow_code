import { describe, expect, test } from "bun:test"
import { fetchPrDashboard, fetchPrMerged } from "./pr-dashboard"
import { derivePrState, groupByRepo } from "@opencode-ai/app/pr-dashboard/types"
import type { OpenPullRequest } from "@opencode-ai/app/pr-dashboard/types"

const NOW = Date.parse("2026-08-26T13:00:00Z")

function openNode(over: Partial<Record<string, unknown>> = {}) {
  return {
    number: 1,
    title: "t",
    url: "https://github.com/o/r/pull/1",
    isDraft: false,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    repository: { nameWithOwner: "o/r" },
    reviewDecision: "APPROVED",
    reviewThreads: { nodes: [] },
    commits: { nodes: [{ commit: { statusCheckRollup: { state: "SUCCESS" } } }] },
    ...over,
  }
}

function openPayload(open: unknown[]) {
  return JSON.stringify({ data: { open: { nodes: open } } })
}

function mergedPayload(merged: unknown[], hasNextPage = false, endCursor: string | null = null) {
  return JSON.stringify({ data: { merged: { pageInfo: { hasNextPage, endCursor }, nodes: merged } } })
}

function openRunner(open: unknown[]) {
  return async () => openPayload(open)
}

describe("derivePrState", () => {
  const base = { isDraft: false, review: "approved", checks: "success", unresolvedCount: 0 } as const

  test("ready only when nothing is outstanding", () => {
    expect(derivePrState(base)).toBe("ready")
  })

  test("draft outranks every other problem", () => {
    expect(derivePrState({ ...base, isDraft: true, checks: "failure", unresolvedCount: 3 })).toBe("draft")
  })

  test("changes requested outranks red checks", () => {
    expect(derivePrState({ ...base, review: "changes-requested", checks: "failure" })).toBe("changes-requested")
  })

  test("red checks outrank a missing review", () => {
    expect(derivePrState({ ...base, review: "review-required", checks: "failure" })).toBe("checks-failing")
  })

  test("unresolved threads block an approved, green PR", () => {
    expect(derivePrState({ ...base, unresolvedCount: 2 })).toBe("unresolved")
  })

  test("approval still required when checks are green", () => {
    expect(derivePrState({ ...base, review: "review-required" })).toBe("awaiting-review")
  })

  test("a PR with no checks at all can still be ready", () => {
    expect(derivePrState({ ...base, checks: "none" })).toBe("ready")
  })

  test("pending checks are not ready", () => {
    expect(derivePrState({ ...base, checks: "pending" })).toBe("checks-failing")
  })
})

describe("groupByRepo", () => {
  const mk = (repo: string, number: number, createdAt: string) =>
    ({ repo, number, createdAt, title: "", url: "", isDraft: false, updatedAt: createdAt,
       review: "none", checks: "none", unresolvedCount: 0, state: "awaiting-review" }) as OpenPullRequest

  test("orders items oldest-first inside a repo", () => {
    const groups = groupByRepo([mk("a/b", 2, "2026-08-05T00:00:00Z"), mk("a/b", 1, "2026-08-01T00:00:00Z")])
    expect(groups[0].items.map((i) => i.number)).toEqual([1, 2])
  })

  test("orders repos by their oldest PR", () => {
    const groups = groupByRepo([
      mk("newer/repo", 1, "2026-08-10T00:00:00Z"),
      mk("older/repo", 2, "2026-08-02T00:00:00Z"),
    ])
    expect(groups.map((g) => g.repo)).toEqual(["older/repo", "newer/repo"])
  })
})

describe("fetchPrDashboard", () => {
  test("maps signals and counts ready PRs", async () => {
    const runner = openRunner([
        openNode({ number: 10, createdAt: "2026-08-02T00:00:00Z" }),
        openNode({
          number: 11,
          createdAt: "2026-08-03T00:00:00Z",
          reviewDecision: "REVIEW_REQUIRED",
          reviewThreads: { nodes: [{ isResolved: false }, { isResolved: true }] },
          commits: { nodes: [{ commit: { statusCheckRollup: { state: "FAILURE" } } }] },
        }),
      ])
    const result = await fetchPrDashboard(NOW, runner)
    expect(result.openCount).toBe(2)
    expect(result.readyCount).toBe(1)
    const [first, second] = result.groups[0].items
    expect(first.state).toBe("ready")
    expect(second.state).toBe("checks-failing")
    expect(second.unresolvedCount).toBe(1)
  })

  test("tolerates a PR with no checks and no review", async () => {
    const runner = openRunner([openNode({ reviewDecision: null, commits: { nodes: [{ commit: { statusCheckRollup: null } }] } })])
    const result = await fetchPrDashboard(NOW, runner)
    expect(result.groups[0].items[0].checks).toBe("none")
    expect(result.groups[0].items[0].review).toBe("none")
  })

  test("surfaces GraphQL errors from the open query", async () => {
    const runner = async () => JSON.stringify({ errors: [{ message: "Bad credentials" }] })
    await expect(fetchPrDashboard(NOW, runner)).rejects.toThrow("Bad credentials")
  })
})

describe("fetchPrMerged", () => {
  test("requests only merges inside the 30-day window", async () => {
    let seen = ""
    const runner = async (args: string[]) => {
      seen = args.find((a) => a.startsWith("merged=")) ?? ""
      return mergedPayload([])
    }
    await fetchPrMerged(Date.parse("2026-08-26T00:00:00Z"), runner)
    expect(seen).toContain("merged:>=2026-07-27")
    expect(seen).toContain("is:merged")
  })

  test("paginates and sorts newest merge first", async () => {
    let calls = 0
    const runner = async () => {
      calls++
      if (calls === 1) {
        return mergedPayload(
          [{ number: 1, title: "old", url: "u1", mergedAt: "2026-08-01T00:00:00Z", repository: { nameWithOwner: "o/r" } }],
          true,
          "CURSOR",
        )
      }
      return mergedPayload([
        { number: 2, title: "new", url: "u2", mergedAt: "2026-08-20T00:00:00Z", repository: { nameWithOwner: "o/r" } },
      ])
    }
    const result = await fetchPrMerged(NOW, runner)
    expect(calls).toBe(2)
    expect(result.items.map((m) => m.number)).toEqual([2, 1])
  })

  test("flags truncation when the window exceeds the page cap", async () => {
    const runner = async () =>
      mergedPayload(
        [{ number: 1, title: "m", url: "u", mergedAt: "2026-08-10T00:00:00Z", repository: { nameWithOwner: "o/r" } }],
        true,
        "MORE",
      )
    const result = await fetchPrMerged(NOW, runner)
    expect(result.truncated).toBe(result.items.length)
    expect(result.error).toBeUndefined()
  })

  test("never requests more than the page cap", async () => {
    let calls = 0
    const runner = async () => {
      calls++
      return mergedPayload([], true, "MORE")
    }
    await fetchPrMerged(NOW, runner)
    expect(calls).toBe(5)
  })

  test("surfaces GraphQL errors", async () => {
    const runner = async () => JSON.stringify({ errors: [{ message: "Bad credentials" }] })
    await expect(fetchPrMerged(NOW, runner)).rejects.toThrow("Bad credentials")
  })
})
