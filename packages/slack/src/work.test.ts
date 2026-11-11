import { describe, expect, test } from "bun:test"
import { blockText, messageText, parseOutcome, repeats } from "./work"

describe("parseOutcome", () => {
  test("reads the final status line and strips it", () => {
    expect(parseOutcome("Opened https://github.com/coval-ai/x/pull/1\n\nSTATUS: done")).toEqual({
      status: "done",
      text: "Opened https://github.com/coval-ai/x/pull/1",
    })
  })
  test("tolerates markdown around the line", () => {
    expect(parseOutcome("CI is red.\n**STATUS: failed**")).toEqual({ status: "failed", text: "CI is red." })
    expect(parseOutcome("Merged, deploy pending.\n`STATUS: waiting 20 minutes`")).toEqual({
      status: "waiting",
      text: "Merged, deploy pending.",
      minutes: 20,
    })
  })
  test("clamps the wait and defaults it", () => {
    expect(parseOutcome("x\nSTATUS: waiting 600")).toMatchObject({ status: "waiting", minutes: 60 })
    expect(parseOutcome("x\nSTATUS: waiting")).toMatchObject({ status: "waiting", minutes: 10 })
  })
  test("the last status wins", () => {
    expect(parseOutcome("STATUS: waiting 5\nlater\nSTATUS: done")).toEqual({ status: "done", text: "later" })
  })
  test("a reply with no status line counts as done, an empty one as failed", () => {
    expect(parseOutcome("All set.")).toEqual({ status: "done", text: "All set." })
    expect(parseOutcome("  ").status).toBe("failed")
  })
})

describe("final reply", () => {
  test("a bare STATUS: done has nothing to post", () => {
    expect(parseOutcome("STATUS: done")).toEqual({ status: "done", text: "" })
  })
  test("is a repeat when the session just posted the same links itself", () => {
    const now = 1_000_000
    const said = {
      at: now - 60_000,
      text: "Deployed. PR https://github.com/coval-ai/x/pull/2 run https://app.coval.dev/covi/runs/abc",
    }
    expect(repeats("All done: https://github.com/coval-ai/x/pull/2 merged.", said, now)).toBe(true)
    expect(repeats("Also opened https://github.com/coval-ai/x/pull/3", said, now)).toBe(false)
    expect(repeats("All done, no links.", said, now)).toBe(false)
    expect(repeats("All done: https://github.com/coval-ai/x/pull/2", { ...said, at: now - 11 * 60_000 }, now)).toBe(
      false,
    )
    expect(repeats("All done: https://github.com/coval-ai/x/pull/2", undefined, now)).toBe(false)
  })
})

describe("thread text", () => {
  test("prefers block content over a short fallback and keeps button links", () => {
    const blocks = [
      { type: "header", text: { text: "Sofia daily briefing" } },
      {
        type: "section",
        text: { text: "Agent defers guidance" },
        accessory: { type: "button", text: { text: "View finding" }, url: "https://app.coval.dev/f/1" },
      },
      { type: "context", elements: [{ type: "mrkdwn", text: "Finding ID: 01M71" }] },
    ]
    expect(blockText(blocks)).toBe(
      "Sofia daily briefing\nAgent defers guidance\nView finding (https://app.coval.dev/f/1)\nFinding ID: 01M71",
    )
    expect(messageText({ text: "briefing", blocks })).toContain("Finding ID: 01M71")
  })
  test("falls back to plain text and attachments", () => {
    expect(messageText({ text: "hello", attachments: [{ title: "PR", text: "ready" }] })).toBe("hello\nPR\nready")
  })
})
