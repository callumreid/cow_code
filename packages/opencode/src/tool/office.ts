// The farmer's tools. Every one of them reads or steers another thread through
// the same session, permission, and question services the UI uses.
import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { Office } from "@/office/office"
import { authorizesDecision } from "@/office/policy"
import { OfficeControl } from "@/office/control"
import { Session } from "@/session/session"
import { SessionID } from "@/session/schema"
import type { TaskPromptOps } from "./task"

const READ_LIMIT = 8_000

function excerpt(messages: SessionV1.WithParts[], origins: Map<string, string>) {
  const lines = messages.flatMap((message) => {
    const role =
      message.info.role === "user" ? (origins.get(message.info.id) ?? "USER INPUT (origin not recorded)") : "THREAD"
    return message.parts.flatMap((part) => {
      if (part.type === "text") return [`${role}: ${part.text.trim().slice(0, 1_500)}`]
      if (part.type === "tool") {
        const title = "title" in part.state && typeof part.state.title === "string" ? part.state.title : ""
        const status = part.state.status
        return [
          `  [${part.tool}${title ? `: ${title}` : ""}] ${status}${"output" in part.state ? ": " + String(part.state.output).slice(-1200) : ""}`,
        ]
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

export const OfficeReadTool = Tool.define<
  typeof ReadParameters,
  { sessionID: string },
  Office.Service | Session.Service | OfficeControl.Service
>(
  "office_read",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    const control = yield* OfficeControl.Service
    return {
      description:
        "Read a bounded excerpt of one thread's recent transcript: Callum's messages, the thread's replies, and its tool calls. Use it before deciding anything the summary line does not settle.",
      parameters: ReadParameters,
      execute: (params) =>
        Effect.gen(function* () {
          const thread = yield* office.thread(params.sessionID)
          const messages = yield* sessions
            .messages({
              sessionID: SessionID.make(params.sessionID),
              limit: Math.max(1, Math.min(40, params.limit ?? 12)),
            })
            .pipe(
              Effect.mapError(
                () =>
                  new Error(
                    "This transcript is unavailable on this host. Use the worker's original host and supported source capability.",
                  ),
              ),
              Effect.orDie,
            )
          if (messages.length === 0)
            return {
              title: thread?.title ?? params.sessionID,
              output: "No messages found for that thread.",
              metadata: { sessionID: params.sessionID },
            }
          const origins = new Map<string, string>()
          for (const message of messages) {
            if (message.info.role !== "user") continue
            const origin = yield* control.origin(params.sessionID, message.info.id)
            if (origin.text)
              origins.set(message.info.id, origin.source === "user" ? "CALLUM" : origin.source.toUpperCase())
          }
          const header = thread
            ? `Thread "${thread.title}" (${thread.projectName ?? thread.directory}) · bucket ${thread.bucket}${thread.waiting ? ` · waiting: ${thread.summary}` : ""}`
            : `Thread ${params.sessionID}`
          return {
            title: thread?.title ?? params.sessionID,
            output: `${header}\n\n${excerpt(messages, origins)}`,
            metadata: { sessionID: params.sessionID },
          }
        }),
    } satisfies Tool.DefWithoutID<typeof ReadParameters, { sessionID: string }>
  }),
)

const PromptParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
  text: Schema.String.annotate({
    description: "Coordinator instructions, preserving the original user objective and scope",
  }),
  mode: Schema.Literals(["steer", "queue", "context", "amend", "cancel", "resume"]).annotate({
    description: "steer = the thread acts on it now; context = just add it to the thread's context without a reply",
  }),
  reason: Schema.String.annotate({ description: "One line on why, for the office log" }),
})

export const OfficePromptTool = Tool.define<typeof PromptParameters, { sessionID: string }, OfficeControl.Service>(
  "office_prompt",
  Effect.gen(function* () {
    const control = yield* OfficeControl.Service
    return {
      description:
        "Submit input to the existing owning worker. steer acts now; queue waits in durable FIFO order; context stores information without starting work; amend records an objective change; cancel stops; resume explicitly restarts after inspection. Return value is an admission receipt, not a completion claim.",
      parameters: PromptParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const ops = ctx.extra?.promptOps as TaskPromptOps | undefined
          if (!ops)
            return {
              title: "unavailable",
              output: "This context cannot admit worker input.",
              metadata: { sessionID: params.sessionID },
            }
          const origin = yield* control.origin(ctx.sessionID, ctx.messageID)
          const receipt = yield* control.execute(
            {
              id: ctx.sessionID + ":" + ctx.messageID + ":" + ctx.callID,
              intent: params.mode,
              sessionID: params.sessionID,
              text: params.text,
            },
            ops,
            origin,
          )
          return { title: receipt.status, output: JSON.stringify(receipt), metadata: { sessionID: receipt.sessionID } }
        }),
    } satisfies Tool.DefWithoutID<typeof PromptParameters, { sessionID: string }>
  }),
)

const AnswerParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
  permission_id: Schema.optional(Schema.String).annotate({
    description: "The pending permission id from the office state",
  }),
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

export const OfficeAnswerTool = Tool.define<
  typeof AnswerParameters,
  { sessionID: string },
  Office.Service | OfficeControl.Service
>(
  "office_answer",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const control = yield* OfficeControl.Service
    return {
      description:
        "Answer a thread's pending permission or question. Tier auto is already handled. Tier farmer you may answer when the intent is clear. Tier callum approval must match the genuine user input and this exact decision. callum_quote is checked against that input; it cannot supply authority. Reject always works.",
      parameters: AnswerParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const thread = yield* office.thread(params.sessionID)
          const decision = thread?.decisions?.find(
            (item) => item.id === (params.permission_id ?? params.question_id) && item.status === "pending",
          )
          const waiting = decision?.waiting
          const origin = yield* control.origin(ctx.sessionID, ctx.messageID)
          if (!(yield* control.active(origin)))
            return {
              title: "held",
              output: "Voice attention changed. This decision was not answered.",
              metadata: { sessionID: params.sessionID },
            }
          if (params.permission_id) {
            if (
              params.reply !== "reject" &&
              (!waiting ||
                (waiting.kind === "permission" &&
                  waiting.tier === "callum" &&
                  !authorizesDecision(origin, params.permission_id, params.reply ?? "once", params.callum_quote)))
            ) {
              return {
                title: "refused",
                output:
                  "This decision has no matching approval in the originating user input. Present the exact pending decision to Callum. Rejection remains available.",
                metadata: { sessionID: params.sessionID },
              }
            }
            const reply = params.reply ?? "once"
            yield* office
              .answer({
                sessionID: params.sessionID,
                permission: { id: params.permission_id, reply, message: params.message },
              })
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
          return {
            title: "office_answer",
            output: "Nothing to answer: pass permission_id + reply, or question_id + answers.",
            metadata: { sessionID: params.sessionID },
          }
        }).pipe(Effect.orDie),
    } satisfies Tool.DefWithoutID<typeof AnswerParameters, { sessionID: string }>
  }),
)

const DispatchParameters = Schema.Struct({
  directory: Schema.String.annotate({ description: "Absolute project directory to start the thread in" }),
  title: Schema.String.annotate({ description: "Short thread title" }),
  prompt: Schema.String.annotate({ description: "The brief: objective, expected output, and boundaries" }),
  agent: Schema.optional(Schema.String).annotate({ description: "Agent to run, default build" }),
  model: OfficeControl.Input.fields.model,
  placement: OfficeControl.Input.fields.placement,
  outputScope: OfficeControl.Input.fields.outputScope,
})

export const OfficeDispatchTool = Tool.define<typeof DispatchParameters, { sessionID?: string }, OfficeControl.Service>(
  "office_dispatch",
  Effect.gen(function* () {
    const control = yield* OfficeControl.Service
    return {
      description:
        "Create a visible sibling task for a distinct user objective with a project, output and scope. Git projects use an isolated worktree by default. Preserve explicit agent/model choice. For follow-up work, target the existing worker with office_prompt.",
      parameters: DispatchParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const ops = ctx.extra?.promptOps as TaskPromptOps | undefined
          if (!ops) return { title: "unavailable", output: "This context cannot admit worker input.", metadata: {} }
          const origin = yield* control.origin(ctx.sessionID, ctx.messageID)
          const receipt = yield* control.execute(
            {
              id: ctx.sessionID + ":" + ctx.messageID + ":" + ctx.callID,
              intent: "new",
              directory: params.directory,
              title: params.title,
              text: params.prompt,
              agent: params.agent,
              model: params.model,
              placement: params.placement,
              outputScope: params.outputScope,
            },
            ops,
            origin,
          )
          return { title: receipt.status, output: JSON.stringify(receipt), metadata: { sessionID: receipt.sessionID } }
        }),
    } satisfies Tool.DefWithoutID<typeof DispatchParameters, { sessionID?: string }>
  }),
)

