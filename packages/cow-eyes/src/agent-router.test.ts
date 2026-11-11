import { describe, expect, test } from "bun:test"
import { SESSION_META, THREAD_META, createAgentRouter } from "./agent-router"

type Fake = { session: string; lines: any[]; emit: (message: unknown) => void; killed: boolean; exit: () => void }

function setup(
  options: { control?: (session: string, thread: string) => Promise<{ owner?: string } | undefined> } = {},
) {
  const started: Fake[] = []
  const out: any[] = []
  const controls: string[] = []
  let exits = 0
  let clock = 0
  const router = createAgentRouter({
    start(session, on) {
      const fake: Fake = {
        session,
        lines: [],
        killed: false,
        emit: (message) => on.line(JSON.stringify(message)),
        exit: on.exit,
      }
      started.push(fake)
      return {
        write(line) {
          const message = JSON.parse(line)
          fake.lines.push(message)
          // Every Playwright process answers the handshake the router repeats for it.
          if (message.method === "initialize" && message.id === "cow-init")
            fake.emit({ jsonrpc: "2.0", id: "cow-init", result: {} })
        },
        kill() {
          fake.killed = true
          on.exit()
        },
      }
    },
    out: (line) => out.push(JSON.parse(line)),
    control: async (session, thread) => {
      controls.push(`${session}/${thread}`)
      return options.control ? options.control(session, thread) : { owner: "agent" }
    },
    recording: () => ({ start: async () => "started", stop: async () => ({ content: [] }) }),
    tools: [{ name: "browser_recording_start" }, { name: "browser_recording_stop" }],
    exit: () => exits++,
    idleMs: 1_000,
    now: () => clock,
  })
  const call = (id: number, session: string | undefined, name = "browser_snapshot", thread?: string) =>
    router.handle(
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: {
          name,
          arguments: {},
          ...(session ? { _meta: { [SESSION_META]: session, ...(thread ? { [THREAD_META]: thread } : {}) } } : {}),
        },
      }),
    )
  const child = (session: string) => started.findLast((item) => item.session === session)!
  const calls = (session: string) => child(session).lines.filter((line) => line.method === "tools/call")
  return { router, started, out, controls, call, child, calls, exits: () => exits, tick: (ms: number) => (clock += ms) }
}

