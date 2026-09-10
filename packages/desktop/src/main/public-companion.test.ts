import { afterEach, describe, expect, test } from "bun:test"
import { createServer, type Server } from "node:http"
import { gatedCompanionUrl, parseCloudflaredOrigin, startPublicCompanionProxy } from "./public-companion"

const servers: Server[] = []

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve())
          server.closeAllConnections()
        }),
    ),
  )
})

describe("gatedCompanionUrl", () => {
  test("adds the hidden gate to a secure tunnel origin", () => {
    expect(gatedCompanionUrl("https://cow.example.com", "x".repeat(32))).toBe(
      `https://cow.example.com/?_cowcode_gate=${"x".repeat(32)}`,
    )
  })

  test("rejects insecure origins and short gates", () => {
    expect(gatedCompanionUrl("http://cow.example.com", "x".repeat(32))).toBeUndefined()
    expect(gatedCompanionUrl("https://cow.example.com", "short")).toBeUndefined()
  })
})

describe("parseCloudflaredOrigin", () => {
  test("extracts a quick-tunnel URL from structured logs", () => {
    expect(parseCloudflaredOrigin('{"url":"https://happy-spinning-cow-herd.trycloudflare.com"}')).toBe(
      "https://happy-spinning-cow-herd.trycloudflare.com",
    )
  })

  test("ignores unrelated output", () => {
    expect(parseCloudflaredOrigin("INF Starting metrics server")).toBeUndefined()
    expect(parseCloudflaredOrigin("POST https://api.trycloudflare.com/tunnel")).toBeUndefined()
  })
})

describe("startPublicCompanionProxy", () => {
  test("hides anonymous traffic and authenticates gated requests upstream", async () => {
    const target = createServer((request, response) => {
      response.setHeader("content-encoding", "gzip")
      response.end(JSON.stringify({ authorization: request.headers.authorization, url: request.url }))
    })
    servers.push(target)
    await new Promise<void>((resolve) => target.listen(0, "127.0.0.1", resolve))
    const address = target.address()
    if (!address || typeof address === "string") throw new Error("target did not bind")

    const gate = "g".repeat(32)
    const proxy = await startPublicCompanionProxy(address.port, "test-password", gate)
    servers.push(proxy.server)
    const base = `http://127.0.0.1:${proxy.port}`

    expect((await fetch(base)).status).toBe(404)
    const response = await fetch(`${base}/global/office?_cowcode_gate=${gate}&project=cow`)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-encoding")).toBeNull()
    expect(response.headers.get("set-cookie")).toContain("cowcode_gate=")
    expect(await response.json()).toEqual({
      authorization: `Basic ${Buffer.from("opencode:test-password").toString("base64")}`,
      url: "/global/office?project=cow",
    })
  })
})
