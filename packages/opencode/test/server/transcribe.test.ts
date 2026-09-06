import { describe, expect, test } from "bun:test"
import { Cause, Effect, Exit } from "effect"
import { MAX_AUDIO_BASE64, TRANSCRIPTION_MODEL, TRANSCRIPTION_URL, transcribeAudio, type FetchLike } from "@/server/shared/transcribe"

const AUDIO = Buffer.from("fake audio bytes").toString("base64")

const run = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromiseExit(effect)

const failName = async <A, E>(effect: Effect.Effect<A, E>) => {
  const exit = await run(effect)
  if (Exit.isSuccess(exit)) throw new Error("expected failure")
  const error = Cause.squash(exit.cause) as { name?: string }
  return error.name
}

const okResponse = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200 })

describe("transcribeAudio", () => {
  test("posts multipart with model + file and returns the text", async () => {
    let seenUrl = ""
    let seenAuth = ""
    let seenForm: FormData | undefined
    const fetchFn = (async (url: string, init?: RequestInit) => {
      seenUrl = String(url)
      seenAuth = String((init?.headers as Record<string, string>)?.Authorization)
      seenForm = init?.body as FormData
      return okResponse({ text: "hello from the pasture" })
    }) satisfies FetchLike

    const exit = await run(transcribeAudio({ audio: AUDIO, mime: "audio/webm" }, "sk-test", fetchFn))
    expect(Exit.isSuccess(exit) && exit.value.text).toBe("hello from the pasture")
    expect(seenUrl).toBe(TRANSCRIPTION_URL)
    expect(seenAuth).toBe("Bearer sk-test")
    expect(seenForm?.get("model")).toBe(TRANSCRIPTION_MODEL)
    const file = seenForm?.get("file") as File
    expect(file.name).toBe("audio.webm")
    expect(file.type).toBe("audio/webm")
  })

  test("fails NoOpenAiAuth without a key and never calls fetch", async () => {
    let called = false
    const fetchFn = (async () => {
      called = true
      return okResponse({ text: "x" })
    }) satisfies FetchLike
    expect(await failName(transcribeAudio({ audio: AUDIO, mime: "audio/webm" }, undefined, fetchFn))).toBe(
      "NoOpenAiAuth",
    )
    expect(called).toBe(false)
  })

  test("fails BadRequest on empty or oversized audio", async () => {
    expect(await failName(transcribeAudio({ audio: "", mime: "audio/webm" }, "sk"))).toBe("BadRequest")
    const huge = "a".repeat(MAX_AUDIO_BASE64 + 1)
    expect(await failName(transcribeAudio({ audio: huge, mime: "audio/webm" }, "sk"))).toBe("BadRequest")
  })

  test("maps a non-2xx reply to TranscriptionFailed with status detail", async () => {
    const fetchFn = (async () => new Response("rate limited", { status: 429 })) satisfies FetchLike
    const exit = await run(transcribeAudio({ audio: AUDIO, mime: "audio/webm" }, "sk", fetchFn))
    if (Exit.isSuccess(exit)) throw new Error("expected failure")
    const error = Cause.squash(exit.cause) as { name?: string; data?: { message?: string } }
    expect(error.name).toBe("TranscriptionFailed")
    expect(error.data?.message).toContain("429")
  })

  test("passes the language hint through when provided", async () => {
    let seenForm: FormData | undefined
    const fetchFn = (async (_url: string, init?: RequestInit) => {
      seenForm = init?.body as FormData
      return okResponse({ text: "ok" })
    }) satisfies FetchLike
    await run(transcribeAudio({ audio: AUDIO, mime: "audio/mp4", language: "en" }, "sk", fetchFn))
    expect(seenForm?.get("language")).toBe("en")
    expect((seenForm?.get("file") as File).name).toBe("audio.mp4")
  })
})
