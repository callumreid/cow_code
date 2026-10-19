import { describe, expect, test } from "bun:test"
import { CodexAppServer } from "../../src/experimental/codex-app-server"

const options = {
  cwd: import.meta.dir,
  command: [process.execPath, `${import.meta.dir}/codex-app-server.fixture.ts`],
  timeoutMs: 1_000,
}

describe("opt-in Codex app-server transport", () => {
  test("initializes split frames, correlates concurrent requests, and streams before turn response", async () => {
    const client = await CodexAppServer.connect(options)
    try {
      expect(client.ready).toEqual({ userAgent: "fixture" })
      expect(await Promise.all([client.request("echo", { n: 1 }), client.request("echo", { n: 2 })])).toEqual([
        { n: 1 },
        { n: 2 },
      ])
      const events: string[] = []
      const unsubscribe = client.subscribe((event) => events.push(event.method))
      const completed = client.waitFor((event) => event.method === "turn/completed")
      const thread = await client.start()
      expect((await client.turn(thread.thread.id, "hello")).turn.id).toBe("test-turn")
      await completed
      expect(events).toEqual(["item/agentMessage/delta", "turn/completed"])
      unsubscribe()
      expect(await client.steer("test-thread", "test-turn", "continue")).toMatchObject({ expectedTurnId: "test-turn" })
      expect(await client.interrupt("test-thread", "test-turn")).toEqual({
        threadId: "test-thread",
        turnId: "test-turn",
      })
    } finally {
      await client.close()
    }
  })

  test.each([undefined, "accept", "decline", "cancel"] as const)(
    "approval decision %s is explicit and single-use",
    async (decision) => {
      const client = await CodexAppServer.connect({ ...options, approval: decision ? async () => decision : undefined })
      try {
        const response = client.waitFor((event) => event.method === "approval-decision")
        void client.request("approval-test").catch(() => {})
        expect((await response).params).toEqual({ decision: decision ?? "decline" })
        const unsupported = client.waitFor((event) => event.method === "unsupported-response")
        void client.request("unsupported-test").catch(() => {})
        expect((await unsupported).params).toMatchObject({ code: -32601 })
      } finally {
        await client.close()
      }
    },
  )

  test("process exit rejects pending requests and notification waits", async () => {
    const client = await CodexAppServer.connect(options)
    const results = Promise.allSettled([
      client.request("pending-test"),
      client.waitFor(() => false),
      client.request("exit-test"),
    ])
    expect((await results).map((result) => result.status)).toEqual(["rejected", "rejected", "rejected"])
    await expect(client.request("echo")).rejects.toThrow()
    await client.close()
  })

  test("request timeout does not retry uncertain operations", async () => {
    const client = await CodexAppServer.connect({ ...options, timeoutMs: 100 })
    try {
      await expect(client.request("pending-test")).rejects.toThrow("do not retry automatically")
    } finally {
      await client.close()
    }
  })

  test("an approval deadline declines and cancels the waiting approval UI", async () => {
    let signal: AbortSignal | undefined
    const client = await CodexAppServer.connect({
      ...options,
      timeoutMs: 100,
      approval: async (request) => {
        signal = request.signal
        return new Promise(() => {})
      },
    })
    try {
      const response = client.waitFor((event) => event.method === "approval-decision", 1_000)
      void client.request("approval-test").catch(() => {})
      expect((await response).params).toEqual({ decision: "decline" })
      expect(signal?.aborted).toBe(true)
    } finally {
      await client.close()
    }
  })

  test("invalid protocol output closes the process and rejects its pending call", async () => {
    const client = await CodexAppServer.connect({ ...options, command: [...options.command, "malformed"] })
    try {
      await expect(client.request("echo")).rejects.toThrow()
    } finally {
      await client.close()
    }
  })
})
