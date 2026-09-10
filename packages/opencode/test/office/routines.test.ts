import { describe, expect, test } from "bun:test"
import { describeCalendar, nextCalendar, withThreads, type Snapshot } from "../../src/office/routines"
import type { Thread } from "../../src/office/office"

// A Wednesday, 16:20 local time.
const wednesday = new Date(2026, 8, 9, 16, 20, 30).getTime()

describe("routines schedule", () => {
  test("describes launchd calendar intervals", () => {
    expect(describeCalendar([{ Minute: 9 }, { Minute: 39 }])).toBe("hourly at :09 and :39")
    expect(describeCalendar([{ Hour: 8, Minute: 0 }])).toBe("daily at 08:00")
    expect(describeCalendar([{ Weekday: 1, Hour: 7, Minute: 30 }])).toBe("Mon 07:30")
  })

  test("finds the next firing minute", () => {
    const next = nextCalendar([{ Minute: 9 }, { Minute: 39 }], wednesday)
    expect(new Date(next!).getHours()).toBe(16)
    expect(new Date(next!).getMinutes()).toBe(39)
  })

  test("skips slots the script itself refuses (hour window, weekdays)", () => {
    const window = { hours: [8, 17] as [number, number], weekdays: true }
    const at = new Date(2026, 8, 9, 17, 50).getTime() // Wed 17:50 → next allowed is Thu 08:09
    const next = new Date(nextCalendar([{ Minute: 9 }, { Minute: 39 }], at, window)!)
    expect(next.getDay()).toBe(4)
    expect(next.getHours()).toBe(8)
    expect(next.getMinutes()).toBe(9)
    const friday = new Date(2026, 8, 11, 17, 50).getTime() // Fri evening → Monday morning
    expect(new Date(nextCalendar([{ Minute: 9 }], friday, window)!).getDay()).toBe(1)
  })
})

function thread(input: Partial<Thread> & { sessionID: string; created: number; updated: number }): Thread {
  return {
    sessionID: input.sessionID,
    directory: "/Users/bronson/coval",
    projectID: "prj",
    title: `routine: pr-review-sweep ${input.created}`,
    routine: "pr-review-sweep",
    bucket: input.bucket ?? "done",
    summary: input.summary ?? "PR review sweep: reviewed 1 PR",
    pinned: false,
    muted: false,
    source: "cow",
    time: { created: input.created, updated: input.updated },
  }
}

describe("routines joined with office threads", () => {
  const base: Snapshot = {
    available: true,
    host: "barn",
    now: wednesday,
    services: [],
    routines: [
      {
        name: "pr-review-sweep",
        label: "dev.coval.pr-review-sweep",
        title: "PR review sweep",
        kind: "llm",
        schedule: "hourly at :09 and :39",
        loaded: true,
        runs: [{ startedAt: wednesday - 3_600_000, endedAt: wednesday - 3_000_000, status: "ok", rc: 0 }],
        last: { startedAt: wednesday - 3_600_000, endedAt: wednesday - 3_000_000, status: "ok", rc: 0 },
        running: { startedAt: wednesday - 120_000, status: "running" },
      },
    ],
  }

  test("attaches the thread each run produced and the live thread's summary", () => {
    const threads = [
      thread({ sessionID: "ses_old", created: wednesday - 3_590_000, updated: wednesday - 3_001_000 }),
      thread({ sessionID: "ses_live", created: wednesday - 100_000, updated: wednesday, bucket: "working", summary: "working: bash" }),
    ]
    const joined = withThreads(base, threads, wednesday)
    const routine = joined.routines[0]
    expect(routine.running?.sessionID).toBe("ses_live")
    expect(routine.running?.summary).toBe("working: bash")
    expect(routine.runs.map((run) => run.sessionID)).toEqual(["ses_old"])
    expect(routine.last?.sessionID).toBe("ses_old")
  })

  test("counts threads without a ledger entry as runs, newest first", () => {
    const threads = [
      thread({ sessionID: "ses_unrecorded", created: wednesday - 7_200_000, updated: wednesday - 6_600_000, bucket: "failed", summary: "rate limited" }),
    ]
    const joined = withThreads(base, threads, wednesday)
    const runs = joined.routines[0].runs
    expect(runs).toHaveLength(2)
    expect(runs[0].status).toBe("ok")
    expect(runs[1]).toMatchObject({ sessionID: "ses_unrecorded", status: "failed", summary: "rate limited" })
  })

  test("leaves the snapshot alone when nothing is scheduled", () => {
    const empty: Snapshot = { available: false, host: "laptop", now: wednesday, routines: [], services: [] }
    expect(withThreads(empty, [], wednesday)).toBe(empty)
  })
})
