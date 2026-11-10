import { describe, expect, test } from "bun:test"
import type { ServerConnection } from "@/context/server"
import { locationID, threadLocations } from "./thread-location"

const sidecar = { type: "sidecar", variant: "base", http: { url: "http://127.0.0.1:4096" } } as ServerConnection.Any
const tunnel = {
  type: "http",
  displayName: "barn",
  http: { url: "http://100.65.225.30:4097", username: "cow", password: "x" },
} as ServerConnection.Any
const lan = {
  type: "http",
  displayName: "barn (home lan)",
  http: { url: "http://192.168.86.25:4096", username: "cow", password: "x" },
} as ServerConnection.Any

describe("threadLocations", () => {
  test("one MacBook entry and one Mac mini entry for both barn connections", () => {
    const list = threadLocations({ servers: [tunnel, lan, sidecar] })
    expect(list.map((item) => [item.id, item.label])).toEqual([
      ["macbook", "MacBook Pro"],
      ["mini", "Mac mini"],
    ])
    expect(list[1]!.key).toBe("http://100.65.225.30:4097" as ServerConnection.Key)
  })

  test("the Mac mini entry uses the barn connection that is up", () => {
    const list = threadLocations({
      servers: [tunnel, lan, sidecar],
      health: { "http://100.65.225.30:4097": { healthy: false }, "http://192.168.86.25:4096": { healthy: true } },
    })
    expect(list[1]!.key).toBe("http://192.168.86.25:4096" as ServerConnection.Key)
  })

  test("keeps the connection the thread is already on", () => {
    const list = threadLocations({
      servers: [tunnel, lan, sidecar],
      health: { "http://100.65.225.30:4097": { healthy: true } },
      current: "http://192.168.86.25:4096" as ServerConnection.Key,
    })
    expect(list[1]!.key).toBe("http://192.168.86.25:4096" as ServerConnection.Key)
  })

  test("classifies connections", () => {
    expect(locationID(sidecar)).toBe("macbook")
    expect(locationID(lan)).toBe("mini")
    expect(locationID({ type: "http", http: { url: "https://example.dev" } } as ServerConnection.Any)).toBe(
      "server:https://example.dev",
    )
  })
})
