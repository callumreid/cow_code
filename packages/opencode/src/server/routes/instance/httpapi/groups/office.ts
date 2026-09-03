import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Office } from "@/office/office"
import { described } from "./metadata"

const Ok = Schema.Struct({ ok: Schema.Literal(true) })

export const AskInput = Schema.Struct({
  text: Schema.String,
  source: Schema.optional(Schema.Literals(["text", "voice"])),
})

export const AskResult = Schema.Struct({ text: Schema.String, sessionID: Schema.String })

export const BriefInput = Schema.Struct({ since: Schema.Finite })

export const BriefResult = Schema.Struct({ text: Schema.String, sessionID: Schema.String, skipped: Schema.Boolean })

export const ThreadPromptInput = Schema.Struct({
  sessionID: Schema.String,
  text: Schema.String,
  mode: Schema.Literals(["steer", "context"]),
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
} as const

export const OfficeApi = HttpApi.make("office").add(
  HttpApiGroup.make("office")
    .add(
      HttpApiEndpoint.get("state", OfficePaths.state, {
        success: described(Office.State, "Farmer's Office state"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.state", summary: "Get office state" })),
      HttpApiEndpoint.post("overseer", OfficePaths.overseer, {
        success: described(Office.OverseerRef, "The farmer's session"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.overseer", summary: "Get or create the farmer's session" })),
      HttpApiEndpoint.post("ask", OfficePaths.ask, {
        payload: AskInput,
        success: described(AskResult, "The farmer's reply"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.ask", summary: "Ask the farmer" })),
      HttpApiEndpoint.post("brief", OfficePaths.brief, {
        payload: BriefInput,
        success: described(BriefResult, "What changed since Callum last looked"),
      }).annotateMerge(OpenApi.annotations({ identifier: "office.brief", summary: "Brief on what changed since a time" })),
      HttpApiEndpoint.post("threadPrompt", OfficePaths.threadPrompt, {
        payload: ThreadPromptInput,
        success: Ok,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.thread.prompt", summary: "Send text into a thread" })),
      HttpApiEndpoint.post("threadAnswer", OfficePaths.threadAnswer, {
        payload: Office.AnswerInput,
        success: Ok,
      }).annotateMerge(OpenApi.annotations({ identifier: "office.thread.answer", summary: "Answer a thread's permission or question" })),
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
      }).annotateMerge(OpenApi.annotations({ identifier: "office.voice.token", summary: "Mint a Realtime client secret for the office voice" })),
    )
    .annotateMerge(OpenApi.annotations({ title: "office", description: "The Farmer's Office." })),
)