describe("browser tool routing", () => {
  test("each session's calls go to that session's own Playwright process", async () => {
    const t = setup()
    await t.router.handle(
      JSON.stringify({ jsonrpc: "2.0", id: 0, method: "initialize", params: { protocolVersion: "x" } }),
    )
    await Promise.all([t.call(1, "ses_a"), t.call(2, "ses_b"), t.call(3, "ses_a"), t.call(4, "ses_b")])
    expect(t.router.sessions().sort()).toEqual(["ses_a", "ses_b", "shared"])
    expect(t.calls("ses_a").map((line) => line.id)).toEqual([1, 3])
    expect(t.calls("ses_b").map((line) => line.id)).toEqual([2, 4])
    // The handshake the client sent is repeated for each session's process before its first call.
    expect(t.child("ses_a").lines[0]).toMatchObject({ method: "initialize", params: { protocolVersion: "x" } })
    expect(t.child("ses_a").lines[1]).toMatchObject({ method: "notifications/initialized" })
    expect(t.calls("shared")).toEqual([])
  })

  test("interleaved calls from two threads never cross, whatever order their checks finish in", async () => {
    const gates = new Map<string, () => void>()
    const t = setup({
      control: (session) => new Promise((resolve) => gates.set(session, () => resolve({ owner: "agent" }))),
    })
    const a = t.call(1, "ses_a")
    const b = t.call(2, "ses_b")
    const a2 = t.call(3, "ses_a")
    await Bun.sleep(0)
    // Thread B's takeover check finishes first; thread A is still waiting on its own.
    gates.get("ses_b")!()
    await b
    expect(t.calls("ses_b").map((line) => line.id)).toEqual([2])
    expect(t.started.some((item) => item.session === "ses_a")).toBe(false)
    gates.get("ses_a")!()
    await a
    await Bun.sleep(0)
    gates.get("ses_a")!()
    await a2
    expect(t.calls("ses_a").map((line) => line.id)).toEqual([1, 3])
    expect(t.calls("ses_b").map((line) => line.id)).toEqual([2])
  })

  test("a call without a session id uses the shared process; other requests go there too", async () => {
    const t = setup()
    await t.call(1, undefined)
    await t.router.handle(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }))
    expect(t.child("shared").lines.map((line) => line.id)).toEqual([1, 2])
    t.child("shared").emit({ jsonrpc: "2.0", id: 2, result: { tools: [{ name: "browser_snapshot" }] } })
    expect(t.out.at(-1).result.tools.map((tool: { name: string }) => tool.name)).toEqual([
      "browser_snapshot",
      "browser_recording_start",
      "browser_recording_stop",
    ])
    expect(t.controls).toEqual(["shared/shared"])
  })

  test("takeover is checked per thread and a subagent reports its root thread", async () => {
    const t = setup({ control: async (_session, thread) => ({ owner: thread === "ses_root" ? "human" : "agent" }) })
    await t.call(1, "ses_child", "browser_click", "ses_root")
    await t.call(2, "ses_other")
    expect(t.controls).toEqual(["ses_child/ses_root", "ses_other/ses_other"])
    expect(t.out[0]).toMatchObject({ id: 1, result: { isError: true } })
    expect(t.out[0].result.content[0].text).toContain("Return to agent")
    expect(t.started.some((item) => item.session === "ses_child")).toBe(false)
    expect(t.calls("ses_other").map((line) => line.id)).toEqual([2])
  })

  test("an unreachable bridge is an explicit error, and recording stop is always allowed", async () => {
    const t = setup({ control: async () => undefined })
    await t.call(1, "ses_a")
    expect(t.out[0].result.content[0].text).toContain("bridge is unavailable")
    await t.call(2, "ses_a", "browser_recording_stop")
    expect(t.out[1]).toMatchObject({ id: 2, result: { content: [] } })
  })

  test("responses, cancellations and server requests reach the right process", async () => {
    const t = setup()
    await t.call(1, "ses_a")
    await t.call(2, "ses_b")
    await t.router.handle(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 2 } }),
    )
    expect(t.child("ses_b").lines.at(-1)).toMatchObject({ method: "notifications/cancelled" })
    expect(t.child("ses_a").lines.some((line) => line.method === "notifications/cancelled")).toBe(false)
    // Both processes number their own requests from 1; the client must see distinct ids.
    t.child("ses_a").emit({ jsonrpc: "2.0", id: 1, method: "roots/list" })
    t.child("ses_b").emit({ jsonrpc: "2.0", id: 1, method: "roots/list" })
    const [first, second] = t.out.slice(-2)
    expect(first.id).not.toBe(second.id)
    await t.router.handle(JSON.stringify({ jsonrpc: "2.0", id: second.id, result: { roots: ["b"] } }))
    expect(t.child("ses_b").lines.at(-1)).toEqual({ jsonrpc: "2.0", id: 1, result: { roots: ["b"] } })
    t.child("ses_a").emit({ jsonrpc: "2.0", id: 1, result: { content: [{ type: "text", text: "A" }] } })
    expect(t.out.at(-1)).toMatchObject({ id: 1, result: { content: [{ text: "A" }] } })
    // A session process announcing a tool-list change does not make the client refetch.
    const before = t.out.length
    t.child("ses_a").emit({ jsonrpc: "2.0", method: "notifications/tools/list_changed" })
    expect(t.out.length).toBe(before)
  })

  test("a call cancelled before it was forwarded is dropped", async () => {
    let release!: () => void
    const t = setup({ control: () => new Promise((resolve) => (release = () => resolve({ owner: "agent" }))) })
    const pending = t.call(1, "ses_a")
    await Bun.sleep(0)
    await t.router.handle(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 1 } }),
    )
    release()
    await pending
    expect(t.started.some((item) => item.session === "ses_a")).toBe(false)
    expect(t.out).toEqual([])
  })

  test("idle session processes stop, a crash fails only that session's calls, and the next call restarts it", async () => {
    const t = setup()
    await t.call(1, "ses_a")
    await t.call(2, "ses_b")
    t.child("ses_b").emit({ jsonrpc: "2.0", id: 2, result: { content: [] } })
    t.tick(2_000)
    t.router.reap()
    // ses_a still has a call in flight, so only ses_b's idle process stops.
    expect(t.child("ses_b").killed).toBe(true)
    expect(t.child("ses_a").killed).toBe(false)
    expect(t.child("shared").killed).toBe(false)
    t.child("ses_a").exit()
    expect(t.out.at(-1)).toMatchObject({ id: 1, result: { isError: true } })
    expect(t.out.at(-1).result.content[0].text).toContain("restarted")
    expect(t.exits()).toBe(0)
    await t.call(3, "ses_a")
    expect(t.started.filter((item) => item.session === "ses_a")).toHaveLength(2)
    expect(t.calls("ses_a").map((line) => line.id)).toEqual([3])
    t.child("shared").exit()
    expect(t.exits()).toBe(1)
  })
})
