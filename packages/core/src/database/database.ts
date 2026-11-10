export * as Database from "./database"

import { EffectDrizzleSqlite } from "@opencode-ai/effect-drizzle-sqlite"
import { layer as sqliteLayer } from "#sqlite"
import { Context, Effect, Layer, Scope } from "effect"
import { Global } from "../global"
import { Flag } from "../flag/flag"
import { isAbsolute, join } from "path"
import { DatabaseMigration } from "./migration"
import { InstallationChannel } from "../installation/version"
import { makeGlobalNode } from "../effect/app-node"

const makeDatabase = EffectDrizzleSqlite.makeWithDefaults()
type DatabaseShape = Effect.Success<typeof makeDatabase>

export interface Interface {
  db: DatabaseShape
}

export class Service extends Context.Service<Service, Interface>()("@opencode/v2/storage/Database") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const db = yield* makeDatabase

    yield* db.run("PRAGMA journal_mode = WAL")
    yield* db.run("PRAGMA synchronous = NORMAL")
    yield* db.run("PRAGMA busy_timeout = 5000")
    yield* db.run("PRAGMA cache_size = -64000")
    yield* db.run("PRAGMA foreign_keys = ON")
    yield* db.run("PRAGMA wal_checkpoint(PASSIVE)")
    yield* DatabaseMigration.apply(db)

    return { db }
  }).pipe(Effect.orDie),
)

export function layerFromPath(filename: string) {
  return layer.pipe(Layer.provide(sqliteLayer({ filename })))
}

const shared = new Map<string, Effect.Effect<Interface>>()

/**
 * One connection for the whole process. The server builds several runtimes from layer nodes (the
 * app runtime and the HTTP server's graph), and each build used to open its own client on the same
 * file. bun:sqlite is synchronous, so a write on one client while another holds a transaction
 * blocks the event loop for the whole busy timeout - and the holder, on the same thread, cannot
 * commit until it returns. On barn (2026-11-10) the two copies of the office collided this way at
 * every boot and the server never answered. A shared client queues transactions on its semaphore
 * instead, without blocking the thread.
 */
export function sharedLayerFromPath(filename: string) {
  if (filename === ":memory:") return layerFromPath(filename)
  return Layer.effect(
    Service,
    Effect.suspend(() => {
      const existing = shared.get(filename)
      if (existing) return existing
      const instance = Effect.runSync(
        Effect.cached(
          Effect.gen(function* () {
            // Lives as long as the process; the OS closes the file on exit.
            const context = yield* Layer.buildWithScope(layerFromPath(filename), Scope.makeUnsafe())
            return Context.get(context, Service)
          }),
        ),
      )
      shared.set(filename, instance)
      return instance
    }),
  )
}

export function path() {
  if (Flag.OPENCODE_DB) {
    if (Flag.OPENCODE_DB === ":memory:" || isAbsolute(Flag.OPENCODE_DB)) return Flag.OPENCODE_DB
    return join(Global.Path.data, Flag.OPENCODE_DB)
  }
  if (
    ["latest", "beta", "prod"].includes(InstallationChannel) ||
    process.env.OPENCODE_DISABLE_CHANNEL_DB === "1" ||
    process.env.OPENCODE_DISABLE_CHANNEL_DB === "true"
  )
    return join(Global.Path.data, "opencode.db")
  return join(Global.Path.data, `opencode-${InstallationChannel.replace(/[^a-zA-Z0-9._-]/g, "-")}.db`)
}

export const node = makeGlobalNode({ service: Service, layer: sharedLayerFromPath(path()), deps: [] })
