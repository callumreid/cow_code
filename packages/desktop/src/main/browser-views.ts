import { randomUUID } from "node:crypto"
import { BrowserWindow, WebContentsView, session } from "electron"
import type { WebContents } from "electron"
import {
  isAllowedBrowserUrl,
  sanitizeBrowserBounds,
  type BrowserPanelEvent,
  type BrowserTabState,
} from "@opencode-ai/app/browser-panel"
import { write as writeLog } from "./logging"

// WebContentsView manager for the in-app browser panel. Views live entirely in
// the main process, attached to the owning BrowserWindow's contentView; the
// renderer only sends tab CRUD/navigation/bounds over IPC and receives state
// events back. SECURITY INVARIANTS:
//   - every view runs in the dedicated `persist:browser-panel` partition, a
//     DIFFERENT session object from the app window's default session. The
//     blanket Access-Control-Allow-Origin webRequest rewriting in windows.ts
//     hooks `win.webContents.session` (the default session) only, so it does
//     NOT apply to browser-panel requests. Verified: windows.ts:196-206.
//   - views NEVER get the preload bridge (no `preload` in webPreferences), so
//     web content cannot reach window.api.
//   - only http/https URLs load (initial, navigate, will-navigate, popups).
//   - popups become new panel tabs; never a naked BrowserWindow.
export const BROWSER_PARTITION = "persist:browser-panel"

const EVENT_CHANNEL = "browser-panel-event"

type BrowserTab = {
  id: string
  win: BrowserWindow
  view: WebContentsView
  favicon?: string
}

const tabs = new Map<string, BrowserTab>()
const wiredWindows = new WeakSet<BrowserWindow>()
let sessionConfigured = false

function browserSession() {
  const ses = session.fromPartition(BROWSER_PARTITION)
  if (sessionConfigured) return ses
  sessionConfigured = true
  // The panel is for reading pages, not full-trust browsing: deny every
  // permission request (camera, mic, geolocation, notifications, ...).
  ses.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
  ses.setPermissionCheckHandler(() => false)
  return ses
}

function tabState(tab: BrowserTab): BrowserTabState {
  const contents = tab.view.webContents
  return {
    id: tab.id,
    url: contents.getURL(),
    title: contents.getTitle(),
    favicon: tab.favicon,
    loading: contents.isLoading(),
    canGoBack: contents.navigationHistory.canGoBack(),
    canGoForward: contents.navigationHistory.canGoForward(),
  }
}

function send(tab: BrowserTab, event: BrowserPanelEvent) {
  if (tab.win.isDestroyed() || tab.win.webContents.isDestroyed()) return
  tab.win.webContents.send(EVENT_CHANNEL, event)
}

function destroyTab(tab: BrowserTab) {
  tabs.delete(tab.id)
  if (!tab.win.isDestroyed()) tab.win.contentView.removeChildView(tab.view)
  const contents = tab.view.webContents
  if (!contents.isDestroyed()) contents.close()
}

function closeAllForWindow(win: BrowserWindow) {
  for (const tab of [...tabs.values()]) {
    if (tab.win === win) destroyTab(tab)
  }
}

function wireWindow(win: BrowserWindow) {
  if (wiredWindows.has(win)) return
  wiredWindows.add(win)
  win.on("closed", () => closeAllForWindow(win))
}

function wireContents(tab: BrowserTab, contents: WebContents) {
  const push = () => send(tab, { type: "state", tab: tabState(tab) })

  contents.on("did-start-loading", push)
  contents.on("did-stop-loading", push)
  contents.on("did-navigate", push)
  contents.on("did-navigate-in-page", push)
  contents.on("page-title-updated", push)
  contents.on("page-favicon-updated", (_event, favicons) => {
    tab.favicon = favicons[0]
    push()
  })
  contents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return
    writeLog("browser-panel", "load failed", { tab: tab.id, errorCode, errorDescription, validatedURL }, "warn")
    push()
  })
  contents.on("render-process-gone", (_event, details) => {
    writeLog("browser-panel", "view process gone", { tab: tab.id, details }, "error")
    send(tab, { type: "closed", tabID: tab.id })
    destroyTab(tab)
  })

  // Block in-page navigation to anything that is not http(s) (file:, custom
  // app schemes, the oc:// renderer protocol, ...).
  contents.on("will-navigate", (event, url) => {
    if (isAllowedBrowserUrl(url)) return
    writeLog("browser-panel", "blocked navigation", { tab: tab.id, url }, "warn")
    event.preventDefault()
  })

  // window.open / target=_blank: open a new panel tab or nothing at all.
  contents.setWindowOpenHandler(({ url }) => {
    if (isAllowedBrowserUrl(url)) {
      const opened = createTab(tab.win, url)
      if (opened) send(opened, { type: "opened", tab: tabState(opened) })
    } else {
      writeLog("browser-panel", "blocked popup", { tab: tab.id, url }, "warn")
    }
    return { action: "deny" }
  })
}

