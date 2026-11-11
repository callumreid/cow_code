// Routes one MCP client's browser tool calls to a Playwright MCP process per CowCode session.
// Playwright MCP keeps a single "current tab" per process, so sharing one process between threads
// would let one thread's call land on the tab another thread just switched to. With a process per
// session there is no shared current tab to race on, and the CDP bridge shows each process only
// its own session's tabs.
import { SHARED_SESSION, validSession } from "./threads"

/** `_meta` keys the CowCode server adds to every `tools/call` for a local MCP server. */
export const SESSION_META = "cowcode/sessionID"
export const THREAD_META = "cowcode/threadID"

type Id = number | string
type Message = {
  jsonrpc?: string
  id?: Id
  method?: string
  params?: { name?: string; requestId?: Id; _meta?: Record<string, unknown>; [key: string]: unknown }
  result?: { tools?: unknown[]; [key: string]: unknown }
}
export type RouterProcess = { write: (line: string) => void; kill: () => void }
type Child = {
  session: string
  base: boolean
  process: RouterProcess
  ready: Promise<void>
  started: () => void
  failed: (error: Error) => void
  inflight: Set<Id>
  used: number
  dead: boolean
}
type Recording = { start: () => Promise<string>; stop: () => Promise<unknown> }

const INIT = "cow-init"
const text = (id: Id | undefined, message: string) => ({
  jsonrpc: "2.0",
  id,
  result: { isError: true, content: [{ type: "text", text: message }] },
})

