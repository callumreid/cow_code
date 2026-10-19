import { describe, expect, test } from "bun:test"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { parseLog, probeDoor, read, stableOrigin } from "../../src/office/phone"

const banner = (stamp: string, host: string) =>
  `${stamp} INF |  https://${host}.trycloudflare.com                                   |`
const failed = (stamp: string, host: string) =>
  `${stamp} ERR Request failed error="stream 21 canceled by remote with error code 0" connIndex=0 dest=https://${host}.trycloudflare.com/global/event?_cowcode_gate=fixture-key event=0 ip=198.41.200.113 type=http`

const log = [
  "2026-09-07T10:00:00Z INF Requesting new quick Tunnel on trycloudflare.com...",
  banner("2026-09-07T10:00:02Z", "old-barn-door"),
  "2026-09-07T10:00:03Z INF Registered tunnel connection connIndex=0",
  "2026-09-09T03:09:44Z INF Requesting new quick Tunnel on trycloudflare.com...",
  banner("2026-09-09T03:09:47Z", "fixture-quick-tunnel-abcd"),
  "2026-09-09T03:09:48Z INF Registered tunnel connection connIndex=0",
  failed("2026-09-11T14:49:06Z", "fixture-quick-tunnel-abcd"),
  "",
].join("\n")

const token = "a".repeat(43)

describe("phone door log", () => {
  test("takes the current origin and the banner that minted it, not a later failed request", () => {
    expect(parseLog(log)).toEqual({
      origin: "https://fixture-quick-tunnel-abcd.trycloudflare.com",
      since: Date.parse("2026-09-09T03:09:47Z"),
    })
  })

  test("is empty without an origin", () => {
    expect(parseLog("")).toBeUndefined()
    expect(parseLog("2026-09-09T03:09:44Z INF Requesting new quick Tunnel on trycloudflare.com...")).toBeUndefined()
  })

  test("keeps the origin when the line has no timestamp", () => {
    expect(parseLog("https://bare.trycloudflare.com")).toEqual({
      origin: "https://bare.trycloudflare.com",
      since: null,
    })
  })
})

describe("phone door files", () => {
  const fixture = async (input: { log?: string; token?: string }) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "phone-door-"))
    const paths = { log: path.join(dir, "cow-public.log"), token: path.join(dir, "gate-token") }
    if (input.log !== undefined) await fs.writeFile(paths.log, input.log)
    if (input.token !== undefined) await fs.writeFile(paths.token, input.token)
    return { paths, cleanup: () => fs.rm(dir, { recursive: true, force: true }) }
  }

  test("joins the origin with the gate key", async () => {
    const { paths, cleanup } = await fixture({ log, token: `${token}\n` })
    try {
      expect(await read(paths)).toEqual({
        url: `https://fixture-quick-tunnel-abcd.trycloudflare.com/?_cowcode_gate=${token}`,
        origin: "https://fixture-quick-tunnel-abcd.trycloudflare.com",
        since: Date.parse("2026-09-09T03:09:47Z"),
      })
    } finally {
      await cleanup()
    }
  })

  test("is all nulls when the key is missing or too short", async () => {
    const nulls = { url: null, origin: null, since: null }
    const missing = await fixture({ log })
    const short = await fixture({ log, token: "too-short" })
    try {
      expect(await read(missing.paths)).toEqual(nulls)
      expect(await read(short.paths)).toEqual(nulls)
    } finally {
      await missing.cleanup()
      await short.cleanup()
    }
  })

  test("is all nulls when the tunnel log is missing", async () => {
    const { paths, cleanup } = await fixture({ token })
    try {
      expect(await read(paths)).toEqual({ url: null, origin: null, since: null })
    } finally {
      await cleanup()
    }
  })
})

describe("stable phone address and measured health", () => {
  test("accepts only an HTTPS origin without credentials, paths, or tokens", () => {
    expect(stableOrigin("https://cow.example.com\n")).toBe("https://cow.example.com")
    for (const invalid of [
      "http://cow.example.com",
      "https://user:secret@cow.example.com",
      "https://cow.example.com/a",
      "https://cow.example.com/?token=x",
      "broken",
    ])
      expect(stableOrigin(invalid)).toBeUndefined()
  })
  test("prefers the stable address and refuses to silently fall back on invalid configuration", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "phone-stable-"))
    const files = { token: path.join(dir, "token"), log: path.join(dir, "log"), origin: path.join(dir, "origin") }
    try {
      await fs.writeFile(files.token, token)
      await fs.writeFile(files.log, log)
      await fs.writeFile(files.origin, "https://cow.example.com")
      expect(await read(files)).toMatchObject({ origin: "https://cow.example.com", address: "stable", since: null })
      await fs.writeFile(files.origin, "https://user:secret@cow.example.com")
      expect((await read(files)).url).toBeNull()
      await fs.rm(files.origin)
      expect((await read(files)).address).toBe("temporary")
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })
  test("checks gate, public reachability and upstream server separately without putting a key in URLs", async () => {
    const server = Bun.serve({
      port: 0,
      fetch(request) {
        expect(new URL(request.url).search).toBe("")
        expect(request.headers.get("cookie")).toBe(`cowcode_gate=${token}`)
        return Response.json({ ok: true, server: false })
      },
    })
    const origin = `http://127.0.0.1:${server.port}`
    try {
      expect(await probeDoor(origin, token, origin)).toMatchObject({ gate: true, public: true, server: false })
    } finally {
      server.stop(true)
    }
    expect(await probeDoor(origin, token, origin)).toMatchObject({ gate: false, public: false, server: null })
  })
})
