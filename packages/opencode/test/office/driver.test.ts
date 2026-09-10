import { expect } from "bun:test"
import { Context, Deferred, Effect, Layer } from "effect"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { OfficeDriver } from "../../src/office/driver"
import { OfficeLedger } from "../../src/office/ledger"
import { Office } from "../../src/office/office"
import { Session } from "../../src/session/session"
import { SessionPrompt } from "../../src/session/prompt"
import { MessageID, PartID } from "../../src/session/schema"
import { InstanceBootstrap } from "../../src/project/bootstrap"
import { InstanceStore } from "../../src/project/instance-store"
import { RuntimeFlags } from "../../src/effect/runtime-flags"
import { pollWithTimeout, testEffect } from "../lib/effect"

class Engine extends Context.Service<Engine, { calls: string[]; release: Deferred.Deferred<void> }>()(
  "TestFarmerEngine",
) {}
const engine = LayerNode.make({
  service: Engine,
  layer: Layer.effect(
    Engine,
    Effect.gen(function* () {
      return { calls: [], release: yield* Deferred.make<void>() }
    }),
  ),
  deps: [],
})
const prompt = LayerNode.make({
  service: SessionPrompt.Service,
  deps: [Session.node, engine],
  layer: Layer.unwrap(
    Effect.gen(function* () {
      const sessions = yield* Session.Service
      const engine = yield* Engine
      return Layer.mock(SessionPrompt.Service)({
        admit: (input) =>
          Effect.gen(function* () {
            const info = yield* sessions.updateMessage({
              id: input.messageID ?? MessageID.ascending(),
              sessionID: input.sessionID,
              role: "user",
              agent: input.agent ?? "farmer",
              model: { providerID: ProviderV2.ID.make("test"), modelID: ModelV2.ID.make("test") },
              time: { created: Date.now() },
            })
            const parts = []
            for (const part of input.parts)
              if (part.type === "text")
                parts.push(
                  yield* sessions.updatePart({
                    ...part,
                    id: part.id ?? PartID.ascending(),
                    sessionID: input.sessionID,
                    messageID: info.id,
                  }),
                )
            return { info, parts }
          }),
        loop: (input) =>
          Effect.gen(function* () {
            const message = (yield* sessions.messages({ sessionID: input.sessionID, limit: 1 }).pipe(Effect.orDie))[0]
            const part = message.parts.find((part) => part.type === "text")
            const text = part?.type === "text" ? part.text : ""
            engine.calls.push(text)
            if (text.startsWith("hold")) yield* Deferred.await(engine.release)
            if (text === "fail") return yield* Effect.die("Controlled provider failure")
            return {
              ...message,
              parts: message.parts.map((part) =>
                part.type === "text" ? { ...part, text: "Reviewed: " + text } : part,
              ),
            }
          }),
      })
    }),
  ),
})
const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      OfficeDriver.node,
      OfficeLedger.node,
      Office.node,
      Session.node,
      SessionProjector.node,
      InstanceStore.node,
      engine,
    ]),
    [
      [SessionPrompt.node, prompt],
      [RuntimeFlags.node, RuntimeFlags.layer({ experimentalWorkspaces: false })],
      [InstanceBootstrap.node, Layer.mock(InstanceBootstrap.Service)({ run: Effect.void })],
    ],
  ),
)

it.instance("new admission and status stay responsive while the Farmer is reasoning", () =>
  Effect.gen(function* () {
    const driver = yield* OfficeDriver.Service
    const engine = yield* Engine
    const first = { id: "first", text: "hold first" }
    expect((yield* driver.request(first)).status).toBe("accepted")
    yield* pollWithTimeout(
      Effect.sync(() => (engine.calls.length === 1 ? true : undefined)),
      "Farmer never started",
    )
    expect((yield* driver.request({ id: "second", text: "next" })).status).toBe("accepted")
    expect((yield* driver.requestStatus("second")).status).toBe("accepted")
    expect((yield* driver.request(first)).status).toBe("processing")
    expect(engine.calls).toEqual(["hold first"])
    yield* Deferred.succeed(engine.release, undefined)
    yield* pollWithTimeout(
      driver
        .requestStatus("second")
        .pipe(Effect.map((receipt) => (receipt.status === "completed" ? receipt : undefined))),
      "second request never finished",
    )
    expect(engine.calls).toEqual(["hold first", "next"])
    const ledger = yield* OfficeLedger.Service
    expect((yield* ledger.list<OfficeDriver.Outcome>("outcome")).map((row) => row.value.requestID)).toEqual([
      "first",
      "second",
    ])
  }),
)

