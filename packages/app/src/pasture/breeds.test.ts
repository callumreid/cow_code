import { describe, expect, test } from "bun:test"
import { BREEDS, breedFor, cowSeed } from "./breeds"
import { hashString } from "./rng"

describe("pasture breeds", () => {
  test("every breed has a usable coat and the catalogue is wide", () => {
    expect(BREEDS.length).toBeGreaterThanOrEqual(25)
    for (const breed of BREEDS) {
      expect(breed.body).toMatch(/^#[0-9a-f]{6}$/i)
      if (breed.pattern !== "solid") expect(breed.patch).toMatch(/^#[0-9a-f]{6}$/i)
    }
    expect(new Set(BREEDS.map((b) => b.id)).size).toBe(BREEDS.length)
    expect(BREEDS.filter((b) => b.pattern === "nguni").length).toBeGreaterThanOrEqual(2)
  })

  test("a PR is always the same cow, and a herd spreads across many breeds", () => {
    const pr = { repo: "coval-ai/backend", number: 7259 }
    expect(breedFor(pr)).toBe(breedFor({ ...pr }))
    expect(cowSeed(pr)).toBe(cowSeed({ ...pr }))
    expect(hashString("a")).not.toBe(hashString("b"))
    const herd = Array.from({ length: 300 }, (_, i) => breedFor({ repo: i % 2 ? "coval-ai/backend" : "coval-ai/frontend", number: 7000 + i }))
    expect(new Set(herd.map((b) => b.id)).size).toBeGreaterThanOrEqual(20)
  })
})
