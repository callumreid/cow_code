import type { VoiceToken } from "../types"
import type { VoiceUsage } from "./cost"
import { createVoiceAdmission } from "./admission"

export type VoicePhase = "connecting" | "listening" | "thinking" | "speaking"
export type VoiceClientEvent =
  | { type: "phase"; phase: VoicePhase }
  | { type: "session"; session: Record<string, unknown> }
  | { type: "speech"; active: boolean }
  | { type: "user"; text: string }
  | { type: "assistant"; text: string; done: boolean }
  | { type: "usage"; usage: VoiceUsage }
  | { type: "error"; message: string }
  | { type: "closed"; reason: "stopped" | "channel closed" }
export type VoiceClientOptions = { ask: (text: string, inputID: string) => Promise<string>; pushToTalk?: boolean }
export type VoiceClient = ReturnType<typeof createVoiceClient>
type ServerEvent = {
  type: string
  item_id?: string
  transcript?: string
  delta?: string
  session?: Record<string, unknown>
  response_id?: string
  response?: { id?: string; status?: string; usage?: VoiceUsage; metadata?: Record<string, string> }
  error?: { message?: string; code?: string }
}
type Speech = { text: string; id: string; current?: () => boolean; delivered?: () => void }
const CALLS_URL = "https://api.openai.com/v1/realtime/calls"
const OFFER_TIMEOUT_MS = 35_000
const CHANNEL_TIMEOUT_MS = 15_000
const STOPPED = "Voice session was stopped."

