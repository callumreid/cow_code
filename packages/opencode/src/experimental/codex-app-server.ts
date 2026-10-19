import { z } from "zod"

// Deliberately opt-in: importing this module never starts or replaces a runtime.
// Wire shapes checked against `codex app-server generate-ts` from Codex 0.144.6.
const Frame = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string().optional(),
  params: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.object({ code: z.number(), message: z.string() }).optional(),
})
const Thread = z.object({
  thread: z.object({ id: z.string(), turns: z.array(z.unknown()).optional() }),
  model: z.string(),
})
const Turn = z.object({ turn: z.object({ id: z.string(), status: z.string() }) })

export type Event = { method: string; params: unknown }
export type Approval = { method: string; params: unknown; signal: AbortSignal }
export type Decision = "accept" | "decline" | "cancel"
export type Options = {
  cwd: string
  command?: string[]
  timeoutMs?: number
  approval?: (request: Approval) => Promise<Decision>
}

export async function connect(options: Options) {
  const child = Bun.spawn(options.command ?? ["codex", "app-server", "--listen", "stdio://"], {
    cwd: options.cwd,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "ignore",
  })
  const pending = new Map<string | number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>()
  const listeners = new Set<(event: Event) => void>()
  const exits = new Set<(error: Error) => void>()
  const approvals = new AbortController()
  let nextID = 0
  let closed: Error | undefined
  const timeout = options.timeoutMs ?? 30_000

  const fail = (error: Error) => {
    if (closed) return
    closed = error
    approvals.abort()
    for (const item of pending.values()) item.reject(error)
    pending.clear()
    for (const listener of exits) listener(error)
    exits.clear()
    listeners.clear()
  }
  const write = (value: unknown) => {
    if (closed) throw closed
    child.stdin.write(JSON.stringify(value) + "\n")
    child.stdin.flush()
  }
  const request = (method: string, params: unknown = {}) => {
    if (closed) return Promise.reject(closed)
    const id = ++nextID
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(
          new Error(`Codex app-server timed out: ${method}. Execution state is unknown; do not retry automatically.`),
        )
      }, timeout)
      pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer)
          resolve(value)
        },
        reject: (error) => {
          clearTimeout(timer)
          reject(error)
        },
      })
      try {
        write({ id, method, params })
      } catch (error) {
        pending.get(id)?.reject(error instanceof Error ? error : new Error(String(error)))
        pending.delete(id)
      }
    })
  }
  const respond = async (frame: z.infer<typeof Frame>) => {
    if (frame.id === undefined) return
    if (!frame.method?.match(/^item\/(commandExecution|fileChange)\/requestApproval$/)) {
      write({ id: frame.id, error: { code: -32601, message: "Unsupported client request" } })
      return
    }
    // No implicit approvals, persistent grants, or policy amendments in this experiment.
    const decision = options.approval
      ? await new Promise<Decision>((resolve) => {
          const controller = new AbortController()
          const finish = (value: Decision) => {
            clearTimeout(timer)
            approvals.signal.removeEventListener("abort", abort)
            controller.abort()
            resolve(value)
          }
          const abort = () => finish("cancel")
          const timer = setTimeout(() => finish("decline"), timeout)
          approvals.signal.addEventListener("abort", abort, { once: true })
          void Promise.resolve()
            .then(() => options.approval!({ method: frame.method!, params: frame.params, signal: controller.signal }))
            .then(
              (value) => finish(["accept", "decline", "cancel"].includes(value) ? value : "decline"),
              () => finish("decline"),
            )
        })
      : "decline"
    if (!closed) write({ id: frame.id, result: { decision } })
  }
  void (async () => {
    let buffer = ""
    const decoder = new TextDecoder()
    const reader = child.stdout.getReader()
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      buffer += decoder.decode(chunk.value, { stream: true })
      if (buffer.length > 8_388_608) throw new Error("Codex app-server frame exceeds 8 MiB")
      let end: number
      while ((end = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, end)
        buffer = buffer.slice(end + 1)
        if (!line.trim()) continue
        const frame = Frame.parse(JSON.parse(line))
        if (frame.method && frame.id !== undefined) {
          void respond(frame).catch((error) => {
            fail(error)
            child.kill()
          })
          continue
        }
        if (frame.method) {
          for (const listener of listeners) listener({ method: frame.method, params: frame.params })
          continue
        }
        if (frame.id === undefined) throw new Error("Codex app-server returned a frame without a method or ID")
        const item = pending.get(frame.id)
        pending.delete(frame.id)
        if (frame.error) item?.reject(new Error(`Codex app-server ${frame.error.code}: ${frame.error.message}`))
        else item?.resolve(frame.result)
      }
    }
    fail(new Error("Codex app-server closed its output"))
  })().catch((error) => {
    fail(error)
    child.kill()
  })

  const close = async () => {
    fail(new Error("Codex app-server connection closed"))
    child.stdin.end()
    const timer = setTimeout(() => child.kill("SIGKILL"), 2_000)
    await child.exited.finally(() => clearTimeout(timer))
  }
  const ready = await request("initialize", {
    clientInfo: { name: "cowcode_native_experiment", title: "CowCode native runtime experiment", version: "0.1.0" },
    capabilities: { experimentalApi: false },
  }).catch(async (error) => {
    await close()
    throw error
  })
  write({ method: "initialized" })

  return {
    ready,
    request,
    close,
    subscribe(listener: (event: Event) => void) {
      if (closed) throw closed
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    // Register before issuing a turn request: a short turn can finish before its response.
    waitFor(predicate: (event: Event) => boolean, timeoutMs = timeout) {
      if (closed) return Promise.reject(closed)
      return new Promise<Event>((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timer)
          listeners.delete(receive)
          exits.delete(exit)
        }
        const receive = (event: Event) => {
          if (predicate(event)) {
            cleanup()
            resolve(event)
          }
        }
        const exit = (error: Error) => {
          cleanup()
          reject(error)
        }
        const timer = setTimeout(() => {
          cleanup()
          reject(new Error("Timed out waiting for Codex notification"))
        }, timeoutMs)
        listeners.add(receive)
        exits.add(exit)
      })
    },
    async models() {
      return z
        .object({
          data: z.array(
            z.object({
              model: z.string(),
              isDefault: z.boolean(),
              inputModalities: z.array(z.string()),
              supportedReasoningEfforts: z.array(z.object({ reasoningEffort: z.string() })),
            }),
          ),
        })
        .parse(await request("model/list", { includeHidden: false })).data
    },
    async start(model?: string) {
      return Thread.parse(
        await request("thread/start", {
          cwd: options.cwd,
          model,
          sandbox: "read-only",
          approvalPolicy: "on-request",
          developerInstructions:
            "This is an isolated CowCode runtime transport test. Work only in the supplied temporary directory. Do not inspect other projects, use external integrations, change credentials, or send messages.",
        }),
      )
    },
    async resume(threadId: string) {
      return Thread.parse(
        await request("thread/resume", {
          threadId,
          cwd: options.cwd,
          sandbox: "read-only",
          approvalPolicy: "on-request",
        }),
      )
    },
    async turn(threadId: string, text: string) {
      return Turn.parse(await request("turn/start", { threadId, input: [{ type: "text", text, text_elements: [] }] }))
    },
    steer(threadId: string, turnId: string, text: string) {
      return request("turn/steer", {
        threadId,
        expectedTurnId: turnId,
        input: [{ type: "text", text, text_elements: [] }],
      })
    },
    interrupt(threadId: string, turnId: string) {
      return request("turn/interrupt", { threadId, turnId })
    },
    archive(threadId: string) {
      return request("thread/archive", { threadId })
    },
  }
}

export * as CodexAppServer from "./codex-app-server"
