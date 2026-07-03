import { describe, expect, test } from "bun:test"
import { createWatchdogCore, STUCK_RETRY_ATTEMPTS, STUCK_SILENCE_MS, watchdogSessionID } from "./session-watchdog-core"

const DIR = "/tmp/project"

const status = (sessionID: string, value: { type: string; attempt?: number }) => ({
  type: "session.status",
  properties: { sessionID, status: value },
})

const delta = (sessionID: string) => ({
  type: "message.part.delta",
  properties: { sessionID, messageID: "msg", partID: "part", field: "text", delta: "x" },
})

const toolProgress = (sessionID: string) => ({
  type: "message.part.updated",
  properties: { part: { id: "part", sessionID, messageID: "msg", type: "tool", state: { status: "running" } } },
})

const harness = (opts?: { silenceMs?: number; retryAttempts?: number }) => {
  const fired: { stuck: { sessionID: string; reason: string; attempt?: number }[]; cleared: string[] } = {
    stuck: [],
    cleared: [],
  }
  const core = createWatchdogCore({
    onStuck: (info) => fired.stuck.push({ sessionID: info.sessionID, reason: info.reason, attempt: info.attempt }),
    onClear: (info) => fired.cleared.push(info.sessionID),
    ...opts,
  })
  return { core, fired }
}

describe("watchdogSessionID", () => {
  test("extracts session ids from session-scoped events only", () => {
    expect(watchdogSessionID(delta("s1"))).toBe("s1")
    expect(watchdogSessionID(toolProgress("s2"))).toBe("s2")
    expect(watchdogSessionID({ type: "message.updated", properties: { info: { sessionID: "s3" } } })).toBe("s3")
    expect(watchdogSessionID(status("s4", { type: "busy" }))).toBe("s4")
    expect(watchdogSessionID({ type: "permission.asked", properties: { sessionID: "s5" } })).toBe("s5")
  })

  test("excludes server heartbeat and lsp/vcs noise", () => {
    expect(watchdogSessionID({ type: "server.heartbeat", properties: {} })).toBeUndefined()
    expect(watchdogSessionID({ type: "lsp.updated", properties: { sessionID: "s1" } })).toBeUndefined()
    expect(watchdogSessionID({ type: "vcs.updated", properties: { sessionID: "s1" } })).toBeUndefined()
    expect(watchdogSessionID({ type: "installation.updated", properties: { version: "1" } })).toBeUndefined()
  })
})

describe("silent-stall detection", () => {
  test("fires stuck when a busy session is silent past the threshold", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.sweep(STUCK_SILENCE_MS - 1)
    expect(fired.stuck).toHaveLength(0)
    core.sweep(STUCK_SILENCE_MS)
    expect(fired.stuck).toEqual([{ sessionID: "s1", reason: "silent", attempt: undefined }])
    expect(core.stuckFor("s1")?.reason).toBe("silent")
  })

  test("does not fire for idle sessions no matter how silent", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent(DIR, status("s1", { type: "idle" }), 1)
    core.sweep(STUCK_SILENCE_MS * 10)
    expect(fired.stuck).toHaveLength(0)
  })

  test("message deltas reset the silence clock", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent(DIR, delta("s1"), STUCK_SILENCE_MS - 1_000)
    core.sweep(STUCK_SILENCE_MS + 1_000)
    expect(fired.stuck).toHaveLength(0)
    core.sweep(STUCK_SILENCE_MS * 2)
    expect(fired.stuck).toHaveLength(1)
  })

  test("tool progress metadata counts as liveness (long bash is legit)", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    const steps = [1, 2, 3, 4, 5].map((i) => i * 60_000)
    steps.forEach((at) => core.handleEvent(DIR, toolProgress("s1"), at))
    core.sweep(5 * 60_000 + STUCK_SILENCE_MS - 1)
    expect(fired.stuck).toHaveLength(0)
  })

  test("clears stuck on any new session event", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.sweep(STUCK_SILENCE_MS)
    expect(fired.stuck).toHaveLength(1)
    core.handleEvent(DIR, delta("s1"), STUCK_SILENCE_MS + 5_000)
    expect(fired.cleared).toEqual(["s1"])
    expect(core.stuckFor("s1")).toBeUndefined()
  })

  test("clears stuck when the session goes idle", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.sweep(STUCK_SILENCE_MS)
    core.handleEvent(DIR, status("s1", { type: "idle" }), STUCK_SILENCE_MS + 1)
    expect(fired.cleared).toEqual(["s1"])
  })

  test("clears tracking on session.error (engine halts to idle)", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.sweep(STUCK_SILENCE_MS)
    core.handleEvent(
      DIR,
      { type: "session.error", properties: { sessionID: "s1", error: undefined } },
      STUCK_SILENCE_MS,
    )
    expect(fired.cleared).toEqual(["s1"])
    core.sweep(STUCK_SILENCE_MS * 3)
    expect(fired.stuck).toHaveLength(1)
  })

  test("fires only once per stall — no re-notify on later sweeps", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.sweep(STUCK_SILENCE_MS)
    core.sweep(STUCK_SILENCE_MS * 2)
    core.sweep(STUCK_SILENCE_MS * 3)
    expect(fired.stuck).toHaveLength(1)
  })

  test("infers busy from deltas when the busy status event was missed", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, delta("s1"), 0)
    core.sweep(STUCK_SILENCE_MS)
    expect(fired.stuck).toEqual([{ sessionID: "s1", reason: "silent", attempt: undefined }])
  })

  test("tracks multiple sessions independently", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent("/tmp/other", status("s2", { type: "busy" }), 0)
    core.handleEvent("/tmp/other", delta("s2"), STUCK_SILENCE_MS - 1)
    core.sweep(STUCK_SILENCE_MS)
    expect(fired.stuck).toEqual([{ sessionID: "s1", reason: "silent", attempt: undefined }])
    expect(core.stuckFor("s1")?.directory).toBe(DIR)
    expect(core.stuckFor("s2")).toBeUndefined()
  })
})

