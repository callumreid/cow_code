// Pure v1-event -> OTLP JSON span mapping for the engine trace exporter.
// Ports the deterministic sha256 trace/span ID scheme from the datadog-otel
// plugin (IDs keyed on sessionID/messageID) so plugin-emitted and
// engine-emitted spans line up in the same trace.
//
// PII policy: tool spans carry names, durations, and status only — never
// tool args, outputs, or metadata content.
import { createHash } from "node:crypto"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { isRecord } from "@/util/record"

export type AttributeValue =
  | { stringValue: string }
  | { intValue: string }
  | { doubleValue: number }
  | { boolValue: boolean }

export type Attribute = { key: string; value: AttributeValue }

export type Span = {
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  kind: number
  startTimeUnixNano: string
  endTimeUnixNano: string
  attributes: Attribute[]
  status: { code: number }
}

export type TurnTimes = {
  requestStart?: number
  firstToken?: number
}

export type MapperState = {
  emitted: Set<string>
  stepStart: Map<string, number>
}

const EMITTED_LIMIT = 4096
const STEP_LIMIT = 64

export const emptyState = (): MapperState => ({ emitted: new Set(), stepStart: new Map() })

const hash = (value: string, bytes: number) =>
  createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, bytes * 2)

export const traceId = (...parts: string[]) => hash(parts.join(":"), 16)

export const spanId = (...parts: string[]) => {
  const value = hash(parts.join(":"), 8)
  // Deterministic non-zero fallback; the plugin randomizes here, but an
  // all-zero sha256 prefix is a 2^-64 event so alignment is unaffected.
  return value === "0000000000000000" ? "0000000000000001" : value
}

const toUnixNano = (value: number | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return undefined
  if (value > 1e17) return BigInt(Math.trunc(value))
  if (value > 1e12) return BigInt(Math.trunc(value * 1e6))
  if (value > 1e9) return BigInt(Math.trunc(value * 1e9))
  return BigInt(Math.trunc(value * 1e6))
}

const nowUnixNano = () => BigInt(Date.now()) * 1000000n

const attribute = (key: string, value: unknown): Attribute | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value === "boolean") return { key, value: { boolValue: value } }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined
    if (Number.isInteger(value)) return { key, value: { intValue: String(value) } }
    return { key, value: { doubleValue: value } }
  }
  if (typeof value === "bigint") return { key, value: { intValue: String(value) } }
  if (typeof value === "string") return { key, value: { stringValue: value } }
  return undefined
}

const attrs = (values: Record<string, unknown>) =>
  Object.entries(values).flatMap((pair) => {
    const built = attribute(pair[0], pair[1])
    return built ? [built] : []
  })

const finite = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined)

const integer = (value: unknown) => {
  const parsed = finite(value)
  return parsed === undefined ? undefined : Math.trunc(parsed)
}

export const turnSpan = (info: SessionV1.Assistant, timing?: TurnTimes): Span => {
  const start = toUnixNano(info.time.created)
  const end = toUnixNano(info.time.completed) ?? nowUnixNano()
  const startOrEnd = start ?? end
  const errorData: unknown = info.error?.data
  const anchor = timing?.requestStart ?? finite(info.time.created)
  const ttft =
    timing?.firstToken !== undefined && anchor !== undefined && timing.firstToken >= anchor
      ? timing.firstToken - anchor
      : undefined

  return {
    traceId: traceId(info.sessionID, info.id),
    spanId: spanId("assistant", info.id),
    name: "opencode.chat.completion",
    kind: 3,
    startTimeUnixNano: String(startOrEnd),
    endTimeUnixNano: String(end >= startOrEnd ? end : startOrEnd),
    attributes: attrs({
      "app.name": "opencode",
      "opencode.event": "message.updated",
      "opencode.session.id": info.sessionID,
      "session.id": info.sessionID,
      "opencode.message.id": info.id,
      "message.id": info.id,
      "opencode.parent_message.id": info.parentID,
      "opencode.agent": info.agent,
      "opencode.mode": info.mode,
      "opencode.path.cwd": info.path?.cwd,
      "opencode.path.root": info.path?.root,
      "gen_ai.system": info.providerID,
      "gen_ai.request.model": info.modelID,
      "gen_ai.response.model": info.modelID,
      provider: info.providerID,
      model: info.modelID,
      cost_usd: finite(info.cost),
      "opencode.cost_usd": finite(info.cost),
      "gen_ai.usage.input_tokens": integer(info.tokens?.input),
      "gen_ai.usage.output_tokens": integer(info.tokens?.output),
      "opencode.tokens.input": integer(info.tokens?.input),
      "opencode.tokens.output": integer(info.tokens?.output),
      "opencode.tokens.reasoning": integer(info.tokens?.reasoning),
      "opencode.tokens.cache_read": integer(info.tokens?.cache?.read),
      "opencode.tokens.cache_write": integer(info.tokens?.cache?.write),
      "opencode.finish": info.finish,
      "error.type": info.error?.name,
      "http.response.status_code": isRecord(errorData) ? integer(errorData.statusCode) : undefined,
      "opencode.error.retryable":
        isRecord(errorData) && typeof errorData.isRetryable === "boolean" ? errorData.isRetryable : undefined,
      ttft_ms: integer(ttft),
      "opencode.ttft_ms": integer(ttft),
    }),
    status: { code: info.error ? 2 : 1 },
  }
}

