import type { ServerSDK } from "@/context/server-sdk"
import { authTokenFromCredentials } from "@/utils/server"
import type { OfficeBrief, OfficeState, VoiceToken } from "./types"

export type OfficeSdk = Pick<ServerSDK, "url" | "server">

export type OfficeFetchInit = {
  method?: string
  headers?: Record<string, string>
  body?: string
  signal?: AbortSignal
  /** `usePlatform().fetch` when the host provides one; falls back to the global fetch. */
  fetch?: typeof globalThis.fetch
}

export type OfficeAnswer = {
  sessionID: string
  permission?: { id: string; reply: "once" | "always" | "reject"; message?: string }
  question?: { id: string; answers: string[][] }
}

export class OfficeRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "OfficeRequestError"
    this.status = status
  }
}

/** The server has no `/global/office/*` routes (older build); the UI degrades to an empty roster. */
export function isOfficeUnavailable(error: unknown) {
  return error instanceof OfficeRequestError && error.status === 404
}

/**
 * Calls an office route with the same Basic credentials the SDK client sends.
 * Rejects with `OfficeRequestError` carrying the server's `error` text (or the
 * raw body) on a non-2xx response, so callers can surface it verbatim.
 */
export async function officeFetch(sdk: OfficeSdk, path: string, init: OfficeFetchInit = {}) {
  const fetcher = init.fetch ?? globalThis.fetch
  const http = sdk.server.http
  const auth = http.password
    ? { Authorization: `Basic ${authTokenFromCredentials({ username: http.username, password: http.password })}` }
    : undefined
  const response = await fetcher(new URL(path, sdk.url), {
    method: init.method ?? "GET",
    headers: { ...auth, ...init.headers },
    body: init.body,
    signal: init.signal,
  })
  if (response.ok) return response
  const body = await response.text().catch(() => "")
  throw new OfficeRequestError(errorMessage(body, response.status), response.status)
}

export function getState(sdk: OfficeSdk, init?: OfficeFetchInit) {
  return json<OfficeState>(sdk, "/global/office/state", init)
}

export function ensureOverseer(sdk: OfficeSdk, init?: OfficeFetchInit) {
  return json<{ sessionID: string; directory: string }>(sdk, "/global/office/overseer", post(undefined, init))
}

export function ask(sdk: OfficeSdk, input: { text: string; source?: "text" | "voice" }, init?: OfficeFetchInit) {
  return json<{ text: string; sessionID: string }>(sdk, "/global/office/ask", post(input, init))
}

/**
 * "Since you last looked": one short farmer brief on what changed after `since`.
 * A server without the route (older build) behaves as if nothing happened.
 */
export function brief(sdk: OfficeSdk, input: { since: number }, init?: OfficeFetchInit): Promise<OfficeBrief> {
  return json<OfficeBrief>(sdk, "/global/office/brief", post(input, init)).catch((error: unknown) => {
    if (isOfficeUnavailable(error)) return { text: "", sessionID: "", skipped: true }
    throw error
  })
}

export function promptThread(
  sdk: OfficeSdk,
  input: { sessionID: string; text: string; mode: "steer" | "context" },
  init?: OfficeFetchInit,
) {
  return json<{ ok: true }>(sdk, "/global/office/thread/prompt", post(input, init))
}

export function answerThread(sdk: OfficeSdk, input: OfficeAnswer, init?: OfficeFetchInit) {
  return json<{ ok: true }>(sdk, "/global/office/thread/answer", post(input, init))
}

export function markThread(
  sdk: OfficeSdk,
  input: { sessionID: string; pinned?: boolean; muted?: boolean },
  init?: OfficeFetchInit,
) {
  return json<{ ok: true }>(sdk, "/global/office/thread/mark", post(input, init))
}

export function voiceToken(sdk: OfficeSdk, input: { model?: string; voice?: string }, init?: OfficeFetchInit) {
  return json<VoiceToken>(sdk, "/global/office/voice/token", post(input, init))
}

/** Hold-to-talk: one recorded clip (base64) to text. A 502 carries the upstream error verbatim. */
export function transcribe(sdk: OfficeSdk, input: { audio: string; mime: string }, init?: OfficeFetchInit) {
  return json<{ text: string }>(sdk, "/global/office/voice/transcribe", post(input, init))
}

/** Hold-to-talk: the farmer's reply as base64 mp3 in the office voice. */
export function speak(sdk: OfficeSdk, input: { text: string; voice?: string }, init?: OfficeFetchInit) {
  return json<{ audio: string; mime: string }>(sdk, "/global/office/voice/speak", post(input, init))
}

export function setAutonomy(sdk: OfficeSdk, mode: "brief" | "act", init?: OfficeFetchInit) {
  return json<{ ok: true }>(sdk, "/global/office/autonomy", post({ mode }, init))
}

async function json<T>(sdk: OfficeSdk, path: string, init?: OfficeFetchInit) {
  const response = await officeFetch(sdk, path, init)
  return (await response.json()) as T
}

function post(body: unknown, init?: OfficeFetchInit): OfficeFetchInit {
  return {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body ?? {}),
  }
}

function errorMessage(body: string, status: number) {
  const parsed = parseJson(body)
  if (parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string") {
    return parsed.error
  }
  const text = body.trim()
  if (text && text.length <= 300) return text
  return `Request failed with status ${status}`
}

function parseJson(body: string): unknown {
  try {
    return JSON.parse(body)
  } catch {
    return undefined
  }
}
