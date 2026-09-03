import type { VoiceToken } from "../types"
import type { VoiceUsage } from "./cost"

export type VoicePhase = "connecting" | "listening" | "thinking" | "speaking"

/** The server events that matter to the strip, already reduced to what the UI shows. */
export type VoiceClientEvent =
  | { type: "phase"; phase: VoicePhase }
  | { type: "session"; session: Record<string, unknown> }
  | { type: "speech"; active: boolean }
  | { type: "user"; text: string }
  | { type: "assistant"; text: string; done: boolean }
  | { type: "usage"; usage: VoiceUsage }
  | { type: "tool"; name: string; args: Record<string, unknown> }
  | { type: "error"; message: string }
  | { type: "closed"; reason: "stopped" | "channel closed" }

export type VoiceClientOptions = {
  /** Runs the `ask_overseer` tool: the farmer's reply text for what the model asked. */
  ask: (text: string) => Promise<string>
  /** Start with the mic closed and only open it while a push-to-talk hold is active. */
  pushToTalk?: boolean
}

export type VoiceClient = ReturnType<typeof createVoiceClient>

type FunctionCall = { type: "function_call"; name: string; call_id: string; arguments?: string }

type ServerEvent =
  | { type: "session.created" | "session.updated"; session?: Record<string, unknown> }
  | { type: "input_audio_buffer.speech_started" | "input_audio_buffer.speech_stopped" }
  | { type: "conversation.item.input_audio_transcription.completed"; item_id?: string; transcript?: string }
  | { type: "response.created" }
  | { type: "response.output_audio_transcript.delta"; delta?: string }
  | { type: "response.output_audio_transcript.done"; transcript?: string }
  | { type: "response.done"; response?: { usage?: VoiceUsage; output?: Array<FunctionCall | { type: string }> } }
  | { type: "output_audio_buffer.started" | "output_audio_buffer.stopped" | "output_audio_buffer.cleared" }
  | { type: "error"; error?: { message?: string; code?: string } }

const CALLS_URL = "https://api.openai.com/v1/realtime/calls"
const OFFER_TIMEOUT_MS = 35_000
const CHANNEL_TIMEOUT_MS = 15_000
const RESERVE_MS = 4_000
const SILENCE_MS = 400
const STOPPED = "Voice session was stopped."

