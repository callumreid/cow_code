import { describe, expect, test } from "bun:test"
import {
  AGENT_BIG_DOG_MODE_RE,
  USER_BIG_DOG_RE,
  countMatches,
  runBigDogCensus,
  type BigDogClient,
} from "./big-dog-census"

describe("big dog detection", () => {
  test("counts user big dog variants", () => {
    expect(countMatches("you got this big dog", USER_BIG_DOG_RE)).toBe(1)
    expect(countMatches("Big Dog. BIG DAWG. big dogging it. big dogged.", USER_BIG_DOG_RE)).toBe(4)
    expect(countMatches("make it happen big dog make it happen real good", USER_BIG_DOG_RE)).toBe(1)
    expect(countMatches("thanks big dog and also big dog", USER_BIG_DOG_RE)).toBe(2)
  })

  test("does not count impostors", () => {
    expect(countMatches("a big dogma about a bigdog statue", USER_BIG_DOG_RE)).toBe(0)
    expect(countMatches("the dog was big", USER_BIG_DOG_RE)).toBe(0)
  })

  test("counts agent big dog mode announcements", () => {
    expect(countMatches("going into big dog mode", AGENT_BIG_DOG_MODE_RE)).toBe(1)
    expect(countMatches("entering BIG DAWG MODE now", AGENT_BIG_DOG_MODE_RE)).toBe(1)
    expect(countMatches("big dog mode: engaged. big dog mode never ends.", AGENT_BIG_DOG_MODE_RE)).toBe(2)
    expect(countMatches("i am a big dog but not in mode", AGENT_BIG_DOG_MODE_RE)).toBe(0)
  })
})

describe("census", () => {
  test("tallies both directions across sessions and roles", async () => {
    const client: BigDogClient = {
      session: {
        list: async () => ({
          data: [
            { id: "s1", directory: "/barn" },
            { id: "s2", directory: "/pasture" },
          ],
        }),
        messages: async ({ sessionID }) => ({
          data:
            sessionID === "s1"
              ? [
                  { info: { role: "user" }, parts: [{ type: "text", text: "you got this big dog" }] },
                  { info: { role: "assistant" }, parts: [{ type: "text", text: "going into big dog mode" }] },
                ]
              : [
                  {
                    info: { role: "user" },
                    parts: [{ type: "text", text: "big dawg please" }, { type: "file", text: "big dog.txt" }],
                  },
                  { info: { role: "assistant" }, parts: [{ type: "text", text: "big dog mode was never off" }] },
                  // agent saying plain "big dog" without mode does not count on the agent side
                  { info: { role: "assistant" }, parts: [{ type: "text", text: "ok big dog" }] },
                ],
        }),
      },
    }
    const census = await runBigDogCensus(client)
    expect(census.userBigDogs).toBe(2)
    expect(census.agentBigDogModes).toBe(2)
    expect(census.sessionsScanned).toBe(2)
    expect(census.messagesScanned).toBe(5)
  })

  test("a failing session is skipped, not fatal", async () => {
    const client: BigDogClient = {
      session: {
        list: async () => ({ data: [{ id: "bad", directory: "/x" }, { id: "good", directory: "/y" }] }),
        messages: async ({ sessionID }) => {
          if (sessionID === "bad") throw new Error("mooo")
          return { data: [{ info: { role: "user" }, parts: [{ type: "text", text: "big dog" }] }] }
        },
      },
    }
    const census = await runBigDogCensus(client)
    expect(census.userBigDogs).toBe(1)
    expect(census.sessionsScanned).toBe(2)
  })
})
