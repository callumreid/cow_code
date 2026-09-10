// The farmer's tools. Every one of them reads or steers another thread through
// the same session, permission, and question services the UI uses.
import { Effect, Schema, Scope } from "effect"
import * as Tool from "./tool"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { InstanceRef } from "@/effect/instance-ref"
import { Office } from "@/office/office"
import { looksLikeApproval } from "@/office/policy"
import { Session } from "@/session/session"
import { SessionID } from "@/session/schema"
import type { TaskPromptOps } from "./task"

const READ_LIMIT = 8_000

function excerpt(messages: SessionV1.WithParts[]) {
  const lines = messages.flatMap((message) => {
    const role = message.info.role === "user" ? "CALLUM" : "THREAD"
    return message.parts.flatMap((part) => {
      if (part.type === "text") return [`${role}: ${part.text.trim().slice(0, 1_500)}`]
      if (part.type === "tool") {
        const title = "title" in part.state && typeof part.state.title === "string" ? part.state.title : ""
        const status = part.state.status
        return [`  [${part.tool}${title ? `: ${title}` : ""}] ${status}`]
      }
      return []
    })
  })
  const text = lines.join("\n")
  return text.length > READ_LIMIT ? "…" + text.slice(-READ_LIMIT) : text
}

const ReadParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id from the office state" }),
  limit: Schema.optional(Schema.Finite).annotate({ description: "How many recent messages to read (default 12)" }),
})

export const OfficeStatusTool = Tool.define<typeof StatusParameters, Record<string, never>, Office.Service>(
  "office_status",
  Effect.gen(function* () {
    const office = yield* Office.Service
    return {
      description:
        "Current Farmer's Office state: every thread by bucket with its summary, waiting reason, and permission tier, plus recent reports and reminders. Call this when the state block at the top of the turn is missing or stale.",
      parameters: StatusParameters,
      execute: () =>
        Effect.gen(function* () {
          const text = yield* office.render()
          return { title: "office state", output: text, metadata: {} }
        }),
    } satisfies Tool.DefWithoutID<typeof StatusParameters, Record<string, never>>
  }),
)
const StatusParameters = Schema.Struct({})

export const OfficeReadTool = Tool.define<typeof ReadParameters, { sessionID: string }, Office.Service | Session.Service>(
  "office_read",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    return {
      description:
        "Read a bounded excerpt of one thread's recent transcript: Callum's messages, the thread's replies, and its tool calls. Use it before deciding anything the summary line does not settle.",
      parameters: ReadParameters,
      execute: (params) =>
        Effect.gen(function* () {
          const thread = yield* office.thread(params.sessionID)
          const messages = yield* sessions
            .messages({ sessionID: SessionID.make(params.sessionID), limit: Math.max(1, Math.min(40, params.limit ?? 12)) })
            .pipe(Effect.orElseSucceed(() => [] as SessionV1.WithParts[]))
          if (messages.length === 0)
            return { title: thread?.title ?? params.sessionID, output: "No messages found for that thread.", metadata: { sessionID: params.sessionID } }
          const header = thread
            ? `Thread "${thread.title}" (${thread.projectName ?? thread.directory}) · bucket ${thread.bucket}${thread.waiting ? ` · waiting: ${thread.summary}` : ""}`
            : `Thread ${params.sessionID}`
          return { title: thread?.title ?? params.sessionID, output: `${header}\n\n${excerpt(messages)}`, metadata: { sessionID: params.sessionID } }
        }),
    } satisfies Tool.DefWithoutID<typeof ReadParameters, { sessionID: string }>
  }),
)

const PromptParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
  text: Schema.String.annotate({ description: "What to tell the thread, in plain words, as if Callum typed it" }),
  mode: Schema.Literals(["steer", "context"]).annotate({
    description: "steer = the thread acts on it now; context = just add it to the thread's context without a reply",
  }),
  reason: Schema.String.annotate({ description: "One line on why, for the office log" }),
})

export const OfficePromptTool = Tool.define<
  typeof PromptParameters,
  { sessionID: string },
  Office.Service | Session.Service | Scope.Scope
