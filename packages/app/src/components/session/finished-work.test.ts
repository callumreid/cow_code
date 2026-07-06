import { describe, expect, test } from "bun:test"
import type { Message, Part, Session, SessionStatus } from "@opencode-ai/sdk/v2/client"
import { FINISHED_WORK_CAP, getFinishedWork, retainFinished, type FinishedRow } from "./finished-work"

const assistant = (id: string) => ({ id, role: "assistant", sessionID: "ses_parent", time: { created: 1 } }) as unknown as Message

const toolPart = (input: {
  id: string
  tool: string
  status: "pending" | "running" | "completed" | "error"
  start?: number
  end?: number
  input?: Record<string, unknown>
  metadata?: Record<string, unknown>
}) => {
  const state =
    input.status === "pending"
      ? { status: "pending", input: input.input ?? {}, raw: "" }
      : {
          status: input.status,
          input: input.input ?? {},
          metadata: input.metadata,
          output: "",
          title: "",
          time: { start: input.start ?? 100, end: input.status === "running" ? undefined : (input.end ?? 200) },
        }
  return { id: input.id, messageID: "m1", sessionID: "ses_parent", type: "tool", callID: `call_${input.id}`, tool: input.tool, state } as unknown as Part
}

const session = (id: string, parentID: string | undefined, extra: Partial<Session> = {}) =>
  ({ id, parentID, title: `title ${id}`, directory: "/tmp", time: { created: 50, updated: 60 }, ...extra }) as unknown as Session

const derive = (input: {
  parts?: Part[]
  sessions?: Session[]
  statuses?: Record<string, SessionStatus>
}) =>
  getFinishedWork({
    sessionID: "ses_parent",
    messages: [assistant("m1")],
    parts: () => input.parts ?? [],
    sessions: input.sessions ?? [],
    status: (id) => input.statuses?.[id],
  })

describe("getFinishedWork", () => {
  test("captures completed and errored tools, skips running/pending", () => {
    const rows = derive({
      parts: [
        toolPart({ id: "p1", tool: "bash", status: "running" }),
        toolPart({ id: "p2", tool: "read", status: "pending" }),
        toolPart({ id: "p3", tool: "glob", status: "completed", start: 100, end: 250 }),
        toolPart({ id: "p4", tool: "grep", status: "error" }),
      ],
    })
    expect(rows.map((r) => r.key)).toEqual(["p3", "p4"])
    const glob = rows.find((r) => r.key === "p3")!
    expect(glob.kind).toBe("tool")
    expect(glob.status).toBe("completed")
    expect(glob.durationMs).toBe(150)
    expect(glob.finishedAt).toBe(250)
  })

  test("captures a finished subagent with snapshotted tokens/cost when its child is idle", () => {
    const rows = derive({
      parts: [toolPart({ id: "t1", tool: "task", status: "completed", metadata: { sessionId: "ses_child" }, input: { description: "summarize", subagent_type: "general" } })],
      sessions: [session("ses_child", "ses_parent", { cost: 0.42, tokens: { input: 10, output: 5, reasoning: 0, cache: { read: 0, write: 0 } } } as Partial<Session>)],
      statuses: { ses_child: { type: "idle" } as SessionStatus },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ kind: "subagent", status: "completed", description: "summarize", agentType: "general", childSessionID: "ses_child", tokens: 15, cost: 0.42 })
  })

  test("does NOT capture a completed task part whose child is still busy", () => {
    const rows = derive({
      parts: [toolPart({ id: "t1", tool: "task", status: "completed", metadata: { sessionId: "ses_child" } })],
      sessions: [session("ses_child", "ses_parent")],
      statuses: { ses_child: { type: "busy" } as SessionStatus },
    })
    expect(rows).toHaveLength(0)
  })

  test("captures an orphan idle child session with no task part, once", () => {
    const rows = derive({
      sessions: [session("ses_orphan", "ses_parent", { cost: 0.1 } as Partial<Session>)],
      statuses: { ses_orphan: { type: "idle" } as SessionStatus },
    })
    expect(rows.map((r) => r.childSessionID)).toEqual(["ses_orphan"])
  })
})

const row = (key: string, finishedAt: number, extra: Partial<FinishedRow> = {}): FinishedRow => ({
  key,
  kind: "tool",
  status: "completed",
  finishedAt,
  ...extra,
})

describe("retainFinished", () => {
  test("accumulates rows newest-first across observations", () => {
    const a = retainFinished([], [row("p1", 100)])
    const b = retainFinished(a, [row("p2", 200)])
    expect(b.map((r) => r.key)).toEqual(["p2", "p1"])
  })

  test("returns the same reference when nothing changed (no store churn)", () => {
    const first = retainFinished([], [row("p1", 100)])
    const again = retainFinished(first, [row("p1", 100)])
    expect(again).toBe(first)
  })

  test("refreshes a row's tokens/cost on re-observe", () => {
    const first = retainFinished([], [row("s1", 100, { tokens: undefined })])
    const next = retainFinished(first, [row("s1", 100, { tokens: 500, cost: 0.2 })])
    expect(next).not.toBe(first)
    expect(next[0]).toMatchObject({ tokens: 500, cost: 0.2 })
  })

  test("drops rows finished before a clear", () => {
    const kept = retainFinished([row("old", 100), row("new", 300)], [], { clearedBefore: 200 })
    expect(kept.map((r) => r.key)).toEqual(["new"])
  })

  test("caps the retained set", () => {
    const many = Array.from({ length: FINISHED_WORK_CAP + 10 }, (_, i) => row(`p${i}`, i + 1))
    const kept = retainFinished([], many)
    expect(kept).toHaveLength(FINISHED_WORK_CAP)
    // Newest kept, oldest dropped.
    expect(kept[0].key).toBe(`p${FINISHED_WORK_CAP + 9}`)
  })
})
