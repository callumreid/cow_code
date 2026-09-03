import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"])

function record(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  return Object.fromEntries(Object.entries(value))
}

export function parseTailscaleServeOrigins(value: unknown, port: number) {
  const web = record(record(value)?.Web)
  if (!web) return []

  const origins: string[] = []
  for (const [authority, rawSite] of Object.entries(web)) {
    const handlers = record(record(rawSite)?.Handlers)
    if (!handlers) continue

    for (const [path, rawHandler] of Object.entries(handlers)) {
      const proxy = record(rawHandler)?.Proxy
      if (typeof proxy !== "string") continue

      try {
        const target = new URL(proxy)
        if (!LOOPBACK.has(target.hostname) || Number(target.port) !== port) continue

        const base = new URL(`https://${authority}`)
        base.pathname = path.endsWith("/") ? path : `${path}/`
        origins.push(base.toString())
      } catch {
        continue
      }
    }
  }

  return [...new Set(origins)].sort((a, b) => Number(new URL(b).pathname === "/") - Number(new URL(a).pathname === "/"))
}

function candidates() {
  const absolute = [
    "/Applications/Tailscale.app/Contents/MacOS/Tailscale",
    "/opt/homebrew/bin/tailscale",
    "/usr/local/bin/tailscale",
    "/usr/bin/tailscale",
  ].filter(existsSync)
  return [...absolute, "tailscale"]
}

export async function getTailscaleServeOrigins(port: number) {
  for (const command of candidates()) {
    try {
      const result = await execFileAsync(command, ["serve", "status", "--json"], {
        encoding: "utf8",
        timeout: 2_000,
        windowsHide: true,
      })
      const origins = parseTailscaleServeOrigins(JSON.parse(result.stdout), port)
      if (origins.length) return origins
    } catch {
      continue
    }
  }
  return []
}