>(
  "office_prompt",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    const scope = yield* Scope.Scope
    return {
      description:
        "Send instructions into another thread. Use steer when the thread should act now (a follow-up Callum asked for, or an obvious next step the thread named itself); use context to hand it information without starting a turn.",
      parameters: PromptParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const ops = ctx.extra?.promptOps as TaskPromptOps | undefined
          if (!ops) return { title: "office_prompt", output: "Prompting is not available in this context.", metadata: { sessionID: params.sessionID } }
          const thread = yield* office.thread(params.sessionID)
          const info = thread ? undefined : yield* sessions.get(SessionID.make(params.sessionID)).pipe(Effect.orElseSucceed(() => undefined))
          const directory = thread?.directory ?? info?.directory
          if (!directory) return { title: "office_prompt", output: `No thread with id ${params.sessionID}.`, metadata: { sessionID: params.sessionID } }
          const target = yield* office.context(directory)
          yield* ops
            .prompt({
              sessionID: SessionID.make(params.sessionID),
              noReply: params.mode === "context",
              parts: [{ type: "text", text: params.text }],
            })
            .pipe(
              Effect.provideService(InstanceRef, target),
              Effect.catchCause((cause) => Effect.logError("office_prompt failed", { sessionID: params.sessionID, cause })),
              Effect.forkIn(scope, { startImmediately: true }),
            )
          return {
            title: `${params.mode} → ${thread?.title ?? params.sessionID}`,
            output: `Sent to "${thread?.title ?? params.sessionID}" as ${params.mode}: ${params.text}`,
            metadata: { sessionID: params.sessionID },
          }
        }),
    } satisfies Tool.DefWithoutID<typeof PromptParameters, { sessionID: string }>
  }),
)

const AnswerParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
  permission_id: Schema.optional(Schema.String).annotate({ description: "The pending permission id from the office state" }),
  reply: Schema.optional(Schema.Literals(["once", "always", "reject"])).annotate({ description: "Permission reply" }),
  message: Schema.optional(Schema.String).annotate({ description: "Feedback to the thread when rejecting" }),
  question_id: Schema.optional(Schema.String).annotate({ description: "The pending question id" }),
  answers: Schema.optional(Schema.Array(Schema.Array(Schema.String))).annotate({
    description: "Answers per question, each an array of chosen labels (or one custom string)",
  }),
  callum_quote: Schema.optional(Schema.String).annotate({
    description: "Callum's exact words approving this, required for tier callum permissions",
  }),
  reason: Schema.String.annotate({ description: "One line on why, for the office log" }),
})

export const OfficeAnswerTool = Tool.define<typeof AnswerParameters, { sessionID: string }, Office.Service>(
  "office_answer",
  Effect.gen(function* () {
    const office = yield* Office.Service
    return {
      description:
        "Answer a thread's pending permission or question. Tier auto is already handled. Tier farmer you may answer when the intent is clear. Tier callum requires callum_quote containing his own approving words; without it the tool refuses and you must ask him.",
      parameters: AnswerParameters,
      execute: (params) =>
        Effect.gen(function* () {
          const thread = yield* office.thread(params.sessionID)
          const waiting = thread?.waiting
          if (params.permission_id) {
            if (waiting?.kind === "permission" && waiting.tier === "callum" && !looksLikeApproval(params.callum_quote)) {
              return {
                title: "refused",
                output:
                  "Refused: this permission is tier callum. Ask Callum, then call office_answer again with his exact approving words in callum_quote.",
                metadata: { sessionID: params.sessionID },
              }
            }
            const reply = params.reply ?? "once"
            yield* office
              .answer({ sessionID: params.sessionID, permission: { id: params.permission_id, reply, message: params.message } })
              .pipe(Effect.mapError((error) => new Error(error.message)))
            return {
              title: `${reply} → ${thread?.title ?? params.sessionID}`,
              output: `Permission ${reply === "reject" ? "rejected" : "allowed"} on "${thread?.title ?? params.sessionID}".`,
              metadata: { sessionID: params.sessionID },
            }
          }
          if (params.question_id && params.answers) {
            yield* office
              .answer({ sessionID: params.sessionID, question: { id: params.question_id, answers: params.answers } })
              .pipe(Effect.mapError((error) => new Error(error.message)))
            return {
              title: `answered → ${thread?.title ?? params.sessionID}`,
              output: `Answered the question on "${thread?.title ?? params.sessionID}".`,
              metadata: { sessionID: params.sessionID },
            }
          }
          return { title: "office_answer", output: "Nothing to answer: pass permission_id + reply, or question_id + answers.", metadata: { sessionID: params.sessionID } }
        }).pipe(Effect.orDie),
    } satisfies Tool.DefWithoutID<typeof AnswerParameters, { sessionID: string }>
  }),
)

const DispatchParameters = Schema.Struct({
  directory: Schema.String.annotate({ description: "Absolute project directory to start the thread in" }),
  title: Schema.String.annotate({ description: "Short thread title" }),
  prompt: Schema.String.annotate({ description: "The brief: objective, expected output, and boundaries" }),
  agent: Schema.optional(Schema.String).annotate({ description: "Agent to run, default build" }),
})

