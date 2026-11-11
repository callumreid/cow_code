import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { SessionThread } from "@/session/thread"

type Row = { id: string; parentID?: string }
const sessions = (rows: Row[]) =>
  ({
    get: (id: string) => {
      const row = rows.find((item) => item.id === id)
      return row ? Effect.succeed(row) : Effect.fail(new Error("missing"))
    },
  }) as any
const root = (rows: Row[], id: string): Promise<string> =>
  Effect.runPromise(SessionThread.threadRoot(sessions(rows), rows.find((item) => item.id === id) as any) as any)

describe("SessionThread.threadRoot", () => {
  const rows = [
    { id: "ses_root" },
    { id: "ses_child", parentID: "ses_root" },
    { id: "ses_grand", parentID: "ses_child" },
  ]
  test("a thread's own session is its root", async () => {
    expect(await root(rows, "ses_root")).toBe("ses_root")
  })
  test("subagent sessions report the thread they were started from", async () => {
    expect(await root(rows, "ses_child")).toBe("ses_root")
    expect(await root(rows, "ses_grand")).toBe("ses_root")
  })
  test("a missing parent or a loop stops at the last session found", async () => {
    expect(await root([{ id: "ses_orphan", parentID: "ses_gone" }], "ses_orphan")).toBe("ses_orphan")
    const loop = [
      { id: "ses_x", parentID: "ses_y" },
      { id: "ses_y", parentID: "ses_x" },
    ]
    expect(await root(loop, "ses_x")).toBe("ses_y")
  })
})
