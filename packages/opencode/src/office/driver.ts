// Durable admission and interpretation for the Farmer. Provider execution stays
// serialized; status, attention and receipts never wait on that model turn.
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { EffectBridge } from "@/effect/bridge"
import { InstanceStore } from "@/project/instance-store"
import { SessionPrompt } from "@/session/prompt"
import { Session } from "@/session/session"
import { MessageID, PartID, SessionID } from "@/session/schema"
import { Cause, Context, Effect, Layer, Schema, Scope, Semaphore } from "effect"
import { GlobalBus } from "@/bus/global"
import { randomUUID } from "crypto"
import { Office } from "./office"
import { OfficeControl } from "./control"
import { OfficeLedger } from "./ledger"

export const Attention = Schema.Struct({
  clientID: Schema.String,
  generation: Schema.Finite,
  mode: Schema.Literals(["active", "paused", "off"]),
})
export const Request = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  source: Schema.optional(Schema.Literals(["text", "voice"])),
  clientID: Schema.optional(Schema.String),
  generation: Schema.optional(Schema.Finite),
  decisionIDs: Schema.optional(Schema.Array(Schema.String)),
})
export type Request = typeof Request.Type
export const RequestReceipt = Schema.Struct({
  id: Schema.String,
  status: Schema.Literals(["accepted", "processing", "completed", "failed", "reconciliation_required", "rejected"]),
  text: Schema.optional(Schema.String),
  sessionID: Schema.optional(Schema.String),
  reason: Schema.optional(Schema.String),
})
export type RequestReceipt = typeof RequestReceipt.Type
export { Outcome } from "./outcome"
import { Outcome } from "./outcome"

