import { expect } from "bun:test"
import { Effect, Layer, Fiber } from "effect"
import { Permission } from "../../src/permission"
import { PermissionV1 } from "@opencode-ai/core/v1/permission"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { OfficeControl } from "../../src/office/control"
import { OfficeLedger } from "../../src/office/ledger"
import { Office } from "../../src/office/office"
import { Session } from "../../src/session/session"
import { SessionStatus } from "../../src/session/status"
import { SessionID, MessageID, PartID } from "../../src/session/schema"
import { InstanceBootstrap } from "../../src/project/bootstrap"
import { InstanceStore } from "../../src/project/instance-store"
import { RuntimeFlags } from "../../src/effect/runtime-flags"
import { EventV2Bridge } from "../../src/event-v2-bridge"
import type { TaskPromptOps } from "../../src/tool/task"
import { TestInstance } from "../fixture/fixture"
import { pollWithTimeout, testEffect } from "../lib/effect"

const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      OfficeControl.node,
      Office.node,
      OfficeLedger.node,
      Session.node,
      SessionProjector.node,
      SessionStatus.node,
      EventV2Bridge.node,
      InstanceStore.node,
      Permission.node,
    ]),
    [
      [RuntimeFlags.node, RuntimeFlags.layer({ experimentalWorkspaces: false })],
      [InstanceBootstrap.node, Layer.mock(InstanceBootstrap.Service)({ run: Effect.void })],
    ],
  ),
)
const model = { providerID: ProviderV2.ID.make("test"), modelID: ModelV2.ID.make("test-model") }
const harness = Effect.gen(function* () {
  const sessions = yield* Session.Service
  const status = yield* SessionStatus.Service
  const office = yield* Office.Service
  const control = yield* OfficeControl.Service
  const ledger = yield* OfficeLedger.Service
  const instance = yield* TestInstance
  const admitted: string[] = []
  const resumed: string[] = []
  const admit: NonNullable<TaskPromptOps["admit"]> = (input) =>
    Effect.gen(function* () {
      const info = yield* sessions.updateMessage({
        id: input.messageID ?? MessageID.ascending(),
        sessionID: input.sessionID,
        role: "user",
        agent: input.agent ?? "build",
        model: input.model ?? model,
        time: { created: Date.now() },
      })
      const parts = []
      for (const part of input.parts) {
        if (part.type !== "text") continue
        parts.push(
          yield* sessions.updatePart({
            ...part,
            id: part.id ?? PartID.ascending(),
            sessionID: input.sessionID,
            messageID: info.id,
          }),
        )
        admitted.push(part.text)
      }
      return { info, parts }
    })
  const ops: TaskPromptOps = {
    resolvePromptParts: (text) => Effect.succeed([{ type: "text", text }]),
    admit,
    prompt: admit,
    cancel: (id) => status.set(id, { type: "idle" }),
    resume: ({ sessionID }) =>
      Effect.gen(function* () {
        resumed.push(sessionID)
        yield* status.set(sessionID, { type: "busy" })
        return (yield* sessions.messages({ sessionID, limit: 1 }).pipe(Effect.orDie))[0]
      }),
  }
  const origin = { id: "user:one", source: "user" as const, text: "objective" }
  const submit = (input: Partial<OfficeControl.Input> & Pick<OfficeControl.Input, "id" | "intent">) =>
    control.execute(
      {
        text: "objective",
        directory: instance.directory,
        title: "Disposable worker",
        placement: "shared",
        ...input,
      },
      ops,
      origin,
    )
  return { sessions, status, office, control, ledger, instance, ops, origin, submit, admitted, resumed }
})

it.instance("durable admission is idempotent and preserves the selected agent and model", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const receipt = yield* h.submit({ id: "new", intent: "new", agent: "plan", model })
    expect(receipt.status).toBe("accepted")
    expect(yield* h.submit({ id: "new", intent: "new", agent: "plan", model })).toEqual(receipt)
    expect(h.admitted).toEqual(["objective"])
    const worker = yield* h.sessions.get(SessionID.make(receipt.sessionID))
    expect(worker.agent).toBe("plan")
    expect(worker.model?.id).toBe(model.modelID)
    expect(worker.metadata?.officeObjective).toBe("objective")
    expect((yield* h.submit({ id: "new", intent: "new", text: "different" })).status).toBe("rejected")
    expect((yield* h.ledger.get("command:new"))?.state).not.toBe("rejected")
  }),
)

