import { Auth } from "@/auth"
import { Office } from "@/office/office"
import { OfficeDriver } from "@/office/driver"
import { Effect } from "effect"
import { HttpServerResponse } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { RootHttpApi } from "../api"
import type {
  AskInput,
  AutonomyInput,
  BriefInput,
  SpeakInput,
  ThreadMarkInput,
  ThreadPromptInput,
  TranscribeInput,
  VoiceTokenInput,
} from "../groups/office"

const TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe"
const TRANSCRIBE_PROMPT =
  "Callum talking to the farmer about coding threads, pull requests, tests, deploys, Coval, Linear, Slack."
const TTS_MODEL = "gpt-4o-mini-tts"

const DEFAULT_VOICE_MODEL = "gpt-realtime-2.1"
const DEFAULT_VOICE = "marin"

const VOICE_INSTRUCTIONS = [
  "You are the voice of the farmer, who runs the Farmer's Office for Callum: every coding thread reports into the office and the farmer briefs him.",
  "You do not know the threads yourself. For anything about threads, decisions, approvals, or actions, call ask_overseer with Callum's exact words and speak the reply it returns.",
  "Say a short phrase like 'checking' before the call, then speak the answer. Keep every reply to two sentences unless Callum asks for detail.",
  "When a message begins with 'Office report', tell Callum what it says in one or two sentences; if it needs a decision, ask him what to do, then pass his answer to ask_overseer.",
  "Never claim something happened unless ask_overseer said so. Do not read out ids, JSON, or tool names.",
].join("\n")

function voiceSession(input: { model: string; voice: string; state: string }) {
  return {
    type: "realtime",
    model: input.model,
    instructions: `${VOICE_INSTRUCTIONS}\n\nOffice state when this call started (may be stale; ask_overseer has the current truth):\n${input.state}`,
    tools: [
      {
        type: "function",
        name: "ask_overseer",
        description: "Hand Callum's words to the farmer and get the spoken reply. Use for any question, decision, or instruction about threads.",
        parameters: {
          type: "object",
          properties: { text: { type: "string", description: "Callum's words, verbatim" } },
          required: ["text"],
          additionalProperties: false,
        },
      },
    ],
    tool_choice: "auto",
    output_modalities: ["audio"],
    audio: {
      input: {
        transcription: { model: "gpt-4o-mini-transcribe" },
        turn_detection: { type: "semantic_vad", eagerness: "medium" },
      },
      output: { voice: input.voice },
    },
  }
}

