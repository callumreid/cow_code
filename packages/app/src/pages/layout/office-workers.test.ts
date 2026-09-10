import { describe, expect, test } from "bun:test"
import type { Session } from "@opencode-ai/sdk/v2/client"
import { isOfficeWorkerSession, isWorkerDirectory, isWorktreeOf, officeWorkerThreads } from "./office-workers"
import type { OfficeThread } from "@/office/types"

function thread(id: string, directory: string, extra: Partial<OfficeThread> = {}): OfficeThread {
  return {
    sessionID: id,
    directory,
    projectID: "p",
    title: id,
    bucket: "working",
    summary: "s",
    pinned: false,
    muted: false,
    source: "cow",
    time: { created: 1, updated: 1 },
    ...extra,
  }
}

const OFFICE = "/Users/bronson/.local/share/opencode/office"
const YELP = "/Users/bronson/.local/share/opencode/worktree/backend-id/kind-wolf"

describe("office workers in the session list", () => {
  test("the office project lists every dispatched worker, but not routines or its own sessions", () => {
    const rows = officeWorkerThreads({
      threads: [
        thread("yelp", YELP),
        thread("sweep", "/Users/bronson/coval", { routine: "pr-review-sweep" }),
        thread("own", OFFICE),
        thread("claude", "/Users/bronson/coval", { source: "claude" }),
      ],
      project: { worktree: OFFICE, id: "office-id" },
      officeDirectory: OFFICE,
      listed: [OFFICE],
    })
    expect(rows.map((row) => row.sessionID)).toEqual(["yelp"])
  })

  test("another project only lists the workers in its own worktrees", () => {
    const rows = officeWorkerThreads({
      threads: [thread("yelp", YELP), thread("vault", "/Users/bronson/.local/share/opencode/worktree/vault-id/hidden-cabin")],
      project: { worktree: "/Users/bronson/coval/backend", id: "backend-id" },
      officeDirectory: OFFICE,
      listed: ["/Users/bronson/coval/backend"],
    })
    expect(rows.map((row) => row.sessionID)).toEqual(["yelp"])
    expect(isWorktreeOf(YELP, "backend-id")).toBe(true)
    expect(isWorktreeOf(YELP, undefined)).toBe(false)
  })

  test("worker sessions are the ones the office control tagged", () => {
    const tagged = { metadata: { officeCommandID: "ses:msg:call" } } as unknown as Session
    const plain = { metadata: {} } as unknown as Session
    expect(isOfficeWorkerSession(tagged)).toBe(true)
    expect(isOfficeWorkerSession(plain)).toBe(false)
    expect(isWorkerDirectory(YELP, [thread("yelp", YELP)])).toBe(true)
    expect(isWorkerDirectory("/elsewhere", [thread("yelp", YELP)])).toBe(false)
  })
})