it.instance("failed admission is observable and never reported as accepted on retry", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const input = { id: "missing", intent: "context" as const, sessionID: "ses_missing", text: "context" }
    const first = yield* h.control.execute(input, h.ops, h.origin)
    expect(first.status).toBe("rejected")
    expect(yield* h.control.execute(input, h.ops, h.origin)).toEqual(first)
    expect((yield* h.ledger.get("command:missing"))?.state).toBe("rejected")
    expect(h.resumed).toEqual([])
  }),
)

it.instance("a late user summary update cannot reopen a completed worker turn", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const receipt = yield* h.submit({ id: "summary-worker", intent: "new" })
    const sessionID = SessionID.make(receipt.sessionID)
    yield* pollWithTimeout(
      h.status.get(sessionID).pipe(Effect.map((value) => (value.type === "busy" ? true : undefined))),
      "worker never started",
    )
    const user = (yield* h.sessions.messages({ sessionID, limit: 1 }).pipe(Effect.orDie))[0].info
    if (user.role !== "user") throw new Error("Expected the admitted user input")
    const assistant = yield* h.sessions.updateMessage({
      id: MessageID.ascending(),
      sessionID,
      role: "assistant",
      parentID: user.id,
      agent: "build",
      mode: "build",
      modelID: model.modelID,
      providerID: model.providerID,
      path: { cwd: h.instance.directory, root: h.instance.directory },
      time: { created: Date.now(), completed: Date.now() },
      cost: 0,
      tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    })
    yield* h.sessions.updatePart({
      id: PartID.ascending(),
      sessionID,
      messageID: assistant.id,
      type: "text",
      text: "OFFICE_OK",
    })
    yield* h.status.set(sessionID, { type: "idle" })
    const stopped = yield* pollWithTimeout(
      h.office.thread(sessionID).pipe(Effect.map((row) => (row?.lifecycle?.phase === "stopped" ? row : undefined))),
      "worker never stopped",
    )
    expect(stopped.lifecycle?.outcome).toBe("reported")
    yield* h.sessions.updateMessage({ ...user, summary: { diffs: [] } })
    const after = yield* h.office.thread(sessionID)
    expect(after?.lifecycle).toEqual(stopped.lifecycle)
    expect(after?.bucket).toBe("done")
  }),
)

it.instance("queues input durably in FIFO order and cancel clears later entries", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const worker = yield* h.submit({ id: "worker", intent: "new" })
    const id = SessionID.make(worker.sessionID)
    yield* pollWithTimeout(
      h.status.get(id).pipe(Effect.map((state) => (state.type === "busy" ? true : undefined))),
      "worker never started",
    )
    const first = yield* h.submit({ id: "z-first", intent: "queue", sessionID: id, text: "first" })
    const second = yield* h.submit({ id: "a-second", intent: "queue", sessionID: id, text: "second" })
    expect(first.queued).toBe(true)
    expect(second.queued).toBe(true)
    expect(h.admitted).toEqual(["objective"])
    yield* h.status.set(id, { type: "idle" })
    yield* pollWithTimeout(
      Effect.sync(() => (h.admitted.length === 2 ? true : undefined)),
      "queue was not promoted",
    )
    expect(h.admitted[1]).toContain("first")
    yield* h.submit({ id: "cancel", intent: "cancel", sessionID: id })
    expect((yield* h.ledger.get("command:a-second"))?.state).toBe("canceled")
    expect(h.admitted).toHaveLength(2)
  }),
)

it.instance("an earlier process command requires reconciliation and never executes again", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const input = { id: "old", intent: "context" as const, text: "objective" }
    const first = yield* h.submit({ ...input, intent: "new" })
    const stored = (yield* h.ledger.get<OfficeControl.Command>("command:old"))!
    yield* h.ledger.put({ ...stored, state: "starting", value: { ...stored.value, epoch: "previous-process" } })
    const retried = yield* h.submit({ ...input, intent: "new" })
    expect(retried.status).toBe("reconciliation_required")
    expect(retried.inputID).toBe(first.inputID)
    expect(h.admitted).toHaveLength(1)
  }),
)

