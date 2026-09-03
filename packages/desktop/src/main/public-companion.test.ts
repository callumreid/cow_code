import { describe, expect, test } from "bun:test"
import { parsePublicCompanion } from "./public-companion"

describe("parsePublicCompanion", () => {
  test("adds the hidden gate to a secure tunnel origin", () => {
    expect(parsePublicCompanion({ origin: "https://cow.example.com", gate: "x".repeat(32) })).toBe(
      `https://cow.example.com/?_cowcode_gate=${"x".repeat(32)}`,
    )
  })

  test("rejects insecure origins and short gates", () => {
    expect(parsePublicCompanion({ origin: "http://cow.example.com", gate: "x".repeat(32) })).toBeUndefined()
    expect(parsePublicCompanion({ origin: "https://cow.example.com", gate: "mooo69!" })).toBeUndefined()
  })
})
