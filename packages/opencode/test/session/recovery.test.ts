import { Database } from "@opencode-ai/core/database/database"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { expect } from "bun:test"
import { spawnSync } from "node:child_process"
import { Effect } from "effect"
import path from "path"
import { SessionRecovery } from "../../src/session/recovery"
import { SessionID } from "../../src/session/schema"
import { tmpdirScoped } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
const it = testEffect(LayerNode.compile(CrossSpawnSpawner.node))
it.live("reopens recovery checkpoints with original deadline and excludes canceled work", () =>
  Effect.gen(function* () {
    const tmp = yield* tmpdirScoped()
    const file = path.join(tmp, "recovery.db")
    const open = () => LayerNode.compile(SessionRecovery.node, [[Database.node, Database.layerFromPath(file)]])
    const id = SessionID.make("session-recovery-test")
    const deadline = yield* Effect.gen(function* () {
      const recovery = yield* SessionRecovery.Service
      yield* recovery.start(id, tmp, Date.now())
      yield* recovery.update(id, "retrying", { attempt: 4, next: Date.now() + 1000 })
      return (yield* recovery.pending())[0]!.value.deadline
    }).pipe(Effect.provide(open()), Effect.scoped)
    yield* Effect.gen(function* () {
      const recovery = yield* SessionRecovery.Service
      const saved = (yield* recovery.pending())[0]!
      expect(saved.value.attempt).toBe(4)
      yield* recovery.start(id, tmp, Date.now())
      expect((yield* recovery.pending())[0]!.value.deadline).toBe(deadline)
      yield* recovery.update(id, "canceled")
      yield* recovery.update(id, "completed")
      expect((yield* recovery.get(id))?.state).toBe("canceled")
    }).pipe(Effect.provide(open()), Effect.scoped)
    yield* Effect.gen(function* () {
      const recovery = yield* SessionRecovery.Service
      expect(yield* recovery.pending()).toEqual([])
    }).pipe(Effect.provide(open()), Effect.scoped)
  }),
)

it.live("only one recovering server claims a dead owner and never steals a live task", () =>
  Effect.gen(function* () {
    const tmp = yield* tmpdirScoped()
    const layer = LayerNode.compile(SessionRecovery.node, [
      [Database.node, Database.layerFromPath(path.join(tmp, "claim.db"))],
    ])
    yield* Effect.gen(function* () {
      const recovery = yield* SessionRecovery.Service
      const id = SessionID.make("session-claim-test")
      yield* recovery.start(id, tmp, Date.now())
      expect(yield* recovery.claim(id)).toBeUndefined()
      const child = spawnSync(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" })
      expect(child.status).toBe(0)
      yield* recovery.update(id, "running", { ownerPID: child.pid })
      const claims = yield* Effect.all([recovery.claim(id), recovery.claim(id)], { concurrency: 2 })
      expect(claims.filter(Boolean)).toHaveLength(1)
      expect((yield* recovery.get(id))?.value.ownerPID).toBe(process.pid)
      yield* recovery.update(id, "blocked")
      expect(yield* recovery.claim(id)).toBeUndefined()
    }).pipe(Effect.provide(layer), Effect.scoped)
  }),
)
