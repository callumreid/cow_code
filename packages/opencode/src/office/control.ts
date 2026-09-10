import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { Cause, Context, Effect, Layer, Option, Schema, Scope, Semaphore } from "effect"
import { createHash, randomUUID } from "crypto"
import { InstanceRef } from "@/effect/instance-ref"
import { EventV2Bridge } from "@/event-v2-bridge"
import { Session } from "@/session/session"
import { MessageID, PartID, SessionID } from "@/session/schema"
import { SessionStatus } from "@/session/status"
import type { TaskPromptOps } from "@/tool/task"
import { Worktree } from "@/worktree"
import path from "path"
import { Office } from "./office"
import { OfficeLedger } from "./ledger"

export const Intent = Schema.Literals(["new", "amend", "steer", "queue", "context", "cancel", "resume", "status"])
export const Input = Schema.Struct({
  id: Schema.String,
  intent: Intent,
  hostID: Schema.optional(Schema.String),
  sessionID: Schema.optional(Schema.String),
  directory: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  text: Schema.String,
  agent: Schema.optional(Schema.String),
  model: Schema.optional(
    Schema.Struct({ providerID: ProviderV2.ID, modelID: ModelV2.ID, variant: Schema.optional(Schema.String) }),
  ),
  executionID: Schema.optional(Schema.String),
  outputScope: Schema.optional(Schema.String),
  placement: Schema.optional(Schema.Literals(["auto", "worktree", "shared"])),
})
export type Input = typeof Input.Type

export const Receipt = Schema.Struct({
  commandID: Schema.String,
  sessionID: Schema.String,
  inputID: Schema.optional(Schema.String),
  phase: Schema.optional(Schema.String),
  outcome: Schema.optional(Schema.String),
  status: Schema.Literals(["accepted", "rejected", "reconciliation_required"]),
  queued: Schema.Boolean,
  directory: Schema.optional(Schema.String),
  time: Schema.Finite,
  reason: Schema.optional(Schema.String),
})
export type Receipt = typeof Receipt.Type

export type Origin = {
  id: string
  source: "user" | "coordinator" | "routine"
  text: string
  sessionID?: string
  messageID?: string
  clientID?: string
  attentionGeneration?: number
  decisionIDs?: string[]
}

export type Command = {
  input: Input
  origin: Origin
  receipt: Receipt
  fingerprint: string
  partID: string
  epoch: string
  promoted: boolean
  order: number
}

export interface Interface {
  execute(input: Input, ops: TaskPromptOps, origin: Origin): Effect.Effect<Receipt>
  origin(sessionID: string, assistantID: string): Effect.Effect<Origin>
  recordOrigin(input: Origin): Effect.Effect<void>
  active(origin: Origin): Effect.Effect<boolean>
  commands(sessionID?: string): Effect.Effect<OfficeLedger.Record<Command>[]>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/OfficeControl") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    const status = yield* SessionStatus.Service
    const ledger = yield* OfficeLedger.Service
    const events = yield* EventV2Bridge.Service
    const scope = yield* Scope.Scope
    const worktrees = yield* Worktree.Service
    const epoch = randomUUID()
    const lock = Semaphore.makeUnsafe(1)
    const bindings = new Map<string, TaskPromptOps>()

    const save = (command: Command, state: string) =>
      ledger.put(
        {
          id: "command:" + command.input.id,
          kind: "command",
          state,
          sessionID: command.receipt.sessionID,
          value: command,
        },
        { kind: "command." + state, sessionID: command.receipt.sessionID, value: command.receipt },
      )

    const active = (origin: Origin) =>
      Effect.gen(function* () {
        if (origin.attentionGeneration === undefined) return true
        if (!origin.clientID) return false
        const current = yield* ledger.get<{ mode: string; generation: number }>("attention:" + origin.clientID)
        return current?.value.mode === "active" && current.value.generation === origin.attentionGeneration
      })

    const commands = (sessionID?: string) =>
      ledger
        .list<Command>("command")
        .pipe(
          Effect.map((rows) =>
            (sessionID ? rows.filter((row) => row.sessionID === sessionID) : rows).sort(
              (a, b) => a.value.order - b.value.order,
            ),
          ),
        )

