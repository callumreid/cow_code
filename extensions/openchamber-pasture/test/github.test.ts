import { describe, expect, test } from "bun:test"
import { classify, groupByRepo, searchPulls, type Request } from "../src/github"

const pr = {
  number: 1,
  title: "Example",
  url: "https://github.com/a/b/pull/1",
  repository: { nameWithOwner: "a/b" },
  author: { login: "a" },
  updatedAt: "2026-11-15T10:00:00Z",
  reviewDecision: "APPROVED",
  mergeStateStatus: "CLEAN",
  reviewThreads: { nodes: [], pageInfo: { hasNextPage: false } },
  commits: { nodes: [{ commit: { statusCheckRollup: { state: "SUCCESS" } } }] },
}

function response(nodes: unknown[], hasNextPage = false, endCursor: string | null = null, issueCount = nodes.length) {
  return { status: 200, body: JSON.stringify({ data: { prs: { issueCount, pageInfo: { hasNextPage, endCursor }, nodes } } }) }
}

describe("GitHub PR stages", () => {
  test("distinguishes review, checks, queue and merge blockers", () => {
    expect(classify(pr).label).toBe("Ready to merge")
    expect(classify({ ...pr, isDraft: true }).label).toBe("Draft")
    expect(classify({ ...pr, isInMergeQueue: true, mergeQueueEntry: { position: 2 } }).detail).toContain("Queue #2")
    expect(classify({ ...pr, reviewDecision: "CHANGES_REQUESTED" }).label).toBe("Changes requested")
    expect(classify({ ...pr, reviewDecision: "REVIEW_REQUIRED" }).label).toBe("Awaiting review")
    expect(classify({ ...pr, mergeStateStatus: "BLOCKED" }).label).toBe("Merge blocked")
    expect(classify({ ...pr, mergeStateStatus: "BEHIND" }).label).toBe("Behind base")
    expect(classify({ ...pr, mergeStateStatus: "DIRTY" }).label).toBe("Merge conflicts")
    expect(classify({ ...pr, reviewThreads: { nodes: [{ isResolved: false }], pageInfo: { hasNextPage: false } } }).label).toBe("Unresolved comments")
    expect(classify({ ...pr, commits: { nodes: [{ commit: { statusCheckRollup: { state: "PENDING" } } }] } }).label).toBe("Checks running")
    expect(classify({ ...pr, commits: { nodes: [{ commit: { statusCheckRollup: { state: "FAILURE" } } }] } }).label).toBe("Checks failing")
    expect(classify({ ...pr, mergedAt: "2026-11-15T10:00:00Z" }).label).toBe("Merged")
  })

  test("does not declare a PR ready when review details or merge state are incomplete", () => {
    expect(classify({ ...pr, reviewThreads: { nodes: [], pageInfo: { hasNextPage: true } } }).label).toBe("Review details incomplete")
    expect(classify({ ...pr, reviewThreads: null }).detail).toContain("Review threads unavailable")
    expect(classify({ ...pr, mergeStateStatus: "UNKNOWN" }).label).toBe("Merge status unavailable")
  })

  test("preserves a changes-requested verdict while indicating a newer re-review request", () => {
    const result = classify({
      ...pr,
      reviewDecision: "CHANGES_REQUESTED",
      latestReviews: { nodes: [{ state: "CHANGES_REQUESTED", submittedAt: "2026-11-14T10:00:00Z" }] },
      timelineItems: { nodes: [{ createdAt: "2026-11-15T10:00:00Z" }] },
    })
    expect(result.label).toBe("Re-review requested")
    expect(result.detail).toContain("Changes requested")
  })
})

describe("GitHub search", () => {
  test("loads all available pages and excludes archived repositories", async () => {
    const cursors: (string | null)[] = []
    const request: Request = async (_query, variables) => {
      cursors.push(variables.cursor)
      if (!variables.cursor) return response([pr], true, "next", 3)
      return response([
        { ...pr, number: 2, url: "https://github.com/a/b/pull/2" },
        { ...pr, number: 3, repository: { nameWithOwner: "a/archive", isArchived: true } },
      ], false, null, 3)
    }
    const result = await searchPulls(request, "is:pr is:open author:@me")
    expect(cursors).toEqual([null, "next"])
    expect(result.pulls.map((pull) => pull.number)).toEqual([1, 2])
    expect(result.incomplete).toBe(false)
  })

  test("rejects partial API errors and broken pagination instead of claiming completeness", async () => {
    const partial: Request = async () => ({
      status: 200,
      body: JSON.stringify({ errors: [{ message: "denied" }], data: { prs: {} } }),
    })
    await expect(searchPulls(partial, "open")).rejects.toThrow("denied")
    await expect(searchPulls(async () => response([pr], true), "open")).rejects.toThrow("next search page")
  })

  test("marks the GitHub search cap and malformed nodes as incomplete", async () => {
    let page = 0
    const request: Request = async () => response([pr, null], true, String(++page), 1200)
    const result = await searchPulls(request, "open")
    expect(page).toBe(10)
    expect(result.pulls).toHaveLength(1)
    expect(result.incomplete).toBe(true)
    const capped = await searchPulls(async () => response([pr], false, null, 1200), "open")
    expect(capped.incomplete).toBe(true)
  })

  test("groups by repository and sorts by the relevant recent activity", () => {
    const items = [
      classify({ ...pr, number: 1, updatedAt: "2026-11-01T10:00:00Z" }),
      classify({ ...pr, number: 2, updatedAt: "2026-11-10T10:00:00Z" }),
      classify({ ...pr, number: 3, repository: { nameWithOwner: "a/a" } }),
    ]
    expect(groupByRepo(items).map((group) => [group.repo, group.pulls.map((pull) => pull.number)])).toEqual([
      ["a/a", [3]],
      ["a/b", [2, 1]],
    ])
    const merged = [
      classify({ ...pr, number: 1, mergedAt: "2026-11-01T10:00:00Z", updatedAt: "2026-11-15T10:00:00Z" }),
      classify({ ...pr, number: 2, mergedAt: "2026-11-10T10:00:00Z", updatedAt: "2026-11-11T10:00:00Z" }),
    ]
    expect(groupByRepo(merged)[0].pulls.map((pull) => pull.number)).toEqual([2, 1])
  })
})