export function createAgentRouter(input: {
  /** Start a Playwright MCP process whose browser connection is scoped to `session`. */
  start: (session: string, on: { line: (line: string) => void; exit: () => void }) => RouterProcess
  /** Write one line to the MCP client. */
  out: (line: string) => void
  /** Who owns the thread's browser; undefined when the bridge cannot be reached. */
  control: (session: string, thread: string) => Promise<{ owner?: string } | undefined>
  recording: (thread: string) => Recording
  tools: { name: string }[]
  /** Called when the process that answers the client's own handshake exits. */
  exit: () => void
  idleMs: number
  startTimeoutMs?: number
  now?: () => number
}) {
  const now = input.now ?? Date.now
  const children = new Map<string, Child>()
  const queues = new Map<string, Promise<void>>()
  const recordings = new Map<string, Recording>()
  /** Tool calls in flight, so a cancellation reaches the process running the call. */
  const owners = new Map<Id, Child>()
  /** Requests a Playwright process sent to the client, renumbered so processes cannot collide. */
  const outbound = new Map<string, { child: Child; id: Id }>()
  const lists = new Set<Id>()
  const cancelled = new Set<Id>()
  let initialize: unknown
  let seq = 0
  const send = (message: unknown) => input.out(JSON.stringify(message))

  function fromChild(child: Child, line: string) {
    let message: Message
    try {
      message = JSON.parse(line)
    } catch {
      if (child.base) input.out(line)
      return
    }
    if (!child.base && message.id === INIT && message.method === undefined) {
      child.process.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }))
      child.started()
      return
    }
    if (message.method !== undefined && message.id !== undefined) {
      const id = `cow-${++seq}`
      outbound.set(id, { child, id: message.id })
      send({ ...message, id })
      return
    }
    if (message.method !== undefined) {
      // The client already has the tool list from the first process; every process serves the same one.
      if (!child.base && message.method.endsWith("/list_changed")) return
      input.out(line)
      return
    }
    if (message.id !== undefined) {
      child.inflight.delete(message.id)
      owners.delete(message.id)
      if (lists.delete(message.id) && Array.isArray(message.result?.tools)) {
        message.result.tools.push(...input.tools)
        send(message)
        return
      }
    }
    input.out(line)
  }

  function exited(child: Child) {
    if (child.dead) return
    child.dead = true
    if (children.get(child.session) === child) children.delete(child.session)
    child.failed(new Error("Browser tools stopped"))
    for (const id of child.inflight) {
      owners.delete(id)
      send(text(id, "The browser tools for this thread restarted. Take a fresh snapshot, then try again."))
    }
    child.inflight.clear()
    for (const [id, route] of outbound) if (route.child === child) outbound.delete(id)
    if (child.base) input.exit()
  }

  function ensure(session: string) {
    const existing = children.get(session)
    if (existing && !existing.dead) return existing
    let started!: () => void
    let failed!: (error: Error) => void
    const ready = new Promise<void>((resolve, reject) => {
      started = resolve
      failed = reject
    })
    ready.catch(() => undefined)
    const child: Child = {
      session,
      base: session === SHARED_SESSION,
      process: undefined as unknown as RouterProcess,
      ready,
      started,
      failed,
      inflight: new Set(),
      used: now(),
      dead: false,
    }
    children.set(session, child)
    child.process = input.start(session, { line: (line) => fromChild(child, line), exit: () => exited(child) })
    // The client performs the first process's handshake itself; the router repeats it for the rest.
    if (child.base) {
      started()
      return child
    }
    child.process.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: INIT,
        method: "initialize",
        params: initialize ?? {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "cowcode", version: "1" },
        },
      }),
    )
    const timer = setTimeout(() => {
      failed(new Error("Browser tools did not start"))
      child.process.kill()
    }, input.startTimeoutMs ?? 60_000)
    void ready.then(
      () => clearTimeout(timer),
      () => clearTimeout(timer),
    )
    return child
  }

  async function call(message: Message, line: string, session: string, thread: string) {
    const id = message.id
    const name = message.params?.name
    if (id !== undefined && cancelled.delete(id)) return
    if (name !== "browser_recording_stop") {
      const state = await input.control(session, thread)
      if (!state || state.owner === "human") {
        send(
          text(
            id,
            state
              ? "A person has taken control of this thread's browser tab in CowCode. Wait for them to choose Return to agent. Then inspect the page again before continuing; their actions may have changed it."
              : "The CowCode browser bridge is unavailable. Open the Browser panel to check its connection; do not fall back to a different invisible browser.",
          ),
        )
        return
      }
    }
    if (input.tools.some((tool) => tool.name === name)) {
      const recording = recordings.get(thread) ?? input.recording(thread)
      recordings.set(thread, recording)
      const result = await (
        name === "browser_recording_start"
          ? recording.start().then((value) => ({ content: [{ type: "text", text: value }] }))
          : recording.stop()
      ).catch((error: unknown) => ({
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : "Browser recording failed." }],
      }))
      send({ jsonrpc: "2.0", id, result })
      return
    }
    if (id !== undefined && cancelled.delete(id)) return
    const child = ensure(session)
    const ready = await child.ready.then(
      () => true,
      () => false,
    )
    if (!ready || child.dead) {
      send(
        text(
          id,
          "The browser tools for this thread could not start. Check that Node and npx are installed, then try again.",
        ),
      )
      return
    }
    if (id !== undefined && cancelled.delete(id)) return
    if (id !== undefined) {
      child.inflight.add(id)
      owners.set(id, child)
    }
    child.used = now()
    child.process.write(line)
  }

  /** Calls for one session are forwarded in the order they arrived; other sessions do not wait. */
  function enqueue(session: string, task: () => Promise<void>) {
    const next = (queues.get(session) ?? Promise.resolve()).then(task).catch(() => undefined)
    queues.set(session, next)
    void next.then(() => {
      if (queues.get(session) === next) queues.delete(session)
    })
    return next
  }

  return {
    /** Handle one line from the MCP client. Resolves once the line has been routed. */
    handle(line: string): Promise<void> {
      let message: Message
      try {
        message = JSON.parse(line)
      } catch {
        return Promise.resolve()
      }
      const base = ensure(SHARED_SESSION)
      if (message.method === undefined) {
        const route = message.id === undefined ? undefined : outbound.get(String(message.id))
        if (!route) base.process.write(line)
        else {
          outbound.delete(String(message.id))
          route.child.process.write(JSON.stringify({ ...message, id: route.id }))
        }
        return Promise.resolve()
      }
      if (message.method === "initialize") initialize = message.params
      if (message.method === "notifications/cancelled") {
        const id = message.params?.requestId
        const owner = id === undefined ? undefined : owners.get(id)
        if (owner) owner.process.write(line)
        else if (id !== undefined) {
          if (cancelled.size > 1_000) cancelled.clear()
          cancelled.add(id)
        }
        return Promise.resolve()
      }
      if (message.method === "tools/list" && message.id !== undefined) lists.add(message.id)
      if (message.method !== "tools/call") {
        base.process.write(line)
        return Promise.resolve()
      }
      const meta = message.params?._meta
      const session = validSession(meta?.[SESSION_META]) ? (meta[SESSION_META] as string) : SHARED_SESSION
      const thread = validSession(meta?.[THREAD_META]) ? (meta[THREAD_META] as string) : session
      return enqueue(session, () => call(message, line, session, thread))
    },
    /** Stop Playwright processes whose session has not used the browser for a while. Their tabs stay. */
    reap() {
      for (const child of [...children.values()])
        if (!child.base && !child.inflight.size && now() - child.used >= input.idleMs) {
          // Forget it before it exits, so a call arriving meanwhile starts a fresh process.
          exited(child)
          child.process.kill()
        }
    },
    sessions: () => [...children.keys()],
    async shutdown() {
      await Promise.all([...recordings.values()].map((recording) => recording.stop().catch(() => undefined)))
      for (const child of children.values()) child.process.kill()
    },
  }
}
