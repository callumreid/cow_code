import { describe, expect, test } from "bun:test"
import { parseTailscaleServeOrigins } from "./tailscale-serve"

describe("parseTailscaleServeOrigins", () => {
  test("returns the HTTPS origin proxying the exposed CowCode port", () => {
    const value = {
      TCP: { "443": { HTTPS: true } },
      Web: {
        "cow.tailnet.ts.net:443": {
          Handlers: { "/": { Proxy: "http://127.0.0.1:4096" } },
        },
      },
    }

    expect(parseTailscaleServeOrigins(value, 4096)).toEqual(["https://cow.tailnet.ts.net/"])
  })

  test("ignores routes for another local service", () => {
    const value = {
      Web: {
        "cow.tailnet.ts.net:443": {
          Handlers: { "/": { Proxy: "http://127.0.0.1:3000" } },
        },
      },
    }

    expect(parseTailscaleServeOrigins(value, 4096)).toEqual([])
  })

  test("preserves a configured path prefix", () => {
    const value = {
      Web: {
        "cow.tailnet.ts.net:443": {
          Handlers: { "/cow": { Proxy: "http://localhost:4096" } },
        },
      },
    }

    expect(parseTailscaleServeOrigins(value, 4096)).toEqual(["https://cow.tailnet.ts.net/cow/"])
  })
})