it.instance("foreign host and stale voice generations cannot start a worker", () =>
  Effect.gen(function* () {
    const h = yield* harness
    expect((yield* h.submit({ id: "foreign", intent: "new", hostID: "other-host" })).status).toBe("rejected")
    const result = yield* h.control.execute(
      { id: "voice", intent: "new", directory: h.instance.directory, title: "No", text: "objective" },
      h.ops,
      { ...h.origin, clientID: "voice-window", attentionGeneration: 1 },
    )
    expect(result.status).toBe("rejected")
    expect(h.admitted).toEqual([])
  }),
)

it.instance("Office preserves failure and cancellation after idle cleanup", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const events = yield* EventV2Bridge.Service
    const worker = yield* h.sessions.create({ title: "Lifecycle fixture" })
    yield* h.status.set(worker.id, { type: "busy" })
    yield* events.publish(Session.Event.Error, {
      sessionID: worker.id,
      error: { name: "UnknownError", data: { message: "provider failure" } },
    })
    yield* pollWithTimeout(
      h.office
        .thread(worker.id)
        .pipe(Effect.map((thread) => (thread?.lifecycle?.phase === "failed" ? true : undefined))),
      "failure not observed",
    )
    yield* h.status.set(worker.id, { type: "idle" })
    expect((yield* h.office.thread(worker.id))?.lifecycle?.phase).toBe("failed")
    yield* h.status.set(worker.id, { type: "busy" })
    yield* events.publish(SessionStatus.Event.Interrupted, { sessionID: worker.id })
    yield* pollWithTimeout(
      h.office
        .thread(worker.id)
        .pipe(Effect.map((thread) => (thread?.lifecycle?.phase === "canceled" ? true : undefined))),
      "cancellation not observed",
    )
    yield* h.status.set(worker.id, { type: "idle" })
    expect((yield* h.office.thread(worker.id))?.lifecycle?.phase).toBe("canceled")
  }),
)

it.instance("multiple permission decisions remain exact and one reply leaves the other pending", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const permissions = yield* Permission.Service
    const worker = yield* h.sessions.create({ title: "Two decisions" })
    const ask = (id: string) =>
      permissions
        .ask({
          id: PermissionV1.ID.make(id),
          sessionID: worker.id,
          permission: "bash",
          patterns: ["deploy"],
          metadata: {},
          always: [],
          ruleset: [],
        })
        .pipe(Effect.result, Effect.forkChild)
    const one = yield* ask("per_one")
    const two = yield* ask("per_two")
    yield* pollWithTimeout(
      h.office
        .thread(worker.id)
        .pipe(
          Effect.map((thread) =>
            thread?.decisions?.filter((item) => item.status === "pending").length === 2 ? true : undefined,
          ),
        ),
      "decisions missing",
    )
    const wrong = yield* h.office
      .answer({ sessionID: "ses_someone_else", permission: { id: "per_one", reply: "once" } })
      .pipe(Effect.result)
    expect(wrong._tag).toBe("Failure")
    yield* h.office.answer({ sessionID: worker.id, permission: { id: "per_one", reply: "reject" } })
    expect((yield* Fiber.join(one))._tag).toBe("Failure")
    expect((yield* permissions.list()).map((request) => request.id)).toEqual([PermissionV1.ID.make("per_two")])
    expect((yield* h.office.thread(worker.id))?.waiting?.kind).toBe("permission")
    yield* h.office.answer({ sessionID: worker.id, permission: { id: "per_two", reply: "once" } })
    expect((yield* Fiber.join(two))._tag).toBe("Success")
    expect((yield* h.office.thread(worker.id))?.decisions?.every((item) => item.status === "answered")).toBe(true)
  }),
)

it.instance("status and cancellation receipts never invent a newly admitted input", () =>
  Effect.gen(function* () {
    const h = yield* harness
    const worker = yield* h.sessions.create({ title: "Read-only status" })
    const result = yield* h.submit({ id: "status", intent: "status", sessionID: worker.id })
    expect(result.status).toBe("accepted")
    expect(result.inputID).toBeUndefined()
    expect(h.admitted).toEqual([])
    expect(h.resumed).toEqual([])
    expect((yield* h.submit({ id: "cancel-empty", intent: "cancel", sessionID: worker.id })).inputID).toBeUndefined()
  }),
)
