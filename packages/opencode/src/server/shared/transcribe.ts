import { Effect } from "effect"
import { TranscribeApiError } from "../routes/instance/httpapi/groups/transcribe"

// Core speech-to-text call, extracted from the HTTP handler so the decision
// tree (auth, size cap, provider errors) is unit-testable with a stubbed fetch.

// OpenAI caps uploads at 25MB; base64 inflates ~4/3, so cap the encoded payload
// a bit under that to fail fast with a clear error instead of a provider 413.
export const MAX_AUDIO_BASE64 = 32_000_000

export const TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions"
export const TRANSCRIPTION_MODEL = "gpt-4o-transcribe"

const extension = (mime: string) => {
  if (mime.includes("webm")) return "webm"
  if (mime.includes("mp4") || mime.includes("m4a")) return "mp4"
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3"
  if (mime.includes("ogg")) return "ogg"
  return "wav"
}

export type TranscribePayload = { audio: string; mime: string; language?: string }

// Structural subset of fetch so tests can stub it without Bun's extras (preconnect).
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

export const transcribeAudio = (
  payload: TranscribePayload,
  key: string | undefined,
  fetchFn: FetchLike = fetch,
): Effect.Effect<{ text: string }, TranscribeApiError> =>
  Effect.gen(function* () {
    if (!payload.audio || payload.audio.length > MAX_AUDIO_BASE64)
      return yield* new TranscribeApiError({
        name: "BadRequest",
        data: { message: "Audio payload is empty or too large (max ~24MB)." },
      })
    if (!key)
      return yield* new TranscribeApiError({
        name: "NoOpenAiAuth",
        data: { message: "Connect OpenAI (or set OPENAI_API_KEY) to enable voice dictation." },
      })

    const bytes = Buffer.from(payload.audio, "base64")
    const form = new FormData()
    form.append("file", new File([bytes], `audio.${extension(payload.mime)}`, { type: payload.mime }))
    form.append("model", TRANSCRIPTION_MODEL)
    form.append("response_format", "json")
    if (payload.language) form.append("language", payload.language)

    const response = yield* Effect.tryPromise({
      try: () =>
        fetchFn(TRANSCRIPTION_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        }),
      catch: (cause) => new TranscribeApiError({ name: "TranscriptionFailed", data: { message: String(cause) } }),
    })
    if (!response.ok) {
      const detail = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => new TranscribeApiError({ name: "TranscriptionFailed", data: {} }),
      }).pipe(Effect.catch(() => Effect.succeed("")))
      return yield* new TranscribeApiError({
        name: "TranscriptionFailed",
        data: { message: `OpenAI returned ${response.status}: ${detail.slice(0, 300)}` },
      })
    }
    const body = yield* Effect.tryPromise({
      try: () => response.json() as Promise<{ text?: string }>,
      catch: () => new TranscribeApiError({ name: "TranscriptionFailed", data: { message: "Invalid JSON reply" } }),
    })
    return { text: body.text ?? "" }
  })

export * as Transcribe from "./transcribe"