export const officeHandlers = HttpApiBuilder.group(RootHttpApi, "office", (handlers) =>
  Effect.gen(function* () {
    const office = yield* Office.Service
    const driver = yield* OfficeDriver.Service
    const auth = yield* Auth.Service

    const state = Effect.fn("OfficeHttpApi.state")(function* () {
      return yield* office.state()
    })

    const overseer = Effect.fn("OfficeHttpApi.overseer")(function* () {
      return yield* driver.ensureOverseer()
    })

    const ask = Effect.fn("OfficeHttpApi.ask")(function* (ctx: { payload: typeof AskInput.Type }) {
      return yield* driver.ask(ctx.payload)
    })

    const brief = Effect.fn("OfficeHttpApi.brief")(function* (ctx: { payload: typeof BriefInput.Type }) {
      return yield* driver.brief(ctx.payload)
    })

    const threadPrompt = Effect.fn("OfficeHttpApi.threadPrompt")(function* (ctx: {
      payload: typeof ThreadPromptInput.Type
    }) {
      yield* driver.promptThread(ctx.payload).pipe(Effect.orDie)
      return { ok: true as const }
    })

    const threadAnswer = Effect.fn("OfficeHttpApi.threadAnswer")(function* (ctx: {
      payload: typeof Office.AnswerInput.Type
    }) {
      yield* office.answer(ctx.payload).pipe(Effect.orDie)
      return { ok: true as const }
    })

    const threadMark = Effect.fn("OfficeHttpApi.threadMark")(function* (ctx: { payload: typeof ThreadMarkInput.Type }) {
      yield* office.mark(ctx.payload)
      return { ok: true as const }
    })

    const autonomy = Effect.fn("OfficeHttpApi.autonomy")(function* (ctx: { payload: typeof AutonomyInput.Type }) {
      yield* office.setAutonomy(ctx.payload.mode)
      return { ok: true as const }
    })

    const openaiKey = Effect.gen(function* () {
      const stored = yield* auth.get("openai").pipe(Effect.orElseSucceed(() => undefined))
      return stored?.type === "api" ? stored.key : process.env.OPENAI_API_KEY
    })
    const noKey = () =>
      HttpServerResponse.jsonUnsafe(
        { error: "No OpenAI key is configured. Add one under Providers or set OPENAI_API_KEY." },
        { status: 502 },
      )

    const transcribe = Effect.fn("OfficeHttpApi.transcribe")(function* (ctx: { payload: typeof TranscribeInput.Type }) {
      const key = yield* openaiKey
      if (!key) return noKey()
      const bytes = Buffer.from(ctx.payload.audio, "base64")
      if (bytes.byteLength < 800) return HttpServerResponse.jsonUnsafe({ text: "" })
      const ext = ctx.payload.mime.includes("mp4") ? "m4a" : ctx.payload.mime.includes("ogg") ? "ogg" : ctx.payload.mime.includes("wav") ? "wav" : "webm"
      const form = new FormData()
      form.append("file", new Blob([bytes], { type: ctx.payload.mime }), `clip.${ext}`)
      form.append("model", TRANSCRIBE_MODEL)
      form.append("prompt", TRANSCRIBE_PROMPT)
      const response = yield* Effect.tryPromise(() =>
        fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        }),
      ).pipe(Effect.orElseSucceed(() => undefined))
      if (!response) return HttpServerResponse.jsonUnsafe({ error: "Could not reach api.openai.com." }, { status: 502 })
      const body = (yield* Effect.promise(() => response.json().catch(() => ({})))) as { text?: string; error?: { message?: string } }
      if (!response.ok)
        return HttpServerResponse.jsonUnsafe({ error: body.error?.message ?? `OpenAI returned HTTP ${response.status}.` }, { status: 502 })
      // Silence makes the model echo its own vocabulary prompt; treat that as nothing said.
      const text = (body.text ?? "").trim()
      const echoed = text.length > 0 && TRANSCRIBE_PROMPT.toLowerCase().includes(text.toLowerCase().slice(0, 40))
      return HttpServerResponse.jsonUnsafe({ text: echoed || text.length < 2 ? "" : text })
    })

    const speak = Effect.fn("OfficeHttpApi.speak")(function* (ctx: { payload: typeof SpeakInput.Type }) {
      const key = yield* openaiKey
      if (!key) return noKey()
      const response = yield* Effect.tryPromise(() =>
        fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: TTS_MODEL,
            voice: ctx.payload.voice ?? DEFAULT_VOICE,
            input: ctx.payload.text.slice(0, 4_000),
            response_format: "mp3",
            instructions: "Calm, quick, matter-of-fact. A farm hand reporting in, not a narrator.",
          }),
        }),
      ).pipe(Effect.orElseSucceed(() => undefined))
      if (!response) return HttpServerResponse.jsonUnsafe({ error: "Could not reach api.openai.com." }, { status: 502 })
      if (!response.ok) {
        const body = (yield* Effect.promise(() => response.json().catch(() => ({})))) as { error?: { message?: string } }
        return HttpServerResponse.jsonUnsafe({ error: body.error?.message ?? `OpenAI returned HTTP ${response.status}.` }, { status: 502 })
      }
      const audio = Buffer.from(yield* Effect.promise(() => response.arrayBuffer())).toString("base64")
      return HttpServerResponse.jsonUnsafe({ audio, mime: "audio/mpeg" })
    })

    const voiceToken = Effect.fn("OfficeHttpApi.voiceToken")(function* (ctx: { payload: typeof VoiceTokenInput.Type }) {
      const key = yield* openaiKey
      if (!key) return noKey()
      const model = ctx.payload.model ?? DEFAULT_VOICE_MODEL
      const voice = ctx.payload.voice ?? DEFAULT_VOICE
      const session = voiceSession({ model, voice, state: yield* office.render() })
      const response = yield* Effect.tryPromise(() =>
        fetch("https://api.openai.com/v1/realtime/client_secrets", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ session }),
        }),
      ).pipe(Effect.orElseSucceed(() => undefined))
      if (!response) return HttpServerResponse.jsonUnsafe({ error: "Could not reach api.openai.com." }, { status: 502 })
      const body = (yield* Effect.promise(() => response.json().catch(() => ({})))) as {
        value?: string
        expires_at?: number
        error?: { message?: string }
      }
      if (!response.ok || !body.value)
        return HttpServerResponse.jsonUnsafe(
          { error: body.error?.message ?? `OpenAI returned HTTP ${response.status}.` },
          { status: 502 },
        )
      return HttpServerResponse.jsonUnsafe({
        value: body.value,
        expiresAt: (body.expires_at ?? Math.floor(Date.now() / 1000) + 60) * 1000,
        model,
        voice,
        session,
      })
    })

    return handlers
      .handle("state", state)
      .handle("overseer", overseer)
      .handle("ask", ask)
      .handle("brief", brief)
      .handle("threadPrompt", threadPrompt)
      .handle("threadAnswer", threadAnswer)
      .handle("threadMark", threadMark)
      .handle("autonomy", autonomy)
      .handle("voiceToken", voiceToken)
      .handle("transcribe", transcribe)
      .handle("speak", speak)
  }),
)
