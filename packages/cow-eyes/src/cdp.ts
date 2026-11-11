export type Target = { id: string; type: string; title: string; url: string; webSocketDebuggerUrl: string }
export type CdpMessage = {
  id?: number
  sessionId?: string
  method?: string
  params?: {
    targetInfo?: { type?: string; targetId?: string }
    sessionId?: string
    targetId?: string
    [key: string]: unknown
  }
  result?: { sessionId?: string; [key: string]: unknown }
  error?: { code: number; message: string }
}

export function normalizeUrl(input: string) {
  const value = input.trim()
  if (!value) return "about:blank"
  if (value === "about:blank") return value
  if (/^https?:\/\//i.test(value) && URL.canParse(value)) return new URL(value).href
  if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(value)) return `http://${value}`
  if (/^[\w.-]+\.[a-z]{2,}(:\d+)?(\/|$)/i.test(value)) return `https://${value}`
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`
}

/** Human takeover blocks evaluation too: JavaScript and DOM calls can cause arbitrary input. */
export function allowedDuringTakeover(method: string) {
  return /^(Browser\.getVersion|Target\.(getTargets|getTargetInfo|attachToTarget|detachFromTarget|setAutoAttach|setDiscoverTargets)|Page\.(enable|disable|getFrameTree|getLayoutMetrics|captureScreenshot)|Runtime\.(enable|disable|releaseObject|releaseObjectGroup)|DOM\.getDocument|Accessibility\.(enable|disable|getFullAXTree)|Network\.(enable|disable)|Log\.(enable|disable))$/.test(
    method,
  )
}

export function takeoverError(message: CdpMessage) {
  return JSON.stringify({
    id: message.id,
    sessionId: message.sessionId,
    error: {
      code: -32000,
      message:
        "A person has taken control in CowCode. Browser actions are paused. Wait until they choose Return to agent, then inspect the page again before continuing.",
    },
  })
}

/**
 * The profile is shared by every agent and holds Callum's sign-ins. One agent clearing cookies to
 * debug a local page signed every job out of the Coval app (2026-11-10), so the bulk clears are
 * refused; deleting a single named cookie still works.
 */
export const wipesProfile = (method: string) =>
  /^(Storage\.(clearCookies|clearDataForOrigin|clearDataForStorageKey)|Network\.(clearBrowserCookies|clearBrowserCache))$/.test(
    method,
  )

export function wipeError(message: CdpMessage) {
  return JSON.stringify({
    id: message.id,
    sessionId: message.sessionId,
    error: {
      code: -32000,
      message:
        "Refused: this browser profile is shared and holds Callum's sign-ins, so cookies and site data cannot be cleared here. For local or test auth work use a separate browser context, or delete only the one cookie you set.",
    },
  })
}
