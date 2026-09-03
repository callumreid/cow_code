import { describe, expect, test } from "bun:test"
import {
  fromBase64,
  INSECURE_CONTEXT,
  MIME_PREFERENCE,
  microphoneBlocked,
  microphoneError,
  pickMime,
  silentWav,
  toBase64,
} from "./recorder"

describe("pickMime", () => {
  test("takes the first supported candidate in preference order", () => {
    expect(pickMime((mime) => mime === "audio/mp4" || mime === "audio/ogg")).toBe("audio/mp4")
    expect(pickMime(() => true)).toBe(MIME_PREFERENCE[0])
  })

  test("is undefined when nothing matches so the browser picks", () => {
    expect(pickMime(() => false)).toBeUndefined()
  })
})

describe("base64", () => {
  test("round-trips bytes, including a clip longer than one chunk", () => {
    const bytes = Uint8Array.from({ length: 0x8000 * 2 + 7 }, (_, index) => index % 251)
    expect(fromBase64(toBase64(bytes))).toEqual(bytes)
  })

  test("matches btoa on a short input", () => {
    expect(toBase64(new TextEncoder().encode("moo"))).toBe(btoa("moo"))
  })
})

describe("silentWav", () => {
  test("is a RIFF/WAVE container with 8-bit silence at the midpoint", () => {
    const bytes = silentWav(4)
    const text = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to))
    expect(bytes.length).toBe(48)
    expect(text(0, 4)).toBe("RIFF")
    expect(text(8, 12)).toBe("WAVE")
    expect(text(36, 40)).toBe("data")
    expect(new DataView(bytes.buffer).getUint32(40, true)).toBe(4)
    expect([...bytes.subarray(44)]).toEqual([128, 128, 128, 128])
  })
})

describe("microphoneBlocked", () => {
  test("names the https requirement first, before anything else is missing", () => {
    expect(microphoneBlocked({ secure: false, getUserMedia: false, recorder: false })).toBe(INSECURE_CONTEXT)
  })

  test("is clear when the browser can record", () => {
    expect(microphoneBlocked({ secure: true, getUserMedia: true, recorder: true })).toBeUndefined()
    expect(microphoneBlocked({ secure: true, getUserMedia: false, recorder: true })).toContain("microphone")
  })
})

describe("microphoneError", () => {
  test("explains a denied permission", () => {
    const denied = new Error("Permission denied")
    denied.name = "NotAllowedError"
    expect(microphoneError(denied)).toContain("denied")
  })

  test("falls back to the error text", () => {
    expect(microphoneError(new Error("boom"))).toBe("boom")
    expect(microphoneError("plain")).toBe("plain")
  })
})
