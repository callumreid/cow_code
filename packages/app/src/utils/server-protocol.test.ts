import { describe, expect, test } from "bun:test"
import { detectServerProtocol } from "./server-protocol"

const server = { url: "http://localhost:4096" }
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } })
const mockFetch = (run: (input: string | URL | Request) => Promise<Response>) =>
  Object.assign(run, { preconnect: globalThis.fetch.preconnect })

describe("detectServerProtocol", () => {
  test("retries unavailable probes instead of permanently guessing V2", async () => {
    let requests = 0
    const fetcher = mockFetch((input) => {
      if (++requests <= 2) return Promise.reject(new TypeError("Failed to fetch"))
      const path = new URL(input instanceof Request ? input.url : input).pathname
      return Promise.resolve(path === "/global/health" ? json({ healthy: true }) : json({ healthy: true, pid: 123 }))
    })
    expect(await detectServerProtocol(server, fetcher)).toBe("v1")
    expect(requests).toBe(3)
  })

  test("retries HTML fallbacks and unhealthy responses before selecting V2", async () => {
    let requests = 0
    const fetcher = mockFetch((input) => {
      const path = new URL(input instanceof Request ? input.url : input).pathname
      requests++
      if (path === "/global/health") return Promise.resolve(new Response("<!doctype html>"))
      return Promise.resolve(json({ healthy: requests > 2, pid: 123 }))
    })
    expect(await detectServerProtocol(server, fetcher)).toBe("v2")
    expect(requests).toBe(4)
  })

  test("cancels the retry wait when the server context is disposed", async () => {
    const abort = new AbortController()
    let requests = 0
    const reason = new DOMException("Disposed", "AbortError")
    const fetcher = mockFetch(() => {
      if (++requests === 2) queueMicrotask(() => abort.abort(reason))
      return Promise.resolve(json({}, 503))
    })
    await expect(detectServerProtocol(server, fetcher, abort.signal)).rejects.toBe(reason)
    expect(requests).toBe(2)
  })

  test("prefers the legacy health endpoint when both API generations exist", async () => {
    const fetcher = mockFetch((input) => {
      const path = new URL(input instanceof Request ? input.url : input).pathname
      if (path === "/global/health") return Promise.resolve(json({ healthy: true, version: "1.18.4" }))
      return Promise.resolve(json({ healthy: true, version: "2.0.0", pid: 123 }))
    })

    expect(await detectServerProtocol(server, fetcher)).toBe("v1")
  })

  test("recognizes V2 health by its process identifier", async () => {
    const fetcher = mockFetch((input) => {
      const path = new URL(input instanceof Request ? input.url : input).pathname
      if (path === "/global/health") return Promise.resolve(json({}, 404))
      return Promise.resolve(json({ healthy: true, version: "2.0.0", pid: 123 }))
    })

    expect(await detectServerProtocol(server, fetcher)).toBe("v2")
  })

  test("recognizes the transitional V1 API health response", async () => {
    const fetcher = mockFetch((input) => {
      const path = new URL(input instanceof Request ? input.url : input).pathname
      if (path === "/global/health") return Promise.resolve(json({}, 404))
      return Promise.resolve(json({ healthy: true }))
    })

    expect(await detectServerProtocol(server, fetcher)).toBe("v1")
  })
})