export const OfficeDispatchTool = Tool.define<
  typeof DispatchParameters,
  { sessionID?: string },
  Office.Service | Session.Service | Scope.Scope
>(
  "office_dispatch",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    const scope = yield* Scope.Scope
    return {
      description:
        "Start a new thread in a project with a brief. Only when Callum asked for the work or a finished thread clearly needs a sibling; the brief must name the objective, the output, and the boundaries.",
      parameters: DispatchParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const ops = ctx.extra?.promptOps as TaskPromptOps | undefined
          if (!ops) return { title: "office_dispatch", output: "Dispatch is not available in this context.", metadata: {} }
          const target = yield* office.context(params.directory)
          const created = yield* sessions
            .create({ title: params.title, agent: params.agent })
            .pipe(Effect.provideService(InstanceRef, target))
          yield* ops
            .prompt({ sessionID: created.id, parts: [{ type: "text", text: params.prompt }] })
            .pipe(
              Effect.provideService(InstanceRef, target),
              Effect.catchCause((cause) => Effect.logError("office_dispatch prompt failed", { sessionID: created.id, cause })),
              Effect.forkIn(scope, { startImmediately: true }),
            )
          return {
            title: `dispatched ${params.title}`,
            output: `Started "${params.title}" in ${params.directory} (thread ${created.id}).`,
            metadata: { sessionID: created.id },
          }
        }),
    } satisfies Tool.DefWithoutID<typeof DispatchParameters, { sessionID?: string }>
  }),
)

const RemindParameters = Schema.Struct({
  minutes: Schema.Finite.annotate({ description: "Minutes from now" }),
  note: Schema.String.annotate({ description: "What to check and why" }),
  sessionID: Schema.optional(Schema.String).annotate({ description: "The thread this is about, if any" }),
})

export const OfficeRemindTool = Tool.define<typeof RemindParameters, { id: string }, Office.Service>(
  "office_remind",
  Effect.gen(function* () {
    const office = yield* Office.Service
    return {
      description: "Schedule a check-back for yourself. When it is due you get a turn with the note.",
      parameters: RemindParameters,
      execute: (params) =>
        Effect.gen(function* () {
          const reminder = yield* office.remind(params)
          return { title: `reminder in ${params.minutes}m`, output: `Reminder set: ${params.note}`, metadata: { id: reminder.id } }
        }),
    } satisfies Tool.DefWithoutID<typeof RemindParameters, { id: string }>
  }),
)

const OpenParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
})

export const OfficeOpenTool = Tool.define<typeof OpenParameters, { sessionID: string }, Office.Service | Session.Service>(
  "office_open",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    return {
      description: "Open a thread in Callum's app so he can read it in full.",
      parameters: OpenParameters,
      execute: (params) =>
        Effect.gen(function* () {
          const thread = yield* office.thread(params.sessionID)
          const info = thread ? undefined : yield* sessions.get(SessionID.make(params.sessionID)).pipe(Effect.orElseSucceed(() => undefined))
          const directory = thread?.directory ?? info?.directory
          if (!directory) return { title: "office_open", output: `No thread with id ${params.sessionID}.`, metadata: { sessionID: params.sessionID } }
          yield* office.navigate({ sessionID: params.sessionID, directory })
          return { title: `opened ${thread?.title ?? params.sessionID}`, output: "Opened in the app.", metadata: { sessionID: params.sessionID } }
        }),
    } satisfies Tool.DefWithoutID<typeof OpenParameters, { sessionID: string }>
  }),
)

const MarkParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
  pinned: Schema.optional(Schema.Boolean).annotate({ description: "Keep it at the top" }),
  muted: Schema.optional(Schema.Boolean).annotate({ description: "Stop reporting on it" }),
})

export const OfficeMarkTool = Tool.define<typeof MarkParameters, { sessionID: string }, Office.Service>(
  "office_mark",
  Effect.gen(function* () {
    const office = yield* Office.Service
    return {
      description: "Pin a thread to the top of the office, or mute its reports.",
      parameters: MarkParameters,
      execute: (params) =>
        Effect.gen(function* () {
          yield* office.mark(params)
          return { title: "marked", output: `Updated marks on ${params.sessionID}.`, metadata: { sessionID: params.sessionID } }
        }),
    } satisfies Tool.DefWithoutID<typeof MarkParameters, { sessionID: string }>
  }),
)