    for (const row of yield* commands()) {
      if (!["admitting", "starting", "queued", "admitted"].includes(row.state)) continue
      yield* save(
        {
          ...row.value,
          receipt: {
            ...row.value.receipt,
            status: "reconciliation_required",
            reason: "Server restarted. Inspect the worker before explicitly continuing.",
          },
        },
        "reconciliation_required",
      )
    }

    const start = (command: Command, ops: TaskPromptOps) =>
      Effect.gen(function* () {
        if (!ops.resume) return yield* Effect.die("This session engine cannot resume admitted input.")
        const target = yield* sessions.get(SessionID.make(command.receipt.sessionID)).pipe(Effect.orDie)
        const context = yield* office.context(target.directory)
        // Persist ownership before scheduling. A restarted process never guesses whether this ran.
        yield* save(command, "starting")
        yield* ops.resume({ sessionID: target.id }).pipe(
          Effect.provideService(InstanceRef, context),
          Effect.matchCauseEffect({
            onSuccess: () =>
              Effect.gen(function* () {
                if ((yield* ledger.get("command:" + command.input.id))?.state === "canceled") return
                const messages = yield* sessions.messages({ sessionID: target.id, limit: 2 }).pipe(Effect.orDie)
                const failed = messages.some((message) => message.info.role === "assistant" && message.info.error)
                yield* save(command, failed ? "failed" : "stopped")
              }),
            onFailure: (cause) =>
              Effect.gen(function* () {
                if ((yield* ledger.get("command:" + command.input.id))?.state === "canceled") return
                yield* save(
                  { ...command, receipt: { ...command.receipt, reason: Cause.pretty(cause).slice(0, 500) } },
                  "failed",
                )
              }),
          }),
          Effect.forkIn(scope, { startImmediately: true }),
        )
      })

    const promote = (command: Command, ops: TaskPromptOps) =>
      Effect.gen(function* () {
        const target = yield* sessions.get(SessionID.make(command.receipt.sessionID)).pipe(Effect.orDie)
        const context = yield* office.context(target.directory)
        const source = command.input.text === command.origin.text ? command.origin.source : "coordinator"
        const text =
          source === "user"
            ? command.input.text
            : "[Office " + source + " instruction; preserve the existing objective]\n" + command.input.text
        // Stable message and part IDs complete a partially admitted input after an exact retry.
        yield* (ops.admit ?? ((input) => ops.prompt({ ...input, noReply: true })))({
          sessionID: target.id,
          messageID: MessageID.make(command.receipt.inputID!),
          agent: command.input.agent ?? target.agent,
          model:
            command.input.model ??
            (target.model ? { providerID: target.model.providerID, modelID: target.model.id } : undefined),
          variant: command.input.model?.variant ?? target.model?.variant,
          parts: [{ id: PartID.make(command.partID), type: "text", text }],
        }).pipe(Effect.provideService(InstanceRef, context))
        yield* ledger.put({
          id: "origin:" + target.id + ":" + command.receipt.inputID,
          kind: "origin",
          state: "recorded",
          sessionID: target.id,
          value: {
            ...command.origin,
            id: target.id + ":" + command.receipt.inputID,
            source,
            text,
            sessionID: target.id,
            messageID: command.receipt.inputID,
          },
        })
        command.promoted = true
        command.receipt = { ...command.receipt, queued: false }
        yield* save(command, command.input.intent === "context" ? "completed" : "admitted")
        if (command.input.intent !== "context") yield* start(command, ops)
      })

