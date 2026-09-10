import { Schema } from "effect"
import type { DeepMutable } from "@opencode-ai/core/schema"

export const Lifecycle = Schema.Struct({
  phase: Schema.Literals(["accepted", "running", "waiting", "stopped", "failed", "canceled", "unknown"]),
  runID: Schema.optional(Schema.String),
  reason: Schema.optional(Schema.String),
  observedAt: Schema.Finite,
  outcome: Schema.Literals(["unverified", "reported", "verified"]),
  evidence: Schema.Array(
    Schema.Struct({
      kind: Schema.Literals(["implementation", "check", "shipment", "runtime"]),
      reference: Schema.String,
      status: Schema.Literals(["reported", "verified"]),
    }),
  ),
})
export type Lifecycle = typeof Lifecycle.Type
export type Signal = {
  type: "input" | "busy" | "waiting" | "idle" | "error" | "cancel" | "restart"
  id?: string
  reason?: string
}

/** Runner cleanup is not evidence that an objective succeeded. */
export function transition(previous: Lifecycle | undefined, signal: Signal, now: number): DeepMutable<Lifecycle> {
  const current: DeepMutable<Lifecycle> = previous
    ? { ...previous, evidence: previous.evidence.map((item) => ({ ...item })) }
    : { phase: "unknown", observedAt: now, outcome: "unverified", evidence: [] }
  // Summary and usage updates can re-emit the same user message after its turn
  // has stopped. Only a new input creates a new outcome boundary.
  if (signal.type === "input" && signal.id && signal.id === current.runID) return current
  if (signal.type === "input")
    return {
      ...current,
      phase: current.phase === "running" ? "running" : "accepted",
      runID: signal.id,
      reason: undefined,
      observedAt: now,
      outcome: "unverified",
      evidence: [],
    }
  if (signal.type === "restart")
    return current.phase === "running" || current.phase === "accepted"
      ? { ...current, phase: "unknown", reason: "Server restarted; execution needs reconciliation." }
      : current
  if (signal.type === "idle" && ["failed", "canceled", "waiting", "unknown"].includes(current.phase)) return current
  if (signal.type === "error" && current.phase === "canceled") return current
  const phase = { busy: "running", waiting: "waiting", idle: "stopped", error: "failed", cancel: "canceled" } as const
  return { ...current, phase: phase[signal.type], reason: signal.reason, observedAt: now, outcome: "unverified" }
}
