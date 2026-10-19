import { Database } from "@opencode-ai/core/database/database"
import { MessageTable } from "@opencode-ai/core/session/sql"
import { and, gte, inArray, lt, sql } from "drizzle-orm"
import { Effect, Schema } from "effect"
import { Session } from "./session"
import { SessionID } from "./schema"
import { budgetLimit, descendants } from "./budget"

export const Input = Schema.Struct({ sessionID: SessionID, start: Schema.Finite, end: Schema.Finite })
export const Total = Schema.Struct({
  amount: Schema.Finite,
  reported: Schema.Finite,
  estimated: Schema.Finite,
  unknown: Schema.Finite,
  turns: Schema.Finite,
})
export const Result = Schema.Struct({
  sessionID: SessionID,
  children: Schema.Finite,
  budget: Schema.optional(Schema.Finite),
  task: Total,
  day: Total,
  providers: Schema.Array(Schema.Struct({ provider: Schema.String, ...Total.fields })),
  updated: Schema.Finite,
})

type Row = { provider: string | null; cost: number | null; status: string | null; completed: number | null }

/** Historical positive costs are estimates. Unpriced/unfinished turns remain unknown, including failed requests. */
export function summarize(rows: readonly Row[]): typeof Total.Type {
  return rows.reduce(
    (total, row) => {
      const amount = typeof row.cost === "number" && Number.isFinite(row.cost) && row.cost >= 0 ? row.cost : 0
      const known = row.status === "reported" || row.status === "estimated" || (row.status === null && amount > 0)
      return {
        amount: total.amount + amount,
        reported: total.reported + (row.status === "reported" ? amount : 0),
        estimated: total.estimated + (row.status !== "reported" ? amount : 0),
        unknown: total.unknown + (!known || !row.completed ? 1 : 0),
        turns: total.turns + 1,
      }
    },
    { amount: 0, reported: 0, estimated: 0, unknown: 0, turns: 0 },
  )
}

export const read = Effect.fn("SessionSpend.read")(function* (input: typeof Input.Type) {
  const sessions = yield* Session.Service
  const db = (yield* Database.Service).db
  const tree = yield* descendants(sessions, input.sessionID)
  const fields = {
    provider: sql<string | null>`json_extract(${MessageTable.data}, '$.providerID')`,
    cost: sql<number | null>`json_extract(${MessageTable.data}, '$.cost')`,
    status: sql<string | null>`json_extract(${MessageTable.data}, '$.costStatus')`,
    completed: sql<number | null>`json_extract(${MessageTable.data}, '$.time.completed')`,
  }
  const assistant = sql`json_extract(${MessageTable.data}, '$.role') = 'assistant'`
  const task = yield* db
    .select(fields)
    .from(MessageTable)
    .where(
      and(
        inArray(
          MessageTable.session_id,
          tree.map((session) => session.id),
        ),
        assistant,
      ),
    )
    .pipe(Effect.orDie)
  const day = yield* db
    .select(fields)
    .from(MessageTable)
    .where(and(gte(MessageTable.time_created, input.start), lt(MessageTable.time_created, input.end), assistant))
    .pipe(Effect.orDie)
  return {
    sessionID: input.sessionID,
    children: tree.length - 1,
    budget: budgetLimit(tree[0].metadata),
    task: summarize(task),
    day: summarize(day),
    providers: [...new Set(day.map((row) => row.provider ?? "unknown"))].sort().map((provider) => ({
      provider,
      ...summarize(day.filter((row) => (row.provider ?? "unknown") === provider)),
    })),
    updated: Date.now(),
  }
})