export const toolSpan = (part: SessionV1.ToolPart): Span | undefined => {
  if (part.state.status !== "completed" && part.state.status !== "error") return undefined
  const start = toUnixNano(part.state.time.start) ?? nowUnixNano()
  const end = toUnixNano(part.state.time.end) ?? nowUnixNano()

  return {
    traceId: traceId(part.sessionID, part.messageID),
    spanId: spanId("tool", part.callID || part.id),
    parentSpanId: spanId("assistant", part.messageID),
    name: "opencode.tool.execute",
    kind: 1,
    startTimeUnixNano: String(start),
    endTimeUnixNano: String(end >= start ? end : start),
    attributes: attrs({
      "app.name": "opencode",
      "opencode.event": "message.part.updated",
      "opencode.session.id": part.sessionID,
      "session.id": part.sessionID,
      "opencode.message.id": part.messageID,
      "message.id": part.messageID,
      "opencode.part.id": part.id,
      "opencode.tool.call_id": part.callID,
      "opencode.tool.name": part.tool,
      "tool.name": part.tool,
      "opencode.tool.status": part.state.status,
    }),
    status: { code: part.state.status === "error" ? 2 : 1 },
  }
}

export const stepSpan = (part: SessionV1.StepFinishPart, time: { start?: number; end: number }): Span => {
  const end = toUnixNano(time.end) ?? nowUnixNano()
  const start = toUnixNano(time.start) ?? end

  return {
    traceId: traceId(part.sessionID, part.messageID),
    spanId: spanId("step", part.id),
    parentSpanId: spanId("assistant", part.messageID),
    name: "opencode.step",
    kind: 1,
    startTimeUnixNano: String(start),
    endTimeUnixNano: String(end >= start ? end : start),
    attributes: attrs({
      "app.name": "opencode",
      "opencode.event": "message.part.updated",
      "opencode.session.id": part.sessionID,
      "session.id": part.sessionID,
      "opencode.message.id": part.messageID,
      "message.id": part.messageID,
      "opencode.part.id": part.id,
      "opencode.finish": part.reason,
      cost_usd: finite(part.cost),
      "opencode.cost_usd": finite(part.cost),
      "gen_ai.usage.input_tokens": integer(part.tokens?.input),
      "gen_ai.usage.output_tokens": integer(part.tokens?.output),
      "opencode.tokens.input": integer(part.tokens?.input),
      "opencode.tokens.output": integer(part.tokens?.output),
      "opencode.tokens.reasoning": integer(part.tokens?.reasoning),
      "opencode.tokens.cache_read": integer(part.tokens?.cache?.read),
      "opencode.tokens.cache_write": integer(part.tokens?.cache?.write),
    }),
    status: { code: 1 },
  }
}

const remember = (state: MapperState, key: string) => {
  if (state.emitted.has(key)) return false
  if (state.emitted.size >= EMITTED_LIMIT) state.emitted.clear()
  state.emitted.add(key)
  return true
}

export type BusEvent = { type: string; data: unknown }

/**
 * Map a v1 bus event to zero or more OTLP spans. Stateful only for
 * emit-once dedupe and step-start/step-finish pairing; the `timing`
 * lookup is consumed exactly once per emitted turn span.
 */
export const mapEvent = (
  state: MapperState,
  event: BusEvent,
  timing?: (messageID: string) => TurnTimes | undefined,
): Span[] => {
  const data = isRecord(event.data) ? event.data : undefined
  if (!data) return []

  if (event.type === "message.updated") {
    if (!isRecord(data.info) || data.info.role !== "assistant") return []
    const info = data.info as unknown as SessionV1.Assistant
    if (!info.time?.completed && !info.error) return []
    if (!remember(state, `assistant:${info.id}`)) return []
    return [turnSpan(info, timing?.(info.id))]
  }

  if (event.type === "message.part.updated") {
    if (!isRecord(data.part)) return []
    const eventTime = finite(data.time) ?? Date.now()

    if (data.part.type === "tool") {
      const part = data.part as unknown as SessionV1.ToolPart
      const span = toolSpan(part)
      if (!span) return []
      return remember(state, `tool:${part.id}:${part.state.status}`) ? [span] : []
    }

    if (data.part.type === "step-start") {
      const part = data.part as unknown as SessionV1.StepStartPart
      if (state.stepStart.size >= STEP_LIMIT && !state.stepStart.has(part.messageID)) {
        state.stepStart.delete(state.stepStart.keys().next().value ?? "")
      }
      state.stepStart.set(part.messageID, eventTime)
      return []
    }

    if (data.part.type === "step-finish") {
      const part = data.part as unknown as SessionV1.StepFinishPart
      if (!remember(state, `step:${part.id}`)) return []
      const start = state.stepStart.get(part.messageID)
      state.stepStart.delete(part.messageID)
      return [stepSpan(part, { start, end: eventTime })]
    }
  }

  return []
}

/** Wrap spans in an OTLP/HTTP JSON export payload. */
export const tracePayload = (
  resource: { serviceName: string; serviceVersion: string; attributes: Record<string, string> },
  spans: Span[],
) => ({
  resourceSpans: [
    {
      resource: {
        attributes: attrs({
          "service.name": resource.serviceName,
          "service.version": resource.serviceVersion,
          ...resource.attributes,
        }),
      },
      scopeSpans: [
        {
          scope: { name: "opencode.trace-export", version: "1.0.0" },
          spans,
        },
      ],
    },
  ],
})

export * as SpanMapper from "./span-mapper"