export function createVoiceClient(options: VoiceClientOptions) {
  const listeners = new Set<(event: VoiceClientEvent) => void>()
  const admission = createVoiceAdmission()
  const queue: Speech[] = []
  const audio = document.createElement("audio")
  audio.autoplay = true
  const state = {
    generation: 0,
    closed: true,
    live: false,
    phase: "connecting" as VoicePhase,
    pc: null as RTCPeerConnection | null,
    dc: null as RTCDataChannel | null,
    stream: null as MediaStream | null,
    session: {} as Record<string, unknown>,
    ptt: options.pushToTalk === true,
    held: false,
    heldAt: 0,
    userSpeaking: false,
    responseActive: false,
    audioPlaying: false,
    caption: "",
    current: undefined as Speech | undefined,
    responseID: undefined as string | undefined,
    spoken: new Set<string>(),
    timer: undefined as ReturnType<typeof setTimeout> | undefined,
  }
  const emit = (event: VoiceClientEvent) => listeners.forEach((listener) => listener(event))
  const setPhase = (phase: VoicePhase) => {
    state.phase = phase
    emit({ type: "phase", phase })
  }
  const send = (event: Record<string, unknown>) => {
    if (state.closed || state.dc?.readyState !== "open") return false
    state.dc.send(JSON.stringify(event))
    return true
  }
  const applyMic = () =>
    state.stream?.getAudioTracks().forEach((track) => {
      track.enabled = !state.closed && state.live && (!state.ptt || state.held)
    })
  const flush = () => {
    if (
      state.closed ||
      !state.live ||
      state.userSpeaking ||
      state.responseActive ||
      state.audioPlaying ||
      state.current
    )
      return
    while (queue.length) {
      const next = queue[0]
      if (state.spoken.has(next.id) || next.current?.() === false) {
        queue.shift()
        continue
      }
      state.current = next
      // Speech is isolated from conversation and has no action tools. Worker
      // outcomes are already interpreted by the Farmer; this only voices them.
      const sent = send({
        type: "response.create",
        response: {
          conversation: "none",
          tool_choice: "none",
          tools: [],
          metadata: { officeSpeechID: next.id },
          instructions: "Read the provided text verbatim. Add no commentary, claims or actions.",
          input: [{ type: "message", role: "user", content: [{ type: "input_text", text: next.text }] }],
        },
      })
      if (!sent) return
      queue.shift()
      state.responseActive = true
      setPhase("speaking")
      clearTimeout(state.timer)
      state.timer = setTimeout(() => {
        if (!state.responseID) interrupt()
      }, 10_000)
      return
    }
  }
  const speak = (text: string, input: Omit<Speech, "text"> = { id: crypto.randomUUID() }) => {
    if (
      state.closed ||
      !text.trim() ||
      state.spoken.has(input.id) ||
      queue.some((item) => item.id === input.id) ||
      state.current?.id === input.id
    )
      return
    queue.push({ text: text.trim(), ...input })
    flush()
  }
  const interrupt = () => {
    if (state.responseActive)
      send({ type: "response.cancel", ...(state.responseID ? { response_id: state.responseID } : {}) })
    send({ type: "output_audio_buffer.clear" })
    audio.muted = true
    state.current = undefined
    state.responseID = undefined
    state.responseActive = false
    state.audioPlaying = false
    clearTimeout(state.timer)
  }
  const pttDown = () => {
    if (state.closed || !state.live || state.held) return
    state.ptt = true
    send({ type: "session.update", session: { type: "realtime", audio: { input: { turn_detection: null } } } })
    state.held = true
    state.heldAt = Date.now()
    applyMic()
    interrupt()
    send({ type: "input_audio_buffer.clear" })
  }
  const pttUp = () => {
    if (state.closed || !state.held) return
    state.held = false
    applyMic()
    send({ type: Date.now() - state.heldAt < 200 ? "input_audio_buffer.clear" : "input_audio_buffer.commit" })
  }
  const hear = (item: { id: string; text: string; generation: number }) => {
    if (!admission.current(item.generation) || state.closed) return
    const connection = state.generation
    emit({ type: "user", text: item.text })
    setPhase("thinking")
    // Use the transcript itself, never model-generated function arguments.
    void options
      .ask(item.text, connection + ":" + item.id)
      .then((receipt) => {
        if (state.closed || connection !== state.generation || !admission.current(item.generation)) return
        setPhase("listening")
        if (receipt) speak(receipt, { id: "receipt:" + item.id })
      })
      .catch((error: unknown) => {
        if (!state.closed && connection === state.generation) emit({ type: "error", message: errorMessage(error) })
      })
  }
  const handle = (event: ServerEvent) => {
    if (state.closed) return
    if (event.type === "session.created" || event.type === "session.updated") {
      emit({ type: "session", session: event.session ?? {} })
      if (event.type === "session.updated") {
        state.live = true
        applyMic()
        setPhase("listening")
        flush()
      }
      return
    }
    if (event.type === "input_audio_buffer.committed") {
      if (event.item_id) admission.commit(event.item_id)
      return
    }
    if (
      event.type === "conversation.item.input_audio_transcription.completed" ||
      event.type === "conversation.item.input_audio_transcription.failed"
    ) {
      if (event.item_id)
        for (const item of admission.complete(event.item_id, event.transcript ?? "", event.type.endsWith("failed")))
          hear(item)
      return
    }
    if (event.type === "input_audio_buffer.speech_started") {
      state.userSpeaking = true
      interrupt()
      emit({ type: "speech", active: true })
      return
    }
    if (event.type === "input_audio_buffer.speech_stopped") {
      state.userSpeaking = false
      emit({ type: "speech", active: false })
      setPhase("listening")
      return
    }
    if (event.type === "response.created") {
      if (!state.current || event.response?.metadata?.officeSpeechID !== state.current.id) {
        send({ type: "response.cancel", response_id: event.response?.id })
        return
      }
      state.responseID = event.response.id
      state.caption = ""
      audio.muted = false
      return
    }
    if (event.response_id && event.response_id !== state.responseID) return
    if (event.type === "response.output_audio_transcript.delta") {
      state.caption += event.delta ?? ""
      emit({ type: "assistant", text: state.caption, done: false })
      return
    }
    if (event.type === "response.output_audio_transcript.done") {
      state.caption = event.transcript ?? state.caption
      emit({ type: "assistant", text: state.caption, done: true })
      return
    }
    if (event.type === "output_audio_buffer.started") {
      state.audioPlaying = true
      return
    }
    if (event.type === "output_audio_buffer.stopped") {
      state.audioPlaying = false
      if (state.current) {
        state.spoken.add(state.current.id)
        state.current.delivered?.()
        state.current = undefined
      }
      setPhase("listening")
      flush()
      return
    }
    if (event.type === "output_audio_buffer.cleared") {
      state.audioPlaying = false
      return
    }
    if (event.type === "response.done") {
      if (event.response?.id !== state.responseID) return
      state.responseActive = false
      clearTimeout(state.timer)
      if (event.response?.usage) emit({ type: "usage", usage: event.response.usage })
      if (event.response?.status !== "completed") state.current = undefined
      if (!state.audioPlaying) {
        setPhase("listening")
        flush()
      }
      return
    }
    if (event.type === "error" && event.error?.code !== "response_cancel_not_active")
      emit({ type: "error", message: event.error?.message ?? "Unknown realtime error" })
  }
  const teardown = () => {
    state.generation += 1
    admission.stop()
    clearTimeout(state.timer)
    queue.length = 0
    state.closed = true
    state.live = false
    state.stream?.getTracks().forEach((track) => track.stop())
    audio.pause()
    audio.srcObject = null
    audio.muted = true
    state.dc?.close()
    state.pc?.close()
    state.dc = null
    state.pc = null
    state.stream = null
    state.held = false
    state.userSpeaking = false
    state.responseActive = false
    state.audioPlaying = false
    state.current = undefined
    state.responseID = undefined
  }
  const connect = async (token: VoiceToken) => {
    teardown()
    state.closed = false
    const generation = state.generation
    const alive = () => !state.closed && generation === state.generation
    setPhase("connecting")
    const stream = await requireMicrophone()
    if (!alive()) {
      stream.getTracks().forEach((track) => track.stop())
      throw new Error(STOPPED)
    }
    state.stream = stream
    state.session = callSession(token.session)
    admission.begin()
    const pc = new RTCPeerConnection()
    const dc = pc.createDataChannel("oai-events")
    state.pc = pc
    state.dc = dc
    stream.getAudioTracks().forEach((track) => {
      track.enabled = false
      pc.addTrack(track, stream)
    })
    pc.ontrack = (event) => {
      if (alive()) audio.srcObject = event.streams[0] ?? new MediaStream([event.track])
    }
    dc.addEventListener("open", () => {
      if (alive()) send({ type: "session.update", session: state.session })
    })
    dc.addEventListener("message", (event: MessageEvent) => {
      if (alive()) {
        const parsed = parseServerEvent(String(event.data))
        if (parsed) handle(parsed)
      }
    })
    dc.addEventListener("close", () => {
      if (alive()) {
        teardown()
        emit({ type: "closed", reason: "channel closed" })
      }
    })
    try {
      const offer = await pc.createOffer()
      if (!alive()) throw new Error(STOPPED)
      await pc.setLocalDescription(offer)
      const answer = await exchangeOffer(token, offer.sdp ?? "")
      if (!alive()) throw new Error(STOPPED)
      await pc.setRemoteDescription({ type: "answer", sdp: answer })
      await waitForDataChannel(pc, dc)
      if (!alive()) throw new Error(STOPPED)
    } catch (error) {
      if (alive()) teardown()
      throw error
    }
  }
  const disconnect = () => {
    if (state.closed) return
    interrupt()
    send({ type: "input_audio_buffer.clear" })
    teardown()
    emit({ type: "closed", reason: "stopped" })
  }
  return {
    connect,
    disconnect,
    send,
    speak,
    interrupt,
    pttDown,
    pttUp,
    // Kept for older callers; resuming requires a fresh connection.
    setMuted: (muted: boolean) => {
      if (muted) disconnect()
    },
    on: (listener: (event: VoiceClientEvent) => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    stream: () => state.stream,
    phase: () => state.phase,
    connected: () => !state.closed && state.live,
  }
}

async function requireMicrophone() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This window cannot capture audio: navigator.mediaDevices is unavailable.")
  }
  return navigator.mediaDevices
    .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
    .catch((error: unknown) => {
      throw new Error(formatMicrophoneError(error))
    })
}