const RemindParameters = Schema.Struct({
  minutes: Schema.Finite.annotate({ description: "Minutes from now" }),
  note: Schema.String.annotate({ description: "What to check and why" }),
  sessionID: Schema.optional(Schema.String).annotate({ description: "The thread this is about, if any" }),
})

export const OfficeRemindTool = Tool.define<
  typeof RemindParameters,
  { id: string },
  Office.Service | OfficeControl.Service
>(
  "office_remind",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const control = yield* OfficeControl.Service
    return {
      description: "Schedule a check-back for yourself. When it is due you get a turn with the note.",
      parameters: RemindParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const origin = yield* control.origin(ctx.sessionID, ctx.messageID)
          if (!(yield* control.active(origin)))
            return { title: "held", output: "Voice attention changed; no action was taken.", metadata: { id: "" } }
          const reminder = yield* office.remind(params)
          return {
            title: `reminder in ${params.minutes}m`,
            output: `Reminder set: ${params.note}`,
            metadata: { id: reminder.id },
          }
        }),
    } satisfies Tool.DefWithoutID<typeof RemindParameters, { id: string }>
  }),
)

const OpenParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
})

export const OfficeOpenTool = Tool.define<
  typeof OpenParameters,
  { sessionID: string },
  Office.Service | Session.Service | OfficeControl.Service
>(
  "office_open",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const control = yield* OfficeControl.Service
    const sessions = yield* Session.Service
    return {
      description: "Open a thread in Callum's app so he can read it in full.",
      parameters: OpenParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const origin = yield* control.origin(ctx.sessionID, ctx.messageID)
          if (!(yield* control.active(origin)))
            return {
              title: "held",
              output: "Voice attention changed; no action was taken.",
              metadata: { sessionID: params.sessionID },
            }
          const thread = yield* office.thread(params.sessionID)
          const info = thread
            ? undefined
            : yield* sessions.get(SessionID.make(params.sessionID)).pipe(Effect.orElseSucceed(() => undefined))
          const directory = thread?.directory ?? info?.directory
          if (!directory)
            return {
              title: "office_open",
              output: `No thread with id ${params.sessionID}.`,
              metadata: { sessionID: params.sessionID },
            }
          yield* office
            .navigate({
              sessionID: params.sessionID,
              directory,
              clientID: origin.clientID,
              generation: origin.attentionGeneration,
              requestID: ctx.messageID + ":" + ctx.callID,
            })
            .pipe(Effect.orDie)
          return {
            title: `open requested: ${thread?.title ?? params.sessionID}`,
            output:
              "Navigation requested on the originating client. Await its acknowledgment before claiming it opened.",
            metadata: { sessionID: params.sessionID },
          }
        }),
    } satisfies Tool.DefWithoutID<typeof OpenParameters, { sessionID: string }>
  }),
)

const MarkParameters = Schema.Struct({
  sessionID: Schema.String.annotate({ description: "The thread's session id" }),
  pinned: Schema.optional(Schema.Boolean).annotate({ description: "Keep it at the top" }),
  muted: Schema.optional(Schema.Boolean).annotate({ description: "Stop reporting on it" }),
})

export const OfficeMarkTool = Tool.define<
  typeof MarkParameters,
  { sessionID: string },
  Office.Service | OfficeControl.Service
>(
  "office_mark",
  Effect.gen(function* () {
    const office = yield* Office.Service
    const control = yield* OfficeControl.Service
    return {
      description: "Pin a thread to the top of the office, or mute its reports.",
      parameters: MarkParameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const origin = yield* control.origin(ctx.sessionID, ctx.messageID)
          if (!(yield* control.active(origin)))
            return {
              title: "held",
              output: "Voice attention changed; no action was taken.",
              metadata: { sessionID: params.sessionID },
            }
          yield* office.mark(params)
          return {
            title: "marked",
            output: `Updated marks on ${params.sessionID}.`,
            metadata: { sessionID: params.sessionID },
          }
        }),
    } satisfies Tool.DefWithoutID<typeof MarkParameters, { sessionID: string }>
  }),
)
