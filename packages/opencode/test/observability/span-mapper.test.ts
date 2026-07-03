import { createHash } from "node:crypto"
import { describe, expect, test } from "bun:test"
import { SpanMapper } from "@/observability/span-mapper"
import { TurnTiming } from "@/observability/turn-timing"

const hash = (value: string, bytes: number) =>
  createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, bytes * 2)

const attr = (span: SpanMapper.Span, key: string) => span.attributes.find((entry) => entry.key === key)?.value

const assistantInfo = (overrides: Record<string, unknown> = {}) => ({
  id: "msg_turn1",
  sessionID: "ses_abc",
  role: "assistant",
  parentID: "msg_user1",
  modelID: "claude-fable-5",
  providerID: "anthropic",
  mode: "build",
  agent: "build",
  path: { cwd: "/tmp/project", root: "/tmp/project" },
  cost: 0.0125,
  tokens: { input: 1200, output: 340, reasoning: 25, cache: { read: 900, write: 100 } },
  finish: "stop",
  time: { created: 1_700_000_000_000, completed: 1_700_000_004_000 },
  ...overrides,
})

const turnEvent = (overrides: Record<string, unknown> = {}) => ({
  type: "message.updated",
  data: { sessionID: "ses_abc", info: assistantInfo(overrides) },
})

const toolPart = (overrides: Record<string, unknown> = {}) => ({
  id: "prt_tool1",
  sessionID: "ses_abc",
  messageID: "msg_turn1",
  type: "tool",
  callID: "call_1",
  tool: "bash",
  state: {
    status: "completed",
    input: { command: "rm -rf /secret", description: "should never be exported" },
    output: "SECRET OUTPUT CONTENT",
    title: "List files",
    metadata: { exit: 0, secret: "do-not-export" },
    time: { start: 1_700_000_001_000, end: 1_700_000_002_500 },
  },
  ...overrides,
})

describe("SpanMapper.mapEvent turn spans", () => {
  test("terminal assistant message.updated maps to a turn span with gen_ai attrs", () => {
    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), turnEvent())

    expect(spans).toHaveLength(1)
    const span = spans[0]
    expect(span.name).toBe("opencode.chat.completion")
    expect(span.kind).toBe(3)
    expect(span.traceId).toBe(hash("ses_abc:msg_turn1", 16))
    expect(span.spanId).toBe(hash("assistant:msg_turn1", 8))
    expect(span.parentSpanId).toBeUndefined()
    expect(span.startTimeUnixNano).toBe("1700000000000000000")
    expect(span.endTimeUnixNano).toBe("1700000004000000000")
    expect(span.status.code).toBe(1)
    expect(attr(span, "gen_ai.usage.input_tokens")).toEqual({ intValue: "1200" })
    expect(attr(span, "gen_ai.usage.output_tokens")).toEqual({ intValue: "340" })
    expect(attr(span, "opencode.tokens.reasoning")).toEqual({ intValue: "25" })
    expect(attr(span, "opencode.tokens.cache_read")).toEqual({ intValue: "900" })
    expect(attr(span, "cost_usd")).toEqual({ doubleValue: 0.0125 })
    expect(attr(span, "gen_ai.system")).toEqual({ stringValue: "anthropic" })
    expect(attr(span, "gen_ai.request.model")).toEqual({ stringValue: "claude-fable-5" })
    expect(attr(span, "opencode.finish")).toEqual({ stringValue: "stop" })
    expect(attr(span, "session.id")).toEqual({ stringValue: "ses_abc" })
    expect(attr(span, "error.type")).toBeUndefined()
    expect(attr(span, "ttft_ms")).toBeUndefined()
  })

  test("errored turn maps error type, status code, and retryability", () => {
    const spans = SpanMapper.mapEvent(
      SpanMapper.emptyState(),
      turnEvent({
        finish: undefined,
        error: {
          name: "APIError",
          data: { message: "overloaded", statusCode: 429, isRetryable: true },
        },
      }),
    )

    expect(spans).toHaveLength(1)
    expect(spans[0].status.code).toBe(2)
    expect(attr(spans[0], "error.type")).toEqual({ stringValue: "APIError" })
    expect(attr(spans[0], "http.response.status_code")).toEqual({ intValue: "429" })
    expect(attr(spans[0], "opencode.error.retryable")).toEqual({ boolValue: true })
  })

  test("non-terminal assistant updates and user messages map to nothing", () => {
    const state = SpanMapper.emptyState()
    expect(SpanMapper.mapEvent(state, turnEvent({ time: { created: 1_700_000_000_000 }, finish: undefined }))).toEqual(
      [],
    )
    expect(
      SpanMapper.mapEvent(state, {
        type: "message.updated",
        data: { sessionID: "ses_abc", info: { id: "msg_u", role: "user", time: { created: 1 } } },
      }),
    ).toEqual([])
  })

  test("turn span emits exactly once per message", () => {
    const state = SpanMapper.emptyState()
    expect(SpanMapper.mapEvent(state, turnEvent())).toHaveLength(1)
    expect(SpanMapper.mapEvent(state, turnEvent())).toEqual([])
  })

  test("ttft_ms is attached when a first-delta timestamp was recorded", () => {
    TurnTiming.markRequestStart("msg_turn1", 1_700_000_000_200)
    TurnTiming.markFirstToken("msg_turn1", 1_700_000_000_650)
    TurnTiming.markFirstToken("msg_turn1", 1_700_000_009_999) // later deltas do not move it

    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), turnEvent(), TurnTiming.take)

    expect(spans).toHaveLength(1)
    expect(attr(spans[0], "ttft_ms")).toEqual({ intValue: "450" })
    expect(attr(spans[0], "opencode.ttft_ms")).toEqual({ intValue: "450" })
    // consumed: a second turn for the same id has no timing left
    expect(TurnTiming.take("msg_turn1")).toBeUndefined()
  })

  test("ttft_ms falls back to message creation time when request start is missing", () => {
    TurnTiming.markFirstToken("msg_turn1", 1_700_000_001_000)

    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), turnEvent(), TurnTiming.take)

    expect(attr(spans[0], "ttft_ms")).toEqual({ intValue: "1000" })
  })
})

