import { expect } from "bun:test"
import { Effect, Layer } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { EventV2Bridge } from "@/event-v2-bridge"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Provider } from "@/provider/provider"
import { Session } from "@/session/session"
import { SessionProcessor } from "@/session/processor"
import { SessionStatus } from "@/session/status"
import { SessionSummary } from "@/session/summary"
import { MessageID, PartID } from "@/session/schema"
import { provideTmpdirServer } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
import { TestLLMServer } from "../lib/llm-server"
import { testProviderConfig } from "../lib/test-provider"

const it = testEffect(
  LayerNode.compile(
    LayerNode.group([
      SessionProcessor.node,
      Session.node,
      SessionProjector.node,
      Provider.node,
      EventV2Bridge.node,
      SessionStatus.node,
      CrossSpawnSpawner.node,
      LayerNode.make({ service: TestLLMServer, layer: TestLLMServer.layer, deps: [] }),
    ]),
    [
      [RuntimeFlags.node, RuntimeFlags.layer({ experimentalEventSystem: true })],
      [
        SessionSummary.node,
        Layer.succeed(
          SessionSummary.Service,
          SessionSummary.Service.of({
            summarize: () => Effect.void,
            diff: () => Effect.succeed([]),
            computeDiff: () => Effect.succeed([]),
          }),
        ),
      ],
    ],
  ),
)

for (const scenario of ["initial", "lowered during retry", "sibling spend during retry"] as const) {
  it.live(`processor rechecks ancestor budget: ${scenario}`, () =>
    provideTmpdirServer(
      ({ dir, llm }) =>
        Effect.gen(function* () {
          const sessions = yield* Session.Service
          const processors = yield* SessionProcessor.Service
          const provider = yield* Provider.Service
          const events = yield* EventV2Bridge.Service
          const root = yield* sessions.create({ metadata: { costBudgetUsd: scenario === "initial" ? 0 : 5 } })
          const child = yield* sessions.create({ parentID: root.id })
          const sibling = yield* sessions.create({ parentID: root.id })
          const model = yield* provider.getModel(ProviderV2.ID.make("test"), ModelV2.ID.make("test-model"))
          const user = yield* sessions.updateMessage({
            id: MessageID.ascending(),
            role: "user",
            sessionID: child.id,
            agent: "build",
            model: { providerID: model.providerID, modelID: model.id },
            time: { created: Date.now() },
          })
          const message: SessionV1.Assistant = {
            id: MessageID.ascending(),
            role: "assistant",
            sessionID: child.id,
            parentID: user.id,
            agent: "build",
            mode: "build",
            path: { cwd: dir, root: dir },
            cost: 0,
            tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
            modelID: model.id,
            providerID: model.providerID,
            time: { created: Date.now() },
          }
          yield* sessions.updateMessage(message)
          yield* llm.error(503, { error: "temporarily unavailable" })
          yield* llm.text("should not spend again")
          const off = yield* events.listen((event) => {
            if (event.type !== SessionStatus.Event.Status.type) return Effect.void
            const data = event.data as typeof SessionStatus.Event.Status.data.Type
            if (data.sessionID !== child.id || data.status.type !== "retry") return Effect.void
            if (scenario === "lowered during retry")
              return sessions.setMetadata({ sessionID: root.id, metadata: { costBudgetUsd: 0 } })
            return Effect.gen(function* () {
              const other = {
                ...message,
                id: MessageID.ascending(),
                sessionID: sibling.id,
                cost: 5,
                costStatus: "reported" as const,
              }
              yield* sessions.updateMessage(other)
              yield* sessions.updatePart({
                id: PartID.ascending(),
                messageID: other.id,
                sessionID: sibling.id,
                type: "step-finish",
                reason: "stop",
                cost: 5,
                tokens: other.tokens,
              })
            })
          })
          const handle = yield* processors.create({ assistantMessage: message, sessionID: child.id, model })
          expect(
            yield* handle.process({
              user,
              sessionID: child.id,
              model,
              agent: { name: "build", mode: "primary", options: {}, permission: [] },
              system: [],
              messages: [{ role: "user", content: "hello" }],
              tools: {},
            }),
          ).toBe("stop")
          yield* off
          expect(yield* llm.calls).toBe(scenario === "initial" ? 0 : 1)
          expect(handle.message.error).toMatchObject({
            data: { message: expect.stringContaining("Task budget reached") },
          })
          expect(handle.message.time.completed).toBeDefined()
          if (scenario === "initial") expect(handle.message.costStatus).toBe("reported")
          else expect(handle.message.costStatus).toBeUndefined()
        }),
      { config: testProviderConfig },
    ),
  )
}