type PendingRequest = { input: Request; receipt: RequestReceipt; messageID: string; epoch: string }
export interface Interface {
  ensureOverseer(): Effect.Effect<Office.OverseerRef>
  request(input: Request): Effect.Effect<RequestReceipt>
  requestStatus(id: string): Effect.Effect<RequestReceipt>
  attention(input: typeof Attention.Type): Effect.Effect<typeof Attention.Type>
  ask(input: {
    text: string
    source?: "text" | "voice"
    clientID?: string
    generation?: number
    decisionIDs?: readonly string[]
  }): Effect.Effect<{ text: string; sessionID: string }>
  brief(input: {
    since: number
    clientID?: string
  }): Effect.Effect<{ text: string; sessionID: string; skipped: boolean }>
  command(input: OfficeControl.Input, origin?: OfficeControl.Origin): Effect.Effect<OfficeControl.Receipt>
  promptThread(input: {
    id?: string
    sessionID: string
    text: string
    mode: "steer" | "queue" | "context" | "amend" | "cancel" | "resume"
  }): Effect.Effect<OfficeControl.Receipt>
  dispatch(input: {
    directory: string
    title: string
    prompt: string
    agent?: string
  }): Effect.Effect<OfficeControl.Receipt>
}
export class Service extends Context.Service<Service, Interface>()("@opencode/OfficeDriver") {}
const URGENT = new Set<Office.ReportKind>(["permission", "question", "error", "stalled"])

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    const prompt = yield* SessionPrompt.Service
    const instances = yield* InstanceStore.Service
    const ledger = yield* OfficeLedger.Service
    const control = yield* OfficeControl.Service
    const scope = yield* Scope.Scope
    const bridge = yield* EffectBridge.make()
    const semaphore = Semaphore.makeUnsafe(1)
    const admission = Semaphore.makeUnsafe(1)
    const epoch = randomUUID()
    const queue: PendingRequest[] = []
    const work = { running: false }

    const ensureOverseer = Effect.fn("OfficeDriver.ensureOverseer")(function* () {
      const known = yield* office.overseer()
      if (known) {
        const alive = yield* sessions.get(SessionID.make(known.sessionID)).pipe(Effect.orElseSucceed(() => undefined))
        if (alive && !alive.time.archived) return known
      }
      const list = yield* sessions.listGlobal({ directory: office.directory, limit: 20 })
      const found = list.find((session) => session.metadata?.office === "overseer" && !session.time.archived)
      if (found) {
        const ref = { sessionID: found.id, directory: office.directory }
        yield* office.setOverseer(ref)
        return ref
      }
      const created = yield* instances.provide(
        { directory: office.directory },
        sessions.create({ title: "Farmer's Office", agent: "farmer", metadata: { office: "overseer" } }),
      )
      const ref = { sessionID: created.id, directory: office.directory }
      yield* office.setOverseer(ref)
      return ref
    })

    const voiceAllowed = (input: Request) =>
      Effect.gen(function* () {
        if (input.source !== "voice") return true
        if (!input.clientID || input.generation === undefined) return false
        const current = yield* ledger.get<typeof Attention.Type>("attention:" + input.clientID)
        return current?.value.mode === "active" && current.value.generation === input.generation
      })

    const attention: Interface["attention"] = (input) =>
      admission.withPermit(
        Effect.gen(function* () {
          const previous = yield* ledger.get<typeof Attention.Type>("attention:" + input.clientID)
          if (previous && previous.value.generation > input.generation) return previous.value
          yield* ledger.put({ id: "attention:" + input.clientID, kind: "attention", state: input.mode, value: input })
          return input
        }),
      )

    const publish = (input: {
      text: string
      sessionID: string
      request?: Request
      reports?: readonly Office.Report[]
      basis?: Office.State
    }) =>
      Effect.gen(function* () {
        const reports = input.reports ?? []
        const current = yield* office.state()
        const targets = new Set(
          reports.length
            ? reports.map((report) => report.sessionID)
            : current.threads.filter((thread) => thread.source === "cow").map((thread) => thread.sessionID),
        )
        const observed = current.threads.filter((thread) => targets.has(thread.sessionID))
        const changed =
          input.basis &&
          observed.some((thread) => {
            const before = input.basis!.threads.find((item) => item.sessionID === thread.sessionID)
            return (
              !before ||
              before.lifecycle?.runID !== thread.lifecycle?.runID ||
              before.time.updated !== thread.time.updated
            )
          })
        const text = changed
          ? "Worker state changed during that reply. Current observations: " +
            observed
              .slice(0, 5)
              .map((thread) => thread.title + ": " + (thread.lifecycle?.phase ?? thread.bucket))
              .join("; ") +
            ". Objective, shipping and live results require the task evidence."
          : input.text
        const outcome: Outcome = {
          id: "outcome:" + (input.request?.id ?? randomUUID()),
          requestID: input.request?.id,
          clientID: input.request?.clientID,
          generation: input.request?.generation,
          sessionID: input.sessionID,
          text,
          time: Date.now(),
          reportIDs: reports.map((report) => report.id),
          urgent: reports.some((report) => URGENT.has(report.kind)),
          observations: current.threads
            .filter((thread) => targets.has(thread.sessionID))
            .map((thread) => ({
              sessionID: thread.sessionID,
              runID: thread.lifecycle?.runID,
              updated: thread.time.updated,
            })),
        }
        yield* ledger.put(
          { id: outcome.id, kind: "outcome", state: "ready", value: outcome },
          { id: outcome.id, kind: "office.outcome", value: outcome },
        )
        GlobalBus.emit("event", { directory: "global", payload: { type: "office.outcome", properties: outcome } })
        return outcome
      })

    // An exact user-message ID binds tools to the genuine input. Synthetic report
    // text never inherits user authority, even when a worker quotes an approval.
    const turn = (input: {
      text: string
      synthetic: boolean
      request?: Request
      messageID?: string
      reports?: readonly Office.Report[]
    }) =>
      semaphore.withPermit(
        Effect.gen(function* () {
          if (input.request && !(yield* voiceAllowed(input.request)))
            return yield* Effect.die("Voice request held: attention changed before execution.")
          const ref = yield* ensureOverseer()
          const state = yield* office.state()
          const pending = state.threads
            .flatMap((thread) => thread.decisions ?? [])
            .filter((decision) => decision.status === "pending")
          const ids =
            input.request?.decisionIDs ??
            (pending.length === 1
              ? [pending[0].id]
              : pending.filter((decision) => input.text.includes(decision.id)).map((decision) => decision.id))
          const messageID = MessageID.make(input.messageID ?? MessageID.ascending())
          const block = yield* office.render()
          const hint =
            input.request?.source === "voice"
              ? "This reply will be spoken. Use under forty words, plain sentences. A receipt proves admission only; distinguish checks, shipping and live proof."
              : ""
          yield* control.recordOrigin({
            id: ref.sessionID + ":" + messageID,
            sessionID: ref.sessionID,
            messageID,
            source: input.synthetic ? "coordinator" : "user",
            text: input.text,
            clientID: input.request?.clientID,
            attentionGeneration: input.request?.source === "voice" ? input.request.generation : undefined,
            decisionIDs: ids.filter((id) => pending.some((decision) => decision.id === id)),
          })
          yield* instances.provide(
            { directory: office.directory },
            prompt.admit({
              sessionID: SessionID.make(ref.sessionID),
              messageID,
              agent: "farmer",
              system: block + "\n\n" + hint,
              parts: [{ id: PartID.ascending(), type: "text", text: input.text, synthetic: input.synthetic }],
            }),
          )
          const result = yield* instances.provide(
            { directory: office.directory },
            prompt.loop({ sessionID: SessionID.make(ref.sessionID) }),
          )
          if (result.info.role === "assistant" && result.info.error) return yield* Effect.die(result.info.error)
          const part = result.parts.findLast((part) => part.type === "text")
          const text =
            part?.type === "text"
              ? part.text
              : "The Farmer turn stopped without an answer; inspect the task before continuing."
          const outcome = yield* publish({
            text,
            sessionID: ref.sessionID,
            request: input.request,
            reports: input.reports,
            basis: state,
          })
          return { text: outcome.text, sessionID: ref.sessionID }
        }),
      )

    const saveRequest = (item: PendingRequest) =>
      ledger
        .put(
          { id: "request:" + item.input.id, kind: "request", state: item.receipt.status, value: item },
          { kind: "office.request", value: item.receipt },
        )
        .pipe(Effect.asVoid)

    const runRequest = (item: PendingRequest) =>
      Effect.gen(function* () {
        item.receipt = { id: item.input.id, status: "processing" }
        yield* saveRequest(item)
        yield* turn({ text: item.input.text, synthetic: false, request: item.input, messageID: item.messageID }).pipe(
          Effect.matchCauseEffect({
            onSuccess: (result) =>
              Effect.gen(function* () {
                item.receipt = { id: item.input.id, status: "completed", ...result }
                yield* saveRequest(item)
              }),
            onFailure: (cause) =>
              Effect.gen(function* () {
                item.receipt = { id: item.input.id, status: "failed", reason: Cause.pretty(cause).slice(0, 500) }
                yield* saveRequest(item)
                yield* publish({
                  sessionID: (yield* office.overseer())?.sessionID ?? "",
                  request: item.input,
                  text: "The Farmer request failed. Its receipt has the error; check the worker before retrying.",
                })
              }),
          }),
        )
      })

    const drain = Effect.gen(function* () {
      if (work.running) return
      work.running = true
      yield* Effect.gen(function* () {
        while (queue.length) {
          const item = queue[0]
          yield* runRequest(item)
          queue.shift()
        }
      }).pipe(
        Effect.ensuring(
          Effect.sync(() => {
            work.running = false
          }),
        ),
      )
    })

    const request: Interface["request"] = (input) =>
      admission.withPermit(
        Effect.gen(function* () {
          const prior = yield* ledger.get<PendingRequest>("request:" + input.id)
          if (prior) {
            if (
              JSON.stringify(Object.entries(prior.value.input).sort(([a], [b]) => a.localeCompare(b))) !==
              JSON.stringify(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)))
            )
              return { id: input.id, status: "rejected", reason: "Request ID already belongs to another input." }
            return prior.value.receipt
          }
          const allowed = input.text.trim() && (yield* voiceAllowed(input))
          const item: PendingRequest = {
            input,
            messageID: MessageID.ascending(),
            epoch,
            receipt: allowed
              ? { id: input.id, status: "accepted" }
              : {
                  id: input.id,
                  status: "rejected",
                  reason: "Input is empty or voice attention is no longer active.",
                },
          }
          yield* saveRequest(item)
          if (item.receipt.status === "rejected") return item.receipt
          queue.push(item)
          bridge.fork(
            drain.pipe(Effect.catchCause((cause) => Effect.logError("office request queue failed", { cause }))),
          )
          return { id: input.id, status: "accepted" }
        }),
      )

    const requestStatus: Interface["requestStatus"] = (id) =>
      ledger
        .get<PendingRequest>("request:" + id)
        .pipe(Effect.map((item) => item?.value.receipt ?? { id, status: "rejected", reason: "Unknown request." }))

    // Execution ownership cannot be inferred after a crash. Keep the admission
    // and report available for inspection, without replaying provider side effects.
    for (const row of yield* ledger.list<PendingRequest>("request")) {
      if (!["accepted", "processing"].includes(row.state)) continue
      const item = row.value
      item.receipt = {
        ...item.receipt,
        status: "reconciliation_required",
        reason: "Server restarted. Inspect the Farmer and worker before explicitly continuing.",
      }
      yield* saveRequest(item)
    }
    for (const kind of ["report", "reminder"]) {
      for (const row of yield* ledger.list(kind, "processing"))
        yield* ledger.put({ ...row, state: "reconciliation_required" })
    }

    const currentReport = (report: Office.Report) =>
      Effect.gen(function* () {
        const thread = yield* office.thread(report.sessionID)
        if (!thread || thread.muted) return false
        if (report.runID && report.runID !== thread.lifecycle?.runID) return false
        if (
          report.requestID &&
          !thread.decisions?.some((decision) => decision.id === report.requestID && decision.status === "pending")
        )
          return false
        return true
      })

    const reportState = (report: Office.Report, state: string) =>
      ledger.put({ id: report.id, kind: "report", state, sessionID: report.sessionID, value: report })
    const handleReport = (report: Office.Report) =>
      Effect.gen(function* () {
        if (
          report.kind === "auto_allowed" ||
          (report.kind === "finished" && (yield* office.thread(report.sessionID))?.routine)
        ) {
          yield* reportState(report, "delivered")
          return
        }
        if (report.kind !== "permission") return
        const thread = yield* office.thread(report.sessionID)
        const waiting = thread?.decisions?.find(
          (decision) => decision.id === report.requestID && decision.status === "pending",
        )?.waiting
        if (waiting?.kind !== "permission" || waiting.tier !== "auto") return
        const answered = yield* office
          .answer({ sessionID: report.sessionID, permission: { id: waiting.id, reply: "once" } })
          .pipe(Effect.result)
        if (answered._tag === "Failure") {
          yield* Effect.logWarning("auto allow failed", { error: answered.failure })
          return
        }
        yield* reportState(report, "delivered")
        yield* office.note({
          kind: "auto_allowed",
          sessionID: report.sessionID,
          directory: report.directory,
          title: report.title,
          requestID: report.requestID,
          summary: "Read-only permission acknowledged by the worker.",
        })
      })
    const unsubscribe = office.onReport((report) => bridge.fork(handleReport(report)))
    yield* Effect.addFinalizer(() => Effect.sync(unsubscribe))

    const tick = Effect.gen(function* () {
      if (work.running || queue.length || !(yield* office.state()).seeded) return
      const stored = yield* ledger.list<Office.Report>("report", "pending")
      const batch: Office.Report[] = []
      for (const row of stored) {
        if (
          row.value.kind === "auto_allowed" ||
          (row.value.kind === "finished" && (yield* office.thread(row.value.sessionID))?.routine)
        ) {
          yield* reportState(row.value, "delivered")
          continue
        }
        if (!(yield* currentReport(row.value))) {
          yield* reportState(row.value, "superseded")
          continue
        }
        if (Date.now() - row.created < 8_000 && !URGENT.has(row.value.kind)) continue
        batch.push(row.value)
      }
      if (!batch.length) return
      for (const report of batch) yield* reportState(report, "processing")
      const text = [
        "<office_reports>",
        ...batch.map((report) => JSON.stringify(report)),
        "</office_reports>",
        "Read current worker evidence before acting or reporting. Resolve only your allowed decisions. Summarize outcomes and remaining user decisions in plain sentences. A stopped turn proves no objective, shipping or runtime result. Do not repeat routine success noise.",
      ].join("\n")
      yield* turn({ text, synthetic: true, reports: batch }).pipe(
        Effect.matchCauseEffect({
          onSuccess: () => Effect.forEach(batch, (report) => reportState(report, "delivered"), { discard: true }),
          onFailure: (cause) =>
            Effect.gen(function* () {
              for (const report of batch) yield* reportState(report, "reconciliation_required")
              const current = [] as Office.Report[]
              for (const report of batch)
                if (URGENT.has(report.kind) && (yield* currentReport(report))) current.push(report)
              if (current.length)
                yield* publish({
                  sessionID: (yield* office.overseer())?.sessionID ?? "",
                  reports: current,
                  text:
                    "The Farmer could not interpret this update. " +
                    current.map((report) => report.title + ": " + report.kind + " requires attention.").join(" "),
                })
              yield* Effect.logError("farmer report interpretation failed; retained for reconciliation", { cause })
            }),
        }),
      )
    })
    yield* Effect.forever(Effect.sleep("2 seconds").pipe(Effect.andThen(tick))).pipe(Effect.forkIn(scope))

    const reminders = Effect.gen(function* () {
      if (work.running || queue.length) return
      const due = [] as Office.Reminder[]
      for (const item of yield* office.dueReminders())
        if ((yield* ledger.get(item.id))?.state === "pending") due.push(item)
      if (!due.length) return
      for (const item of due) yield* ledger.put({ id: item.id, kind: "reminder", state: "processing", value: item })
      yield* turn({
        text: "Check the current worker state for these due reminders: " + JSON.stringify(due),
        synthetic: true,
      }).pipe(
        Effect.matchCauseEffect({
          onSuccess: () => office.acknowledgeReminders(due.map((item) => item.id)),
          onFailure: (cause) =>
            Effect.gen(function* () {
              for (const item of due)
                yield* ledger.put({ id: item.id, kind: "reminder", state: "reconciliation_required", value: item })
              yield* Effect.logError("reminder interpretation failed; reminder retained", { cause })
            }),
        }),
      )
    })
    yield* Effect.forever(Effect.sleep("30 seconds").pipe(Effect.andThen(reminders))).pipe(Effect.forkIn(scope))

    const ask: Interface["ask"] = (input) =>
      turn({ text: input.text, synthetic: false, request: { ...input, id: randomUUID() } }).pipe(Effect.orDie)
    const brief: Interface["brief"] = (input) =>
      Effect.gen(function* () {
        const current = yield* office.state()
        const needs = new Set(
          current.threads
            .filter((thread) => thread.bucket === "needs_you" || thread.bucket === "failed")
            .map((thread) => thread.sessionID),
        )
        const reports = current.reports.filter(
          (report) => (report.time > input.since || needs.has(report.sessionID)) && report.kind !== "auto_allowed",
        )
        if (!reports.length) return { text: "", sessionID: current.overseer?.sessionID ?? "", skipped: true }
        const result = yield* turn({
          text:
            "Give one fresh, short catch-up on current decisions and outcomes. Verify these reports against the current roster: " +
            JSON.stringify(reports),
          synthetic: true,
          reports,
          request: { id: randomUUID(), text: "Current catch-up", clientID: input.clientID },
        }).pipe(Effect.orDie)
        return { ...result, skipped: false }
      })
    const command: Interface["command"] = (input, origin) =>
      control.execute(
        input,
        {
          resolvePromptParts: prompt.resolvePromptParts,
          prompt: (input) => prompt.prompt(input).pipe(Effect.orDie),
          admit: (input) => prompt.admit(input).pipe(Effect.orDie),
          resume: prompt.loop,
          cancel: prompt.cancel,
        },
        origin ?? { id: "http:" + input.id, source: "user", text: input.text },
      )
    return Service.of({
      ensureOverseer,
      request,
      requestStatus,
      attention,
      ask,
      brief,
      command,
      promptThread: (input) =>
        command({ id: input.id ?? randomUUID(), intent: input.mode, sessionID: input.sessionID, text: input.text }),
      dispatch: (input) =>
        command({
          id: randomUUID(),
          intent: "new",
          directory: input.directory,
          title: input.title,
          text: input.prompt,
          agent: input.agent,
        }),
    })
  }),
)

export const node = LayerNode.make({
  service: Service,
  layer,
  deps: [Office.node, OfficeLedger.node, OfficeControl.node, Session.node, SessionPrompt.node, InstanceStore.node],
})
export * as OfficeDriver from "./driver"
