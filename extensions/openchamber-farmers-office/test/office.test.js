import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { newDesk, classify, makeInventory } from "../src/desk.js"
import { createOffice } from "../src/office.js"
import { reconcileWaiting } from "../src/reconcile.js"
import { namedCommand } from "../src/commands.js"

const sid = "ses_worker1",
  directory = "/office",
  title = "Fix accounting export"
function packet(type, content = {}, at = 1) {
  return {
    event: {
      type,
      id: "event-" + type + "-" + at,
      session: { id: sid },
      project: { directory },
      at,
      permission: type === "permission-asked" ? { requestId: "per_abcdefghi" } : null,
    },
    content: { type, sessionTitle: title, ...content },
  }
}
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "office-test-"))
  t.after(() => rmSync(dir, { force: true, recursive: true }))
  const desk = newDesk(dir),
    row = { id: sid, title, directory }
  const calls = []
  const sessions = {
    start: async (a) => {
      calls.push(a)
      return { sessionId: sid }
    },
    send: async (...a) => {
      calls.push(a)
      return { sent: true }
    },
    status: async () => ({ status: "idle" }),
    lastReply: async () => ({ reply: "done" }),
    answerPermission: async (...a) => calls.push(a),
  }
  const inventory = { one: async () => row, list: async () => ({ rows: [row], activeCount: 0 }), invalidate() {} }
  const office = createOffice({ desk, inventory, host: { sessions } })
  return { dir, desk, office, calls, sessions, inventory }
}
test("keeps reviews and no-op reports quiet, raises a real decision and a ready-to-test outcome", () => {
  for (const sessionTitle of ["Review PR #12", "routine: pr-review-requests backend#9001", "Daily maintenance"])
    assert.equal(
      classify(packet("turn-failed", { sessionTitle, error: { message: "retry exhausted" } })),
      undefined,
    )
  assert.equal(classify(packet("turn-finished", { reply: "It is not ready to test." })), undefined)
  assert.equal(classify(packet("turn-finished", { reply: "No changes needed. All green." })), undefined)
  assert.equal(classify(packet("turn-finished", { reply: "The export is ready to test." })).kind, "milestone")
  assert.equal(
    classify(packet("question-asked", { ask: { title: "Which reporting timezone?" } })).kind,
    "question",
  )
})
test("persists a single badge across duplicate events and a restart; resumed decisions clear", (t) => {
  const { desk, dir } = fixture(t)
  const p = packet("permission-asked", { action: "Publish", message: "Publish report?" })
  desk.handle(p)
  desk.handle(p)
  assert.equal(desk.attention().length, 1)
  const reopened = newDesk(dir)
  assert.equal(reopened.attention().length, 1)
  reopened.handle(packet("turn-started", {}, 2))
  assert.equal(reopened.attention().length, 0)
  assert.deepEqual(reopened.state.waits, {})
})
test("routine decisions remain reachable in thread details without interrupting", async (t) => {
  const { desk, office } = fixture(t)
  desk.handle(packet("permission-asked", { sessionTitle: "PR review sweep" }))
  assert.equal(desk.attention().length, 0)
  assert.equal((await office.detail(sid)).waits.length, 1)
})
test("hydrates pre-existing waits and respects coverage and dismissal", (t) => {
  const { desk, office } = fixture(t)
  const row = { id: sid, title, directory, activity: "waiting-question" }
  const snapshot = { project: "a", directories: [directory], waiting: [row] }
  reconcileWaiting(desk, snapshot)
  assert.equal(desk.attention().length, 1)
  office.dismiss(desk.attention()[0].id)
  reconcileWaiting(desk, snapshot)
  assert.equal(desk.attention().length, 0)
  reconcileWaiting(desk, { ...snapshot, directories: [], waiting: [] })
  assert.equal(desk.state.cards.length, 1)
  reconcileWaiting(desk, { ...snapshot, waiting: [] })
  assert.equal(desk.state.cards.length, 0)
})
test("includes running sessions outside the first page and supports search paging", async () => {
  const row = { id: sid, title, location: { directory }, time: { updated: 2 } }
  const reads = []
  const inv = makeInventory(async (path) => {
    reads.push(path)
    if (path === "/api/session/active") return { data: { ses_older: { type: "running" } } }
    if (path === "/api/session/ses_older") return { data: { ...row, id: "ses_older" } }
    return { data: [row], cursor: { next: "another" } }
  })
  assert.deepEqual(
    (await inv.list()).rows.map((r) => [r.id, r.running]),
    [
      [sid, false],
      ["ses_older", true],
    ],
  )
  await inv.list("maintenance", "next-page")
  assert.ok(reads.some((p) => p.includes("search=maintenance") && p.includes("cursor=next-page")))
})
test("repeated and concurrent confirmations deliver one instruction and preserve the receipt", async (t) => {
  const { office, desk, calls, dir } = fixture(t)
  const p = await office.toolFor({}, "chat")("prepare", { kind: "steer", id: sid, text: "Check the dates." })
  assert.equal(calls.length, 0)
  const [a, b] = await Promise.all([office.confirm(p.proposal.id, "chat"), office.confirm(p.proposal.id, "voice")])
  assert.deepEqual(a, b)
  assert.equal(calls.length, 1)
  assert.equal(newDesk(dir).state.proposals.length, 0)
  assert.equal(desk.state.receipts["proposal-" + p.proposal.id].result.sessionId, sid)
})
test("an unconfirmed host result is never retried automatically", async (t) => {
  const { office, calls, sessions } = fixture(t)
  sessions.start = async (a) => {
    calls.push(a)
    throw new Error("Transport timeout")
  }
  const input = {
    kind: "dispatch",
    title: "Example",
    text: "Read the example",
    directory,
    projects: [directory],
    requestId: "same-request-98",
  }
  await assert.rejects(office.direct(input), /timeout/)
  await assert.rejects(office.direct(input), /timeout/)
  assert.equal(calls.length, 1)
})
test("steering cannot dismiss a pending permission, and direct answers bind the request to its thread", async (t) => {
  const { office, desk, calls } = fixture(t)
  desk.handle(packet("permission-asked", { action: "read", message: "Read report?" }))
  await assert.rejects(
    office.direct({ kind: "steer", id: sid, text: "Go ahead", requestId: "steer-request-1" }),
    /pending request/,
  )
  assert.equal(calls.length, 0)
  await office.answer({ decision: "allow", requestId: "per_abcdefghi", id: sid })
  assert.equal(calls[0][1], "per_abcdefghi")
  assert.equal(desk.attention().length, 0)
})
test("named instructions match a single real thread and keep the worker prompt intact", async (t) => {
  const { inventory, office, desk } = fixture(t)
  const answer = await namedCommand(
    'Tell the thread named "Fix accounting export" to check February with no changes.',
    {},
    inventory,
    (a) => office.toolFor({}, "chat")("prepare", a),
  )
  assert.match(answer, /check February/)
  assert.equal(desk.state.proposals[0].action.id, sid)
  const dup = {
    list: async () => ({
      rows: [
        { id: sid, title, directory },
        { id: "ses_worker2", title, directory: "/elsewhere" },
      ],
    }),
  }
  assert.match(await namedCommand("Stop " + title, {}, dup, () => assert.fail()), /Which thread/)
})
