// Shared, dependency-free logic for the in-app browser panel. Imported by the
// SolidJS renderer (context/browser.tsx) AND the Electron main process
// (packages/desktop/src/main/browser-views.ts), so keep this module pure: no
// solid-js, no electron, no DOM beyond the URL global.

export type BrowserPanelBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type BrowserTabState = {
  id: string
  url: string
  title: string
  favicon?: string
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
}

export type BrowserPanelEvent =
  | { type: "state"; tab: BrowserTabState }
  | { type: "opened"; tab: BrowserTabState }
  | { type: "closed"; tabID: string }

const EXPLICIT_HTTP = /^https?:\/\//i
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/
// "localhost:3000" parses as scheme "localhost:", so host:port shorthand is
// carved out of the non-http scheme rejection below.
const HOST_PORT = /^[a-zA-Z][a-zA-Z0-9+.-]*:\d+(\/|$)/
const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i

/** Only http(s) URLs may ever load in a browser-panel view. */
export function isAllowedBrowserUrl(value: string): boolean {
  if (!URL.canParse(value)) return false
  const protocol = new URL(value).protocol
  return protocol === "http:" || protocol === "https:"
}

/**
 * Turn URL-bar input into a loadable http(s) URL.
 * - explicit http/https URLs pass through
 * - any other scheme (file:, javascript:, mailto:, ...) is rejected
 * - bare hosts get https:// (loopback hosts get http://)
 * - single-word hosts other than localhost are rejected as typos
 */
export function normalizeBrowserUrl(input: string): string | undefined {
  const trimmed = input.trim()
  if (!trimmed) return undefined
  if (EXPLICIT_HTTP.test(trimmed)) {
    if (!isAllowedBrowserUrl(trimmed)) return undefined
    return new URL(trimmed).toString()
  }
  if (SCHEME.test(trimmed) && !HOST_PORT.test(trimmed)) return undefined
  const candidate = `${LOOPBACK.test(trimmed) ? "http" : "https"}://${trimmed}`
  if (!URL.canParse(candidate)) return undefined
  const url = new URL(candidate)
  if (!url.hostname) return undefined
  if (!url.hostname.includes(".") && url.hostname !== "localhost") return undefined
  return url.toString()
}

/** Validate an untrusted IPC payload into integer, non-negative bounds. */
export function sanitizeBrowserBounds(value: unknown): BrowserPanelBounds | undefined {
  if (typeof value !== "object" || value === null) return undefined
  const raw = value as Record<string, unknown>
  const read = (key: "x" | "y" | "width" | "height") => {
    const num = raw[key]
    return typeof num === "number" && Number.isFinite(num) ? num : undefined
  }
  const x = read("x")
  const y = read("y")
  const width = read("width")
  const height = read("height")
  if (x === undefined || y === undefined || width === undefined || height === undefined) return undefined
  if (width < 0 || height < 0) return undefined
  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
}

/** Apply a main-process event to the renderer's tab list. */
export function applyBrowserPanelEvent(tabs: BrowserTabState[], event: BrowserPanelEvent): BrowserTabState[] {
  if (event.type === "closed") return tabs.filter((tab) => tab.id !== event.tabID)
  const index = tabs.findIndex((tab) => tab.id === event.tab.id)
  if (index === -1) return [...tabs, event.tab]
  return tabs.map((tab, position) => (position === index ? event.tab : tab))
}

/** Pick the tab that becomes active after `closedID` closes (neighbor-first). */
export function nextActiveTab(tabs: BrowserTabState[], active: string | undefined, closedID: string) {
  if (active !== closedID) return active
  const index = tabs.findIndex((tab) => tab.id === closedID)
  if (index === -1) return active
  return (index > 0 ? tabs[index - 1] : tabs[1])?.id
}
