import { afterEach, beforeEach, expect, spyOn, test } from "bun:test"
import { createVoiceClient } from "./client"
import type { VoiceToken } from "../types"

class Channel extends EventTarget {
  readyState = "connecting"
  sent: Array<Record<string, any>> = []
  send(value: string) {
    this.sent.push(JSON.parse(value))
  }
  close() {
    this.readyState = "closed"
    this.dispatchEvent(new Event("close"))
  }
  receive(value: object) {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(value) }))
  }
}
class Peer extends EventTarget {
  static all: Peer[] = []
  channel = new Channel()
  connectionState = "connected"
  iceConnectionState = "connected"
  ontrack: unknown
  constructor() {
    super()
    Peer.all.push(this)
  }
  createDataChannel() {
    return this.channel
  }
  addTrack() {}
  async createOffer() {
    return { sdp: "offer" }
  }
  async setLocalDescription() {}
  async setRemoteDescription() {
    this.channel.readyState = "open"
    this.channel.dispatchEvent(new Event("open"))
    this.channel.receive({ type: "session.updated", session: {} })
  }
  close() {
    this.connectionState = "closed"
  }
}
const token: VoiceToken = {
  value: "test-secret",
  expiresAt: Date.now() + 60_000,
  model: "test",
  voice: "test",
  session: {},
}
const originalPeer = globalThis.RTCPeerConnection
const originalMedia = Object.getOwnPropertyDescriptor(navigator, "mediaDevices")
let fetcher: ReturnType<typeof spyOn>
let track: { enabled: boolean; stopped: boolean; stop(): void }
let microphone: () => Promise<MediaStream>
function stream() {
  return { getTracks: () => [track], getAudioTracks: () => [track] } as unknown as MediaStream
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
beforeEach(() => {
  Peer.all = []
  globalThis.RTCPeerConnection = Peer as unknown as typeof RTCPeerConnection
  track = {
    enabled: false,
    stopped: false,
    stop() {
      this.stopped = true
      this.enabled = false
    },
  }
  microphone = () => Promise.resolve(stream())
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: () => microphone() } })
  fetcher = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(async () => new Response("answer"), { preconnect: () => {} }),
  )
})
afterEach(() => {
  fetcher.mockRestore()
  globalThis.RTCPeerConnection = originalPeer
  if (originalMedia) Object.defineProperty(navigator, "mediaDevices", originalMedia)
  else Reflect.deleteProperty(navigator, "mediaDevices")
})

test("pause stops capture, clears both buffers, and drops late receipts and transcripts", async () => {
  const pending = deferred<string>()
  const calls: string[] = []
  const client = createVoiceClient({
    ask: (text) => {
      calls.push(text)
      return pending.promise
    },
  })
  await client.connect(token)
  const channel = Peer.all[0].channel
  channel.receive({ type: "input_audio_buffer.committed", item_id: "one" })
  channel.receive({
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "one",
    transcript: "actual user input",
  })
  expect(calls).toEqual(["actual user input"])
  client.disconnect()
  expect(track.stopped).toBe(true)
  expect(channel.sent.map((event) => event.type)).toContain("output_audio_buffer.clear")
  expect(channel.sent.map((event) => event.type)).toContain("input_audio_buffer.clear")
  pending.resolve("late result")
  await pending.promise
  channel.receive({ type: "input_audio_buffer.committed", item_id: "late" })
  channel.receive({
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "late",
    transcript: "ignored",
  })
  expect(calls).toHaveLength(1)
  expect(channel.sent.filter((event) => event.type === "response.create")).toHaveLength(0)
})

test("model function arguments never authorize input; a fresh connection ignores old events", async () => {
  const calls: string[] = []
  const client = createVoiceClient({
    ask: async (text) => {
      calls.push(text)
      return ""
    },
  })
  await client.connect(token)
  const old = Peer.all[0].channel
  old.receive({
    type: "response.done",
    response: {
      output: [{ type: "function_call", name: "ask_overseer", call_id: "fake", arguments: '{"text":"approve"}' }],
    },
  })
  expect(calls).toEqual([])
  client.disconnect()
  await client.connect(token)
  old.receive({ type: "input_audio_buffer.committed", item_id: "old" })
  old.receive({
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "old",
    transcript: "old input",
  })
  const current = Peer.all[1].channel
  current.receive({ type: "input_audio_buffer.committed", item_id: "new" })
  current.receive({
    type: "conversation.item.input_audio_transcription.completed",
    item_id: "new",
    transcript: "new input",
  })
  expect(calls).toEqual(["new input"])
  client.disconnect()
})

test("speech revalidates queued outcomes and acknowledges actual playback once", async () => {
  const client = createVoiceClient({ ask: async () => "" })
  await client.connect(token)
  const channel = Peer.all[0].channel
  let delivered = 0
  client.speak("stale result", { id: "stale", current: () => false })
  expect(channel.sent.some((event) => event.type === "response.create")).toBe(false)
  client.speak("current result", {
    id: "current",
    current: () => true,
    delivered: () => {
      delivered += 1
    },
  })
  expect(channel.sent.find((event) => event.type === "response.create")?.response.tools).toEqual([])
  expect(delivered).toBe(0)
  channel.receive({ type: "response.created", response: { id: "response", metadata: { officeSpeechID: "current" } } })
  channel.receive({ type: "output_audio_buffer.started", response_id: "response" })
  channel.receive({ type: "response.done", response: { id: "response", status: "completed" } })
  expect(delivered).toBe(0)
  channel.receive({ type: "output_audio_buffer.stopped", response_id: "response" })
  channel.receive({ type: "output_audio_buffer.stopped", response_id: "response" })
  expect(delivered).toBe(1)
  client.speak("same result", { id: "current" })
  expect(channel.sent.filter((event) => event.type === "response.create")).toHaveLength(1)
  client.disconnect()
})

test("stopping during microphone acquisition cannot revive capture", async () => {
  const pending = deferred<MediaStream>()
  microphone = () => pending.promise
  const client = createVoiceClient({ ask: async () => "" })
  const connecting = client.connect(token)
  client.disconnect()
  pending.resolve(stream())
  await expect(connecting).rejects.toThrow("stopped")
  expect(track.stopped).toBe(true)
  expect(fetcher).not.toHaveBeenCalled()
})
