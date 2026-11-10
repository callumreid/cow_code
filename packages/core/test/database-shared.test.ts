import { describe, expect, test } from "bun:test"
import { Effect, ManagedRuntime } from "effect"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { sql } from "drizzle-orm"
import { Database } from "../src/database/database"

const service = Effect.gen(function* () {
  return yield* Database.Service
})

describe("Database.sharedLayerFromPath", () => {
  test("separate runtimes share one client, so a write never waits on another client's transaction", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "opencode-shared-db-"))
    const file = path.join(dir, "shared.db")
    const a = ManagedRuntime.make(Database.sharedLayerFromPath(file))
    const b = ManagedRuntime.make(Database.sharedLayerFromPath(file))
    const dbA = await a.runPromise(service)
    const dbB = await b.runPromise(service)
    expect(dbA).toBe(dbB)

    // Hold a transaction open in runtime A while runtime B writes: with two clients this blocked
    // the thread for the busy timeout and then failed with "database is locked".
    await a.runPromise(dbA.db.run(sql`create table if not exists probe (id integer primary key)`))
    const started = Date.now()
    await Promise.all([
      a.runPromise(
        dbA.db.transaction((tx) =>
          Effect.gen(function* () {
            yield* tx.run(sql`insert into probe default values`)
            yield* Effect.sleep("20 millis")
          }),
        ),
      ),
      b.runPromise(Effect.sleep("5 millis").pipe(Effect.andThen(dbB.db.run(sql`insert into probe default values`)))),
    ])
    expect(Date.now() - started).toBeLessThan(2_000)
    const rows = await a.runPromise(dbA.db.all<{ n: number }>(sql`select count(*) as n from probe`))
    expect(rows[0]?.n).toBe(2)
  })

  test("in-memory databases stay separate", async () => {
    const a = await ManagedRuntime.make(Database.sharedLayerFromPath(":memory:")).runPromise(service)
    const b = await ManagedRuntime.make(Database.sharedLayerFromPath(":memory:")).runPromise(service)
    expect(a).not.toBe(b)
  })
})
