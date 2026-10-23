import { describe, expect, test } from "bun:test"
import type { OpenCodeEvent } from "@opencode-ai/client/promise"
import type { ServerEvent } from "./server-sdk"
import { adaptServerEvent } from "./server-sdk"
import { createGenerationTracker, generationRate } from "./server-generation"

let sequence = 0
const current = (type: string, data: object, sessionID = "ses_1", assistantMessageID = "msg_1") =>
  adaptServerEvent({
    id: `evt_${++sequence}`,
    created: 1,
    location: { directory: "/repo" },
    type,
    data: { sessionID, assistantMessageID, ...data },
  } as OpenCodeEvent)
const legacy = (type: string, properties: object) => ({ type, properties }) as ServerEvent

describe("per-thread generation speed", () => {
  test("excludes prefill, estimates live deltas, and settles with provider tokens", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.step.started", {}), 0)
    tracker.apply(current("session.reasoning.delta", { delta: "warm" }), 10_000)
    expect(generationRate(tracker.samples.ses_1, 10_000)).toBeUndefined()
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 11_000)
    expect(generationRate(tracker.samples.ses_1, 11_000)).toEqual({ value: 100, estimated: true, active: true })
    tracker.apply(current("session.step.ended", { tokens: { output: 80, reasoning: 20 } }), 50_000)
    expect(generationRate(tracker.samples.ses_1, 100_000)).toEqual({ value: 100, estimated: false, active: false })
  })

  test("freezes during tool execution and excludes the tool wait on continuation", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.step.started", {}), 0)
    tracker.apply(current("session.tool.input.delta", { delta: "{" }), 100)
    tracker.apply(current("session.tool.input.delta", { delta: "x".repeat(400) }), 1100)
    tracker.apply(current("session.tool.called", {}), 1200)
    expect(generationRate(tracker.samples.ses_1, 99_000)?.value).toBe(100)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 100_000)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 101_000)
    tracker.apply(current("session.step.ended", { tokens: { output: 300, reasoning: 0 } }), 102_000)
    expect(generationRate(tracker.samples.ses_1)?.value).toBe(150)
  })

  test("keeps simultaneous threads isolated and clears timing for a new model turn", () => {
    const tracker = createGenerationTracker()
    for (const id of ["ses_1", "ses_2"]) {
      tracker.apply(current("session.step.started", {}, id), 0)
      tracker.apply(current("session.text.delta", { delta: "a" }, id), 0)
      tracker.apply(current("session.text.delta", { delta: "x".repeat(id === "ses_1" ? 400 : 800) }, id), 1000)
    }
    expect(generationRate(tracker.samples.ses_1, 1000)?.value).toBe(100)
    expect(generationRate(tracker.samples.ses_2, 1000)?.value).toBe(200)
    tracker.apply(current("session.step.started", {}, "ses_1", "msg_2"), 2000)
    expect(generationRate(tracker.samples.ses_1, 2000)).toBeUndefined()
    expect(tracker.samples.ses_1?.started).toBeUndefined()
    expect(tracker.samples.ses_1?.tokens).toBeUndefined()
    expect(generationRate(tracker.samples.ses_2, 1000)?.value).toBe(200)
  })

  test("does not label a partial observation with full-turn provider usage", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.text.delta", { delta: "a" }), 0)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 1000)
    tracker.apply(current("session.step.ended", { tokens: { output: 10_000, reasoning: 0 } }), 2000)
    expect(generationRate(tracker.samples.ses_1)?.estimated).toBe(true)
    expect(generationRate(tracker.samples.ses_1)?.value).toBe(100)
  })

  test("ignores replayed deltas, stale completion, and tool results", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.step.started", {}), 0)
    tracker.apply(current("session.text.delta", { delta: "a" }), 0)
    const event = current("session.text.delta", { delta: "x".repeat(400) })
    tracker.apply(event, 1000)
    tracker.apply(event, 1500)
    tracker.apply(current("session.step.failed", {}, "ses_1", "msg_old"), 2000)
    tracker.apply(current("session.tool.success", { content: "x".repeat(1_000_000) }), 2000)
    expect(tracker.samples.ses_1?.characters).toBe(401)
    expect(tracker.samples.ses_1?.complete).toBe(false)
  })

  test("disconnect and failure freeze partial rates without fabricating usage", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.step.started", {}), 0)
    tracker.apply(current("session.text.delta", { delta: "a" }), 0)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 1000)
    tracker.disconnect()
    expect(generationRate(tracker.samples.ses_1, 99_000)).toEqual({ value: 100, estimated: true, active: false })
    tracker.apply(current("session.text.delta", { delta: "ignored after reconnect" }), 100_000)
    expect(tracker.samples.ses_1?.characters).toBe(401)
  })

  test("retry and interruption stop sampling; a retry starts a fresh provider turn", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.step.started", {}), 0)
    tracker.apply(current("session.text.delta", { delta: "a" }), 0)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 1000)
    tracker.apply(current("session.retry.scheduled", {}), 2000)
    expect(generationRate(tracker.samples.ses_1, 50_000)?.active).toBe(false)
    tracker.apply(current("session.step.started", {}, "ses_1", "msg_2"), 100_000)
    expect(generationRate(tracker.samples.ses_1)).toBeUndefined()
    tracker.apply(current("session.text.delta", { delta: "b" }, "ses_1", "msg_2"), 100_000)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(800) }, "ses_1", "msg_2"), 101_000)
    tracker.apply(current("session.execution.interrupted", {}), 102_000)
    expect(generationRate(tracker.samples.ses_1, 500_000)).toEqual({ value: 200, estimated: true, active: false })
  })

  test("supports legacy streams and usage without counting user text", () => {
    const tracker = createGenerationTracker()
    const part = { sessionID: "ses_1", messageID: "msg_1", type: "step-start" }
    tracker.apply(legacy("message.part.updated", { part }), 0)
    tracker.apply(legacy("message.part.delta", { ...part, field: "text", delta: "a" }), 0)
    tracker.apply(legacy("message.part.delta", { ...part, field: "text", delta: "x".repeat(400) }), 1000)
    tracker.apply(legacy("message.part.delta", { ...part, messageID: "user", field: "text", delta: "ignored" }), 1100)
    tracker.apply(
      legacy("message.part.updated", { part: { ...part, type: "step-finish", tokens: { output: 90, reasoning: 10 } } }),
      2000,
    )
    expect(generationRate(tracker.samples.ses_1)).toEqual({ value: 100, estimated: false, active: false })
  })

  test("missing usage remains estimated and zero-length or buffered streams stay unknown", () => {
    const tracker = createGenerationTracker()
    tracker.apply(current("session.step.started", {}), 0)
    tracker.apply(current("session.text.delta", { delta: "" }), 0)
    expect(tracker.samples.ses_1?.deltas).toBe(0)
    tracker.apply(current("session.text.delta", { delta: "a" }), 0)
    tracker.apply(current("session.text.delta", { delta: "x".repeat(400) }), 1000)
    tracker.apply(current("session.step.ended", { tokens: { output: 0, reasoning: 0 } }), 1000)
    expect(generationRate(tracker.samples.ses_1)?.estimated).toBe(true)
    tracker.apply(current("session.step.started", {}, "ses_1", "msg_2"), 2000)
    tracker.apply(current("session.text.delta", { delta: "a" }, "ses_1", "msg_2"), 2000)
    tracker.apply(current("session.text.delta", { delta: "b" }, "ses_1", "msg_2"), 2000)
    tracker.apply(current("session.step.ended", { tokens: { output: 10, reasoning: 0 } }, "ses_1", "msg_2"), 2000)
    expect(generationRate(tracker.samples.ses_1)).toBeUndefined()
  })
})
