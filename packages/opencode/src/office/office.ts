// The Farmer's Office: a process-wide roster of every root session, kept from the
// event bridge, plus the report stream the farmer (overseer) is briefed from.
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { PermissionV1 } from "@opencode-ai/core/v1/permission"
import { QuestionV1 } from "@opencode-ai/schema/question-v1"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { type DeepMutable } from "@opencode-ai/core/schema"
import { Global } from "@opencode-ai/core/global"
import { EventV2Bridge } from "@/event-v2-bridge"
import { GlobalBus } from "@/bus/global"
import { InstanceRef } from "@/effect/instance-ref"
import type { InstanceContext } from "@/project/instance-context"
import { Permission } from "@/permission"
import { Project } from "@/project/project"
import { Question } from "@/question"
import { Session } from "@/session/session"
import { SessionID } from "@/session/schema"
import { Context, Effect, Layer, Schema, Scope } from "effect"
import { execFile } from "child_process"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { classify, type Autonomy } from "./policy"
import { OfficeLedger } from "./ledger"
import { Lifecycle, transition } from "./lifecycle"
import { randomUUID } from "crypto"
import { rolloutFiles } from "./discovery"
import { toolEvidence } from "./evidence"
import { Outcome } from "./outcome"

export const Bucket = Schema.Literals(["needs_you", "failed", "review", "working", "done"]).annotate({
  identifier: "OfficeBucket",
})
export type Bucket = typeof Bucket.Type

export const AutonomySchema = Schema.Literals(["brief", "act"]).annotate({ identifier: "OfficeAutonomy" })

const QuestionInfo = Schema.Struct({
  question: Schema.String,
  header: Schema.String,
  options: Schema.Array(Schema.Struct({ label: Schema.String, description: Schema.String })),
  multiple: Schema.optional(Schema.Boolean),
  custom: Schema.optional(Schema.Boolean),
})

export const Waiting = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal("permission"),
    id: Schema.String,
    permission: Schema.String,
    patterns: Schema.Array(Schema.String),
    always: Schema.Array(Schema.String),
    metadata: Schema.Record(Schema.String, Schema.Unknown),
    title: Schema.optional(Schema.String),
    tier: Schema.Literals(["auto", "farmer", "callum"]),
  }),
  Schema.Struct({ kind: Schema.Literal("question"), id: Schema.String, questions: Schema.Array(QuestionInfo) }),
  Schema.Struct({ kind: Schema.Literal("error"), message: Schema.String }),
]).annotate({ identifier: "OfficeWaiting", discriminator: "kind" })
export type Waiting = typeof Waiting.Type

export const Decision = Schema.Struct({
  id: Schema.String,
  sessionID: Schema.String,
  rootSessionID: Schema.String,
  runID: Schema.optional(Schema.String),
  waiting: Waiting,
  status: Schema.Literals(["pending", "answered", "reconciliation_required"]),
  created: Schema.Finite,
})
export type Decision = typeof Decision.Type

export const Thread = Schema.Struct({
  sessionID: Schema.String,
  directory: Schema.String,
  projectID: Schema.String,
  projectName: Schema.optional(Schema.String),
  title: Schema.String,
  agent: Schema.optional(Schema.String),
  // Set when the thread is a scheduled routine run (title "routine: <name> <stamp>").
  routine: Schema.optional(Schema.String),
  bucket: Bucket,
  waiting: Schema.optional(Waiting),
  decisions: Schema.optional(Schema.Array(Decision)),
  lifecycle: Schema.optional(Lifecycle),
  hostID: Schema.optional(Schema.String),
  availability: Schema.optional(Schema.Literals(["available", "stale", "unavailable"])),
  executionID: Schema.optional(Schema.String),
  objective: Schema.optional(Schema.String),
  capabilities: Schema.optional(Schema.Array(Schema.String)),
  summary: Schema.String,
  lastText: Schema.optional(Schema.String),
  lastTool: Schema.optional(Schema.String),
  pr: Schema.optional(Schema.String),
  pinned: Schema.Boolean,
  muted: Schema.Boolean,
  source: Schema.Literals(["cow", "claude", "codex"]),
  time: Schema.Struct({
    created: Schema.Finite,
    updated: Schema.Finite,
    reported: Schema.optional(Schema.Finite),
  }),
}).annotate({ identifier: "OfficeThread" })
export type Thread = typeof Thread.Type

export const ReportKind = Schema.Literals([
  "finished",
  "permission",
  "question",
  "error",
  "pr",
  "stalled",
  "auto_allowed",
]).annotate({ identifier: "OfficeReportKind" })
export type ReportKind = typeof ReportKind.Type

export const Report = Schema.Struct({
  id: Schema.String,
  time: Schema.Finite,
  sessionID: Schema.String,
  directory: Schema.String,
  kind: ReportKind,
  title: Schema.String,
  summary: Schema.String,
  requestID: Schema.optional(Schema.String),
  runID: Schema.optional(Schema.String),
}).annotate({ identifier: "OfficeReport" })
export type Report = typeof Report.Type

export const Reminder = Schema.Struct({
  id: Schema.String,
  due: Schema.Finite,
  note: Schema.String,
  sessionID: Schema.optional(Schema.String),
}).annotate({ identifier: "OfficeReminder" })
export type Reminder = typeof Reminder.Type

export const OverseerRef = Schema.Struct({ sessionID: Schema.String, directory: Schema.String }).annotate({
  identifier: "OfficeOverseer",
})
export type OverseerRef = typeof OverseerRef.Type

export const State = Schema.Struct({
  outcomes: Schema.optional(Schema.Array(Outcome)),
  host: Schema.optional(Schema.Struct({ id: Schema.String, name: Schema.String })),
  recovery: Schema.optional(
    Schema.Array(Schema.Struct({ id: Schema.String, kind: Schema.String, sessionID: Schema.optional(Schema.String) })),
  ),
  sources: Schema.optional(
    Schema.Record(
      Schema.String,
      Schema.Struct({ status: Schema.Literals(["loading", "available", "unavailable"]), observedAt: Schema.Finite }),
    ),
  ),
  epoch: Schema.optional(Schema.String),
  cursor: Schema.optional(Schema.Finite),
  seeded: Schema.optional(Schema.Boolean),
  overseer: Schema.NullOr(OverseerRef),
  threads: Schema.Array(Thread),
  reports: Schema.Array(Report),
  reminders: Schema.Array(Reminder),
  counts: Schema.Record(Bucket, Schema.Finite),
  autonomy: AutonomySchema,
  updated: Schema.Finite,
}).annotate({ identifier: "OfficeState" })
export type State = typeof State.Type

export const AnswerInput = Schema.Struct({
  sessionID: Schema.String,
  hostID: Schema.optional(Schema.String),
  runID: Schema.optional(Schema.String),
  permission: Schema.optional(
    Schema.Struct({
      id: Schema.String,
      reply: Schema.Literals(["once", "always", "reject"]),
      message: Schema.optional(Schema.String),
    }),
  ),
  question: Schema.optional(Schema.Struct({ id: Schema.String, answers: Schema.Array(Schema.Array(Schema.String)) })),
}).annotate({ identifier: "OfficeAnswerInput" })
export type AnswerInput = typeof AnswerInput.Type