    const drain = (sessionID: string) =>
      lock.withPermit(
        Effect.gen(function* () {
          const ops = bindings.get(sessionID)
          if (!ops) return
          const thread = yield* office.thread(sessionID)
          if (thread?.waiting || thread?.bucket === "failed" || thread?.lifecycle?.phase === "canceled") return
          const target = yield* sessions.get(SessionID.make(sessionID)).pipe(Effect.orDie)
          const context = yield* office.context(target.directory)
          const live = yield* status.get(target.id).pipe(Effect.provideService(InstanceRef, context))
          if (live.type !== "idle") return
          const messages = yield* sessions.messages({ sessionID: target.id, limit: 1 }).pipe(Effect.orDie)
          if (messages.some((message) => message.info.role === "assistant" && message.info.error)) return
          const next = (yield* commands(sessionID)).find((row) => row.state === "queued" && row.value.epoch === epoch)
          if (!next) return
          yield* promote(next.value, ops)
        }),
      )

    const unsubscribe = yield* events.listen((event) => {
      if (event.type !== "session.idle") return Effect.void
      const data = event.data as { sessionID: string }
      // Run after the terminal state reducers have observed this event.
      return drain(data.sessionID).pipe(Effect.forkIn(scope), Effect.asVoid)
    })
    yield* Effect.addFinalizer(() => unsubscribe)

    const execute = (input: Input, ops: TaskPromptOps, origin: Origin) =>
      lock.withPermit(
        Effect.gen(function* () {
          const fingerprint = createHash("sha256")
            .update(
              JSON.stringify({
                intent: input.intent,
                target: input.sessionID,
                directory: input.directory,
                title: input.title,
                text: input.text,
                agent: input.agent,
                model: input.model && [input.model.providerID, input.model.modelID, input.model.variant],
                origin: origin.id,
                host: input.hostID,
                execution: input.executionID,
                placement: input.placement,
                outputScope: input.outputScope,
              }),
            )
            .digest("hex")
          const prior = yield* ledger.get<Command>("command:" + input.id)
          if (prior) {
            if (prior.value.fingerprint !== fingerprint)
              return {
                ...prior.value.receipt,
                status: "rejected" as const,
                reason: "Command ID already belongs to different input.",
              }
            if (prior.value.epoch !== epoch && ["admitting", "starting", "queued", "admitted"].includes(prior.state))
              return {
                ...prior.value.receipt,
                status: "reconciliation_required" as const,
                reason: "The server restarted; inspect the worker before explicitly resuming.",
              }
            return prior.value.receipt
          }
          const sessionID = input.intent === "new" ? SessionID.descending() : (input.sessionID ?? "")
          const command: Command = {
            input,
            origin,
            fingerprint,
            partID: PartID.ascending(),
            epoch,
            promoted: false,
            order: 0,
            receipt: {
              commandID: input.id,
              sessionID,
              inputID: ["cancel", "resume", "status"].includes(input.intent) ? undefined : MessageID.ascending(),
              status: "accepted",
              queued: input.intent === "queue",
              time: Date.now(),
            },
          }
          command.order = (yield* save(command, "admitting"))!.cursor
          return yield* Effect.gen(function* () {
            if (!(yield* active(origin)))
              return yield* Effect.die("Voice attention changed. No new worker action was admitted.")
            const current = yield* office.state()
            if (input.hostID && input.hostID !== current.host?.id)
              return yield* Effect.die("This worker belongs to another host; route the command to its original server.")
            if (!sessionID) return yield* Effect.die("Choose an existing worker for this request.")
            if (input.intent === "new") {
              if (!input.directory || !input.title || !input.text.trim())
                return yield* Effect.die("A new task needs a project directory, title, and objective.")
              if (!path.isAbsolute(input.directory)) return yield* Effect.die("Choose an absolute project directory.")
              const project = yield* office.context(input.directory)
              const isolate =
                input.placement === "worktree" || (input.placement !== "shared" && project.project.vcs === "git")
              const place = isolate
                ? (yield* worktrees.create().pipe(Effect.provideService(InstanceRef, project), Effect.orDie)).directory
                : input.directory
              if (
                !isolate &&
                current.threads.some((thread) => thread.directory === place && thread.lifecycle?.phase === "running")
              )
                return yield* Effect.die(
                  "Another worker is writing in this directory. Choose a worktree or a separate output directory.",
                )
              const context = yield* office.context(place)
              command.receipt = { ...command.receipt, directory: place }
              yield* sessions
                .create({
                  id: SessionID.make(sessionID),
                  title: input.title,
                  agent: input.agent,
                  model: input.model
                    ? { providerID: input.model.providerID, id: input.model.modelID, variant: input.model.variant }
                    : undefined,
                  metadata: {
                    officeCommandID: input.id,
                    officeObjective: input.text,
                    officeOriginID: origin.id,
                    officeOrigin: origin.source,
                    officeOutputScope: input.outputScope,
                    executionID: input.executionID,
                  },
                })
                .pipe(Effect.provideService(InstanceRef, context))
            }
            const target = yield* sessions.get(SessionID.make(sessionID)).pipe(Effect.orDie)
            const context = yield* office.context(target.directory)
            if (input.intent === "status") {
              const thread = yield* office.thread(sessionID)
              command.receipt = {
                ...command.receipt,
                phase: thread?.lifecycle?.phase ?? "unknown",
                outcome: thread?.lifecycle?.outcome ?? "unverified",
              }
              yield* save(command, "observed")
              return command.receipt
            }
            bindings.set(sessionID, ops)
            if (input.intent === "cancel") {
              for (const pending of yield* commands(sessionID)) {
                if (["queued", "starting", "admitted", "reconciliation_required"].includes(pending.state))
                  yield* save(
                    {
                      ...pending.value,
                      receipt: {
                        ...pending.value.receipt,
                        status: "accepted",
                        phase: "canceled",
                        reason: "Canceled explicitly; no queued input was replayed.",
                      },
                    },
                    "canceled",
                  )
              }
              yield* ops.cancel(target.id).pipe(Effect.provideService(InstanceRef, context))
              yield* save(command, "canceled")
              return command.receipt
            }
            if (input.intent === "resume") {
              yield* start(command, ops)
              return command.receipt
            }
            if (input.intent === "amend") {
              const existing = target.metadata?.officeAmendments
              yield* sessions.setMetadata({
                sessionID: target.id,
                metadata: {
                  ...target.metadata,
                  officeAmendments: [
                    ...(Array.isArray(existing) ? existing : []),
                    { commandID: input.id, text: input.text, originID: origin.id },
                  ],
                },
              })
            }
            const live = yield* status.get(target.id).pipe(Effect.provideService(InstanceRef, context))
            if (input.intent === "queue" && live.type !== "idle") {
              yield* save(command, "queued")
              return command.receipt
            }
            yield* promote(command, ops)
            return command.receipt
          }).pipe(
            Effect.catchCause((cause) =>
              Effect.gen(function* () {
                command.receipt = { ...command.receipt, status: "rejected", reason: Cause.pretty(cause).slice(0, 500) }
                yield* save(command, "rejected")
                return command.receipt
              }),
            ),
          )
        }),
      )

