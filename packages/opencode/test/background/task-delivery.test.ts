import { expect } from "bun:test"
import { spawnSync } from "node:child_process"
import { Effect, Exit, Layer } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { Database } from "@opencode-ai/core/database/database"
import { EffectFlock } from "@opencode-ai/core/util/effect-flock"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { ModelV2 } from "@opencode-ai/core/model"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { TaskDelivery } from "@/background/task-delivery"
import { OfficeLedger } from "@/office/ledger"
import { Session } from "@/session/session"
import { SessionRecovery } from "@/session/recovery"
import { MessageID, PartID } from "@/session/schema"
import { InstanceStore } from "@/project/instance-store"
import { InstanceBootstrap } from "@/project/bootstrap-service"
import type { TaskPromptOps } from "@/tool/task"
import { testEffect } from "../lib/effect"

const it = testEffect(
  LayerNode.compile(
    LayerNode.group([
      TaskDelivery.node,
      OfficeLedger.node,
      Session.node,
      SessionRecovery.node,
      SessionProjector.node,
      Database.node,
      EffectFlock.node,
      CrossSpawnSpawner.node,
    ]),
    [[InstanceStore.bootstrapNode, Layer.succeed(InstanceBootstrap.Service, { run: Effect.void })]],
  ),
)
const model = { providerID: ProviderV2.ID.make("test"), modelID: ModelV2.ID.make("test") }
const seed = Effect.gen(function* () {
  const sessions = yield* Session.Service
  const parent = yield* sessions.create({ title: "Parent" })
  const child = yield* sessions.create({ parentID: parent.id, title: "Child" })
  return {
    parent,
    child,
    dispatch: {
      parentID: parent.id,
      childID: child.id,
      inputID: MessageID.ascending(),
      directory: parent.directory,
      description: "One independent task",
      agent: "build",
    },
  }
})
function operations(sessions: Session.Interface, calls: { admit: number; resume: number }): TaskPromptOps {
  return {
    cancel: () => Effect.void,
    resolvePromptParts: (text) => Effect.succeed([{ type: "text", text }]),
    prompt: () => Effect.die("Delivery must not redispatch a child"),
    admit: (input) =>
      Effect.gen(function* () {
        calls.admit++
        const info = yield* sessions.updateMessage({
          id: input.messageID!,
          sessionID: input.sessionID,
          role: "user",
          agent: "build",
          model,
          time: { created: Date.now() },
        })
        const parts: SessionV1.Part[] = []
        for (const part of input.parts)
          parts.push(
            yield* sessions.updatePart({
              ...part,
              id: part.id ?? PartID.ascending(),
              messageID: info.id,
              sessionID: input.sessionID,
            }),
          )
        return { info, parts }
      }),
    resume: (input) =>
      Effect.gen(function* () {
        calls.resume++
        const messages = yield* sessions.messages({ sessionID: input.sessionID }).pipe(Effect.orDie)
        const user = messages.findLast((message) => message.info.role === "user")!
        const info: SessionV1.Assistant = {
          id: MessageID.ascending(),
          parentID: user.info.id,
          sessionID: input.sessionID,
          role: "assistant",
          agent: "build",
          mode: "build",
          path: { cwd: "/tmp", root: "/tmp" },
          ...model,
          cost: 0,
          tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
          time: { created: Date.now(), completed: Date.now() },
          finish: "stop",
        }
        yield* sessions.updateMessage(info)
        return { info, parts: [] }
      }),
  }
}
const delivered = (ledger: OfficeLedger.Interface, id: MessageID) =>
  Effect.gen(function* () {
    const stop = Date.now() + 2000
    while (Date.now() < stop) {
      if ((yield* ledger.get("task-delivery:" + id))?.state === "delivered") return
      yield* Effect.sleep("10 millis")
    }
    throw new Error("notification was not delivered")
  })