const READ_ONLY_SESSION_KEYS = new Set(["id", "object", "expires_at", "client_secret"])

/** The session as the call endpoint and `session.update` accept it: no read-only fields. */
function callSession(session: Record<string, unknown>) {
  const writable = Object.fromEntries(Object.entries(session).filter(([key]) => !READ_ONLY_SESSION_KEYS.has(key)))
  return {
    ...writable,
    tools: [],
    tool_choice: "none",
    type: typeof writable.type === "string" ? writable.type : "realtime",
    output_modalities: Array.isArray(writable.output_modalities) ? writable.output_modalities : ["audio"],
  }
}

async function exchangeOffer(token: VoiceToken, sdp: string) {
  const body = new FormData()
  body.set("sdp", sdp)
  body.set("session", JSON.stringify(callSession(token.session)))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OFFER_TIMEOUT_MS)
  const response = await fetch(CALLS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token.value}` },
    body,
    signal: controller.signal,
  })
    .finally(() => clearTimeout(timer))
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`OpenAI did not answer the WebRTC offer within ${OFFER_TIMEOUT_MS / 1000}s.`)
      }
      throw new Error(`Could not reach OpenAI Realtime: ${errorMessage(error)}`)
    })
  const text = await response.text()
  if (!response.ok) throw new Error(formatResponseError(response, text))
  return text
}

function formatResponseError(response: Response, text: string) {
  const clean = stripHtml(text).trim()
  const status = `${response.status} ${response.statusText || "Request failed"}`
  if (clean) return `OpenAI Realtime rejected the call (${status}): ${clean}`
  return `OpenAI Realtime rejected the call (${status}).`
}

function waitForDataChannel(pc: RTCPeerConnection, dc: RTCDataChannel) {
  if (dc.readyState === "open") return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout)
      dc.removeEventListener("open", onOpen)
      dc.removeEventListener("close", onClose)
      dc.removeEventListener("error", onError)
      pc.removeEventListener("connectionstatechange", onConnection)
      pc.removeEventListener("iceconnectionstatechange", onIce)
    }
    const finish = () => {
      cleanup()
      resolve()
    }
    const fail = (message: string) => {
      cleanup()
      reject(new Error(message))
    }
    const timeout = setTimeout(
      () =>
        fail(
          `Voice connection timed out: the OpenAI control channel did not open within ${CHANNEL_TIMEOUT_MS / 1000}s. Check the network or VPN and retry.`,
        ),
      CHANNEL_TIMEOUT_MS,
    )
    const onOpen = () => finish()
    const onClose = () => fail("The OpenAI control channel closed before it opened. Retry.")
    const onError = () => fail("The OpenAI control channel failed before it opened. Retry.")
    const onConnection = () => {
      if (!["failed", "closed", "disconnected"].includes(pc.connectionState)) return
      fail(`WebRTC peer connection ${pc.connectionState} before the control channel opened. Retry.`)
    }
    const onIce = () => {
      if (!["failed", "closed", "disconnected"].includes(pc.iceConnectionState)) return
      fail(
        `ICE connection ${pc.iceConnectionState} before the control channel opened: something on the network is blocking WebRTC (VPN, firewall). Retry.`,
      )
    }
    dc.addEventListener("open", onOpen)
    dc.addEventListener("close", onClose)
    dc.addEventListener("error", onError)
    pc.addEventListener("connectionstatechange", onConnection)
    pc.addEventListener("iceconnectionstatechange", onIce)
  })
}

function parseServerEvent(raw: string): ServerEvent | undefined {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || typeof (parsed as { type?: unknown }).type !== "string") return
    return parsed as ServerEvent
  } catch {
    return
  }
}

export function isMicrophoneAccessError(error: unknown) {
  const name = error instanceof Error ? error.name : ""
  if (
    ["NotAllowedError", "NotFoundError", "NotReadableError", "OverconstrainedError", "SecurityError"].includes(name)
  ) {
    return true
  }
  return /microphone|getUserMedia|permission|denied|notallowed|input device/i.test(errorMessage(error))
}

export function isRealtimeConnectionError(error: unknown) {
  return /realtime|control channel|peer connection|ice connection|timed out|webrtc|reach openai/i.test(
    errorMessage(error),
  )
}

export function formatMicrophoneError(error: unknown) {
  const name = error instanceof Error ? error.name : ""
  const message = errorMessage(error)
  if (name === "NotAllowedError" || /permission|denied|notallowed/i.test(message)) {
    return "Microphone access was denied. Allow the microphone for this app (System Settings › Privacy & Security › Microphone) and retry."
  }
  if (name === "NotFoundError") return "No microphone was found. Connect or select an input device and retry."
  if (name === "NotReadableError") {
    return "The microphone could not be opened; another app may be holding it. Close that app and retry."
  }
  return message || "Could not access the microphone."
}

/** A readable message for anything thrown: Error, `{ error }`, `{ message }`, or a bare value. */
export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const record = error as { error?: unknown; message?: unknown }
    if (typeof record.error === "string") return record.error
    if (typeof record.message === "string") return record.message
    return JSON.stringify(error)
  }
  return String(error)
}

function stripHtml(text: string) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .slice(0, 900)
}