function createTab(win: BrowserWindow, url?: string): BrowserTab | undefined {
  if (win.isDestroyed()) return undefined
  if (url !== undefined && !isAllowedBrowserUrl(url)) return undefined

  browserSession()
  const view = new WebContentsView({
    webPreferences: {
      partition: BROWSER_PARTITION,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      // Intentionally NO preload: web content must never see window.api.
    },
  })

  const tab: BrowserTab = { id: randomUUID(), win, view }
  tabs.set(tab.id, tab)
  wireWindow(win)
  wireContents(tab, view.webContents)

  view.setVisible(false)
  win.contentView.addChildView(view)

  if (url) {
    void view.webContents.loadURL(url).catch((error: unknown) => {
      writeLog("browser-panel", "initial load failed", { tab: tab.id, url, error }, "warn")
    })
  }

  return tab
}

function ownedTab(win: BrowserWindow | null, tabID: unknown): BrowserTab | undefined {
  if (!win || typeof tabID !== "string") return undefined
  const tab = tabs.get(tabID)
  // Reject cross-window tab ids so one renderer cannot drive another window's views.
  if (!tab || tab.win !== win) return undefined
  return tab
}

export const BrowserViews = {
  create(win: BrowserWindow | null, url?: unknown): BrowserTabState | undefined {
    if (!win) return undefined
    const initial = typeof url === "string" && url.length > 0 ? url : undefined
    if (typeof url === "string" && url.length > 0 && !isAllowedBrowserUrl(url)) return undefined
    const tab = createTab(win, initial)
    return tab ? tabState(tab) : undefined
  },

  list(win: BrowserWindow | null): BrowserTabState[] {
    if (!win) return []
    return [...tabs.values()].filter((tab) => tab.win === win).map(tabState)
  },

  close(win: BrowserWindow | null, tabID: unknown) {
    const tab = ownedTab(win, tabID)
    if (!tab) return
    destroyTab(tab)
  },

  navigate(win: BrowserWindow | null, tabID: unknown, url: unknown): boolean {
    const tab = ownedTab(win, tabID)
    if (!tab || typeof url !== "string" || !isAllowedBrowserUrl(url)) return false
    void tab.view.webContents.loadURL(url).catch((error: unknown) => {
      writeLog("browser-panel", "navigate failed", { tab: tab.id, url, error }, "warn")
    })
    return true
  },

  back(win: BrowserWindow | null, tabID: unknown) {
    const tab = ownedTab(win, tabID)
    if (!tab) return
    tab.view.webContents.navigationHistory.goBack()
  },

  forward(win: BrowserWindow | null, tabID: unknown) {
    const tab = ownedTab(win, tabID)
    if (!tab) return
    tab.view.webContents.navigationHistory.goForward()
  },

  reload(win: BrowserWindow | null, tabID: unknown) {
    ownedTab(win, tabID)?.view.webContents.reload()
  },

  stop(win: BrowserWindow | null, tabID: unknown) {
    ownedTab(win, tabID)?.view.webContents.stop()
  },

  // The renderer measures the panel's content rect in CSS pixels; view bounds
  // are window DIP coordinates, so scale by the window's zoom factor.
  setBounds(win: BrowserWindow | null, tabID: unknown, bounds: unknown) {
    const tab = ownedTab(win, tabID)
    const rect = sanitizeBrowserBounds(bounds)
    if (!tab || !rect) return
    const factor = tab.win.webContents.getZoomFactor()
    tab.view.setBounds({
      x: Math.round(rect.x * factor),
      y: Math.round(rect.y * factor),
      width: Math.round(rect.width * factor),
      height: Math.round(rect.height * factor),
    })
    // Re-adding raises the active view above its hidden siblings.
    tab.win.contentView.addChildView(tab.view)
    tab.view.setVisible(true)
  },

  hide(win: BrowserWindow | null) {
    if (!win) return
    for (const tab of tabs.values()) {
      if (tab.win === win) tab.view.setVisible(false)
    }
  },
}
