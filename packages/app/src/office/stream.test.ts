import { describe, expect, test } from "bun:test"
import type { Message, Part } from "@opencode-ai/sdk/v2/client"
import {
  buildStream,
  isLive,
  latestOfKind,
  messageItems,
  nextNeedsYou,
  toolLabel,
  unreadReports,
  withDivider,
} from "./stream"
import type { OfficeReport, OfficeThread } from "./types"

function message(id: string, role: "user" | "assistant", created: number) {
  return { id, role, sessionID: "ses", time: { created } } as unknown as Message
}

function text(id: string, value: string, extra: Record<string, unknown> = {}) {
  return { id, type: "text", text: value, sessionID: "ses", messageID: "", ...extra } as unknown as Part
}

function tool(id: string, name: string, title?: string) {
  return {
    id,
    type: "tool",
    tool: name,
    callID: id,
    sessionID: "ses",
    messageID: "",
    state: { status: "completed", title, input: {}, output: "", metadata: {}, time: { start: 0, end: 0 } },
  } as unknown as Part
}

function report(id: string, time: number, kind: OfficeReport["kind"], sessionID = "thread"): OfficeReport {
  return { id, time, sessionID, directory: "/tmp/x", kind, title: "t", summary: "s" }
}

function thread(waiting: OfficeThread["waiting"]): OfficeThread {
  return {
    sessionID: "thread",
    directory: "/tmp/x",
    projectID: "p",
    title: "t",
    bucket: waiting ? "needs_you" : "working",
    waiting,
    summary: "s",
    pinned: false,
    muted: false,
    source: "cow",
    time: { created: 1, updated: 1 },
  }
}

describe("messageItems", () => {
  test("drops synthetic user parts and collapses tool runs across messages", () => {
    const messages = [message("m1", "user", 10), message("m2", "assistant", 20), message("m3", "assistant", 30)]
    const parts: Record<string, Part[]> = {
      m1: [text("p1", "<office_reports>…</office_reports>", { synthetic: true })],
      m2: [text("p2", "On it."), tool("p3", "office_read", "yelp retry"), tool("p4", "office_prompt")],
      m3: [tool("p5", "office_answer"), text("p6", "Done.")],
    }
    const items = messageItems(messages, (id) => parts[id] ?? [])
    expect(items.map((item) => item.kind)).toEqual(["text", "tools", "text"])
    const run = items[1]
    if (run.kind !== "tools") throw new Error("expected a tool run")
    expect(run.parts.map((part) => part.tool)).toEqual(["office_read", "office_prompt", "office_answer"])
    expect(toolLabel(run.parts)).toBe("3 actions")
    expect(toolLabel(run.parts.slice(0, 1))).toBe("office_read → yelp retry")
  })

  test("keeps a real user message as a bubble", () => {
    const items = messageItems([message("m1", "user", 10)], () => [text("p1", "  what is going on?  ")])
    expect(items).toEqual([{ kind: "user", id: "m1", time: 10, text: "what is going on?" }])
  })
})

describe("buildStream", () => {
  test("interleaves cards by time and puts the divider at lastSeen", () => {
    const rows = buildStream({
      messages: [message("m1", "user", 10), message("m2", "assistant", 40)],
      parts: (id) => (id === "m1" ? [text("p1", "hi")] : [text("p2", "hello")]),
      reports: [report("r1", 20, "finished"), report("r2", 50, "error")],
      lastSeen: 30,
    })
    expect(rows.map((row) => row.id)).toEqual(["m1", "r1", "divider", "p2", "r2"])
  })

  test("skips the divider when everything is new or lastSeen is unset", () => {
    const items = buildStream({ messages: [], parts: () => [], reports: [report("r1", 20, "pr")], lastSeen: 0 })
    expect(items.map((row) => row.id)).toEqual(["r1"])
    expect(
      withDivider(
        items.filter((row) => row.kind !== "divider"),
        5,
      ).map((row) => row.id),
    ).toEqual(["r1"])
  })

  test("puts the divider last when nothing is new", () => {
    const rows = buildStream({ messages: [], parts: () => [], reports: [report("r1", 20, "pr")], lastSeen: 30 })
    expect(rows.map((row) => row.id)).toEqual(["r1", "divider"])
  })
})

describe("unread and liveness", () => {
  const reports = [
    report("r1", 10, "permission"),
    report("r2", 20, "auto_allowed"),
    report("r3", 30, "permission"),
    report("r4", 40, "question", "other"),
  ]

  test("unread excludes auto_allowed", () => {
    expect(unreadReports(reports, 15).map((report) => report.id)).toEqual(["r3", "r4"])
  })

  test("only the newest report of a kind can be live, and only while the thread waits", () => {
    const latest = latestOfKind(reports)
    const waiting = thread({
      kind: "permission",
      id: "perm",
      permission: "bash",
      patterns: ["git push"],
      always: [],
      metadata: {},
      tier: "callum",
    })
    expect(isLive(reports[0], waiting, latest)).toBe(false)
    expect(isLive(reports[2], waiting, latest)).toBe(true)
    expect(isLive(reports[2], thread(undefined), latest)).toBe(false)
    expect(isLive(reports[2], undefined, latest)).toBe(false)
  })

  test("nextNeedsYou walks live cards in order and wraps", () => {
    const latest = latestOfKind(reports)
    const threads: Record<string, OfficeThread> = {
      thread: thread({ kind: "permission", id: "perm", permission: "bash", patterns: [], always: [], metadata: {} }),
      other: { ...thread({ kind: "question", id: "q", questions: [] }), sessionID: "other" },
    }
    const lookup = (id: string) => threads[id]
    expect(nextNeedsYou(reports, lookup, latest, undefined)?.id).toBe("r3")
    expect(nextNeedsYou(reports, lookup, latest, "r3")?.id).toBe("r4")
    expect(nextNeedsYou(reports, lookup, latest, "r4")?.id).toBe("r3")
    expect(nextNeedsYou(reports, () => undefined, latest, undefined)).toBeUndefined()
  })
})
