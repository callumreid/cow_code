import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Office } from "@/office/office"
import { OfficeControl } from "@/office/control"
import { OfficeDriver } from "@/office/driver"
import { OfficeLedger } from "@/office/ledger"
import { ConflictError } from "../errors"
import { Routines } from "@/office/routines"
import { described } from "./metadata"

const Ok = Schema.Struct({ ok: Schema.Literal(true) })
export const ReplayInput = Schema.Struct({
  after: Schema.optional(Schema.Finite),
  checkpoint: Schema.optional(Schema.Finite),
  clientID: Schema.String,
})
export const ReplayResult = Schema.Struct({
  epoch: Schema.String,
  cursor: Schema.Finite,
  checkpoint: Schema.Finite,
  more: Schema.Boolean,
  events: Schema.Array(OfficeLedger.Event),
  delivered: Schema.Array(Schema.String),
})
export const AcknowledgeInput = Schema.Struct({
  clientID: Schema.String,
  eventID: Schema.String,
  channel: Schema.Literals(["display", "spoken", "navigation"]),
  sessionID: Schema.optional(Schema.String),
  directory: Schema.optional(Schema.String),
})

// Scheduled jobs on the machine the server runs on (launchd + the box's run ledger).
export const RoutineRunInput = Schema.Struct({ name: Schema.String })
export const RoutineLogInput = Schema.Struct({ name: Schema.String, lines: Schema.optional(Schema.Finite) })

export const AskInput = Schema.Struct({
  text: Schema.String,
  source: Schema.optional(Schema.Literals(["text", "voice"])),
  clientID: Schema.optional(Schema.String),
  generation: Schema.optional(Schema.Finite),
  decisionIDs: Schema.optional(Schema.Array(Schema.String)),
})

export const AskResult = Schema.Struct({ text: Schema.String, sessionID: Schema.String })

export const BriefInput = Schema.Struct({ since: Schema.Finite, clientID: Schema.optional(Schema.String) })

export const BriefResult = Schema.Struct({ text: Schema.String, sessionID: Schema.String, skipped: Schema.Boolean })

export const ThreadPromptInput = Schema.Struct({
  id: Schema.optional(Schema.String),
  sessionID: Schema.String,
  text: Schema.String,
  mode: Schema.Literals(["steer", "queue", "context", "amend", "cancel", "resume"]),
})

export const ThreadMarkInput = Schema.Struct({
  sessionID: Schema.String,
  pinned: Schema.optional(Schema.Boolean),
  muted: Schema.optional(Schema.Boolean),
})

export const AutonomyInput = Schema.Struct({ mode: Office.AutonomySchema })

export const VoiceTokenInput = Schema.Struct({
  model: Schema.optional(Schema.String),
  voice: Schema.optional(Schema.String),
})

export const VoiceToken = Schema.Struct({
  value: Schema.String,
  expiresAt: Schema.Finite,
  model: Schema.String,
  voice: Schema.String,
  session: Schema.Record(Schema.String, Schema.Unknown),
})

const VoiceTokenResult = Schema.Union([VoiceToken, Schema.Struct({ error: Schema.String })])

// Hold-to-talk: the phone (or desktop) records a clip, the server transcribes it,
// the farmer answers, and the server voices the reply. No WebRTC needed.
export const TranscribeInput = Schema.Struct({
  audio: Schema.String.annotate({ description: "base64 audio clip" }),
  mime: Schema.String.annotate({ description: "e.g. audio/webm, audio/mp4" }),
})

export const TranscribeResult = Schema.Union([
  Schema.Struct({ text: Schema.String }),
  Schema.Struct({ error: Schema.String }),
])

export const SpeakInput = Schema.Struct({
  text: Schema.String,
  voice: Schema.optional(Schema.String),
})

export const SpeakResult = Schema.Union([
  Schema.Struct({ audio: Schema.String, mime: Schema.String }),
  Schema.Struct({ error: Schema.String }),
])

export const OfficePaths = {
  state: "/global/office/state",
  overseer: "/global/office/overseer",
  ask: "/global/office/ask",
  brief: "/global/office/brief",
  threadPrompt: "/global/office/thread/prompt",
  threadAnswer: "/global/office/thread/answer",
  threadMark: "/global/office/thread/mark",
  autonomy: "/global/office/autonomy",
  voiceToken: "/global/office/voice/token",
  transcribe: "/global/office/voice/transcribe",
  speak: "/global/office/voice/speak",
  routines: "/global/office/routines",
  routineRun: "/global/office/routines/run",
  routineLog: "/global/office/routines/log",
} as const

