import { describe, expect, test } from "bun:test"
import type { OpenPullRequest } from "@/pr-dashboard/types"
import { LIMBO_MS, advanceLimbo, buildMembers, openDetail, penCounts } from "./members"
import type { PasturePullRequest } from "./types"

function open(number: number, state: OpenPullRequest["state"] = "awaiting-review"): OpenPullRequest {
  return {
    repo: "coval-ai/backend",
    number,
    title: `PR ${number}`,
    url: `https://github.com/coval-ai/backend/pull/${number}`,
    isDraft: state === "draft",
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-10T11:00:00Z",
    review: state === "ready" ? "approved" : state === "changes-requested" ? "changes-requested" : "review-required",
    checks: state === "checks-failing" ? "failure" : "success",
    unresolvedCount: state === "unresolved" ? 2 : 0,
    state,
    inMergeQueue: state === "merge-queue",
    behind: false,
    autoMerge: false,
    reRequested: false,
    automation: { keepUpdated: true, autoFix: true, merge: false },
  }
}

function merged(number: number): PasturePullRequest {
  return {
    repo: "coval-ai/backend",
    number,
    title: `PR ${number}`,
    url: `https://github.com/coval-ai/backend/pull/${number}`,
    mergedAt: "2026-09-10T12:00:00Z",
    author: "callumreid",
    additions: 1,
    deletions: 0,
    changedFiles: 1,
    base: "main",
    labels: [],
  }
}

describe("pasture members", () => {
  test("open PRs land in their stage pen and merged ones out back", () => {
    const members = buildMembers([open(1, "draft"), open(2, "ready"), open(3, "changes-requested"), open(4)], [merged(9)], new Map(), 150)
    expect(members.map((m) => [m.id, m.pen])).toEqual([
      ["coval-ai/backend#9", "merged"],
      ["coval-ai/backend#1", "draft"],
      ["coval-ai/backend#2", "ready"],
      ["coval-ai/backend#3", "changes"],
      ["coval-ai/backend#4", "awaiting"],
    ])
    expect(penCounts(members)).toEqual({ draft: 1, awaiting: 1, changes: 1, ready: 1, merged: 1 })
  })

  test("a PR listed both open and merged is one cow, in the merged pen, with the same coat", () => {
    const members = buildMembers([open(5)], [merged(5)], new Map(), 150)
    expect(members).toHaveLength(1)
    expect(members[0].pen).toBe("merged")
    const asOpen = buildMembers([open(5)], [], new Map(), 150)[0]
    expect(asOpen.breed.id).toBe(members[0].breed.id)
    expect(asOpen.seed).toBe(members[0].seed)
  })

  test("a vanished open PR is held until it shows up merged or times out", () => {
    const t0 = 1_000_000
    let limbo = advanceLimbo(new Map(), [open(7), open(8)], [open(8)], new Set(), t0)
    expect([...limbo.keys()]).toEqual(["coval-ai/backend#7"])
    const held = buildMembers([open(8)], [], limbo, 150)
    expect(held.find((m) => m.id === "coval-ai/backend#7")).toMatchObject({ kind: "open", held: true, pen: "awaiting" })
    // Merged search catches up: released, and the merged cow takes over.
    limbo = advanceLimbo(limbo, [open(8)], [open(8)], new Set(["coval-ai/backend#7"]), t0 + 60_000)
    expect(limbo.size).toBe(0)
    // Or it never merges (closed): gone after the hold.
    limbo = advanceLimbo(new Map(), [open(7)], [], new Set(), t0)
    limbo = advanceLimbo(limbo, [], [], new Set(), t0 + LIMBO_MS + 1)
    expect(limbo.size).toBe(0)
  })

  test("the detail line explains what is holding a PR up", () => {
    expect(openDetail(open(1, "draft"))).toBe("Draft")
    expect(openDetail(open(2, "ready"))).toBe("Ready to merge · approved · CI green")
    expect(openDetail(open(3, "checks-failing"))).toBe("Checks not green · CI failing")
    expect(openDetail({ ...open(4, "unresolved"), autoMerge: true })).toBe("Unresolved comments · CI green · 2 unresolved · auto-merge armed")
  })
})
