import { spawn, type ChildProcess } from "node:child_process"
import { randomBytes, timingSafeEqual } from "node:crypto"
import { Resolver } from "node:dns/promises"
import { existsSync } from "node:fs"
import { chmod, mkdir, rm, writeFile } from "node:fs/promises"
import {
  createServer,
  request as httpRequest,
  type IncomingMessage,
  type RequestOptions,
  type Server,
  type ServerResponse,
} from "node:http"
import { dirname } from "node:path"
import { request as httpsRequest } from "node:https"

const GATE_QUERY = "_cowcode_gate"
const GATE_COOKIE = "cowcode_gate"
const TUNNEL_START_TIMEOUT = 75_000
const TUNNEL_HEALTH_TIMEOUT = 5_000
const RESTART_DELAY = 2_000

type CompanionLogger = {
  log: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
}

type PublicCompanionOptions = {
  stateFile: string
  targetPort: number
  password: string
  logger: CompanionLogger
  cloudflaredPath?: string
}

export type PublicCompanionManager = {
  ensure: () => Promise<string | undefined>
  stop: () => Promise<void>
}

export function parseCloudflaredOrigin(line: string): string | undefined {
  return line.match(/https:\/\/[a-z0-9]+(?:-[a-z0-9]+){2,}\.trycloudflare\.com/i)?.[0]
}

export function gatedCompanionUrl(origin: string, gate: string): string | undefined {
  if (gate.length < 32) return undefined
  try {
    const url = new URL(origin)
    if (url.protocol !== "https:") return undefined
    url.searchParams.set(GATE_QUERY, gate)
    return url.toString()
  } catch {
    return undefined
  }
}

export function createPublicCompanionManager(options: PublicCompanionOptions): PublicCompanionManager {
  let desired = false
  let generation = 0
  let startPromise: Promise<string | undefined> | undefined
  let origin: string | undefined
  let gate = ""
  let proxy: Server | undefined
  let tunnel: ChildProcess | undefined
  let restartTimer: NodeJS.Timeout | undefined

  const removeState = () => rm(options.stateFile, { force: true }).catch(() => undefined)

  const closeProxy = async () => {
    const current = proxy
    proxy = undefined
    if (!current) return
    await new Promise<void>((resolve) => {
      current.close(() => resolve())
      current.closeAllConnections()
    })
  }

  const closeTunnel = async () => {
    const current = tunnel
    tunnel = undefined
    if (!current || current.exitCode !== null) return
    current.kill("SIGTERM")
    await Promise.race([
      new Promise<void>((resolve) => current.once("exit", () => resolve())),
      new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
    ])
    if (current.exitCode === null) current.kill("SIGKILL")
  }

  const clearRuntime = async () => {
    origin = undefined
    await removeState()
    await Promise.all([closeTunnel(), closeProxy()])
  }

  const scheduleRestart = () => {
    if (!desired || restartTimer) return
    restartTimer = setTimeout(() => {
      restartTimer = undefined
      void ensure()
    }, RESTART_DELAY)
    restartTimer.unref()
  }

  const start = async (): Promise<string | undefined> => {
    const executable = resolveCloudflared(options.cloudflaredPath)
    if (!executable) {
      options.logger.warn("mobile companion HTTPS unavailable", { reason: "cloudflared not found" })
      return undefined
    }

    const currentGeneration = ++generation
    await clearRuntime()
    if (!desired || currentGeneration !== generation) return undefined

    gate = randomBytes(32).toString("base64url")
    const proxyPort = await startPublicCompanionProxy(options.targetPort, options.password, gate).then((value) => {
      proxy = value.server
      return value.port
    })
    if (!desired || currentGeneration !== generation) {
      await clearRuntime()
      return undefined
    }

    options.logger.log("mobile companion proxy ready", { proxyPort, targetPort: options.targetPort })
    const child = spawn(
      executable,
      ["tunnel", "--no-autoupdate", "--metrics", "127.0.0.1:0", "--url", `http://127.0.0.1:${proxyPort}`],
      { stdio: ["ignore", "pipe", "pipe"] },
    )
    tunnel = child

    child.once("exit", (code, signal) => {
      if (currentGeneration !== generation) return
      tunnel = undefined
      origin = undefined
      void removeState()
      options.logger.warn("mobile companion tunnel exited", { code, signal })
      scheduleRestart()
    })
    child.once("error", (error) => {
      if (currentGeneration !== generation) return
      options.logger.error("mobile companion tunnel failed", { error: error.message })
    })

    try {
      const publicOrigin = await waitForOrigin(child)
      const url = gatedCompanionUrl(publicOrigin, gate)
      if (!url) throw new Error("cloudflared returned an invalid HTTPS origin")
      options.logger.log("mobile companion tunnel allocated", { host: new URL(publicOrigin).host })
      await waitForHealth(url)
      if (!desired || currentGeneration !== generation) return undefined
      origin = url
      await writeState(options.stateFile, publicOrigin, gate, child.pid)
      options.logger.log("mobile companion HTTPS ready", { host: new URL(publicOrigin).host })
      return origin
    } catch (error) {
      options.logger.warn("mobile companion HTTPS startup failed", { error: errorMessage(error) })
      if (currentGeneration === generation) {
        ++generation
        await clearRuntime()
        scheduleRestart()
      }
      return undefined
    }
  }

  const ensure = async (): Promise<string | undefined> => {
    desired = true
    if (origin && tunnel?.exitCode === null && proxy?.listening) {
      if (await isHealthy(origin)) return origin
      options.logger.warn("mobile companion HTTPS health check failed; restarting")
      ++generation
      await clearRuntime()
    }
    if (startPromise) return startPromise
    startPromise = start().finally(() => {
      startPromise = undefined
    })
    return startPromise
  }

  const stop = async () => {
    desired = false
    ++generation
    if (restartTimer) clearTimeout(restartTimer)
    restartTimer = undefined
    await clearRuntime()
  }

  return { ensure, stop }
}

