import { afterEach, describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { Session as SessionNs } from "@/session/session"
import type { SessionV1 } from "@opencode-ai/core/v1/session"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { MessageID, PartID } from "@/session/schema"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { EventV2Bridge } from "@/event-v2-bridge"
import { InstanceStore } from "@/project/instance-store"
import { InstanceBootstrap } from "@/project/bootstrap"
import { disposeAllInstances } from "../fixture/fixture"
import { testEffect } from "../lib/effect"

afterEach(async () => {
  await disposeAllInstances()
})

const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      SessionNs.node,
      EventV2Bridge.node,
      SessionProjector.node,
      CrossSpawnSpawner.node,
      InstanceStore.node,
    ]),
    [
      [RuntimeFlags.node, RuntimeFlags.layer({ experimentalWorkspaces: false })],
      [
        InstanceBootstrap.node,
        Layer.succeed(InstanceBootstrap.Service, InstanceBootstrap.Service.of({ run: Effect.void })),
      ],
    ],
  ),
)

const seedMessage = (sessionID: string) =>
  Effect.gen(function* () {
    const session = yield* SessionNs.Service
    const messageID = MessageID.ascending()
    yield* session.updateMessage({
      id: messageID,
      sessionID,
      role: "user",
      time: { created: Date.now() },
      agent: "user",
      model: { providerID: "test", modelID: "test" },
      tools: {},
      mode: "",
    } as unknown as SessionV1.Info)
    return messageID
  })

const seedTextPart = (sessionID: string, messageID: string, text: string, extra: Record<string, unknown> = {}) =>
  SessionNs.Service.use((session) =>
    session.updatePart({
      id: PartID.ascending(),
      messageID,
      sessionID,
      type: "text",
      text,
      ...extra,
    } as unknown as SessionV1.Part),
  )

describe("session content search", () => {
  it.instance(
    "search matches message text, not just titles; synthetic and tool payloads excluded",
    () =>
      Effect.gen(function* () {
        const session = yield* SessionNs.Service

        const alpha = yield* session.create({ title: "alpha" })
        const alphaMessage = yield* seedMessage(alpha.id)
        yield* seedTextPart(alpha.id, alphaMessage, "there is a needle in this haystack")

        const named = yield* session.create({ title: "needle in the title" })

        const ghost = yield* session.create({ title: "ghost" })
        const ghostMessage = yield* seedMessage(ghost.id)
        yield* seedTextPart(ghost.id, ghostMessage, "synthetic needle should not match", { synthetic: true })

        const toolish = yield* session.create({ title: "toolish" })
        const toolishMessage = yield* seedMessage(toolish.id)
        yield* SessionNs.Service.use((svc) =>
          svc.updatePart({
            id: PartID.ascending(),
            messageID: toolishMessage,
            sessionID: toolish.id,
            type: "tool",
            callID: "call_1",
            tool: "bash",
            state: { status: "completed", input: {}, output: "tool output with needle", title: "", metadata: {}, time: { start: 1, end: 2 } },
          } as unknown as SessionV1.Part),
        )

        const byContent = yield* session.list({ search: "haystack" })
        expect(byContent.map((row) => row.id)).toEqual([alpha.id])

        const both = yield* session.list({ search: "needle" })
        const ids = new Set(both.map((row) => row.id))
        expect(ids.has(alpha.id)).toBe(true)
        expect(ids.has(named.id)).toBe(true)
        expect(ids.has(ghost.id)).toBe(false)
        expect(ids.has(toolish.id)).toBe(false)

        // ASCII case-insensitive, matching existing title-search behavior.
        const upper = yield* session.list({ search: "HAYSTACK" })
        expect(upper.map((row) => row.id)).toEqual([alpha.id])

        for (const id of [alpha.id, named.id, ghost.id, toolish.id]) yield* session.remove(id)
      }),
    { git: true, timeout: 30000 },
  )
})