    return Service.of({
      execute,
      active,
      commands,
      recordOrigin: (input) =>
        ledger
          .put({
            id: "origin:" + input.id,
            kind: "origin",
            state: "recorded",
            sessionID: input.sessionID,
            value: input,
          })
          .pipe(Effect.asVoid),
      origin: (sessionID, assistantID) =>
        Effect.gen(function* () {
          const direct = yield* ledger.get<Origin>("origin:" + sessionID + ":" + assistantID)
          if (direct) return direct.value
          const assistant = yield* sessions
            .findMessage(SessionID.make(sessionID), (message) => message.info.id === assistantID)
            .pipe(Effect.orDie)
          const parentID =
            Option.isSome(assistant) && assistant.value.info.role === "assistant"
              ? assistant.value.info.parentID
              : undefined
          const found = parentID ? yield* ledger.get<Origin>("origin:" + sessionID + ":" + parentID) : undefined
          return (
            found?.value ?? { id: sessionID + ":" + assistantID, source: "coordinator" as const, text: "", sessionID }
          )
        }),
    })
  }),
)

export const node = LayerNode.make({
  service: Service,
  layer,
  deps: [Office.node, OfficeLedger.node, Session.node, SessionStatus.node, EventV2Bridge.node, Worktree.node],
})
export * as OfficeControl from "./control"