function resolveCloudflared(explicit?: string): string | undefined {
  const candidates = [
    explicit,
    process.env.CLOUDFLARED_PATH,
    "/opt/homebrew/bin/cloudflared",
    "/usr/local/bin/cloudflared",
    "/usr/bin/cloudflared",
  ].filter((value): value is string => Boolean(value))
  return candidates.find((value) => existsSync(value))
}

export async function startPublicCompanionProxy(targetPort: number, password: string, gate: string) {
  const authorization = `Basic ${Buffer.from(`opencode:${password}`).toString("base64")}`
  const server = createServer((request, response) => proxyRequest(request, response, targetPort, authorization, gate))
  server.keepAliveTimeout = 255_000
  server.headersTimeout = 260_000
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject)
      resolve()
    })
  })
  const address = server.address()
  if (!address || typeof address === "string") {
    server.close()
    throw new Error("mobile companion proxy did not bind a TCP port")
  }
  return { server, port: address.port }
}

function proxyRequest(
  request: IncomingMessage,
  response: ServerResponse,
  targetPort: number,
  authorization: string,
  gate: string,
) {
  const incoming = new URL(request.url ?? "/", "http://cowcode.local")
  if (!allowed(incoming, request.headers.cookie, gate)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    response.end("Not found")
    return
  }

  incoming.searchParams.delete(GATE_QUERY)
  const headers = { ...request.headers }
  delete headers["accept-encoding"]
  delete headers.authorization
  headers.host = `127.0.0.1:${targetPort}`
  headers.authorization = authorization

  const upstreamOptions: RequestOptions = {
    host: "127.0.0.1",
    port: targetPort,
    method: request.method,
    path: `${incoming.pathname}${incoming.search}`,
    headers,
  }
  const upstream = httpRequest(upstreamOptions)

  upstream.on("response", (upstreamResponse) => {
    const outgoing = { ...upstreamResponse.headers }
    delete outgoing["content-length"]
    delete outgoing["content-encoding"]
    const cookie = `${GATE_COOKIE}=${gate}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`
    const existing = outgoing["set-cookie"]
    outgoing["set-cookie"] = existing ? [...(Array.isArray(existing) ? existing : [existing]), cookie] : [cookie]
    response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.statusMessage, outgoing)
    upstreamResponse.pipe(response)
  })
  upstream.on("error", () => {
    if (response.headersSent) {
      response.destroy()
      return
    }
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" })
    response.end("CowCode is unavailable")
  })
  request.pipe(upstream)
}

