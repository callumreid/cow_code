import { describe, expect, test } from "bun:test"
import type { OpencodeClient, Session } from "@opencode-ai/sdk/v2/client"
import type { SessionApi } from "@opencode-ai/client/promise"
import { loadSessionChildren } from "./session-load"

describe("subagent discovery", () => {
  test("reads legacy children without loading every session", async () => {
    const child = { id: "child", parentID: "parent" } as Session
    const client = {
      session: {
        children: async (input: { sessionID: string }) => {
          expect(input.sessionID).toBe("parent")
          return { data: [child] }
        },
      },
    } as unknown as OpencodeClient
    expect(await loadSessionChildren({ client, api: {} as SessionApi, protocol: "v1", sessionID: "parent" })).toEqual([
      child,
    ])
  })

  test("loads all child pages and discards unrelated sessions", async () => {
    const seen: (string | undefined)[] = []
    const api = {
      list: async (input: { cursor?: string; parentID?: string }) => {
        seen.push(input.cursor)
        expect(input.parentID).toBe("parent")
        return {
          data: [
            { id: input.cursor ?? "first", parentID: "parent" },
            { id: "other", parentID: "elsewhere" },
          ],
          cursor: { next: input.cursor ? undefined : "second" },
        }
      },
    } as unknown as SessionApi
    const result = await loadSessionChildren({ client: {} as OpencodeClient, api, protocol: "v2", sessionID: "parent" })
    expect(result.map((item) => item.id)).toEqual(["first", "second"])
    expect(seen).toEqual([undefined, "second"])
  })

  test("surfaces server failures so the sidebar can retry", async () => {
    const client = {
      session: {
        children: async () => {
          throw new Error("offline")
        },
      },
    } as unknown as OpencodeClient
    await expect(
      loadSessionChildren({ client, api: {} as SessionApi, protocol: "v1", sessionID: "parent" }),
    ).rejects.toThrow("offline")
  })
})
