import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Authorization } from "../middleware/authorization"
import { InstanceContextMiddleware } from "../middleware/instance-context"
import { WorkspaceRoutingMiddleware, WorkspaceRoutingQuery } from "../middleware/workspace-routing"
import { described } from "./metadata"

const TranscribeErrorName = Schema.Union([
  Schema.Literal("BadRequest"),
  Schema.Literal("NoOpenAiAuth"),
  Schema.Literal("TranscriptionFailed"),
])

export class TranscribeApiError extends Schema.ErrorClass<TranscribeApiError>("TranscribeError")(
  {
    name: TranscribeErrorName,
    data: Schema.Struct({
      message: Schema.optional(Schema.String),
    }),
  },
  { httpApiStatus: 400 },
) {}

export const TranscribeInput = Schema.Struct({
  audio: Schema.String.annotate({ description: "Base64-encoded audio (webm/mp4/mp3/wav)" }),
  mime: Schema.String.annotate({ description: "MIME type of the audio, e.g. audio/webm" }),
  language: Schema.optional(Schema.String).annotate({ description: "Optional ISO-639-1 language hint" }),
})

export const TranscribeResult = Schema.Struct({
  text: Schema.String,
})

export const TranscribeApi = HttpApi.make("transcribe")
  .add(
    HttpApiGroup.make("transcribe")
      .add(
        HttpApiEndpoint.post("transcribe", "/transcribe", {
          query: WorkspaceRoutingQuery,
          payload: TranscribeInput,
          success: described(TranscribeResult, "Transcribed text"),
          error: TranscribeApiError,
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "transcribe.audio",
            summary: "Transcribe audio",
            description: "Transcribe recorded audio to text using the connected OpenAI account.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "transcribe",
          description: "Speech-to-text for voice dictation.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "opencode transcribe HttpApi",
      version: "0.0.1",
      description: "Speech-to-text endpoint backing composer voice dictation.",
    }),
  )
