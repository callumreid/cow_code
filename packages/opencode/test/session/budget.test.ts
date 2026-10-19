import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { budgetLimit, checkBudget } from "../../src/session/budget"
import { summarize } from "../../src/session/spend"
import { Session } from "../../src/session/session"
import { Database } from "@opencode-ai/core/database/database"
import { read } from "../../src/session/spend"
import { sql } from "drizzle-orm"
import { SessionID } from "../../src/session/schema"

describe("task budget", () => {
  const root = SessionID.make("ses_root")
  const child = SessionID.make("ses_child")
  const grandchild = SessionID.make("ses_grandchild")
  const other = SessionID.make("ses_other")
  const entries = [
    { id: root, cost: 1, metadata: { costBudgetUsd: 5 } },
    { id: child, parentID: root, cost: 2 },
    { id: grandchild, parentID: child, cost: 2 },
    { id: other, cost: 100 },
  ] as Session.Info[]
  const sessions = {
    get: (id: SessionID) => Effect.succeed(entries.find((entry) => entry.id === id)!),
    children: (id: SessionID) => Effect.succeed(entries.filter((entry) => entry.parentID === id)),
  }
  test("blocks a child once the ancestor tree reaches its limit, excluding unrelated tasks", async () => {
    expect(await Effect.runPromise(checkBudget(sessions, grandchild))).toEqual({
      rootID: root,
      limit: 5,
      spent: 5,
      blocked: true,
    })
    expect(await Effect.runPromise(checkBudget(sessions, other))).toBeUndefined()
  })
  test("validates persisted limits and permits an explicit zero", () => {
    expect(budgetLimit({ costBudgetUsd: 0 })).toBe(0)
    expect(budgetLimit({ costBudgetUsd: -1 })).toBeUndefined()
    expect(budgetLimit({ costBudgetUsd: NaN })).toBeUndefined()
    expect(budgetLimit({ costBudgetUsd: "5" })).toBeUndefined()
  })
})

test("spend retains unknown turns instead of reporting missing accounting as free", () => {
  expect(
    summarize([
      { provider: "openrouter", cost: 2, status: "reported", completed: 1 },
      { provider: "anthropic", cost: 1, status: "estimated", completed: 1 },
      { provider: "legacy", cost: 0.5, status: null, completed: 1 },
      { provider: "missing", cost: 0, status: "unknown", completed: 1 },
      { provider: "failed", cost: 0, status: null, completed: null },
    ]),
  ).toEqual({ amount: 3.5, reported: 2, estimated: 1.5, unknown: 2, turns: 5 })
})

test("spend query reads real persisted usage, includes descendants and isolates the requested day", async () => {
  const root = SessionID.make("ses_spend_root")
  const child = SessionID.make("ses_spend_child")
  const sessions = [
    { id: root, metadata: { costBudgetUsd: 5 }, cost: 1 },
    { id: child, parentID: root, cost: 2 },
  ] as Session.Info[]
  await Effect.runPromise(
    Effect.gen(function* () {
      const db = (yield* Database.Service).db
      yield* db.run("INSERT INTO project(id,worktree,sandboxes,time_created,time_updated) VALUES ('p','/tmp','[]',0,0)")
      for (const entry of sessions)
        yield* db.run(
          sql`INSERT INTO session(id,project_id,parent_id,slug,directory,title,version,time_created,time_updated) VALUES (${entry.id},'p',${entry.parentID ?? null},'s','/tmp','task','test',0,0)`,
        )
      for (const entry of [
        { id: "msg_today", session: root, created: 100, cost: 1, provider: "openrouter" },
        { id: "msg_child", session: child, created: 101, cost: 2, provider: "anthropic" },
        { id: "msg_yesterday", session: root, created: 1, cost: 3, provider: "openrouter" },
      ])
        yield* db.run(
          sql`INSERT INTO message(id,session_id,time_created,time_updated,data) VALUES (${entry.id},${entry.session},${entry.created},${entry.created},${JSON.stringify({ role: "assistant", providerID: entry.provider, cost: entry.cost, costStatus: "estimated", time: { completed: 150 } })})`,
        )
      const result = yield* read({ sessionID: root, start: 100, end: 200 })
      expect(result.task.amount).toBe(6)
      expect(result.day.amount).toBe(3)
      expect(result.children).toBe(1)
      expect(result.budget).toBe(5)
      expect(result.providers.map((provider) => [provider.provider, provider.amount])).toEqual([
        ["anthropic", 2],
        ["openrouter", 1],
      ])
    }).pipe(
      Effect.provideService(Session.Service, {
        get: (id: SessionID) => Effect.succeed(sessions.find((session) => session.id === id)!),
        children: (id: SessionID) => Effect.succeed(sessions.filter((session) => session.parentID === id)),
      } as unknown as Session.Interface),
      Effect.provide(Database.layerFromPath(":memory:")),
    ),
  )
})
