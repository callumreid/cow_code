import { Database } from "@opencode-ai/core/database/database"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { OfficeEventTable, OfficeRecordTable } from "@opencode-ai/core/office/record.sql"
import { and, asc, desc, eq, gt } from "drizzle-orm"
import { Context, Effect, Layer, Schema } from "effect"
import { randomUUID } from "crypto"

export type Record<T = unknown> = {
  id: string
  kind: string
  state: string
  sessionID?: string
  value: T
  created: number
  updated: number
}

export const Event = Schema.Struct({
  cursor: Schema.Finite,
  id: Schema.String,
  kind: Schema.String,
  sessionID: Schema.optional(Schema.String),
  value: Schema.Unknown,
  time: Schema.Finite,
})
export type Event = typeof Event.Type

type Write<T = unknown> = Pick<Record<T>, "id" | "kind" | "state" | "value" | "sessionID">
type Append = { id?: string; kind: string; sessionID?: string; value: unknown }

export interface Interface {
  get<T = unknown>(id: string): Effect.Effect<Record<T> | undefined>
  list<T = unknown>(kind: string, state?: string): Effect.Effect<Record<T>[]>
  put<T>(input: Write<T>, event?: Append): Effect.Effect<Event | undefined>
  create<T>(input: Write<T>): Effect.Effect<boolean>
  append(input: Append): Effect.Effect<Event>
  replay(after: number, limit?: number): Effect.Effect<Event[]>
  cursor(): Effect.Effect<number>
  acknowledge(input: {
    clientID: string
    eventID: string
    channel: "display" | "spoken" | "navigation"
  }): Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/OfficeLedger") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const database = yield* Database.Service
    const db = database.db

    const get = <T = unknown>(id: string) =>
      db
        .select()
        .from(OfficeRecordTable)
        .where(eq(OfficeRecordTable.id, id))
        .get()
        .pipe(
          Effect.map((row) => row && record<T>(row)),
          Effect.orDie,
        )

    const list = <T = unknown>(kind: string, state?: string) =>
      db
        .select()
        .from(OfficeRecordTable)
        .where(
          and(eq(OfficeRecordTable.kind, kind), state === undefined ? undefined : eq(OfficeRecordTable.state, state)),
        )
        .orderBy(asc(OfficeRecordTable.time_created), asc(OfficeRecordTable.id))
        .all()
        .pipe(
          Effect.map((rows) => rows.map((row) => record<T>(row))),
          Effect.orDie,
        )

    const append = (input: Append) =>
      db
        .insert(OfficeEventTable)
        .values({
          id: input.id ?? randomUUID(),
          kind: input.kind,
          session_id: input.sessionID,
          value: input.value,
          time_created: Date.now(),
        })
        .onConflictDoNothing()
        .returning()
        .get()
        .pipe(
          Effect.flatMap((row) =>
            row
              ? Effect.succeed(event(row))
              : db
                  .select()
                  .from(OfficeEventTable)
                  .where(eq(OfficeEventTable.id, input.id!))
                  .get()
                  .pipe(Effect.map((existing) => event(existing!))),
          ),
          Effect.orDie,
        )

    const put = <T>(input: Write<T>, change?: Append) =>
      db
        .transaction((tx) =>
          Effect.gen(function* () {
            const now = Date.now()
            yield* tx
              .insert(OfficeRecordTable)
              .values({
                id: input.id,
                kind: input.kind,
                state: input.state,
                session_id: input.sessionID,
                value: input.value,
                time_created: now,
                time_updated: now,
              })
              .onConflictDoUpdate({
                target: OfficeRecordTable.id,
                set: { state: input.state, value: input.value, session_id: input.sessionID, time_updated: now },
              })
            if (!change) return undefined
            const row = yield* tx
              .insert(OfficeEventTable)
              .values({
                id: change.id ?? randomUUID(),
                kind: change.kind,
                session_id: change.sessionID,
                value: change.value,
                time_created: now,
              })
              .onConflictDoNothing()
              .returning()
              .get()
            return row ? event(row) : undefined
          }),
        )
        .pipe(Effect.orDie)

    return Service.of({
      get,
      list,
      put,
      append,
      create: <T>(input: Write<T>) =>
        db
          .insert(OfficeRecordTable)
          .values({
            id: input.id,
            kind: input.kind,
            state: input.state,
            session_id: input.sessionID,
            value: input.value,
            time_created: Date.now(),
            time_updated: Date.now(),
          })
          .onConflictDoNothing()
          .returning({ id: OfficeRecordTable.id })
          .get()
          .pipe(
            Effect.map((row) => row !== undefined),
            Effect.orDie,
          ),
      replay: (after, limit = 500) =>
        db
          .select()
          .from(OfficeEventTable)
          .where(gt(OfficeEventTable.cursor, after))
          .orderBy(asc(OfficeEventTable.cursor))
          .limit(Math.max(1, Math.min(limit, 1000)))
          .all()
          .pipe(
            Effect.map((rows) => rows.map(event)),
            Effect.orDie,
          ),
      cursor: () =>
        db
          .select({ cursor: OfficeEventTable.cursor })
          .from(OfficeEventTable)
          .orderBy(desc(OfficeEventTable.cursor))
          .limit(1)
          .get()
          .pipe(
            Effect.map((row) => row?.cursor ?? 0),
            Effect.orDie,
          ),
      acknowledge: (input) =>
        put({
          id: "delivery:" + input.clientID + ":" + input.channel + ":" + input.eventID,
          kind: "delivery",
          state: "acknowledged",
          value: input,
        }).pipe(Effect.asVoid),
    })
  }),
)

function record<T>(row: typeof OfficeRecordTable.$inferSelect): Record<T> {
  return {
    id: row.id,
    kind: row.kind,
    state: row.state,
    value: row.value as T,
    sessionID: row.session_id ?? undefined,
    created: row.time_created,
    updated: row.time_updated,
  }
}

function event(row: typeof OfficeEventTable.$inferSelect): Event {
  return {
    cursor: row.cursor,
    id: row.id,
    kind: row.kind,
    sessionID: row.session_id ?? undefined,
    value: row.value,
    time: row.time_created,
  }
}

export const node = LayerNode.make({ service: Service, layer, deps: [Database.node] })
export * as OfficeLedger from "./ledger"
