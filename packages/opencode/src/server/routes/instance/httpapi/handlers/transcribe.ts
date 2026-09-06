import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Auth } from "@/auth"
import { transcribeAudio } from "@/server/shared/transcribe"
import { InstanceHttpApi } from "../api"
import type { TranscribeInput } from "../groups/transcribe"
import type { Schema } from "effect"

export const transcribeHandlers = HttpApiBuilder.group(InstanceHttpApi, "transcribe", (handlers) =>
  Effect.gen(function* () {
    const auth = yield* Auth.Service

    const transcribe = Effect.fn("TranscribeHttpApi.transcribe")(function* (ctx: {
      payload: Schema.Schema.Type<typeof TranscribeInput>
    }) {
      const stored = yield* auth.get("openai").pipe(Effect.catch(() => Effect.succeed(undefined)))
      const key = (stored?.type === "api" ? stored.key : undefined) ?? process.env.OPENAI_API_KEY
      return yield* transcribeAudio(ctx.payload, key)
    })

    return handlers.handle("transcribe", transcribe)
  }),
)