describe("SpanMapper.mapEvent tool spans", () => {
  test("completed tool part maps to a child span with names, duration, status — no args or output", () => {
    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), {
      type: "message.part.updated",
      data: { sessionID: "ses_abc", part: toolPart(), time: 1_700_000_002_500 },
    })

    expect(spans).toHaveLength(1)
    const span = spans[0]
    expect(span.name).toBe("opencode.tool.execute")
    expect(span.traceId).toBe(hash("ses_abc:msg_turn1", 16))
    expect(span.parentSpanId).toBe(hash("assistant:msg_turn1", 8))
    expect(span.spanId).toBe(hash("tool:call_1", 8))
    expect(span.startTimeUnixNano).toBe("1700000001000000000")
    expect(span.endTimeUnixNano).toBe("1700000002500000000")
    expect(span.status.code).toBe(1)
    expect(attr(span, "tool.name")).toEqual({ stringValue: "bash" })
    expect(attr(span, "opencode.tool.status")).toEqual({ stringValue: "completed" })

    const serialized = JSON.stringify(span)
    expect(serialized).not.toContain("rm -rf")
    expect(serialized).not.toContain("SECRET OUTPUT CONTENT")
    expect(serialized).not.toContain("do-not-export")
  })

  test("errored tool part maps to an error-status span", () => {
    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), {
      type: "message.part.updated",
      data: {
        sessionID: "ses_abc",
        part: toolPart({
          state: {
            status: "error",
            input: { command: "boom" },
            error: "tool exploded",
            time: { start: 1_700_000_001_000, end: 1_700_000_001_100 },
          },
        }),
        time: 1_700_000_001_100,
      },
    })

    expect(spans).toHaveLength(1)
    expect(spans[0].status.code).toBe(2)
    expect(attr(spans[0], "opencode.tool.status")).toEqual({ stringValue: "error" })
    expect(JSON.stringify(spans[0])).not.toContain("tool exploded")
  })

  test("pending and running tool parts map to nothing, completed part emits once", () => {
    const state = SpanMapper.emptyState()
    const pending = {
      type: "message.part.updated",
      data: {
        sessionID: "ses_abc",
        part: toolPart({ state: { status: "pending", input: {}, raw: "" } }),
        time: 1,
      },
    }
    expect(SpanMapper.mapEvent(state, pending)).toEqual([])

    const completed = {
      type: "message.part.updated",
      data: { sessionID: "ses_abc", part: toolPart(), time: 1_700_000_002_500 },
    }
    expect(SpanMapper.mapEvent(state, completed)).toHaveLength(1)
    expect(SpanMapper.mapEvent(state, completed)).toEqual([])
  })
})

