import { describe, expect, test } from "bun:test"
import { BREEDS, breedFor, hashString, herd } from "./breeds"
import type { PasturePullRequest } from "./types"

function pr(repo: string, number: number): PasturePullRequest {
  return {
    repo,
    number,
    title: `PR ${number}`,
    url: `https://github.com/${repo}/pull/${number}`,
    mergedAt: "2026-09-10T10:00:00Z",
    author: "callumreid",
    additions: 1,
    deletions: 0,
    changedFiles: 1,
    base: "main",
    labels: [],
  }
}

describe("pasture breeds", () => {
  test("every breed has a usable coat and the catalogue is wide", () => {
    expect(BREEDS.length).toBeGreaterThanOrEqual(25)
    for (const breed of BREEDS) {
      expect(breed.body).toMatch(/^#[0-9a-f]{6}$/i)
      if (breed.pattern !== "solid") expect(breed.patch).toMatch(/^#[0-9a-f]{6}$/i)
    }
    expect(new Set(BREEDS.map((b) => b.id)).size).toBe(BREEDS.length)
  })

  test("a PR is always the same cow, and a herd spreads across many breeds", () => {
    expect(breedFor(pr("coval-ai/backend", 7259))).toBe(breedFor(pr("coval-ai/backend", 7259)))
    expect(hashString("a")).not.toBe(hashString("b"))
    const members = herd(Array.from({ length: 300 }, (_, i) => pr(i % 2 ? "coval-ai/backend" : "coval-ai/frontend", 7000 + i)))
    const breeds = new Set(members.map((m) => m.breed.id))
    expect(breeds.size).toBeGreaterThanOrEqual(20)
    expect(new Set(members.map((m) => m.id)).size).toBe(300)
  })
})
