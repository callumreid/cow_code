import { describe, expect, test } from "bun:test"
import { phoneUrl } from "./dialog-connect-phone"

const base = { username: "cow", password: "moo" }
const door = { kind: "door" as const, url: "https://fixture-quick-tunnel-abcd.trycloudflare.com/?_cowcode_gate=k" }

describe("phoneUrl", () => {
  test("the barn door keeps its gate key and never gets auth_token", () => {
    const url = new URL(phoneUrl(door, base, ["/Users/bronson/coval"]))
    expect(url.origin).toBe("https://fixture-quick-tunnel-abcd.trycloudflare.com")
    expect(url.searchParams.get("_cowcode_gate")).toBe("k")
    expect(url.searchParams.has("auth_token")).toBe(false)
    expect(url.searchParams.getAll("project")).toHaveLength(1)
  })

  test("a same-network origin carries the server auth and the projects", () => {
    const url = new URL(phoneUrl({ kind: "origin", origin: "http://192.168.86.25:4097/" }, base, ["/a", "/b"]))
    expect(url.searchParams.get("auth_token")).toBeTruthy()
    expect(url.searchParams.getAll("project")).toHaveLength(2)
  })

  test("no password means no auth_token on a same-network origin", () => {
    const url = new URL(phoneUrl({ kind: "origin", origin: "https://mac.tailnet.ts.net/" }, {}, []))
    expect(url.searchParams.has("auth_token")).toBe(false)
    expect(url.search).toBe("")
  })
})
