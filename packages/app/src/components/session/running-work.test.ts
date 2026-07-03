import { describe, expect, test } from "bun:test"
import type { Message, Part, Session, SessionStatus } from "@opencode-ai/sdk/v2/client"
import { getRunningWork, runningWorkCount } from "./running-work"

const assistant = (id: string) =>
  ({
    id,
    role: "assistant",
    sessionID: "ses_parent",
    time: { created: 1 },
  }) as unknown as Message

const user = (id: string) =>
  ({
    id,
    role: "user",
    sessionID: "ses_parent",
    time: { created: 1 },
  }) as unknown as Message

const toolPart = (input: {
  id: string
  messageID: string
  tool: string
  status: "pending" | "running" | "completed" | "error"
  start?: number
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
          time: { start: input.start ?? 100, end: input.status === "running" ? undefined : 200 },
        }
  return {
    id: input.id,
    messageID: input.messageID,
    sessionID: "ses_parent",
    type: "tool",
    callID: `call_${input.id}`,
    tool: input.tool,
    state,
  } as unknown as Part
}

const session = (id: string, parentID: string | undefined, extra: Partial<Session> = {}) =>
  ({
    id,
    parentID,
    title: `title ${id}`,
    directory: "/tmp",
    time: { created: 50, updated: 60 },
    ...extra,
  }) as unknown as Session

const derive = (input: {
  messages?: Message[]
  parts?: Record<string, Part[]>
  sessions?: Session[]
  statuses?: Record<string, SessionStatus>
}) =>
  getRunningWork({
    sessionID: "ses_parent",
    messages: input.messages ?? [],
    parts: (messageID) => input.parts?.[messageID] ?? [],
    sessions: input.sessions ?? [],
    status: (sessionID) => input.statuses?.[sessionID],
  })

describe("getRunningWork", () => {
  test("collects running and pending tools with start times, skips finished ones", () => {
    const work = derive({
      messages: [user("m0"), assistant("m1")],
      parts: {
        m1: [
          toolPart({ id: "p1", messageID: "m1", tool: "bash", status: "running", start: 123 }),
          toolPart({ id: "p2", messageID: "m1", tool: "read", status: "pending" }),
          toolPart({ id: "p3", messageID: "m1", tool: "glob", status: "completed" }),
          toolPart({ id: "p4", messageID: "m1", tool: "grep", status: "error" }),
        ],
      },
    })

    expect(work.tools.map((row) => row.key)).toEqual(["p1", "p2"])
    expect(work.tools[0]?.startedAt).toBe(123)
    expect(work.tools[0]?.status).toBe("running")
    expect(work.tools[1]?.startedAt).toBeUndefined()
    expect(work.tools[1]?.status).toBe("pending")
    expect(runningWorkCount(work)).toBe(2)
  })

  test("ignores parts on user messages", () => {
    const work = derive({
      messages: [user("m0")],
      parts: { m0: [toolPart({ id: "p1", messageID: "m0", tool: "bash", status: "running" })] },
    })

    expect(work.tools).toEqual([])
  })

  test("running task parts become subagent rows linked by metadata.sessionId", () => {
    const work = derive({
      messages: [assistant("m1")],
      parts: {
        m1: [
          toolPart({
            id: "p1",
            messageID: "m1",
            tool: "task",
            status: "running",
            start: 500,
            input: { description: "audit the code", subagent_type: "reviewer" },
            metadata: { sessionId: "ses_child", background: true },
          }),
        ],
      },
    })

    expect(work.tools).toEqual([])
    expect(work.subagents).toHaveLength(1)
    const row = work.subagents[0]!
    expect(row.childSessionID).toBe("ses_child")
    expect(row.description).toBe("audit the code")
    expect(row.agentType).toBe("reviewer")
    expect(row.background).toBe(true)
    expect(row.partStatus).toBe("running")
    expect(row.startedAt).toBe(500)
  })

  test("busy child session without an active task part still appears (background)", () => {
    const work = derive({
      messages: [assistant("m1")],
      parts: {
        m1: [
          toolPart({
            id: "p1",
            messageID: "m1",
            tool: "task",
            status: "completed",
            start: 400,
            input: { description: "long research", subagent_type: "explore" },
            metadata: { sessionId: "ses_child", background: true },
          }),
        ],
      },
      sessions: [session("ses_child", "ses_parent")],
      statuses: { ses_child: { type: "busy" } },
    })

    expect(work.subagents).toHaveLength(1)
    const row = work.subagents[0]!
    expect(row.childSessionID).toBe("ses_child")
    expect(row.description).toBe("long research")
    expect(row.background).toBe(true)
    expect(row.partStatus).toBeUndefined()
    expect(row.startedAt).toBe(400)
  })

  test("busy child with no task part at all falls back to session title and created time", () => {
    const work = derive({
      sessions: [session("ses_child", "ses_parent")],
      statuses: { ses_child: { type: "retry", attempt: 2, message: "429", next: 1000 } },
    })

    expect(work.subagents).toHaveLength(1)
    expect(work.subagents[0]?.description).toBe("title ses_child")
    expect(work.subagents[0]?.startedAt).toBe(50)
  })

  test("does not duplicate a child covered by an active task part", () => {
    const work = derive({
      messages: [assistant("m1")],
      parts: {
        m1: [
          toolPart({
            id: "p1",
            messageID: "m1",
            tool: "task",
            status: "running",
            metadata: { sessionId: "ses_child" },
          }),
        ],
      },
      sessions: [session("ses_child", "ses_parent")],
      statuses: { ses_child: { type: "busy" } },
    })

    expect(work.subagents).toHaveLength(1)
    expect(work.subagents[0]?.key).toBe("p1")
  })

  test("skips idle children and children of other sessions", () => {
    const work = derive({
      sessions: [session("ses_idle", "ses_parent"), session("ses_other", "ses_unrelated")],
      statuses: { ses_idle: { type: "idle" }, ses_other: { type: "busy" } },
    })

    expect(work.subagents).toEqual([])
  })
})
