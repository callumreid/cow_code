import { describe, expect, test } from "bun:test"
import {
  applyBrowserPanelEvent,
  isAllowedBrowserUrl,
  nextActiveTab,
  normalizeBrowserUrl,
  sanitizeBrowserBounds,
  type BrowserTabState,
} from "./browser-panel"

const tab = (id: string, url = `https://example.com/${id}`): BrowserTabState => ({
  id,
  url,
  title: id,
  loading: false,
  canGoBack: false,
  canGoForward: false,
})

describe("isAllowedBrowserUrl", () => {
  test("allows http and https", () => {
    expect(isAllowedBrowserUrl("https://example.com")).toBe(true)
    expect(isAllowedBrowserUrl("http://localhost:3000/path")).toBe(true)
  })

  test("rejects every other scheme", () => {
    expect(isAllowedBrowserUrl("file:///etc/passwd")).toBe(false)
    expect(isAllowedBrowserUrl("javascript:alert(1)")).toBe(false)
    expect(isAllowedBrowserUrl("about:blank")).toBe(false)
    expect(isAllowedBrowserUrl("chrome://settings")).toBe(false)
    expect(isAllowedBrowserUrl("oc://renderer/index.html")).toBe(false)
    expect(isAllowedBrowserUrl("not a url")).toBe(false)
  })
})

describe("normalizeBrowserUrl", () => {
  test("passes explicit http(s) urls through", () => {
    expect(normalizeBrowserUrl("https://example.com/a?b=c")).toBe("https://example.com/a?b=c")
    expect(normalizeBrowserUrl("  http://example.com  ")).toBe("http://example.com/")
    expect(normalizeBrowserUrl("HTTPS://EXAMPLE.COM")).toBe("https://example.com/")
  })

  test("prefixes bare hosts with https", () => {
    expect(normalizeBrowserUrl("example.com")).toBe("https://example.com/")
    expect(normalizeBrowserUrl("docs.opencode.ai/config")).toBe("https://docs.opencode.ai/config")
    expect(normalizeBrowserUrl("10.0.0.5:8080")).toBe("https://10.0.0.5:8080/")
  })

  test("prefixes loopback hosts with http", () => {
    expect(normalizeBrowserUrl("localhost:3000")).toBe("http://localhost:3000/")
    expect(normalizeBrowserUrl("localhost")).toBe("http://localhost/")
    expect(normalizeBrowserUrl("127.0.0.1:4096/session")).toBe("http://127.0.0.1:4096/session")
  })

  test("rejects non-http schemes", () => {
    expect(normalizeBrowserUrl("file:///etc/passwd")).toBeUndefined()
    expect(normalizeBrowserUrl("javascript:alert(1)")).toBeUndefined()
    expect(normalizeBrowserUrl("mailto:a@b.com")).toBeUndefined()
    expect(normalizeBrowserUrl("data:text/html,<h1>hi</h1>")).toBeUndefined()
  })

  test("rejects empty and single-word input", () => {
    expect(normalizeBrowserUrl("")).toBeUndefined()
    expect(normalizeBrowserUrl("   ")).toBeUndefined()
    expect(normalizeBrowserUrl("example")).toBeUndefined()
  })
})

describe("sanitizeBrowserBounds", () => {
  test("rounds finite bounds", () => {
    expect(sanitizeBrowserBounds({ x: 1.4, y: 2.6, width: 100.2, height: 50.5 })).toEqual({
      x: 1,
      y: 3,
      width: 100,
      height: 51,
    })
  })

  test("rejects malformed payloads", () => {
    expect(sanitizeBrowserBounds(null)).toBeUndefined()
    expect(sanitizeBrowserBounds("rect")).toBeUndefined()
    expect(sanitizeBrowserBounds({ x: 0, y: 0, width: -1, height: 10 })).toBeUndefined()
    expect(sanitizeBrowserBounds({ x: Number.NaN, y: 0, width: 1, height: 1 })).toBeUndefined()
    expect(sanitizeBrowserBounds({ x: 0, y: 0, width: 1 })).toBeUndefined()
    expect(sanitizeBrowserBounds({ x: "0", y: 0, width: 1, height: 1 })).toBeUndefined()
  })
})

describe("applyBrowserPanelEvent", () => {
  test("appends unknown tabs on state/opened", () => {
    const next = applyBrowserPanelEvent([tab("a")], { type: "opened", tab: tab("b") })
    expect(next.map((t) => t.id)).toEqual(["a", "b"])
  })

  test("replaces known tabs in place", () => {
    const updated = { ...tab("a"), title: "changed", loading: true }
    const next = applyBrowserPanelEvent([tab("a"), tab("b")], { type: "state", tab: updated })
    expect(next[0]).toEqual(updated)
    expect(next.map((t) => t.id)).toEqual(["a", "b"])
  })

  test("removes tabs on closed", () => {
    const next = applyBrowserPanelEvent([tab("a"), tab("b")], { type: "closed", tabID: "a" })
    expect(next.map((t) => t.id)).toEqual(["b"])
  })
})

describe("nextActiveTab", () => {
  const tabs = [tab("a"), tab("b"), tab("c")]

  test("keeps the active tab when another closes", () => {
    expect(nextActiveTab(tabs, "a", "b")).toBe("a")
  })

  test("prefers the previous neighbor", () => {
    expect(nextActiveTab(tabs, "b", "b")).toBe("a")
  })

  test("falls forward from the first tab", () => {
    expect(nextActiveTab(tabs, "a", "a")).toBe("b")
  })

  test("returns undefined when the last tab closes", () => {
    expect(nextActiveTab([tab("a")], "a", "a")).toBeUndefined()
  })
})
