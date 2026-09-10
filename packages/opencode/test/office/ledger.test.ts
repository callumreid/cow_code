import { Database } from "@opencode-ai/core/database/database"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { expect } from "bun:test"
import { Effect } from "effect"
import path from "path"
import { OfficeLedger } from "../../src/office/ledger"
import { tmpdirScoped } from "../fixture/fixture"
import { testEffect } from "../lib/effect"

const it = testEffect(LayerNode.compile(CrossSpawnSpawner.node))

it.live("retains accepted commands, pending decisions and replay after reopening the database", () =>
  Effect.gen(function* () {
    const tmp = yield* tmpdirScoped()
    const filename = path.join(tmp, "office.db")
    const open = () => LayerNode.compile(OfficeLedger.node, [[Database.node, Database.layerFromPath(filename)]])
    const cursor = yield* Effect.gen(function* () {
      const ledger = yield* OfficeLedger.Service
      expect(
        yield* ledger.create({
          id: "command:one",
          kind: "command",
          state: "accepted",
          value: { text: "keep the objective", inputID: "input:one" },
        }),
      ).toBe(true)
      expect(
        yield* ledger.create({
          id: "command:one",
          kind: "command",
          state: "accepted",
          value: { text: "replacement" },
        }),
      ).toBe(false)
      const change = yield* ledger.put(
        {
          id: "decision:one",
          kind: "decision",
          state: "pending",
          sessionID: "worker",
          value: { requestID: "one" },
        },
        { id: "event:one", kind: "decision", sessionID: "worker", value: { requestID: "one" } },
      )
      return change!.cursor
    }).pipe(Effect.provide(open()), Effect.scoped)

    yield* Effect.gen(function* () {
      const ledger = yield* OfficeLedger.Service
      expect((yield* ledger.get<{ text: string }>("command:one"))?.value.text).toBe("keep the objective")
      expect(yield* ledger.list("decision", "pending")).toHaveLength(1)
      expect((yield* ledger.replay(0)).map((event) => event.id)).toEqual(["event:one"])
      expect(yield* ledger.replay(cursor)).toEqual([])
      yield* ledger.acknowledge({ clientID: "window:one", eventID: "event:one", channel: "spoken" })
    }).pipe(Effect.provide(open()), Effect.scoped)

    yield* Effect.gen(function* () {
      const ledger = yield* OfficeLedger.Service
      expect(yield* ledger.list("delivery")).toHaveLength(1)
      expect(yield* ledger.list("decision", "pending")).toHaveLength(1)
    }).pipe(Effect.provide(open()), Effect.scoped)
  }),
)

it.live("deduplicates events and keeps replay cursors ordered", () =>
  Effect.gen(function* () {
    const ledger = yield* OfficeLedger.Service
    const first = yield* ledger.append({ id: "same", kind: "outcome", value: { reason: "failed" } })
    const duplicate = yield* ledger.append({ id: "same", kind: "outcome", value: { reason: "failed" } })
    const next = yield* ledger.append({ id: "next", kind: "outcome", value: { reason: "canceled" } })
    expect(duplicate.cursor).toBe(first.cursor)
    expect(next.cursor).toBeGreaterThan(first.cursor)
    expect((yield* ledger.replay(first.cursor)).map((item) => item.id)).toEqual(["next"])
  }).pipe(Effect.provide(LayerNode.compile(OfficeLedger.node))),
)