describe("SpanMapper.mapEvent step spans", () => {
  test("step-start/step-finish pair maps to one step span with per-step tokens and cost", () => {
    const state = SpanMapper.emptyState()
    const started = SpanMapper.mapEvent(state, {
      type: "message.part.updated",
      data: {
        sessionID: "ses_abc",
        part: { id: "prt_ss1", sessionID: "ses_abc", messageID: "msg_turn1", type: "step-start" },
        time: 1_700_000_000_100,
      },
    })
    expect(started).toEqual([])

    const spans = SpanMapper.mapEvent(state, {
      type: "message.part.updated",
      data: {
        sessionID: "ses_abc",
        part: {
          id: "prt_sf1",
          sessionID: "ses_abc",
          messageID: "msg_turn1",
          type: "step-finish",
          reason: "tool-calls",
          cost: 0.004,
          tokens: { input: 800, output: 120, reasoning: 0, cache: { read: 500, write: 0 } },
        },
        time: 1_700_000_003_000,
      },
    })

    expect(spans).toHaveLength(1)
    const span = spans[0]
    expect(span.name).toBe("opencode.step")
    expect(span.spanId).toBe(hash("step:prt_sf1", 8))
    expect(span.parentSpanId).toBe(hash("assistant:msg_turn1", 8))
    expect(span.startTimeUnixNano).toBe("1700000000100000000")
    expect(span.endTimeUnixNano).toBe("1700000003000000000")
    expect(attr(span, "gen_ai.usage.input_tokens")).toEqual({ intValue: "800" })
    expect(attr(span, "gen_ai.usage.output_tokens")).toEqual({ intValue: "120" })
    expect(attr(span, "cost_usd")).toEqual({ doubleValue: 0.004 })
    expect(attr(span, "opencode.finish")).toEqual({ stringValue: "tool-calls" })
  })

  test("step-finish without a recorded step-start collapses to a zero-length span", () => {
    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), {
      type: "message.part.updated",
      data: {
        sessionID: "ses_abc",
        part: {
          id: "prt_sf2",
          sessionID: "ses_abc",
          messageID: "msg_turn1",
          type: "step-finish",
          reason: "stop",
          cost: 0,
          tokens: { input: 1, output: 1, reasoning: 0, cache: { read: 0, write: 0 } },
        },
        time: 1_700_000_003_000,
      },
    })

    expect(spans).toHaveLength(1)
    expect(spans[0].startTimeUnixNano).toBe(spans[0].endTimeUnixNano)
  })
})

describe("SpanMapper.tracePayload", () => {
  test("wraps spans with resource attributes in OTLP JSON shape", () => {
    const spans = SpanMapper.mapEvent(SpanMapper.emptyState(), turnEvent())
    const payload = SpanMapper.tracePayload(
      { serviceName: "opencode", serviceVersion: "1.0.0", attributes: { "opencode.client": "desktop" } },
      spans,
    )

    expect(payload.resourceSpans).toHaveLength(1)
    expect(payload.resourceSpans[0].resource.attributes).toContainEqual({
      key: "service.name",
      value: { stringValue: "opencode" },
    })
    expect(payload.resourceSpans[0].resource.attributes).toContainEqual({
      key: "opencode.client",
      value: { stringValue: "desktop" },
    })
    expect(payload.resourceSpans[0].scopeSpans[0].spans).toEqual(spans)
  })
})

describe("TurnTiming", () => {
  test("first marks win and take clears the record", () => {
    TurnTiming.markRequestStart("msg_timing", 100)
    TurnTiming.markRequestStart("msg_timing", 999)
    TurnTiming.markFirstToken("msg_timing", 150)
    TurnTiming.markFirstToken("msg_timing", 999)

    expect(TurnTiming.take("msg_timing")).toEqual({ requestStart: 100, firstToken: 150 })
    expect(TurnTiming.take("msg_timing")).toBeUndefined()
  })
})
