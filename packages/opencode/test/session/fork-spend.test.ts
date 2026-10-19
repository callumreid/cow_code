import { expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Database } from "@opencode-ai/core/database/database"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { EventV2Bridge } from "@/event-v2-bridge"
import { InstanceStore } from "@/project/instance-store"
import { InstanceBootstrap } from "@/project/bootstrap"
import { Session } from "@/session/session"
import { MessageID, PartID } from "@/session/schema"
import { checkBudget } from "@/session/budget"
import { read } from "@/session/spend"
import { testEffect } from "../lib/effect"

const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      Session.node,
      Database.node,
      EventV2Bridge.node,
      SessionProjector.node,
      CrossSpawnSpawner.node,
      InstanceStore.node,
    ]),
    [
      [
        InstanceBootstrap.node,
        Layer.succeed(InstanceBootstrap.Service, InstanceBootstrap.Service.of({ run: Effect.void })),
      ],
    ],
  ),
)

it.instance("forked history preserves context without duplicating recorded spend or consuming the new budget", () =>
  Effect.gen(function* () {
    const sessions = yield* Session.Service
    const root = yield* sessions.create({ metadata: { costBudgetUsd: 5 } })
    const model = { providerID: ProviderV2.ID.make("fork-accounting"), modelID: ModelV2.ID.make("test-model") }
    const now = Date.now()
    const user = yield* sessions.updateMessage({
      id: MessageID.ascending(),
      sessionID: root.id,
      role: "user",
      agent: "build",
      model,
      time: { created: now },
    })
    const assistant = yield* sessions.updateMessage({
      id: MessageID.ascending(),
      sessionID: root.id,
      role: "assistant",
      parentID: user.id,
      mode: "build",
      agent: "build",
      path: { root: root.directory, cwd: root.directory },
      providerID: model.providerID,
      modelID: model.modelID,
      cost: 5,
      costStatus: "reported",
      finish: "stop",
      tokens: { input: 10, output: 4, reasoning: 0, cache: { read: 0, write: 0 } },
      time: { created: now, completed: now + 1 },
    })
    yield* sessions.updatePart({
      id: PartID.ascending(),
      sessionID: root.id,
      messageID: assistant.id,
      type: "text",
      text: "original reply",
    })
    yield* sessions.updatePart({
      id: PartID.ascending(),
      sessionID: root.id,
      messageID: assistant.id,
      type: "step-finish",
      reason: "stop",
      cost: 5,
      tokens: assistant.tokens,
    })
    const before = yield* read({ sessionID: root.id, start: now - 1000, end: now + 1000 })
    const fork = yield* sessions.fork({ sessionID: root.id })
    const after = yield* read({ sessionID: fork.id, start: now - 1000, end: now + 1000 })
    expect(before.task.amount).toBe(5)
    expect(after.day.amount).toBe(before.day.amount)
    expect(after.task.amount).toBe(0)
    expect(after.task.unknown).toBe(0)
    expect((yield* sessions.get(fork.id)).cost).toBe(0)
    expect(yield* checkBudget(sessions, fork.id)).toBeUndefined()
    expect(yield* checkBudget(sessions, root.id)).toMatchObject({ blocked: true, spent: 5 })
    const cloned = (yield* sessions.messages({ sessionID: fork.id })).find(
      (message) => message.info.role === "assistant",
    )!
    expect(cloned.info).toMatchObject({ cost: 0, costStatus: "reported", tokens: assistant.tokens })
    expect(cloned.parts.some((part) => part.type === "text" && part.text === "original reply")).toBe(true)
    expect(cloned.parts.find((part) => part.type === "step-finish")).toMatchObject({
      cost: 0,
      tokens: assistant.tokens,
    })
  }),
)
