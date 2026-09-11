import { describe, expect, test } from "bun:test"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { parseLog, read } from "../../src/office/phone"

const banner = (stamp: string, host: string) =>
  `${stamp} INF |  https://${host}.trycloudflare.com                                   |`
const failed = (stamp: string, host: string) =>
  `${stamp} ERR Request failed error="stream 21 canceled by remote with error code 0" connIndex=0 dest=https://${host}.trycloudflare.com/global/event?_cowcode_gate=fixture-key event=0 ip=198.41.200.113 type=http`

const log = [
  "2026-09-07T10:00:00Z INF Requesting new quick Tunnel on trycloudflare.com...",
  banner("2026-09-07T10:00:02Z", "old-barn-door"),
  "2026-09-07T10:00:03Z INF Registered tunnel connection connIndex=0",
  "2026-09-09T03:09:44Z INF Requesting new quick Tunnel on trycloudflare.com...",
  banner("2026-09-09T03:09:47Z", "ours-composition-fellow-gamma"),
  "2026-09-09T03:09:48Z INF Registered tunnel connection connIndex=0",
  failed("2026-09-11T14:49:06Z", "ours-composition-fellow-gamma"),
  "",
].join("\n")

const token = "a".repeat(43)

describe("phone door log", () => {
  test("takes the current origin and the banner that minted it, not a later failed request", () => {
    expect(parseLog(log)).toEqual({
      origin: "https://ours-composition-fellow-gamma.trycloudflare.com",
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
        url: `https://ours-composition-fellow-gamma.trycloudflare.com/?_cowcode_gate=${token}`,
        origin: "https://ours-composition-fellow-gamma.trycloudflare.com",
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