export const OfficeApi = HttpApi.make("office").add(
  HttpApiGroup.make("office")
    .add(
      HttpApiEndpoint.post("request", "/global/office/request", {
        payload: OfficeDriver.Request,
        success: OfficeDriver.RequestReceipt,
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "office.request",
          summary: "Admit a Farmer request without waiting for reasoning",
        }),
      ),
      HttpApiEndpoint.post("requestStatus", "/global/office/request/status", {
        payload: Schema.Struct({ id: Schema.String }),
        success: OfficeDriver.RequestReceipt,
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.request.status", summary: "Read a durable request receipt" }),
      ),
      HttpApiEndpoint.post("attention", "/global/office/attention", {
        payload: OfficeDriver.Attention,
        success: OfficeDriver.Attention,
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "office.attention",
          summary: "Set client voice attention and admission generation",
        }),
      ),
      HttpApiEndpoint.post("command", "/global/office/command", {
        payload: OfficeControl.Input,
        success: OfficeControl.Receipt,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.command", summary: "Admit an exact worker command" })),
      HttpApiEndpoint.get("commands", "/global/office/commands", {
        success: Schema.Array(Schema.Struct({ state: Schema.String, receipt: OfficeControl.Receipt })),
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "office.commands",
          summary: "Read worker command receipts and execution state",
        }),
      ),
      HttpApiEndpoint.post("events", "/global/office/events", {
        payload: ReplayInput,
        success: ReplayResult,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.events", summary: "Replay durable Office events" })),
      HttpApiEndpoint.post("acknowledge", "/global/office/acknowledge", {
        payload: AcknowledgeInput,
        success: Ok,
        error: ConflictError,
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "office.acknowledge",
          summary: "Acknowledge display, speech or targeted navigation",
        }),
      ),
      HttpApiEndpoint.get("state", OfficePaths.state, {
        success: described(Office.State, "Farmer's Office state"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.state", summary: "Get office state" })),
      HttpApiEndpoint.post("overseer", OfficePaths.overseer, {
        success: described(Office.OverseerRef, "The farmer's session"),
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.overseer", summary: "Get or create the farmer's session" }),
      ),
      HttpApiEndpoint.post("ask", OfficePaths.ask, {
        payload: AskInput,
        success: described(AskResult, "The farmer's reply"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.ask", summary: "Ask the farmer" })),
      HttpApiEndpoint.post("brief", OfficePaths.brief, {
        payload: BriefInput,
        success: described(BriefResult, "What changed since Callum last looked"),
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.brief", summary: "Brief on what changed since a time" }),
      ),
      HttpApiEndpoint.post("threadPrompt", OfficePaths.threadPrompt, {
        payload: ThreadPromptInput,
        success: OfficeControl.Receipt,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.thread.prompt", summary: "Send text into a thread" })),
      HttpApiEndpoint.post("threadAnswer", OfficePaths.threadAnswer, {
        payload: Office.AnswerInput,
        success: Ok,
        error: ConflictError,
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "office.thread.answer",
          summary: "Answer a thread's permission or question",
        }),
      ),
      HttpApiEndpoint.post("threadMark", OfficePaths.threadMark, {
        payload: ThreadMarkInput,
        success: Ok,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.thread.mark", summary: "Pin or mute a thread" })),
      HttpApiEndpoint.post("autonomy", OfficePaths.autonomy, {
        payload: AutonomyInput,
        success: Ok,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.autonomy", summary: "Set the farmer's autonomy" })),
      HttpApiEndpoint.post("voiceToken", OfficePaths.voiceToken, {
        payload: VoiceTokenInput,
        success: described(VoiceTokenResult, "Ephemeral Realtime client secret"),
      }).annotateMerge(
        OpenApi.annotations({
          identifier: "office.voice.token",
          summary: "Mint a Realtime client secret for the office voice",
        }),
      ),
      HttpApiEndpoint.post("transcribe", OfficePaths.transcribe, {
        payload: TranscribeInput,
        success: described(TranscribeResult, "Transcript of the clip"),
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.voice.transcribe", summary: "Transcribe a hold-to-talk clip" }),
      ),
      HttpApiEndpoint.post("speak", OfficePaths.speak, {
        payload: SpeakInput,
        success: described(SpeakResult, "Spoken audio for a reply"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.voice.speak", summary: "Voice a farmer reply" })),
      HttpApiEndpoint.get("routines", OfficePaths.routines, {
        success: described(Routines.Snapshot, "Scheduled jobs and always-on services on this machine"),
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.routines", summary: "List scheduled jobs and their runs" }),
      ),
      HttpApiEndpoint.post("routineRun", OfficePaths.routineRun, {
        payload: RoutineRunInput,
        success: described(Routines.RunResult, "Whether launchd started the job"),
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.routines.run", summary: "Start a scheduled job now" }),
      ),
      HttpApiEndpoint.post("routineLog", OfficePaths.routineLog, {
        payload: RoutineLogInput,
        success: described(Routines.LogResult, "Tail of the job's log"),
      }).annotateMerge(
        OpenApi.annotations({ identifier: "office.routines.log", summary: "Read the tail of a job's log" }),
      ),
    )
    .annotateMerge(OpenApi.annotations({ title: "office", description: "The Farmer's Office." })),
)
