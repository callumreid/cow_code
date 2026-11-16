import { describe, expect, test } from "bun:test"
import { classify, parseResponse } from "../src/github"

const pr = { number: 1, title: "Example", url: "https://github.com/a/b/pull/1", repository: { nameWithOwner: "a/b" }, author: { login: "a" }, reviewDecision: "APPROVED", mergeStateStatus: "CLEAN", reviewThreads: { nodes: [], pageInfo: { hasNextPage: false } }, commits: { nodes: [{ commit: { statusCheckRollup: { state: "SUCCESS" } } }] } }
describe("GitHub PR stages", () => {
  test("only puts fully checked approved PRs in ready", () => {
    expect(classify(pr).pen).toBe("ready")
    expect(classify({ ...pr, isDraft: true }).pen).toBe("draft")
    expect(classify({ ...pr, reviewDecision: "CHANGES_REQUESTED" }).pen).toBe("changes")
    expect(classify({ ...pr, mergeStateStatus: "BLOCKED" }).pen).toBe("awaiting")
    expect(classify({ ...pr, reviewThreads: { nodes: [{ isResolved: false }], pageInfo: { hasNextPage: false } } }).pen).toBe("awaiting")
    expect(classify({ ...pr, reviewThreads: { nodes: [], pageInfo: { hasNextPage: true } } }).pen).toBe("awaiting")
    expect(classify({ ...pr, commits: { nodes: [{ commit: { statusCheckRollup: { state: "FAILURE" } } }] } }).pen).toBe("awaiting")
    expect(classify({ ...pr, mergedAt: "2026-11-15T10:00:00Z" }).pen).toBe("merged")
  })
  test("rejects partial GraphQL data and reports capped search results", () => {
    expect(() => parseResponse(JSON.stringify({ errors: [{ message: "denied" }], data: {} }))).toThrow("denied")
    const page = { issueCount: 101, pageInfo: { hasNextPage: true }, nodes: [pr] }
    const empty = { issueCount: 0, pageInfo: { hasNextPage: false }, nodes: [] }
    const parsed = parseResponse(JSON.stringify({ data: { open: page, merged: empty } }))
    expect(parsed.notice).toContain("limit reached")
    expect(parsed.cows).toHaveLength(1)
  })
})
