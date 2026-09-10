import { expect, test } from "bun:test"
import { transition } from "../../src/office/lifecycle"

test("failure, cancellation and waiting survive generic idle cleanup", () => {
  const active = transition(undefined, { type: "input", id: "run-one" }, 1)
  for (const type of ["error", "cancel", "waiting"] as const) {
    const terminal = transition(active, { type, reason: "specific reason" }, 2)
    expect(transition(terminal, { type: "idle" }, 3)).toEqual(terminal)
  }
})

test("new input opens a new outcome boundary; idle never verifies an objective", () => {
  const failed = transition(undefined, { type: "error", reason: "provider failed" }, 1)
  const resumed = transition(failed, { type: "input", id: "new-input" }, 2)
  const stopped = transition(resumed, { type: "idle" }, 3)
  expect(stopped.phase).toBe("stopped")
  expect(stopped.outcome).toBe("unverified")
  expect(stopped.runID).toBe("new-input")
  expect(stopped.evidence).toEqual([])
})

test("restart reports uncertain execution without inventing a heartbeat", () => {
  const active = transition(undefined, { type: "busy" }, 10)
  const restarted = transition(active, { type: "restart" }, 100)
  expect(restarted.phase).toBe("unknown")
  expect(restarted.observedAt).toBe(10)
  expect(transition(restarted, { type: "idle" }, 101).phase).toBe("unknown")
})

test("repeated user-message updates preserve terminal outcomes and evidence", () => {
  const input = transition(undefined, { type: "input", id: "run-one" }, 1)
  for (const type of ["idle", "error", "cancel", "waiting"] as const) {
    const terminal = transition(input, { type, reason: "observed state" }, 2)
    terminal.outcome = "reported"
    terminal.evidence.push({ kind: "check", status: "verified", reference: "test exit 0" })
    expect(transition(terminal, { type: "input", id: "run-one" }, 3)).toEqual(terminal)
  }
})