export class OfficeError extends Schema.TaggedErrorClass<OfficeError>()("OfficeError", {
  message: Schema.String,
}) {}

export interface Interface {
  readonly directory: string
  readonly state: () => Effect.Effect<State>
  readonly thread: (sessionID: string) => Effect.Effect<Thread | undefined>
  readonly mark: (input: { sessionID: string; pinned?: boolean; muted?: boolean }) => Effect.Effect<void>
  readonly autonomy: () => Effect.Effect<Autonomy>
  readonly setAutonomy: (mode: Autonomy) => Effect.Effect<void>
  readonly overseer: () => Effect.Effect<OverseerRef | undefined>
  readonly setOverseer: (ref: OverseerRef) => Effect.Effect<void>
  readonly onReport: (listener: (report: Report) => void) => () => void
  readonly note: (input: Omit<Report, "id" | "time">) => Effect.Effect<void>
  readonly answer: (input: AnswerInput) => Effect.Effect<void, OfficeError>
  readonly context: (directory: string) => Effect.Effect<InstanceContext>
  readonly render: () => Effect.Effect<string>
  readonly navigate: (
    ref: OverseerRef & { clientID?: string; requestID: string; generation?: number },
  ) => Effect.Effect<void, OfficeError>
  readonly remind: (input: { minutes: number; note: string; sessionID?: string }) => Effect.Effect<Reminder>
  readonly dueReminders: () => Effect.Effect<Reminder[]>
  readonly acknowledgeReminders: (ids: string[]) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Office") {}

type Row = DeepMutable<Thread> & {
  roles: Map<string, "user" | "assistant">
  edited: boolean
  lastPartAt: number
  stalled: boolean
  /** Last error report time, so a provider retry storm yields one card, not one per attempt. */
  lastErrorAt?: number
  lastErrorMessage?: string
}

const RECENT_MS = 48 * 60 * 60 * 1000
const DETAIL_MS = 3 * 60 * 60 * 1000
const STALL_MS = 20 * 60 * 1000
const PR_LINK = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/

const EDIT_TOOLS = new Set(["edit", "write", "apply_patch", "patch"])

function firstLine(text: string | undefined, max = 160) {
  if (!text) return ""
  const line = text.replace(/\s+/g, " ").trim()
  const cut = line.match(/^(.{20,}?[.!?])\s/)
  const candidate = cut ? cut[1] : line
  return candidate.length > max ? candidate.slice(0, max - 1) + "…" : candidate
}

function trim(text: string | undefined, max: number) {
  if (!text) return undefined
  const clean = text.trim()
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean
}

function routineOf(title: string | undefined) {
  const match = title?.match(/^routine:\s*(\S+)/i)
  return match?.[1]
}

function publicThread(row: Row): Thread {
  return {
    sessionID: row.sessionID,
    directory: row.directory,
    projectID: row.projectID,
    projectName: row.projectName,
    title: row.title,
    agent: row.agent,
    routine: row.routine,
    bucket: row.bucket,
    waiting: row.waiting,
    decisions: row.decisions,
    lifecycle: row.lifecycle,
    hostID: row.hostID,
    availability: row.availability,
    executionID: row.executionID,
    objective: row.objective,
    capabilities: row.capabilities,
    summary: row.summary,
    lastText: row.lastText,
    lastTool: row.lastTool,
    pr: row.pr,
    pinned: row.pinned,
    muted: row.muted,
    source: row.source,
    time: row.time,
  }
}

function age(now: number, then: number) {
  const diff = Math.max(0, now - then)
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function describeWaiting(waiting: Waiting | undefined) {
  if (!waiting) return ""
  if (waiting.kind === "permission") {
    const command = typeof waiting.metadata.command === "string" ? waiting.metadata.command : undefined
    const detail = command ?? waiting.patterns.join(", ")
    return `${waiting.permission}: ${trim(detail, 160) ?? ""} · tier ${waiting.tier}`
  }
  if (waiting.kind === "question") return `question: ${trim(waiting.questions[0]?.question, 160) ?? ""}`
  return `error: ${trim(waiting.message, 160) ?? ""}`
}

// The farmer needs the ids and the exact option labels to answer with office_answer;
// a steer through office_prompt does not unblock a pending question or permission.
function describeWaitingForFarmer(waiting: Waiting | undefined) {
  if (!waiting) return ""
  if (waiting.kind === "permission") return `${describeWaiting(waiting)} · permission_id ${waiting.id}`
  if (waiting.kind === "question") {
    const questions = waiting.questions
      .map((question, index) => {
        const options = question.options.map((option) => `"${option.label}"`).join(" | ")
        return `q${index + 1} "${trim(question.question, 200)}" options: ${options}${question.multiple ? " (multiple)" : ""}${question.custom === false ? "" : " (custom text allowed)"}`
      })
      .join("; ")
    return `question_id ${waiting.id} · ${questions} — answer with office_answer(question_id, answers=[[label], …]); a steer will NOT unblock it`
  }
  return describeWaiting(waiting)
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const events = yield* EventV2Bridge.Service
    const sessions = yield* Session.Service
    const projects = yield* Project.Service
    const permissions = yield* Permission.Service
    const questions = yield* Question.Service
    const scope = yield* Scope.Scope
    const ledger = yield* OfficeLedger.Service
    const epoch = randomUUID()
    yield* ledger.create({
      id: "office:identity",
      kind: "identity",
      state: "active",
      value: { id: randomUUID(), name: os.hostname() },
    })
    const host = (yield* ledger.get<{ id: string; name: string }>("office:identity"))!.value
    const startup = { seeded: false }
    const recovered = new Map<string, Thread>()

    const directory = path.join(Global.Path.data, "office")
    const rows = new Map<string, Row>()
    const reports: Report[] = []
    const reminders: Reminder[] = []
    const listeners = new Set<(report: Report) => void>()
    const dirty = new Set<string>()
    const marks = new Map<string, { pinned?: boolean; muted?: boolean }>()
    const parents = new Map<string, string>()
    const settings = { autonomy: "act" as Autonomy, overseer: undefined as OverseerRef | undefined }
    const settingsFile = path.join(directory, "settings.json")

    // Keep coordination in the same durable database as its session history.
    const persist = () =>
      ledger
        .put({
          id: "office:settings",
          kind: "settings",
          state: "active",
          value: { autonomy: settings.autonomy, overseer: settings.overseer, marks: [...marks] },
        })
        .pipe(Effect.asVoid)

    const restore = Effect.gen(function* () {
      yield* Effect.tryPromise(() => fs.mkdir(directory, { recursive: true })).pipe(Effect.ignore)
      const saved = yield* ledger.get("office:settings")
      const data: unknown =
        saved?.value ??
        (yield* Effect.tryPromise(() => fs.readFile(settingsFile, "utf8").then(JSON.parse)).pipe(
          Effect.orElseSucceed(() => undefined),
        ))
      for (const row of yield* ledger.list<Thread>("thread"))
        if (!["archived", "deleted"].includes(row.state)) recovered.set(row.id.slice(7), row.value)
      for (const row of yield* ledger.list<Report>("report")) reports.push(row.value)
      for (const row of yield* ledger.list<Reminder>("reminder", "pending")) reminders.push(row.value)
      for (const row of yield* ledger.list<Decision>("decision", "pending")) {
        yield* ledger.put({
          id: row.id,
          kind: "decision",
          state: "reconciliation_required",
          sessionID: row.sessionID,
          value: { ...row.value, status: "reconciliation_required" },
        })
      }
      if (!data || typeof data !== "object") return
      const stored = data as { autonomy?: Autonomy; overseer?: OverseerRef; marks?: [string, Row][] }
      if (stored.autonomy === "brief" || stored.autonomy === "act") settings.autonomy = stored.autonomy
      if (stored.overseer?.sessionID) settings.overseer = stored.overseer
      for (const [id, mark] of stored.marks ?? []) marks.set(id, { pinned: mark.pinned, muted: mark.muted })
    })

    const emit = (type: string, properties: unknown) =>
      GlobalBus.emit("event", { directory: "global", payload: { type, properties } })

    const touch = (row: Row) => {
      row.time = { ...row.time, updated: Date.now() }
      dirty.add(row.sessionID)
    }

    const saveThread = (row: Row) =>
      ledger.put({
        id: "thread:" + row.sessionID,
        kind: "thread",
        state: row.lifecycle?.phase ?? row.bucket,
        sessionID: row.sessionID,
        value: publicThread(row),
      })

    const note = (input: Omit<Report, "id" | "time">) =>
      Effect.gen(function* () {
        const report: Report = { ...input, id: "rep_" + randomUUID(), time: Date.now() }
        const row = rows.get(input.sessionID)
        if (row) yield* saveThread(row)
        yield* ledger.put(
          { id: report.id, kind: "report", state: "pending", sessionID: report.sessionID, value: report },
          { id: report.id, kind: "office.report", sessionID: report.sessionID, value: report },
        )
        reports.push(report)
        if (reports.length > 100) reports.splice(0, reports.length - 100)
        if (row) row.time = { ...row.time, reported: report.time }
        emit("office.report", report)
        for (const listener of listeners) listener(report)
      })

    const summarize = (row: Row) => {
      if (row.waiting) return describeWaiting(row.waiting)
      if (row.bucket === "working" && row.lastTool) return `working: ${row.lastTool}`
      if (row.lastText) return firstLine(row.lastText)
      if (row.lastTool) return row.lastTool
      return row.bucket === "working" ? "working" : "no output yet"
    }

    const upsert = (info: Session.Info) => {
      const existing = rows.get(info.id)
      const saved = recovered.get(info.id)
      const mark = marks.get(info.id)
      const row: Row = existing ?? {
        sessionID: info.id,
        directory: info.directory,
        projectID: info.projectID,
        title: info.title,
        agent: info.agent,
        routine: typeof info.metadata?.routineName === "string" ? info.metadata.routineName : routineOf(info.title),
        bucket: "done",
        summary: "no output yet",
        pinned: mark?.pinned ?? false,
        muted: mark?.muted ?? false,
        source: "cow",
        hostID: host.id,
        capabilities: ["read", "open", "steer", "queue", "cancel", "answer"],
        decisions: [],
        time: { created: info.time.created, updated: info.time.updated },
        ...(saved ? (structuredClone(saved) as DeepMutable<Thread>) : {}),
        lifecycle: saved?.lifecycle ? transition(saved.lifecycle, { type: "restart" }, Date.now()) : undefined,
        ...(saved?.decisions
          ? {
              decisions: saved.decisions.map((item) => ({
                ...(structuredClone(item) as DeepMutable<Decision>),
                status: "reconciliation_required" as const,
              })),
            }
          : {}),
        roles: new Map(),
        edited: false,
        lastPartAt: info.time.updated,
        stalled: false,
      }
      row.title = info.title
      row.routine = typeof info.metadata?.routineName === "string" ? info.metadata.routineName : routineOf(info.title)
      row.agent = info.agent
      row.directory = info.directory
      row.projectID = info.projectID
      row.executionID = typeof info.metadata?.executionID === "string" ? info.metadata.executionID : undefined
      row.objective = typeof info.metadata?.officeObjective === "string" ? info.metadata.officeObjective : undefined
      rows.set(info.id, row)
      dirty.add(info.id)
      return row
    }

    // A permission raised by a subagent lands on the parent thread; the parent
    // is what Callum sees and what the farmer can steer.
    const resolve = (sessionID: string) =>
      Effect.gen(function* () {
        const direct = rows.get(sessionID)
        if (direct) return direct
        const parent = parents.get(sessionID)
        if (parent) return rows.get(parent)
        const info = yield* sessions.get(SessionID.make(sessionID)).pipe(Effect.orElseSucceed(() => undefined))
        if (!info) return undefined
        if (info.parentID) {
          parents.set(sessionID, info.parentID)
          return rows.get(info.parentID)
        }
        if (info.directory === directory) return undefined
        if (info.time.archived) return undefined
        return upsert(info)
      })

    const wait = (row: Row, waiting: Waiting, sessionID: string) =>
      Effect.gen(function* () {
        if (!("id" in waiting)) return
        const decision: DeepMutable<Decision> = {
          id: waiting.id,
          sessionID,
          rootSessionID: row.sessionID,
          runID: row.lifecycle?.runID,
          waiting: structuredClone(waiting) as DeepMutable<Waiting>,
          status: "pending",
          created: Date.now(),
        }
        yield* ledger.put({
          id: "decision:" + waiting.id,
          kind: "decision",
          state: "pending",
          sessionID: row.sessionID,
          value: decision,
        })
        row.decisions = [...(row.decisions ?? []).filter((item) => item.id !== waiting.id), decision]
        row.waiting = row.decisions.find((item) => item.status === "pending")?.waiting
        row.lifecycle = transition(row.lifecycle, { type: "waiting" }, Date.now())
      })

    const answered = (row: Row, id: string) =>
      Effect.gen(function* () {
        const decision = row.decisions?.find((item) => item.id === id)
        if (!decision) return
        yield* ledger.put({
          id: "decision:" + id,
          kind: "decision",
          state: "answered",
          sessionID: row.sessionID,
          value: { ...decision, status: "answered" },
        })
        row.decisions = row.decisions?.filter((item) => item.id !== id)
        row.waiting = row.decisions?.[0]?.waiting
        row.bucket = row.waiting ? "needs_you" : "working"
        row.lifecycle = transition(row.lifecycle, { type: row.waiting ? "waiting" : "busy" }, Date.now())
        row.summary = summarize(row)
        touch(row)
        yield* saveThread(row)
      })

    const finish = (row: Row) =>
      Effect.gen(function* () {
        if (row.waiting || ["failed", "canceled", "unknown", "stopped"].includes(row.lifecycle?.phase ?? "")) return
        row.lifecycle = transition(row.lifecycle, { type: "idle" }, Date.now())
        if (row.lastText) row.lifecycle.outcome = "reported"
        row.waiting = undefined
        row.stalled = false
        const reviewable = row.pr !== undefined || row.edited
        row.bucket = reviewable ? "review" : "done"
        row.edited = false
        row.summary = summarize(row)
        touch(row)
        if (row.muted) return
        yield* note({
          kind: row.pr ? "pr" : "finished",
          sessionID: row.sessionID,
          directory: row.directory,
          title: row.title,
          runID: row.lifecycle.runID,
          summary:
            "Turn stopped; objective and verification are unverified. " +
            (row.pr ? `${row.summary} · ${row.pr}` : row.summary),
        })
      })

    const handle = (type: string, data: unknown) =>
      Effect.gen(function* () {
        if (type === "session.created" || type === "session.updated") {
          const payload = data as { info: Session.Info }
          const info = payload.info
          if (info.parentID) {
            parents.set(info.id, info.parentID)
            return
          }
          if (info.directory === directory) return
          if (info.time.archived) {
            rows.delete(info.id)
            yield* ledger.put(
              { id: "thread:" + info.id, kind: "thread", state: "archived", value: publicThread(blank(info)) },
              { kind: "office.removed", sessionID: info.id, value: { sessionID: info.id, hostID: host.id } },
            )
            emit("office.removed", { sessionID: info.id, hostID: host.id })
            return
          }
          const row = upsert(info)
          row.time = { ...row.time, updated: info.time.updated }
          return
        }
        if (type === "session.deleted") {
          const payload = data as { info: Session.Info }
          rows.delete(payload.info.id)
          yield* ledger.put(
            {
              id: "thread:" + payload.info.id,
              kind: "thread",
              state: "deleted",
              value: publicThread(blank(payload.info)),
            },
            {
              kind: "office.removed",
              sessionID: payload.info.id,
              value: { sessionID: payload.info.id, hostID: host.id },
            },
          )
          emit("office.removed", { sessionID: payload.info.id, hostID: host.id })
          return
        }
        if (type === "session.status") {
          const payload = data as { sessionID: string; status: { type: string; message?: string } }
          const row = yield* resolve(payload.sessionID)
          if (!row) return
          if (payload.status.type === "busy") {
            // A pending permission or question survives busy: the run is still
            // in progress while it waits, and only a reply clears it.
            const blocked = row.waiting?.kind === "permission" || row.waiting?.kind === "question"
            row.lifecycle = transition(row.lifecycle, { type: blocked ? "waiting" : "busy" }, Date.now())
            row.bucket = blocked ? "needs_you" : "working"
            if (!blocked) row.waiting = undefined
            row.stalled = false
            row.lastPartAt = Date.now()
            row.summary = summarize(row)
            touch(row)
            return
          }
          if (payload.status.type === "retry") {
            row.summary = `retrying: ${trim(payload.status.message, 120) ?? ""}`
            touch(row)
          }
          return
        }
        if (type === "session.idle") {
          const payload = data as { sessionID: string }
          const row = rows.get(payload.sessionID)
          if (!row) return
          yield* finish(row)
          return
        }
        if (type === "session.interrupted") {
          const payload = data as { sessionID: string }
          const row = yield* resolve(payload.sessionID)
          if (!row) return
          row.lifecycle = transition(row.lifecycle, { type: "cancel", reason: "Canceled by user." }, Date.now())
          row.bucket = "done"
          row.summary = "Canceled by user; objective and verification are unverified."
          touch(row)
          yield* note({
            kind: "finished",
            sessionID: row.sessionID,
            directory: row.directory,
            title: row.title,
            summary: row.summary,
            runID: row.lifecycle.runID,
          })
          return
        }
        if (type === "session.error") {
          const payload = data as { sessionID?: string; error?: { name?: string; data?: { message?: string } } }
          if (!payload.sessionID) return
          const row = yield* resolve(payload.sessionID)
          if (!row) return
          if (row.lifecycle?.phase === "canceled") return
          const message = payload.error?.data?.message ?? payload.error?.name ?? "unknown error"
          row.lifecycle = transition(row.lifecycle, { type: "error", reason: message }, Date.now())
          // Rate limits and repeated identical errors: update the row, but do not raise another card.
          const repeat =
            row.lastErrorAt !== undefined &&
            Date.now() - row.lastErrorAt < 15 * 60_000 &&
            (/Too Many Requests|rate limit/i.test(message) || row.lastErrorMessage === message)
          row.lastErrorAt = Date.now()
          row.lastErrorMessage = message
          row.bucket = "failed"
          row.waiting = { kind: "error", message }
          row.summary = summarize(row)
          if (repeat) {
            touch(row)
            return
          }
          touch(row)
          if (row.muted) return
          yield* note({
            kind: "error",
            sessionID: row.sessionID,
            directory: row.directory,
            title: row.title,
            summary: message,
          })
          return
        }
        if (type === "permission.asked") {
          const payload = data as PermissionV1.Request
          const row = yield* resolve(payload.sessionID)
          if (!row) return
          const tier = classify(
            { permission: payload.permission, patterns: payload.patterns, metadata: payload.metadata },
            settings.autonomy,
          )
          const description =
            typeof payload.metadata.description === "string" ? payload.metadata.description : undefined
          row.waiting = {
            kind: "permission",
            id: payload.id,
            permission: payload.permission,
            patterns: [...payload.patterns],
            always: [...payload.always],
            metadata: payload.metadata,
            title: description,
            tier,
          }
          const waiting = row.waiting
          yield* wait(row, waiting, payload.sessionID)
          row.bucket = "needs_you"
          row.summary = summarize(row)
          touch(row)
          if (row.muted) return
          yield* note({
            kind: "permission",
            sessionID: row.sessionID,
            directory: row.directory,
            title: row.title,
            summary: describeWaitingForFarmer(waiting),
            requestID: payload.id,
            runID: row.lifecycle?.runID,
          })
          return
        }
        if (type === "permission.replied" || type === "question.replied" || type === "question.rejected") {
          const payload = data as { sessionID: string; requestID: string }
          const row = yield* resolve(payload.sessionID)
          if (!row) return
          yield* answered(row, payload.requestID)
          return
        }
        if (type === "question.asked") {
          const payload = data as typeof QuestionV1.Request.Type
          const row = yield* resolve(payload.sessionID)
          if (!row) return
          row.waiting = {
            kind: "question",
            id: payload.id,
            questions: payload.questions.map((question) => ({
              question: question.question,
              header: question.header,
              options: question.options.map((option) => ({ label: option.label, description: option.description })),
              multiple: question.multiple,
              custom: question.custom,
            })),
          }
          const waiting = row.waiting
          yield* wait(row, waiting, payload.sessionID)
          row.bucket = "needs_you"
          row.summary = summarize(row)
          touch(row)
          if (row.muted) return
          yield* note({
            kind: "question",
            sessionID: row.sessionID,
            directory: row.directory,
            title: row.title,
            summary: describeWaitingForFarmer(waiting),
            requestID: payload.id,
            runID: row.lifecycle?.runID,
          })
          return
        }
        if (type === "message.updated") {
          const payload = data as { sessionID: string; info: SessionV1.Info }
          const row = rows.get(payload.sessionID)
          if (!row) return
          const seen = row.roles.has(payload.info.id)
          row.roles.set(payload.info.id, payload.info.role)
          if (payload.info.role === "user" && !seen) {
            row.lifecycle = transition(row.lifecycle, { type: "input", id: payload.info.id }, Date.now())
            row.edited = false
            row.pr = undefined
          }
          return
        }
        if (type === "message.part.updated") {
          const payload = data as { sessionID: string; part: SessionV1.Part }
          const row = rows.get(payload.sessionID)
          if (!row) return
          const part = payload.part
          row.lastPartAt = Date.now()
          if (part.type === "text") {
            if (row.roles.get(part.messageID) !== "assistant") return
            row.lastText = trim(part.text, 600)
            const link = part.text.match(PR_LINK)
            if (link) row.pr = link[0]
            if (row.bucket !== "working") {
              row.summary = summarize(row)
              dirty.add(row.sessionID)
            }
            return
          }
          if (part.type === "tool") {
            const evidence = toolEvidence(part)
            if (
              evidence &&
              row.lifecycle &&
              !row.lifecycle.evidence.some((item) => item.reference === evidence.reference)
            )
              row.lifecycle.evidence.push({ ...evidence })
            const title = "title" in part.state && typeof part.state.title === "string" ? part.state.title : ""
            row.lastTool = trim(`${part.tool}${title ? `: ${title}` : ""}`, 120)
            if (EDIT_TOOLS.has(part.tool)) row.edited = true
            if (row.bucket === "working") {
              row.summary = summarize(row)
              dirty.add(row.sessionID)
            }
          }
          return
        }
      })

    const blank = (info: Session.Info): Row => ({
      sessionID: info.id,
      directory: info.directory,
      projectID: info.projectID,
      title: info.title,
      agent: info.agent,
      bucket: "done",
      summary: "",
      pinned: false,
      muted: false,
      source: "cow",
      time: { created: info.time.created, updated: info.time.updated },
      roles: new Map(),
      edited: false,
      lastPartAt: 0,
      stalled: false,
    })

    const seed = Effect.gen(function* () {
      const now = Date.now()
      const list = yield* sessions.listGlobal({ roots: true, limit: 300 })
      for (const info of list) {
        if (info.directory === directory) continue
        if (now - info.time.updated > RECENT_MS) continue
        const row = upsert(info)
        row.projectName = info.project?.name ?? path.basename(info.project?.worktree ?? info.directory)
        if (now - info.time.updated > DETAIL_MS) continue
        const messages = yield* sessions
          .messages({ sessionID: SessionID.make(info.id), limit: 6 })
          .pipe(Effect.orElseSucceed(() => [] as SessionV1.WithParts[]))
        const last = messages.findLast((message) => message.info.role === "assistant")
        if (!last || last.info.role !== "assistant") continue
        for (const message of messages) row.roles.set(message.info.id, message.info.role)
        const text = last.parts.findLast((part) => part.type === "text")
        if (text && text.type === "text") {
          row.lastText = trim(text.text, 600)
          const link = text.text.match(PR_LINK)
          if (link) row.pr = link[0]
        }
        const tool = last.parts.findLast((part) => part.type === "tool")
        if (tool && tool.type === "tool") {
          const title = "title" in tool.state && typeof tool.state.title === "string" ? tool.state.title : ""
          row.lastTool = trim(`${tool.tool}${title ? `: ${title}` : ""}`, 120)
        }
        const working = last.info.time.completed === undefined && !last.info.error
        const input = messages.findLast((message) => message.info.role === "user")
        // A completed reply to the latest input is execution evidence after a
        // restart. An unanswered context/queued input still needs reconciliation.
        if (!row.lifecycle || (row.lifecycle.phase === "unknown" && !working && input?.info.id === last.info.parentID))
          row.lifecycle = {
            phase: last.info.error ? "failed" : working ? "unknown" : "stopped",
            runID: input?.info.id,
            observedAt: info.time.updated,
            outcome: !working && !last.info.error && row.lastText ? "reported" : "unverified",
            evidence: row.lifecycle?.evidence ?? [],
            reason: working ? "Execution needs reconciliation after startup." : undefined,
          }
        row.bucket = row.waiting
          ? "needs_you"
          : row.lifecycle.phase === "failed"
            ? "failed"
            : row.lifecycle.phase === "unknown"
              ? "review"
              : row.pr
                ? "review"
                : "done"
        row.lastPartAt = info.time.updated
        row.summary = row.lifecycle.reason ?? summarize(row)
      }
      const names = new Map<string, string>()
      for (const info of list) if (info.project?.name) names.set(info.projectID, info.project.name)
      for (const row of rows.values()) row.projectName = row.projectName ?? names.get(row.projectID)
      yield* flush
      startup.seeded = true
      emit("office.seeded", { threads: rows.size })
    }).pipe(Effect.catchCause((cause) => Effect.logWarning("office seed failed", { cause })))

    const find = (id: string) => rows.get(id) ?? claude.get(id) ?? codex.get(id)

    const flush = Effect.gen(function* () {
      const ids = [...dirty]
      dirty.clear()
      for (const id of ids) {
        const row = find(id)
        if (!row) continue
        const value = structuredClone(publicThread(row))
        yield* ledger
          .put(
            { id: "thread:" + id, kind: "thread", state: value.lifecycle?.phase ?? value.bucket, sessionID: id, value },
            { kind: "office.thread", sessionID: id, value },
          )
          .pipe(
            Effect.tap(() => Effect.sync(() => emit("office.thread", value))),
            Effect.catchCause((cause) =>
              Effect.gen(function* () {
                dirty.add(id)
                yield* Effect.logError("office state persistence failed", { cause })
              }),
            ),
          )
      }
    })

    // Codex threads from the ChatGPT desktop app, read-only: every thread is a
    // JSONL rollout under ~/.codex/sessions/YYYY/MM/DD. The head carries the
    // session meta and the first user message; the tail says whether a turn is
    // open (task_started after the last task_complete) and what was last said.
    const sources: Record<string, { status: "loading" | "available" | "unavailable"; observedAt: number }> = {
      codex: { status: "loading", observedAt: 0 },
      claude: { status: "loading", observedAt: 0 },
    }
    const codex = new Map<string, Row>()
    let index: { at: number; files: string[] } | undefined
    const codexRoot = path.join(Global.Path.home, ".codex", "sessions")
    const codexSeen = new Map<string, { mtime: number; title: string; id: string; cwd: string; created: number }>()
    const CODEX_HEAD = 512 * 1024
    const CODEX_TAIL = 96 * 1024

    const readSlice = (file: string, start: number, length: number) =>
      Effect.tryPromise(async () => {
        const handle = await fs.open(file, "r")
        try {
          const buffer = Buffer.alloc(length)
          const result = await handle.read(buffer, 0, length, start)
          return buffer.subarray(0, result.bytesRead).toString("utf8")
        } finally {
          await handle.close()
        }
      })

    const parseLines = (text: string) =>
      text.split("\n").flatMap((line) => {
        if (!line.startsWith("{")) return []
        try {
          return [
            JSON.parse(line) as {
              type?: string
              timestamp?: string
              ordinal?: number
              payload?: Record<string, unknown>
            },
          ]
        } catch {
          return []
        }
      })

    const userText = (payload: Record<string, unknown>) => {
      const item = payload.item as { type?: string; content?: Array<{ type?: string; text?: string }> } | undefined
      if (item?.type !== "UserMessage") return undefined
      const text = item.content?.find((part) => typeof part.text === "string")?.text ?? ""
      const clean = text
        .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      return clean || undefined
    }

    const codexTick = Effect.gen(function* () {
      const now = Date.now()
      if (!index || now - index.at >= 60_000)
        index = { at: now, files: yield* Effect.tryPromise(() => rolloutFiles(codexRoot)) }
      const files = index.files
      sources.codex = { status: "available", observedAt: now }
      const present = new Set<string>()
      for (const file of files) {
        const stat = yield* Effect.tryPromise(() => fs.stat(file)).pipe(Effect.orElseSucceed(() => undefined))
        if (!stat) continue
        if (now - stat.mtimeMs > RECENT_MS) continue
        const cached = codexSeen.get(file)
        const meta =
          cached ??
          (yield* Effect.gen(function* () {
            const head = parseLines(yield* readSlice(file, 0, CODEX_HEAD))
            const session = head.find((record) => record.type === "session_meta")?.payload as
              | { id?: string; session_id?: string; cwd?: string; timestamp?: string; thread_source?: string }
              | undefined
            const id = session?.session_id ?? session?.id
            if (!id) return undefined
            // Codex automations (scheduled runs) are not Callum's threads; skip them.
            if (session?.thread_source && session.thread_source !== "user") return undefined
            const first = head
              .filter((record) => record.type === "event_msg" && record.payload?.type === "item_completed")
              .map((record) => userText(record.payload ?? {}))
              .find((text) => text)
            return {
              mtime: 0,
              id,
              cwd: session?.cwd ?? Global.Path.home,
              title: trim(first, 80) ?? "Codex thread",
              created: session?.timestamp ? Date.parse(session.timestamp) : stat.birthtimeMs,
            }
          }).pipe(Effect.orElseSucceed(() => undefined)))
        if (!meta) continue
        const rowID = `codex:${meta.id}`
        present.add(rowID)
        if (cached && cached.mtime === stat.mtimeMs) continue
        codexSeen.set(file, { ...meta, mtime: stat.mtimeMs })
        const tail = parseLines(
          yield* readSlice(file, Math.max(0, stat.size - CODEX_TAIL), CODEX_TAIL).pipe(Effect.orElseSucceed(() => "")),
        )
        let started = -1
        let complete = -1
        let last: string | undefined
        let lastUser: string | undefined
        let cwd = meta.cwd
        for (const record of tail) {
          const payload = record.payload ?? {}
          const ordinal = tail.indexOf(record) + 1
          if (record.type === "turn_context" && typeof payload.cwd === "string") cwd = payload.cwd
          if (record.type !== "event_msg") continue
          if (payload.type === "task_started") started = Math.max(started, ordinal)
          if (payload.type === "task_complete" || payload.type === "task_aborted" || payload.type === "turn_aborted") {
            complete = Math.max(complete, ordinal)
            if (typeof payload.last_agent_message === "string") last = payload.last_agent_message
          }
          if (payload.type === "item_completed") lastUser = userText(payload) ?? lastUser
        }
        const working = started > complete || (started < 0 && complete < 0 && now - stat.mtimeMs < 120_000)
        const existing = codex.get(rowID)
        const row: Row = existing ?? {
          sessionID: rowID,
          directory: cwd,
          projectID: "codex",
          projectName: "codex",
          title: meta.title,
          agent: "codex",
          bucket: "done",
          summary: "",
          pinned: marks.get(rowID)?.pinned ?? false,
          muted: marks.get(rowID)?.muted ?? true,
          source: "codex",
          time: { created: meta.created, updated: stat.mtimeMs },
          roles: new Map(),
          edited: false,
          lastPartAt: stat.mtimeMs,
          stalled: true,
        }
        const wasWorking = existing?.bucket === "working"
        row.hostID = host.id
        row.capabilities = ["observe"]
        row.availability = "available"
        row.lifecycle = {
          phase: working ? "running" : complete ? "stopped" : "unknown",
          observedAt: stat.mtimeMs,
          outcome: "unverified",
          evidence: [],
        }
        row.directory = cwd
        row.title = meta.title === "Codex thread" && lastUser ? (trim(lastUser, 80) ?? meta.title) : meta.title
        row.lastText = trim(last, 600)
        const link = last?.match(PR_LINK)
        if (link) row.pr = link[0]
        row.bucket = working ? "working" : row.pr ? "review" : "done"
        row.summary = working
          ? `Codex is working${lastUser ? ` on: ${trim(lastUser, 100)}` : ""}`
          : row.lastText
            ? firstLine(row.lastText)
            : "Codex thread"
        row.time = { ...row.time, updated: stat.mtimeMs }
        row.lastPartAt = stat.mtimeMs
        codex.set(rowID, row)
        dirty.add(rowID)
        if (wasWorking && !working && !row.muted) {
          yield* note({
            kind: row.pr ? "pr" : "finished",
            sessionID: rowID,
            directory: cwd,
            title: `${row.title} (Codex)`,
            summary: row.pr ? `${row.summary} · ${row.pr}` : row.summary,
          })
        }
      }
      for (const id of [...codex.keys()]) {
        if (present.has(id)) continue
        const row = codex.get(id)
        codex.delete(id)
        if (row) emit("office.removed", { sessionID: id, hostID: host.id })
      }
    }).pipe(
      Effect.catchCause(() =>
        Effect.sync(() => {
          sources.codex.status = "unavailable"
          for (const row of codex.values()) {
            row.availability = "stale"
            dirty.add(row.sessionID)
          }
        }),
      ),
    )

    // Claude Code sessions on this machine, read-only: `claude agents --json`
    // lists live processes but not their state, so they always read as working.
    const claude = new Map<string, Row>()
    const claudeTick = Effect.gen(function* () {
      if (process.env.OPENCODE_TEST_HOME) {
        sources.claude.status = "unavailable"
        return
      }
      const text = yield* Effect.tryPromise(
        () =>
          new Promise<string>((resolve, reject) => {
            execFile(
              "claude",
              ["agents", "--json"],
              { timeout: 10_000, maxBuffer: 4 * 1024 * 1024 },
              (error, stdout) => {
                if (error) return reject(error)
                resolve(stdout)
              },
            )
          }),
      )
      const parsed: unknown = text.trim() ? JSON.parse(text) : []
      if (!Array.isArray(parsed)) throw new Error("Invalid Claude agent inventory")
      sources.claude = { status: "available", observedAt: Date.now() }
      const now = Date.now()
      const seen = new Set<string>()
      for (const item of parsed as Array<{
        sessionId?: string
        name?: string
        cwd?: string
        kind?: string
        startedAt?: number
      }>) {
        if (!item.sessionId || !item.cwd) continue
        const id = `claude:${item.sessionId}`
        seen.add(id)
        const started = item.startedAt ?? now
        const row: Row = claude.get(id) ?? {
          sessionID: id,
          directory: item.cwd,
          projectID: "claude",
          projectName: "claude code",
          title: `${item.name ?? "claude"} · ${path.basename(item.cwd)}`,
          agent: item.kind,
          bucket: "working",
          summary: "",
          pinned: marks.get(id)?.pinned ?? false,
          muted: marks.get(id)?.muted ?? true,
          source: "claude",
          time: { created: started, updated: started },
          roles: new Map(),
          edited: false,
          lastPartAt: started,
          stalled: true,
        }
        row.hostID = host.id
        row.capabilities = ["observe"]
        row.availability = "available"
        row.lifecycle = {
          phase: "unknown",
          reason: "Process is visible; agent turn state is unavailable.",
          observedAt: now,
          outcome: "unverified",
          evidence: [],
        }
        row.summary = `Claude Code ${item.kind ?? ""} session in ${item.cwd}, running ${age(now, started).replace(" ago", "")}`
        if (!claude.has(id)) {
          claude.set(id, row)
          dirty.add(id)
        }
      }
      for (const id of [...claude.keys()]) {
        if (seen.has(id)) continue
        const row = claude.get(id)
        claude.delete(id)
        if (row) emit("office.removed", { sessionID: id, hostID: host.id })
      }
    }).pipe(
      Effect.catchCause(() =>
        Effect.sync(() => {
          sources.claude.status = "unavailable"
          for (const row of claude.values()) {
            row.availability = "stale"
            dirty.add(row.sessionID)
          }
        }),
      ),
    )

    const stalls = Effect.gen(function* () {
      const now = Date.now()
      for (const row of rows.values()) {
        if (row.bucket !== "working" || row.stalled || row.muted) continue
        if (now - row.lastPartAt < STALL_MS) continue
        row.stalled = true
        yield* note({
          kind: "stalled",
          sessionID: row.sessionID,
          directory: row.directory,
          title: row.title,
          summary: `no output for ${Math.floor((now - row.lastPartAt) / 60_000)} minutes · ${row.summary}`,
        })
      }
    })

    yield* restore
    const unsubscribe = yield* events.listen((event) => handle(event.type, event.data).pipe(Effect.ignore))
    yield* Effect.addFinalizer(() => unsubscribe)
    yield* seed.pipe(Effect.forkIn(scope, { startImmediately: true }))
    yield* Effect.forever(Effect.sleep("500 millis").pipe(Effect.andThen(flush))).pipe(
      Effect.forkIn(scope, { startImmediately: true }),
    )
    yield* Effect.forever(Effect.sleep("60 seconds").pipe(Effect.andThen(stalls))).pipe(
      Effect.forkIn(scope, { startImmediately: true }),
    )
    yield* Effect.forever(claudeTick.pipe(Effect.andThen(Effect.sleep("30 seconds")))).pipe(
      Effect.forkIn(scope, { startImmediately: true }),
    )
    yield* Effect.forever(codexTick.pipe(Effect.andThen(Effect.sleep("20 seconds")))).pipe(
      Effect.forkIn(scope, { startImmediately: true }),
    )

    const threads = () =>
      [...rows.values(), ...claude.values(), ...codex.values()]
        .map(publicThread)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.time.updated - a.time.updated)

    const state = Effect.fn("Office.state")(function* () {
      // Read the cursor before the synchronous snapshot: replay may overlap, never skip a newer state.
      const cursor = yield* ledger.cursor()
      const list = threads()
      const counts = { needs_you: 0, failed: 0, review: 0, working: 0, done: 0 }
      for (const thread of list) counts[thread.bucket] += 1
      return {
        host,
        epoch,
        cursor,
        seeded: startup.seeded,
        outcomes: (yield* ledger.list<Outcome>("outcome")).slice(-100).map((row) => row.value),
        sources: structuredClone(sources),
        recovery: (yield* Effect.forEach(["command", "request", "report", "reminder"], (kind) =>
          ledger.list(kind, "reconciliation_required"),
        ))
          .flat()
          .map((row) => ({ id: row.id, kind: row.kind, sessionID: row.sessionID })),
        overseer: settings.overseer ?? null,
        threads: list,
        reports: [...reports],
        reminders: [...reminders],
        counts,
        autonomy: settings.autonomy,
        updated: Date.now(),
      }
    })

    const thread = Effect.fn("Office.thread")(function* (sessionID: string) {
      const row = find(sessionID)
      return row ? publicThread(row) : undefined
    })

    const mark = Effect.fn("Office.mark")(function* (input: { sessionID: string; pinned?: boolean; muted?: boolean }) {
      const current = marks.get(input.sessionID) ?? {}
      const next = {
        pinned: input.pinned ?? current.pinned,
        muted: input.muted ?? current.muted,
      }
      marks.set(input.sessionID, next)
      const row = find(input.sessionID)
      if (row) {
        row.pinned = next.pinned ?? false
        row.muted = next.muted ?? false
        dirty.add(row.sessionID)
      }
      yield* persist()
    })

    const context = Effect.fn("Office.context")(function* (dir: string) {
      const result = yield* projects.fromDirectory(dir)
      return { directory: dir, worktree: result.sandbox, project: result.project } satisfies InstanceContext
    })

    const answer = Effect.fn("Office.answer")(function* (input: AnswerInput) {
      if (input.hostID && input.hostID !== host.id)
        return yield* new OfficeError({ message: "This decision belongs to a different host." })
      if (Boolean(input.permission) === Boolean(input.question))
        return yield* new OfficeError({ message: "Choose exactly one permission or question to answer." })
      const id = input.permission?.id ?? input.question?.id
      const decision = id ? yield* ledger.get<Decision>("decision:" + id) : undefined
      if (
        !decision ||
        decision.state !== "pending" ||
        ![decision.value.rootSessionID, decision.value.sessionID].includes(input.sessionID)
      )
        return yield* new OfficeError({ message: "That exact decision is no longer pending; refresh the worker." })
      if (input.runID && input.runID !== decision.value.runID)
        return yield* new OfficeError({ message: "This decision belongs to another worker run." })
      const row = rows.get(input.sessionID)
      const info = yield* sessions
        .get(SessionID.make(decision.value.sessionID))
        .pipe(Effect.orElseSucceed(() => undefined))
      const dir = info?.directory
      if (!dir) return yield* new OfficeError({ message: `unknown thread ${input.sessionID}` })
      const ctx = yield* context(dir)
      if (input.permission) {
        const pending = yield* permissions.list().pipe(Effect.provideService(InstanceRef, ctx))
        if (!pending.some((item) => item.id === id && item.sessionID === decision.value.sessionID))
          return yield* new OfficeError({ message: "That permission is no longer pending on this worker." })
        yield* permissions
          .reply({
            requestID: PermissionV1.ID.make(input.permission.id),
            reply: input.permission.reply,
            scope: "request",
            message: input.permission.message,
          })
          .pipe(
            Effect.provideService(InstanceRef, ctx),
            Effect.mapError(() => new OfficeError({ message: "that permission is no longer pending" })),
          )
      }
      if (input.question) {
        const pending = yield* questions.list().pipe(Effect.provideService(InstanceRef, ctx))
        if (!pending.some((item) => item.id === id && item.sessionID === decision.value.sessionID))
          return yield* new OfficeError({ message: "That question is no longer pending on this worker." })
        yield* questions
          .reply({ requestID: QuestionV1.ID.make(input.question.id), answers: input.question.answers })
          .pipe(
            Effect.provideService(InstanceRef, ctx),
            Effect.mapError(() => new OfficeError({ message: "that question is no longer pending" })),
          )
      }
      yield* ledger.put({
        id: decision.id,
        kind: "decision",
        state: "answered",
        sessionID: decision.sessionID,
        value: { ...decision.value, status: "answered" },
      })
      const root = row ?? rows.get(decision.value.rootSessionID)
      if (root) yield* answered(root, decision.value.id)
    })

    const render = Effect.fn("Office.render")(function* () {
      const now = Date.now()
      const list = threads()
      const by = (bucket: Bucket) => list.filter((thread) => thread.bucket === bucket)
      const pendingText = (thread: Thread) =>
        (thread.decisions ?? [])
          .map((decision) =>
            decision.status === "pending"
              ? describeWaitingForFarmer(decision.waiting)
              : `decision ${decision.id}: ${decision.status}; inspect before continuing`,
          )
          .join(" | ")
      const line = (thread: Thread) =>
        `- [${thread.sessionID}] "${thread.title}" (${thread.projectName ?? path.basename(thread.directory)}) — ${pendingText(thread) || thread.summary} · phase ${thread.lifecycle?.phase ?? "unknown"}, outcome ${thread.lifecycle?.outcome ?? "unverified"} · host ${thread.hostID ?? host.id} · updated ${age(now, thread.time.updated)}${thread.muted ? " · muted" : ""}${thread.pinned ? " · pinned" : ""}${thread.source !== "cow" ? ` · ${thread.source}, read-only` : ""}`
      const section = (label: string, items: Thread[], max = 12) =>
        items.length === 0
          ? [`${label}: none`]
          : [
              `${label} (${items.length}):`,
              ...items.slice(0, max).map(line),
              ...(items.length > max ? [`  …and ${items.length - max} more`] : []),
            ]
      const when = new Date(now).toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour12: false })
      const autonomy =
        settings.autonomy === "act"
          ? "act — you may answer read-only and reversible permissions, steer threads, and dispatch work without asking; irreversible actions (tier callum) need Callum's own words quoted in office_answer."
          : "brief — only read-only permissions are auto-allowed; everything else waits for Callum."
      const routines = (() => {
        const latest = new Map<string, Thread>()
        for (const thread of list) {
          if (!thread.routine) continue
          const seen = latest.get(thread.routine)
          if (!seen || thread.time.updated > seen.time.updated) latest.set(thread.routine, thread)
        }
        return [...latest.values()].sort((x, y) => y.time.updated - x.time.updated)
      })()
      const routineLine = (thread: Thread) =>
        `- ${thread.routine}: ${thread.bucket} · last run ${age(now, thread.time.updated)} — ${thread.waiting ? describeWaitingForFarmer(thread.waiting) : thread.summary} [${thread.sessionID}]`
      const recent = reports
        .slice(-10)
        .map((report) => `- ${age(now, report.time)} · ${report.kind} · "${report.title}": ${report.summary}`)
      const due = reminders.map(
        (reminder) => `- ${reminder.id} due ${age(now, reminder.due).replace(" ago", "")}: ${reminder.note}`,
      )
      return [
        `FARMER'S OFFICE — state at ${when} PT on ${host.name} (${host.id}); ${startup.seeded ? "seeded" : "still loading"}`,
        `Autonomy: ${autonomy}`,
        `Counts: needs you ${by("needs_you").length} · failed ${by("failed").length} · ready for review ${by("review").length} · working ${by("working").length} · done ${by("done").length}`,
        ...section("NEEDS YOU", by("needs_you")),
        ...section("FAILED", by("failed")),
        ...section("READY FOR REVIEW", by("review")),
        ...section("WORKING", by("working")),
        ...section(
          "DONE (recent)",
          by("done").filter((thread) => !thread.routine),
          6,
        ),
        routines.length ? `ROUTINES (latest run each):\n${routines.map(routineLine).join("\n")}` : "ROUTINES: none yet",
        recent.length ? `RECENT REPORTS:\n${recent.join("\n")}` : "RECENT REPORTS: none",
        due.length ? `REMINDERS:\n${due.join("\n")}` : "REMINDERS: none",
      ].join("\n")
    })

    const remind = Effect.fn("Office.remind")(function* (input: { minutes: number; note: string; sessionID?: string }) {
      const reminder: Reminder = {
        id: "rem_" + randomUUID(),
        due: Date.now() + Math.max(1, input.minutes) * 60_000,
        note: input.note,
        sessionID: input.sessionID,
      }
      yield* ledger.put({ id: reminder.id, kind: "reminder", state: "pending", value: reminder })
      reminders.push(reminder)
      return reminder
    })

    const dueReminders = Effect.fn("Office.dueReminders")(function* () {
      const now = Date.now()
      const due = reminders.filter((reminder) => reminder.due <= now)
      return due
    })

    return Service.of({
      directory,
      state,
      thread,
      mark,
      autonomy: () => Effect.succeed(settings.autonomy),
      setAutonomy: (mode) =>
        Effect.gen(function* () {
          settings.autonomy = mode
          for (const row of rows.values()) {
            for (const decision of row.decisions ?? []) {
              if (decision.status !== "pending" || decision.waiting.kind !== "permission") continue
              decision.waiting = { ...decision.waiting, tier: classify(decision.waiting, mode) }
              yield* ledger.put({
                id: "decision:" + decision.id,
                kind: "decision",
                state: "pending",
                sessionID: decision.sessionID,
                value: decision,
              })
            }
            row.waiting = row.decisions?.find((decision) => decision.status === "pending")?.waiting
            dirty.add(row.sessionID)
          }
          yield* persist()
        }),
      overseer: () => Effect.succeed(settings.overseer),
      setOverseer: (ref) =>
        Effect.gen(function* () {
          settings.overseer = ref
          emit("office.overseer", ref)
          yield* persist()
        }),
      onReport: (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      note,
      answer,
      context,
      render,
      navigate: (ref) =>
        Effect.gen(function* () {
          if (!ref.clientID)
            return yield* new OfficeError({
              message: "No requesting client is attached; open this worker from its card.",
            })
          const value = { ...ref, hostID: host.id, time: Date.now() }
          yield* ledger.put(
            { id: "navigation:" + ref.requestID, kind: "navigation", state: "pending", value },
            { id: "navigation:" + ref.requestID, kind: "office.navigate", value },
          )
          emit("office.navigate", value)
        }),
      remind,
      dueReminders,
      acknowledgeReminders: (ids) =>
        Effect.gen(function* () {
          for (const id of ids) {
            const reminder = reminders.find((item) => item.id === id)
            if (!reminder) continue
            yield* ledger.put({ id, kind: "reminder", state: "delivered", value: reminder })
            reminders.splice(reminders.indexOf(reminder), 1)
          }
        }),
    })
  }),
)

export const node = LayerNode.make({
  service: Service,
  layer,
  deps: [EventV2Bridge.node, Session.node, Project.node, Permission.node, Question.node, OfficeLedger.node],
})

export * as Office from "./office"
