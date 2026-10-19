import { describe, expect, test } from "bun:test"
import { imageCapability, imageModelSuggestions } from "./model-capabilities"

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

  test("suggests coding models from the current provider and recent history, excluding video generators", () => {
    const model = (id: string, providerID: string, toolcall = true, text = true) => ({
      id,
      name: id,
      provider: { id: providerID },
      capabilities: { input: { image: true }, output: { text }, toolcall },
    })
    const models = [
      model("HappyHorse Reference-to-Video", "alibaba", false, false),
      model("A media model", "openrouter", true, false),
      model("B text only", "openrouter", false),
      model("A coding model", "alibaba"),
      model("B coding model", "openrouter"),
      model("Recent coding model", "openrouter"),
      model("Other recent coding model", "anthropic"),
    ]
    expect(
      imageModelSuggestions(models, { provider: { id: "openrouter" } }, [models[6], models[5]]).map((m) => m.id),
    ).toEqual(["Recent coding model", "B coding model", "Other recent coding model"])
    expect(models[0].id).toBe("HappyHorse Reference-to-Video")
  })

  test("uses v2 tools and output metadata and keeps unknown tool support out of quick suggestions", () => {
    const models = [
      {
        id: "video",
        name: "video",
        provider: { id: "p" },
        capabilities: { input: ["image"], output: ["video"], tools: true },
      },
      {
        id: "chat",
        name: "chat",
        provider: { id: "p" },
        capabilities: { input: ["image"], output: ["text"], tools: true },
      },
      { id: "unknown", name: "unknown", provider: { id: "p" }, capabilities: { input: ["image"] } },
    ]
    expect(imageModelSuggestions(models, undefined).map((m) => m.id)).toEqual(["chat"])
    expect(imageCapability(models[0])).toBe("supported")
  })
})
