import type { ServerConnection } from "@/context/server"
import { authTokenFromCredentials } from "./server"

export type ServerProtocol = "v1" | "v2"

function headers(server: ServerConnection.HttpBase) {
  if (!server.password) return
  return {
    Authorization: `Basic ${authTokenFromCredentials({ username: server.username, password: server.password })}`,
  }
}

async function probe(
  server: ServerConnection.HttpBase,
  fetch: typeof globalThis.fetch,
  path: string,
  signal?: AbortSignal,
) {
  const response = await fetch(new URL(path, server.url), {
    headers: headers(server),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(5_000)]) : AbortSignal.timeout(5_000),
  })
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return
  const value: unknown = await response.json()
  if (!value || typeof value !== "object") return
  return value
}

export async function detectServerProtocol(
  server: ServerConnection.HttpBase,
  fetch: typeof globalThis.fetch,
  signal?: AbortSignal,
): Promise<ServerProtocol> {
  let delay = 250
  while (true) {
    signal?.throwIfAborted()
    const legacy = await probe(server, fetch, "/global/health", signal).catch(() => undefined)
    if (legacy && "healthy" in legacy && legacy.healthy === true) return "v1"

    const current = await probe(server, fetch, "/api/health", signal).catch(() => undefined)
    if (current && "healthy" in current && current.healthy === true) {
      if ("pid" in current && typeof current.pid === "number") return "v2"
      return "v1"
    }
    // A failed probe is not evidence of V2. Guessing pins every later request
    // to the wrong API for the lifetime of this server context after a reload.
    signal?.throwIfAborted()
    await new Promise<void>((resolve, reject) => {
      const finish = () => {
        signal?.removeEventListener("abort", cancel)
        resolve()
      }
      const timer = setTimeout(finish, delay)
      const cancel = () => {
        clearTimeout(timer)
        reject(signal?.reason)
      }
      signal?.addEventListener("abort", cancel, { once: true })
    })
    delay = Math.min(delay * 2, 5_000)
  }
}