describe("retry-loop detection", () => {
  test("fires stuck once the retry attempt reaches the threshold", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "retry", attempt: STUCK_RETRY_ATTEMPTS - 1 }), 0)
    expect(fired.stuck).toHaveLength(0)
    core.handleEvent(DIR, status("s1", { type: "retry", attempt: STUCK_RETRY_ATTEMPTS }), 30_000)
    expect(fired.stuck).toEqual([{ sessionID: "s1", reason: "retry", attempt: STUCK_RETRY_ATTEMPTS }])
  })

  test("retry-stuck clears when the session recovers to busy", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "retry", attempt: STUCK_RETRY_ATTEMPTS }), 0)
    expect(fired.stuck).toHaveLength(1)
    core.handleEvent(DIR, status("s1", { type: "busy" }), 1_000)
    expect(fired.cleared).toEqual(["s1"])
  })

  test("periodic retry events below threshold never trip the silence rule", () => {
    const { core, fired } = harness()
    const attempts = [1, 2, 3, 4]
    const last = (attempts.length - 1) * 30_000
    attempts.forEach((attempt, index) =>
      core.handleEvent(DIR, status("s1", { type: "retry", attempt }), index * 30_000),
    )
    core.sweep(last + STUCK_SILENCE_MS - 1)
    expect(fired.stuck).toHaveLength(0)
    // But a retry loop that stops emitting eventually trips the silence rule.
    core.sweep(last + STUCK_SILENCE_MS)
    expect(fired.stuck).toEqual([{ sessionID: "s1", reason: "silent", attempt: undefined }])
  })
})

describe("user-input waits", () => {
  test("a session waiting on a permission is not stuck", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent(DIR, { type: "permission.asked", properties: { sessionID: "s1" } }, 1_000)
    core.sweep(STUCK_SILENCE_MS * 5)
    expect(fired.stuck).toHaveLength(0)
  })

  test("silence resumes counting after the permission is replied", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent(DIR, { type: "permission.asked", properties: { sessionID: "s1" } }, 1_000)
    core.handleEvent(DIR, { type: "permission.replied", properties: { sessionID: "s1" } }, 2_000)
    core.sweep(2_000 + STUCK_SILENCE_MS)
    expect(fired.stuck).toHaveLength(1)
  })

  test("questions behave like permissions", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent(DIR, { type: "question.asked", properties: { sessionID: "s1" } }, 1_000)
    core.sweep(STUCK_SILENCE_MS * 5)
    expect(fired.stuck).toHaveLength(0)
    core.handleEvent(DIR, { type: "question.rejected", properties: { sessionID: "s1" } }, STUCK_SILENCE_MS * 5)
    core.sweep(STUCK_SILENCE_MS * 6)
    expect(fired.stuck).toHaveLength(1)
  })
})

describe("noise immunity", () => {
  test("heartbeat and lsp events neither track nor reset sessions", () => {
    const { core, fired } = harness()
    core.handleEvent(DIR, status("s1", { type: "busy" }), 0)
    core.handleEvent(DIR, { type: "server.heartbeat", properties: {} }, STUCK_SILENCE_MS - 1)
    core.handleEvent(DIR, { type: "lsp.updated", properties: {} }, STUCK_SILENCE_MS - 1)
    core.sweep(STUCK_SILENCE_MS)
    expect(fired.stuck).toHaveLength(1)
  })
})