it.instance("rejected empty and expired voice requests retain their exact durable receipts", () =>
  Effect.gen(function* () {
    const driver = yield* OfficeDriver.Service
    const ledger = yield* OfficeLedger.Service
    const engine = yield* Engine
    yield* driver.attention({ clientID: "expired", generation: 2, mode: "paused" })
    for (const input of [
      { id: "empty", text: " " },
      { id: "expired", text: "must not run", source: "voice" as const, clientID: "expired", generation: 1 },
    ]) {
      const receipt = yield* driver.request(input)
      expect(receipt.status).toBe("rejected")
      expect(yield* driver.requestStatus(input.id)).toEqual(receipt)
      expect(yield* driver.request(input)).toEqual(receipt)
      expect((yield* ledger.get("request:" + input.id))?.state).toBe("rejected")
    }
    expect(engine.calls).toEqual([])
  }),
)

it.instance("pause invalidates an admitted voice request before it can reach the Farmer", () =>
  Effect.gen(function* () {
    const driver = yield* OfficeDriver.Service
    const engine = yield* Engine
    yield* driver.request({ id: "hold", text: "hold first" })
    yield* pollWithTimeout(
      Effect.sync(() => (engine.calls.length ? true : undefined)),
      "Farmer never started",
    )
    yield* driver.attention({ clientID: "window", generation: 1, mode: "active" })
    const voice = {
      id: "voice",
      text: "do the next thing",
      clientID: "window",
      generation: 1,
      source: "voice" as const,
    }
    expect((yield* driver.request(voice)).status).toBe("accepted")
    yield* driver.attention({ clientID: "window", generation: 2, mode: "paused" })
    expect((yield* driver.attention({ clientID: "window", generation: 1, mode: "active" })).mode).toBe("paused")
    yield* Deferred.succeed(engine.release, undefined)
    yield* pollWithTimeout(
      driver.requestStatus("voice").pipe(Effect.map((receipt) => (receipt.status === "failed" ? receipt : undefined))),
      "stale voice request did not settle",
    )
    expect(engine.calls).toEqual(["hold first"])
    expect((yield* driver.request({ ...voice, id: "late" })).status).toBe("rejected")
  }),
)

it.instance("failed interpretation remains a failed receipt and has one correlated outcome", () =>
  Effect.gen(function* () {
    const driver = yield* OfficeDriver.Service
    const ledger = yield* OfficeLedger.Service
    yield* driver.request({ id: "failure", text: "fail" })
    yield* pollWithTimeout(
      driver
        .requestStatus("failure")
        .pipe(Effect.map((receipt) => (receipt.status === "failed" ? receipt : undefined))),
      "failure receipt missing",
    )
    const retried = yield* driver.request({ id: "failure", text: "fail" })
    expect(retried.status).toBe("failed")
    expect(retried.reason).toContain("Controlled provider failure")
    yield* pollWithTimeout(
      ledger.get("outcome:failure").pipe(Effect.map((record) => record || undefined)),
      "failure outcome missing",
    )
    expect(yield* ledger.list("outcome")).toHaveLength(1)
    expect((yield* Engine).calls).toEqual(["fail"])
  }),
)

it.instance("a worker changing during interpretation replaces the stale answer with current observations", () =>
  Effect.gen(function* () {
    const driver = yield* OfficeDriver.Service
    const engine = yield* Engine
    const sessions = yield* Session.Service
    const office = yield* Office.Service
    yield* driver.request({ id: "freshness", text: "hold stale answer" })
    yield* pollWithTimeout(
      Effect.sync(() => (engine.calls.length ? true : undefined)),
      "Farmer never started",
    )
    const worker = yield* sessions.create({ title: "New worker" })
    yield* pollWithTimeout(office.thread(worker.id).pipe(Effect.map((thread) => thread || undefined)), "Worker missing")
    yield* Deferred.succeed(engine.release, undefined)
    const receipt = yield* pollWithTimeout(
      driver
        .requestStatus("freshness")
        .pipe(Effect.map((receipt) => (receipt.status === "completed" ? receipt : undefined))),
      "Reply missing",
    )
    expect(receipt.text).toContain("Worker state changed")
    expect(receipt.text).not.toContain("Reviewed:")
    const ledger = yield* OfficeLedger.Service
    expect((yield* ledger.get<OfficeDriver.Outcome>("outcome:freshness"))?.value.observations[0].sessionID).toBe(
      worker.id,
    )
  }),
)
