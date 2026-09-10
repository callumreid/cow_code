import { Server } from "@/server/server"
import { InstanceRuntime } from "@/project/instance-runtime"
import { Rpc } from "@/util/rpc"
import { upgrade } from "@/cli/upgrade"
import { Config } from "@/config/config"
import { GlobalBus } from "@/bus/global"
import { ServerAuth } from "@/server/auth"
import { Global } from "@opencode-ai/core/global"
import { randomBytes } from "node:crypto"
import { writeFile } from "node:fs/promises"
import path from "node:path"
import { writeHeapSnapshot } from "node:v8"
import { Heap } from "@/cli/heap"
import { AppRuntime } from "@/effect/app-runtime"
import { Effect } from "effect"
import { disposeAllInstancesAndEmitGlobalDisposed } from "@/server/global-lifecycle"

Heap.start()

const onUnhandledRejection = (_error: unknown) => {}

const onUncaughtException = (_error: Error) => {}

process.on("unhandledRejection", onUnhandledRejection)
process.on("uncaughtException", onUncaughtException)

// Subscribe to global events and forward them via RPC
GlobalBus.on("event", (event) => {
  Rpc.emit("global.event", event)
})

let server: Awaited<ReturnType<typeof Server.listen>> | undefined
let companion: Promise<{ port: number; username: string; password: string }> | undefined

// Reuse one password across restarts so a phone that already logged in stays
// logged in; an explicit OPENCODE_SERVER_PASSWORD always wins and is never
// written to disk.
async function companionPassword() {
  const explicit = process.env.OPENCODE_SERVER_PASSWORD
  if (explicit) return explicit
  const file = path.join(Global.Path.state, "companion-password")
  const saved = (await Bun.file(file).exists()) ? (await Bun.file(file).text()).trim() : ""
  if (saved) return saved
  const generated = randomBytes(16).toString("base64url")
  await writeFile(file, generated, { mode: 0o600 })
  return generated
}

async function startCompanion(input: { cors?: string[] }) {
  const password = await companionPassword()
  // The listener reads auth from a fresh env snapshot, so setting it here is
  // what secures the companion server. The TUI's own in-process transport
  // already snapshotted a config before this and is unaffected.
  process.env.OPENCODE_SERVER_PASSWORD = password
  const listener = await Server.listen({ port: 0, hostname: "0.0.0.0", cors: input.cors })
  return {
    port: listener.port,
    username: process.env.OPENCODE_SERVER_USERNAME ?? "opencode",
    password,
  }
}

export const rpc = {
  async fetch(input: { url: string; method: string; headers: Record<string, string>; body?: string }) {
    const headers = { ...input.headers }
    const auth = ServerAuth.header()
    if (auth && !headers["authorization"] && !headers["Authorization"]) {
      headers["Authorization"] = auth
    }
    const request = new Request(input.url, {
      method: input.method,
      headers,
      body: input.body,
    })
    const response = await Server.Default().app.fetch(request)
    const body = await response.text()
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    }
  },
  snapshot() {
    const result = writeHeapSnapshot("server.heapsnapshot")
    return result
  },
  async server(input: { port: number; hostname: string; mdns?: boolean; cors?: string[] }) {
    if (server) await server.stop(true)
    server = await Server.listen(input)
    return { url: server.url.toString() }
  },
  async companion(input: { cors?: string[] }) {
    companion ??= startCompanion(input).catch((error) => {
      companion = undefined
      throw error
    })
    return companion
  },
  async checkUpgrade(input: { directory: string }) {
    await InstanceRuntime.load({ directory: input.directory })
    await upgrade().catch(() => {})
  },
  async reload() {
    await AppRuntime.runPromise(
      Effect.gen(function* () {
        const cfg = yield* Config.Service
        yield* cfg.invalidate()
        yield* disposeAllInstancesAndEmitGlobalDisposed({ swallowErrors: true })
      }),
    )
  },
  async shutdown() {
    await InstanceRuntime.disposeAllInstances()
    if (server) await server.stop(true)
    process.off("unhandledRejection", onUnhandledRejection)
    process.off("uncaughtException", onUncaughtException)
  },
}

Rpc.listen(rpc)
