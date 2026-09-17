import { describe, expect, test } from "bun:test"
import { isWolf, wolfFor, wolfID } from "./wolves"

describe("wolves", () => {
  test("an alert becomes a grey wolf that carries the alert's name", () => {
    const wolf = wolfFor({ id: 42, name: "Pipeline setup error spike", since: null, url: "https://app.example/monitors/42" })
    expect(wolf.id).toBe("wolf:42")
    expect(wolf.kind).toBe("wolf")
    expect(wolf.blurb).toBe("Pipeline setup error spike")
    expect(isWolf(wolf.id)).toBe(true)
    expect(isWolf("kobi")).toBe(false)
    expect(wolfID({ id: 7 })).toBe("wolf:7")
  })
})
