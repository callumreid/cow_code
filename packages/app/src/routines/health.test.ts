import { expect, test } from "bun:test"
import { lastVerified, routineHealth } from "./health"
import type { Routine } from "./types"
const now = 2_000_000
const routine: Routine = {
  name: "test",
  title: "Test",
  label: "test",
  kind: "llm",
  schedule: "daily",
  loaded: true,
  runs: [],
}
test("missing calendar receipts require attention only after a grace period", () => {
  expect(routineHealth({ ...routine, previousRunAt: now - 30_000 }, now)).toBe("unknown")
  expect(routineHealth({ ...routine, previousRunAt: now - 180_000 }, now)).toBe("missed")
  expect(
    routineHealth(
      { ...routine, previousRunAt: now - 180_000, runs: [{ startedAt: now - 180_000, status: "skipped" }] },
      now,
    ),
  ).toBe("unknown")
})
test("waiting and stalled runs stay distinct and require actual progress evidence", () => {
  expect(routineHealth({ ...routine, running: { startedAt: 1, status: "running" } }, now)).toBe("running")
  expect(routineHealth({ ...routine, running: { startedAt: 1, status: "running", lastProgressAt: 1 } }, now)).toBe(
    "stalled",
  )
  expect(routineHealth({ ...routine, running: { startedAt: 1, status: "waiting", lastProgressAt: 1 } }, now)).toBe(
    "waiting",
  )
})
test("process success and a reported outcome never become verified success", () => {
  const reported = { startedAt: now, status: "ok" as const, outcome: "reported" as const }
  const verified = { startedAt: now - 100, status: "ok" as const, outcome: "verified" as const }
  expect(routineHealth({ ...routine, last: reported }, now)).toBe("unverified")
  expect(lastVerified({ ...routine, last: reported, runs: [reported, verified] })).toEqual(verified)
})
