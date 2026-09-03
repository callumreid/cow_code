/** Recorder mime types in preference order; the first the browser can produce wins. */
export const MIME_PREFERENCE = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]

/** Plain-http phone links (the LAN/tailnet companion URL) have no `getUserMedia` at all. */
export const INSECURE_CONTEXT = "Microphone needs an HTTPS link (open the office over Tailscale HTTPS)"

export type Recording = { blob: Blob; mime: string; durationMs: number }

/** First candidate the recorder supports; undefined lets the browser choose. */
export function pickMime(supported: (mime: string) => boolean, candidates = MIME_PREFERENCE) {
  return candidates.find((mime) => supported(mime))
}

/** Base64 of raw bytes, chunked so a long clip does not overflow `String.fromCharCode`'s argument list. */
export function toBase64(bytes: Uint8Array) {
  const chunk = 0x8000
  const parts = Array.from({ length: Math.ceil(bytes.length / chunk) }, (_, index) =>
    String.fromCharCode(...bytes.subarray(index * chunk, (index + 1) * chunk)),
  )
  return btoa(parts.join(""))
}

export function fromBase64(text: string) {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0))
}

export async function blobToBase64(blob: Blob) {
  return toBase64(new Uint8Array(await blob.arrayBuffer()))
}

/**
 * A valid 8 kHz mono 8-bit PCM WAV of `samples` silent frames. Playing it inside
 * a user gesture is what lets an `<audio>` element play programmatically later on iOS.
 */
export function silentWav(samples = 8) {
  const header = new DataView(new ArrayBuffer(44))
  const ascii = (offset: number, text: string) =>
    [...text].forEach((char, index) => header.setUint8(offset + index, char.charCodeAt(0)))
  ascii(0, "RIFF")
  header.setUint32(4, 36 + samples, true)
  ascii(8, "WAVE")
  ascii(12, "fmt ")
  header.setUint32(16, 16, true)
  header.setUint16(20, 1, true)
  header.setUint16(22, 1, true)
  header.setUint32(24, 8000, true)
  header.setUint32(28, 8000, true)
  header.setUint16(32, 1, true)
  header.setUint16(34, 8, true)
  ascii(36, "data")
  header.setUint32(40, samples, true)
  const bytes = new Uint8Array(44 + samples)
  bytes.set(new Uint8Array(header.buffer))
  // 8-bit PCM silence sits at the midpoint, not zero.
  bytes.fill(128, 44)
  return bytes
}

export type MicrophoneEnvironment = { secure: boolean; getUserMedia: boolean; recorder: boolean }

/** Why recording cannot start here, in words the user can act on; undefined when it can. */
export function microphoneBlocked(env: MicrophoneEnvironment) {
  if (!env.secure) return INSECURE_CONTEXT
  if (!env.getUserMedia) return "This browser does not expose a microphone."
  if (!env.recorder) return "This browser cannot record audio."
  return undefined
}

export function currentEnvironment(): MicrophoneEnvironment {
  return {
    secure: typeof window === "undefined" ? true : window.isSecureContext,
    getUserMedia: typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function",
    recorder: typeof MediaRecorder !== "undefined",
  }
}

/** A `getUserMedia` failure as readable text. */
export function microphoneError(error: unknown) {
  const name = error instanceof Error ? error.name : ""
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access was denied. Allow the microphone for this site and try again."
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No microphone was found."
  if (name === "NotReadableError") return "The microphone is busy in another app."
  if (error instanceof Error && error.message) return error.message
  return String(error)
}

type Take = { recorder: MediaRecorder; stream: MediaStream; chunks: Blob[]; started: number }

/**
 * One microphone take at a time over MediaRecorder. `start` asks for the
 * device, `stop` hands back the clip and releases the tracks, `cancel` throws
 * the take away. Every rejection carries a message fit to show as is.
 */
export function createRecorder() {
  const state = { take: undefined as Take | undefined }
  const release = (stream: MediaStream) => stream.getTracks().forEach((track) => track.stop())

  return {
    active: () => state.take !== undefined,
    async start() {
      if (state.take) return
      const blocked = microphoneBlocked(currentEnvironment())
      if (blocked) throw new Error(blocked)
      const stream = await navigator.mediaDevices
        .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        .catch((error: unknown) => {
          throw new Error(microphoneError(error))
        })
      const mime = pickMime((candidate) => MediaRecorder.isTypeSupported(candidate))
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      state.take = { recorder, stream, chunks, started: Date.now() }
      recorder.start()
    },
    stop() {
      const take = state.take
      state.take = undefined
      if (!take) return Promise.reject(new Error("Nothing is recording."))
      return new Promise<Recording>((resolve) => {
        take.recorder.onstop = () => {
          release(take.stream)
          const mime = take.recorder.mimeType || "audio/webm"
          resolve({ blob: new Blob(take.chunks, { type: mime }), mime, durationMs: Date.now() - take.started })
        }
        take.recorder.stop()
      })
    },
    cancel() {
      const take = state.take
      state.take = undefined
      if (!take) return
      take.recorder.onstop = null
      take.recorder.ondataavailable = null
      if (take.recorder.state !== "inactive") take.recorder.stop()
      release(take.stream)
    },
  }
}