export function createVoiceClient(options: VoiceClientOptions) {
  const listeners = new Set<(event: VoiceClientEvent) => void>()
  const queue: Array<() => void> = []
  const audio = document.createElement("audio")
  audio.autoplay = true

  const state = {
    generation: 0,
    closed: true,
    live: false,
    pc: null as RTCPeerConnection | null,
    dc: null as RTCDataChannel | null,
    stream: null as MediaStream | null,
    session: {} as Record<string, unknown>,
    phase: "connecting" as VoicePhase,
    caption: "",
    muted: false,
    ptt: options.pushToTalk === true,
    held: false,
    heldAt: 0,
    userSpeaking: false,
    responseActive: false,
    audioPlaying: false,
    toolPending: false,
    // While set (and in the future) a response.create is in flight and response.created has not landed yet.
    reservedUntil: 0,
    reserveTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    restoreTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  }

  const emit = (event: VoiceClientEvent) => listeners.forEach((listener) => listener(event))

  const setPhase = (phase: VoicePhase) => {
    if (state.phase === phase) return
    state.phase = phase
    emit({ type: "phase", phase })
  }

  const applyMic = () => {
    const enabled = !state.muted && (!state.ptt || state.held)
    state.stream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
  }

  const send = (event: Record<string, unknown>) => {
    if (!state.dc || state.dc.readyState !== "open") return false
    state.dc.send(JSON.stringify(event))
    return true
  }

  const sendSessionUpdate = () => send({ type: "session.update", session: state.session })

  const busy = () =>
    state.userSpeaking ||
    state.responseActive ||
    state.audioPlaying ||
    state.toolPending ||
    Date.now() < state.reservedUntil

  // Hold the floor until the server opens the response we just asked for; the
  // timeout only matters if it never does, so a queued report is not stranded.
  const reserve = () => {
    state.reservedUntil = Date.now() + RESERVE_MS
    clearTimeout(state.reserveTimer)
    state.reserveTimer = setTimeout(() => {
      state.reservedUntil = 0
      if (!busy()) setPhase("listening")
      flush()
    }, RESERVE_MS)
  }

  // Reports never barge in: one queued item goes out only when nobody is
  // talking, nothing is playing, and no response or tool call is in flight.
  const flush = () => {
    if (state.closed || !state.live || busy()) return
    const next = queue.shift()
    if (!next) return
    next()
    reserve()
  }

  const enqueue = (fn: () => void) => {
    queue.push(fn)
    flush()
  }

  const silence = () => {
    audio.muted = true
    clearTimeout(state.restoreTimer)
    state.restoreTimer = setTimeout(restore, SILENCE_MS)
  }

  const restore = () => {
    clearTimeout(state.restoreTimer)
    state.restoreTimer = undefined
    audio.muted = false
    if (audio.paused && audio.srcObject) void audio.play().catch(() => {})
  }

  // response.cancel drops what the server has not sent yet; WebRTC has already
  // handed the browser a few hundred ms of audio, so the element is muted long
  // enough to swallow that tail.
  const interrupt = () => {
    if (state.responseActive) send({ type: "response.cancel" })
    silence()
  }

  const speak = (directive: string) => {
    const text = directive.trim()
    if (!text || state.closed) return
    enqueue(() => {
      send({
        type: "conversation.item.create",
        item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
      })
      send({ type: "response.create" })
    })
  }

  const setMuted = (muted: boolean) => {
    state.muted = muted
    applyMic()
  }

  const pttDown = () => {
    if (state.closed || state.held) return
    if (!state.ptt) {
      // The first hold switches the session to push-to-talk for good: no
      // server VAD, so the mic is only open while the button is held.
      state.ptt = true
      send({ type: "session.update", session: { type: "realtime", audio: { input: { turn_detection: null } } } })
    }
    state.held = true
    state.heldAt = Date.now()
    applyMic()
    if (state.responseActive || state.audioPlaying) interrupt()
    send({ type: "input_audio_buffer.clear" })
  }

  const pttUp = () => {
    if (!state.held) return
    state.held = false
    applyMic()
    // A tap too short to carry speech would only earn an empty-commit error.
    if (Date.now() - state.heldAt < 200) {
      send({ type: "input_audio_buffer.clear" })
      return
    }
    send({ type: "input_audio_buffer.commit" })
    send({ type: "response.create" })
    reserve()
  }

  const runTool = async (name: string, args: Record<string, unknown>) => {
    if (name !== "ask_overseer") return { error: "unknown tool" }
    const text = typeof args.text === "string" ? args.text.trim() : ""
    if (!text) return { error: "ask_overseer needs a non-empty text argument" }
    return options.ask(text).then(
      (reply) => ({ reply }),
      (error: unknown) => ({ error: errorMessage(error) }),
    )
  }

  // Tool outputs and the response.create that relays them go out together
  // through the idle queue: if Callum spoke while the farmer was thinking, the
  // model answers him first and relays the farmer afterwards.
  const runTools = async (calls: FunctionCall[]) => {
    const generation = state.generation
    state.toolPending = true
    setPhase("thinking")
    const outputs: Array<{ call_id: string; output: string }> = []
    for (const call of calls) {
      const args = parseArguments(call.arguments)
      emit({ type: "tool", name: call.name, args })
      const output = await runTool(call.name, args)
      if (generation !== state.generation) return
      outputs.push({ call_id: call.call_id, output: JSON.stringify(output) })
    }
    state.toolPending = false
    enqueue(() => {
      outputs.forEach((item) =>
        send({ type: "conversation.item.create", item: { type: "function_call_output", ...item } }),
      )
      send({ type: "response.create" })
    })
  }

  const handle = (event: ServerEvent) => {
    switch (event.type) {
      case "session.created":
      case "session.updated":
        emit({ type: "session", session: event.session ?? {} })
        if (event.type === "session.created" || state.live) return
        state.live = true
        applyMic()
        setPhase("listening")
        flush()
        return
      case "input_audio_buffer.speech_started":
        state.userSpeaking = true
        emit({ type: "speech", active: true })
        if (state.responseActive || state.audioPlaying) interrupt()
        return
      case "input_audio_buffer.speech_stopped":
        state.userSpeaking = false
        emit({ type: "speech", active: false })
        // Server VAD opens its own response next; do not let a report slip in first.
        reserve()
        setPhase("thinking")
        return
      case "conversation.item.input_audio_transcription.completed": {
        const text = event.transcript?.trim() ?? ""
        if (text) emit({ type: "user", text })
        return
      }
      case "response.created":
        state.responseActive = true
        state.reservedUntil = 0
        state.caption = ""
        setPhase("thinking")
        return
      case "response.output_audio_transcript.delta":
        state.caption += event.delta ?? ""
        emit({ type: "assistant", text: state.caption, done: false })
        setPhase("speaking")
        return
      case "response.output_audio_transcript.done":
        state.caption = event.transcript ?? state.caption
        emit({ type: "assistant", text: state.caption, done: true })
        return
      case "output_audio_buffer.started":
        state.audioPlaying = true
        setPhase("speaking")
        return
      case "output_audio_buffer.stopped":
      case "output_audio_buffer.cleared":
        state.audioPlaying = false
        if (!state.responseActive && !state.toolPending) setPhase("listening")
        flush()
        return
      case "response.done": {
        state.responseActive = false
        if (event.response?.usage) emit({ type: "usage", usage: event.response.usage })
        const calls = (event.response?.output ?? []).filter(isFunctionCall)
        if (calls.length > 0) {
          void runTools(calls)
          return
        }
        if (!state.audioPlaying) setPhase("listening")
        flush()
        return
      }
      case "error":
        // Our cancel races the server's own VAD interrupt; losing that race is not an error.
        if (event.error?.code === "response_cancel_not_active") return
        emit({ type: "error", message: event.error?.message ?? "Unknown realtime error" })
        return
    }
  }

  const teardown = () => {
    state.generation += 1
    clearTimeout(state.reserveTimer)
    clearTimeout(state.restoreTimer)
    queue.length = 0
    state.dc?.close()
    state.pc?.close()
    state.stream?.getTracks().forEach((track) => track.stop())
    audio.pause()
    audio.srcObject = null
    audio.muted = false
    state.dc = null
    state.pc = null
    state.stream = null
    state.live = false
    state.held = false
    state.caption = ""
    state.userSpeaking = false
    state.responseActive = false
    state.audioPlaying = false
    state.toolPending = false
    state.reservedUntil = 0
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

    const pc = new RTCPeerConnection()
    const dc = pc.createDataChannel("oai-events")
    state.pc = pc
    state.dc = dc
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !state.ptt
      pc.addTrack(track, stream)
    })
    pc.ontrack = (event) => {
      audio.srcObject = event.streams[0] ?? new MediaStream([event.track])
    }
    dc.addEventListener("open", () => {
      if (alive()) sendSessionUpdate()
    })
    dc.addEventListener("message", (event: MessageEvent) => {
      if (!alive()) return
      const parsed = parseServerEvent(String(event.data))
      if (parsed) handle(parsed)
    })
    dc.addEventListener("close", () => {
      if (!alive()) return
      teardown()
      state.closed = true
      emit({ type: "closed", reason: "channel closed" })
    })

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    const answer = await exchangeOffer(token, offer.sdp ?? "")
    if (!alive()) throw new Error(STOPPED)
    await pc.setRemoteDescription({ type: "answer", sdp: answer })
    await waitForDataChannel(pc, dc)
    if (!alive()) throw new Error(STOPPED)
  }

  const disconnect = () => {
    if (state.closed) return
    teardown()
    state.closed = true
    emit({ type: "closed", reason: "stopped" })
  }

  return {
    connect,
    disconnect,
    send,
    sendSessionUpdate,
    speak,
    interrupt,
    setMuted,
    pttDown,
    pttUp,
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

function parseArguments(value: string | undefined): Record<string, unknown> {
  if (!value) return {}
  try {
    const parsed: unknown = JSON.parse(value)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>
    return { raw_arguments: value }
  } catch {
    return { raw_arguments: value }
  }
}

function isFunctionCall(item: FunctionCall | { type: string }): item is FunctionCall {
  if (item.type !== "function_call") return false
  const call = item as Partial<FunctionCall>
  return typeof call.name === "string" && typeof call.call_id === "string"
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
