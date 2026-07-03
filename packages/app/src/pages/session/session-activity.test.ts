import { describe, expect, test } from "bun:test"
import type { Message, Part, SessionStatus } from "@opencode-ai/sdk/v2/client"
import { activeUserMessage, deriveSessionActivity } from "./session-activity"

const idle: SessionStatus = { type: "idle" }
const busy: SessionStatus = { type: "busy" }
const retry: SessionStatus = { type: "retry", attempt: 2, message: "overloaded", next: 9_000 }

const userMessage = (id: string, created = 1_000) =>
  ({
    id,
    sessionID: "session-1",
    role: "user",
    time: { created },
    agent: "build",
    model: { providerID: "anthropic", modelID: "claude" },
  }) as Message

const assistantMessage = (id: string, parentID: string, completed?: number) =>
  ({
    id,
    sessionID: "session-1",
    role: "assistant",
    parentID,
    time: { created: 1_100, completed },
  }) as Message

const toolPart = (id: string, messageID: string, state: Record<string, unknown>) =>
  ({
    id,
    sessionID: "session-1",
    messageID,
    type: "tool",
    callID: `call-${id}`,
    tool: "bash",
    state,
  }) as Part

const reasoningPart = (id: string, messageID: string, time: { start: number; end?: number }) =>
  ({
    id,
    sessionID: "session-1",
    messageID,
    type: "reasoning",
    text: "pondering",
    time,
  }) as Part

const textPart = (id: string, messageID: string, time?: { start: number; end?: number }) =>
  ({
    id,
    sessionID: "session-1",
    messageID,
    type: "text",
    text: "hello",
    time,
  }) as Part

const stepFinishPart = (id: string, messageID: string) =>
  ({
    id,
    sessionID: "session-1",
    messageID,
    type: "step-finish",
    reason: "tool-calls",
    cost: 0,
    tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
  }) as Part

const store = (parts: Record<string, Part[]>) => (messageID: string) => parts[messageID] ?? []

describe("activeUserMessage", () => {
  test("anchors to the parent of the incomplete assistant message", () => {
    const messages = [userMessage("msg-1", 500), assistantMessage("msg-2", "msg-1"), userMessage("msg-3", 900)]
    expect(activeUserMessage(messages, busy)?.id).toBe("msg-1")
  })

  test("falls back to the last user message while busy with no assistant yet", () => {
    const messages = [userMessage("msg-1", 500), assistantMessage("msg-2", "msg-1", 800), userMessage("msg-3", 900)]
    expect(activeUserMessage(messages, busy)?.id).toBe("msg-3")
  })

  test("returns undefined when idle and every assistant message completed", () => {
    const messages = [userMessage("msg-1"), assistantMessage("msg-2", "msg-1", 2_000)]
    expect(activeUserMessage(messages, idle)).toBeUndefined()
  })
})

describe("deriveSessionActivity", () => {
  test("returns undefined when idle", () => {
    expect(deriveSessionActivity({ status: idle, messages: [userMessage("msg-1")], parts: store({}) })).toBeUndefined()
  })

  test("retry status wins regardless of parts", () => {
    const messages = [userMessage("msg-1", 700), assistantMessage("msg-2", "msg-1")]
    const parts = store({
      "msg-2": [toolPart("prt-1", "msg-2", { status: "running", input: {}, time: { start: 750 } })],
    })
    expect(deriveSessionActivity({ status: retry, messages, parts })).toEqual({
      phase: "retry",
      startedAt: 700,
      turnStartedAt: 700,
    })
  })

  test("busy with no messages yet reports working without a start time", () => {
    expect(deriveSessionActivity({ status: busy, messages: [], parts: store({}) })).toEqual({
      phase: "working",
      startedAt: undefined,
      turnStartedAt: undefined,
    })
  })

  test("busy with only the optimistic user message anchors to its created time", () => {
    const result = deriveSessionActivity({ status: busy, messages: [userMessage("msg-1", 1_234)], parts: store({}) })
    expect(result).toEqual({ phase: "working", startedAt: 1_234, turnStartedAt: 1_234 })
  })

  test("running tool as last part reports the tool with its start time", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({
      "msg-2": [
        reasoningPart("prt-1", "msg-2", { start: 1_050, end: 1_060 }),
        toolPart("prt-2", "msg-2", { status: "running", input: {}, time: { start: 1_100 } }),
      ],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "tool",
      toolName: "bash",
      startedAt: 1_100,
      turnStartedAt: 1_000,
    })
  })

  test("pending tool falls back to the turn start time", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({
      "msg-2": [toolPart("prt-1", "msg-2", { status: "pending", input: {}, raw: "" })],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "tool",
      toolName: "bash",
      startedAt: 1_000,
      turnStartedAt: 1_000,
    })
  })

  test("open reasoning part reports thinking from the reasoning start", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({ "msg-2": [reasoningPart("prt-1", "msg-2", { start: 1_050 })] })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "thinking",
      startedAt: 1_050,
      turnStartedAt: 1_000,
    })
  })

  test("open text part reports streaming", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({
      "msg-2": [
        reasoningPart("prt-1", "msg-2", { start: 1_050, end: 1_060 }),
        textPart("prt-2", "msg-2", { start: 1_070 }),
      ],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "streaming",
      startedAt: 1_070,
      turnStartedAt: 1_000,
    })
  })

  test("text part without time metadata still reports streaming from the turn start", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({ "msg-2": [textPart("prt-1", "msg-2")] })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "streaming",
      startedAt: 1_000,
      turnStartedAt: 1_000,
    })
  })

  test("completed tool between steps reports working", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({
      "msg-2": [
        toolPart("prt-1", "msg-2", {
          status: "completed",
          input: {},
          output: "done",
          title: "bash",
          metadata: {},
          time: { start: 1_100, end: 1_200 },
        }),
      ],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "working",
      startedAt: 1_000,
      turnStartedAt: 1_000,
    })
  })

  test("ignores step-finish parts when picking the last relevant part", () => {
    const messages = [userMessage("msg-1", 1_000), assistantMessage("msg-2", "msg-1")]
    const parts = store({
      "msg-2": [
        toolPart("prt-1", "msg-2", { status: "running", input: {}, time: { start: 1_100 } }),
        stepFinishPart("prt-2", "msg-2"),
      ],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })?.phase).toBe("tool")
  })

  test("spans parts across multiple assistant messages of the same turn", () => {
    const messages = [
      userMessage("msg-1", 1_000),
      assistantMessage("msg-2", "msg-1", 1_300),
      assistantMessage("msg-3", "msg-1"),
    ]
    const parts = store({
      "msg-2": [textPart("prt-1", "msg-2", { start: 1_100, end: 1_200 })],
      "msg-3": [reasoningPart("prt-2", "msg-3", { start: 1_400 })],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "thinking",
      startedAt: 1_400,
      turnStartedAt: 1_000,
    })
  })

  test("only counts parts belonging to the active turn", () => {
    const messages = [userMessage("msg-1", 500), assistantMessage("msg-2", "msg-1", 800), userMessage("msg-3", 900)]
    const parts = store({
      "msg-2": [toolPart("prt-1", "msg-2", { status: "running", input: {}, time: { start: 600 } })],
    })
    expect(deriveSessionActivity({ status: busy, messages, parts })).toEqual({
      phase: "working",
      startedAt: 900,
      turnStartedAt: 900,
    })
  })
})
