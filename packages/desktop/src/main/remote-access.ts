import { networkInterfaces } from "node:os"
import type { RemoteAccessInfo } from "../preload/types"

// Remote access rebinds the local sidecar between loopback (default, OFF) and
// all interfaces so a phone or another machine on the LAN can join sessions.
// The random per-launch password stays required either way, and the state is
// deliberately NOT persisted: every app launch starts loopback-only.

function lanIPs() {
  return Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address)
}

export function createRemoteAccessController(options: {
  port: number
  username: string
  password: string
  relisten: (hostname: string) => Promise<void>
}) {
  let enabled = false
  let queue: Promise<unknown> = Promise.resolve()

  const info = (): RemoteAccessInfo => ({
    enabled,
    lanIPs: lanIPs(),
    port: options.port,
    credentials: { username: options.username, password: options.password },
  })

  return {
    get: () => info(),
    // Serialize toggles so overlapping IPC calls can't interleave rebinds.
    set: (next: boolean) => {
      const result = queue.then(async () => {
        if (next !== enabled) {
          await options.relisten(next ? "0.0.0.0" : "127.0.0.1")
          enabled = next
        }
        return info()
      })
      queue = result.catch(() => undefined)
      return result
    },
  }
}

export type RemoteAccessController = ReturnType<typeof createRemoteAccessController>
