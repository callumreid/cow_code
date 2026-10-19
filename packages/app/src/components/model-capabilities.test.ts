import { describe, expect, test } from "bun:test"
import { imageCapability } from "./model-capabilities"

describe("image capability", () => {
  test("uses the exact selected provider metadata and never a model name", () => {
    expect(imageCapability({ capabilities: { input: { image: true } } })).toBe("supported")
    expect(imageCapability({ capabilities: { input: { image: false } }, modalities: { input: ["image"] } })).toBe(
      "unsupported",
    )
    expect(imageCapability({ capabilities: { input: ["text", "image"] } })).toBe("supported")
    expect(imageCapability({ modalities: { input: ["text"] } })).toBe("unsupported")
    expect(imageCapability(undefined)).toBe("unknown")
    expect(imageCapability({})).toBe("unknown")
  })
})
