import { describe, expect, test } from "bun:test"
import { liveThreads } from "./sidebar-office-threads"
import type { OfficeBucket, OfficeThread } from "@/office/types"

function thread(id: string, bucket: OfficeBucket, extra: Partial<OfficeThread> = {}): OfficeThread {
  return {
    sessionID: id,
    directory: "/Users/bronson/coval-worktrees/" + id,
    projectID: "p",
    title: id,
    bucket,
    summary: "s",
    pinned: false,
    muted: false,
    source: "cow",
    time: { created: 1, updated: 1 },
    ...extra,
  }
}

describe("liveThreads", () => {
  test("shows dispatched work across projects, needs-you first, and hides routines and done threads", () => {
    const rows = liveThreads([
      thread("done", "done"),
      thread("yelp", "working", { time: { created: 1, updated: 50 } }),
      thread("sweep", "working", { routine: "pr-review-sweep" }),
      thread("perm", "needs_you", { routine: "pr-review-fixer" }),
      thread("review", "review", { time: { created: 1, updated: 90 } }),
      thread("muted", "working", { muted: true }),
    ])
    expect(rows.map((row) => row.sessionID)).toEqual(["perm", "review", "yelp"])
  })

  test("pinned threads lead within a bucket, then the most recently updated", () => {
    const rows = liveThreads([
      thread("old", "working", { time: { created: 1, updated: 10 } }),
      thread("new", "working", { time: { created: 1, updated: 20 } }),
      thread("pinned", "working", { pinned: true, time: { created: 1, updated: 5 } }),
    ])
    expect(rows.map((row) => row.sessionID)).toEqual(["pinned", "new", "old"])
  })
})