it.instance("a fresh service reconciles a crash after admission without duplicating the parent message", () =>
  Effect.gen(function* () {
    const sessions = yield* Session.Service
    const ledger = yield* OfficeLedger.Service
    const { parent, dispatch } = yield* seed
    const calls = { admit: 0, resume: 0 }
    const ops = operations(sessions, calls)
    yield* Effect.gen(function* () {
      const delivery = yield* TaskDelivery.Service
      yield* delivery.register(dispatch)
      yield* delivery.activate(dispatch.inputID)
      yield* delivery.complete(dispatch.inputID, "completed", "saved result")
      const exit = yield* delivery
        .deliver(dispatch.inputID, {
          ...ops,
          admit: (input) => ops.admit!(input).pipe(Effect.andThen(Effect.die("interrupted after saving message"))),
        })
        .pipe(Effect.exit)
      expect(Exit.isFailure(exit)).toBe(true)
    }).pipe(Effect.provide(TaskDelivery.layer), Effect.scoped)
    yield* Effect.gen(function* () {
      const delivery = yield* TaskDelivery.Service
      yield* delivery.reconcile(ops)
      yield* delivered(ledger, dispatch.inputID)
      yield* delivery.reconcile(ops)
    }).pipe(Effect.provide(TaskDelivery.layer), Effect.scoped)
    expect(calls).toEqual({ admit: 1, resume: 1 })
    expect(
      (yield* sessions.messages({ sessionID: parent.id })).filter((message) => message.info.role === "user"),
    ).toHaveLength(1)
  }),
)

it.instance("stopped parents receive the result but are not automatically resumed", () =>
  Effect.gen(function* () {
    const sessions = yield* Session.Service
    const recovery = yield* SessionRecovery.Service
    const delivery = yield* TaskDelivery.Service
    const ledger = yield* OfficeLedger.Service
    const { parent, dispatch } = yield* seed
    const calls = { admit: 0, resume: 0 }
    const ops = operations(sessions, calls)
    yield* recovery.start(parent.id, parent.directory, Date.now())
    yield* recovery.update(parent.id, "canceled")
    yield* delivery.register(dispatch)
    yield* delivery.activate(dispatch.inputID)
    yield* delivery.complete(dispatch.inputID, "completed", "Visible while stopped")
    yield* delivery.deliver(dispatch.inputID, ops)
    expect(calls).toEqual({ admit: 1, resume: 0 })
    expect((yield* recovery.get(parent.id))?.state).toBe("canceled")
    expect((yield* ledger.get("task-delivery:" + dispatch.inputID))?.state).toBe("admitted")
    yield* recovery.start(parent.id, parent.directory, Date.now())
    yield* delivery.reconcile(ops)
    yield* delivered(ledger, dispatch.inputID)
    expect(calls).toEqual({ admit: 1, resume: 1 })
  }),
)

it.instance("an unadmitted queued update from a dead owner becomes an explicit error without dispatch", () =>
  Effect.gen(function* () {
    const sessions = yield* Session.Service
    const ledger = yield* OfficeLedger.Service
    const delivery = yield* TaskDelivery.Service
    const { parent, dispatch } = yield* seed
    const calls = { admit: 0, resume: 0 }
    const ops = operations(sessions, calls)
    yield* delivery.register(dispatch)
    yield* delivery.activate(dispatch.inputID)
    const exited = spawnSync(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" })
    expect(exited.status).toBe(0)
    const record = (yield* ledger.get<Record<string, unknown>>("task-delivery:" + dispatch.inputID))!
    yield* ledger.put({ ...record, value: { ...record.value, ownerPID: exited.pid } })
    yield* delivery.reconcile(ops)
    yield* delivered(ledger, dispatch.inputID)
    const messages = yield* sessions.messages({ sessionID: parent.id })
    expect(JSON.stringify(messages)).toContain("interrupted before admission")
    expect(calls).toEqual({ admit: 1, resume: 1 })
  }),
)