function allowed(url: URL, cookie: string | undefined, gate: string) {
  if (safeEqual(url.searchParams.get(GATE_QUERY), gate)) return true
  return (
    cookie?.split(/;\s*/).some((item) => safeEqual(item.startsWith(`${GATE_COOKIE}=`) ? item.slice(13) : null, gate)) ??
    false
  )
}

function safeEqual(value: string | null, expected: string) {
  if (!value) return false
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function waitForOrigin(child: ChildProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false
    let pending = ""
    const finish = (value: string | Error) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      child.stdout?.off("data", onData)
      child.stderr?.off("data", onData)
      child.off("exit", onExit)
      value instanceof Error ? reject(value) : resolve(value)
    }
    const timeout = setTimeout(
      () => finish(new Error(`cloudflared did not publish a URL within ${TUNNEL_START_TIMEOUT}ms`)),
      TUNNEL_START_TIMEOUT,
    )
    const onData = (chunk: Buffer) => {
      pending += chunk.toString("utf8")
      const found = parseCloudflaredOrigin(pending)
      if (found) finish(found)
      if (pending.length > 16_384) pending = pending.slice(-8_192)
    }
    const onExit = (code: number | null) =>
      finish(new Error(`cloudflared exited before publishing a URL (code ${code})`))
    child.stdout?.on("data", onData)
    child.stderr?.on("data", onData)
    child.once("exit", onExit)
  })
}

async function waitForHealth(url: string) {
  const deadline = Date.now() + TUNNEL_START_TIMEOUT
  let last = "no response"
  while (Date.now() < deadline) {
    const probe = await probeHealth(url)
    if (probe.ok) return
    last = probe.detail
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Cloudflare published a URL but it never reached CowCode (${last})`)
}

async function isHealthy(url: string) {
  return (await probeHealth(url)).ok
}

async function probeHealth(url: string) {
  // A brand-new quick-tunnel hostname can briefly return NXDOMAIN through
  // macOS/Tailscale even after Cloudflare's own resolver has published it.
  // Probing through the system resolver here would poison its negative cache
  // just before the phone scans the QR, so validate directly at Cloudflare.
  return probeCloudflareEdge(url)
}

async function probeCloudflareEdge(url: string) {
  try {
    const parsed = new URL(url)
    const resolver = new Resolver()
    resolver.setServers(["1.1.1.1", "1.0.0.1"])
    const addresses = await resolver.resolve4(parsed.hostname)
    let last = "no A records"
    for (const address of addresses) {
      const result = await new Promise<{ ok: boolean; detail: string }>((resolve) => {
        const request = httpsRequest(
          {
            host: address,
            port: 443,
            servername: parsed.hostname,
            method: "HEAD",
            path: `${parsed.pathname}${parsed.search}`,
            headers: { host: parsed.hostname },
            timeout: TUNNEL_HEALTH_TIMEOUT,
          },
          (response) => {
            response.resume()
            resolve({
              ok: Boolean(response.statusCode && response.statusCode >= 200 && response.statusCode < 300),
              detail: `HTTP ${response.statusCode}`,
            })
          },
        )
        request.once("timeout", () => request.destroy(new Error("timeout")))
        request.once("error", (error) => resolve({ ok: false, detail: error.message }))
        request.end()
      })
      if (result.ok) return result
      last = result.detail
    }
    return { ok: false, detail: last }
  } catch (error) {
    return { ok: false, detail: errorMessage(error) }
  }
}

async function writeState(file: string, origin: string, gate: string, pid?: number) {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify({ origin, gate, pid }), { mode: 0o600 })
  await chmod(file, 0o600)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
