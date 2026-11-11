// Is the box's shared Chrome signed in to the Coval app? Agents reach the Coval UI (marking a
// finding, checking a page) through that one browser, and a signed-out session only showed up at a
// job's last step (2026-11-10: another session had cleared the shared cookies hours earlier).
// This reads the cookie jar over the DevTools port; it opens no tab and touches no page.
type Cookie = { name: string; value: string; domain: string }

export async function covalSignedIn(cdp = process.env.COW_BROWSER_CDP ?? "http://127.0.0.1:9222") {
  try {
    const version = (await (await fetch(`${cdp}/json/version`, { signal: AbortSignal.timeout(5000) })).json()) as {
      webSocketDebuggerUrl?: string
    }
    if (!version.webSocketDebuggerUrl) return undefined
    const cookies = await new Promise<Cookie[] | undefined>((resolve) => {
      const socket = new WebSocket(version.webSocketDebuggerUrl!)
      const timer = setTimeout(() => {
        socket.close()
        resolve(undefined)
      }, 8000)
      socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: "Storage.getCookies" }))
      socket.onmessage = (event) => {
        const message = JSON.parse(String(event.data)) as { id?: number; result?: { cookies?: Cookie[] } }
        if (message.id !== 1) return
        clearTimeout(timer)
        socket.close()
        resolve(message.result?.cookies)
      }
      socket.onerror = () => {
        clearTimeout(timer)
        resolve(undefined)
      }
    })
    if (!cookies) return undefined
    // Clerk keeps "__client_uat" at 0 while signed out and at the sign-in time otherwise.
    return cookies.some((c) => c.name === "__client_uat" && /(^|\.)coval\.dev$/.test(c.domain) && c.value !== "0")
  } catch {
    return undefined
  }
}

/** `cow-slack browser`: exit 0 signed in, 1 signed out, 3 could not tell. */
export async function browser(): Promise<number> {
  const state = await covalSignedIn()
  console.log(
    state === undefined
      ? "could not read the box browser's cookies"
      : state
        ? "the box browser is signed in to app.coval.dev"
        : "the box browser is SIGNED OUT of app.coval.dev: Callum has to sign in on the computer view",
  )
  return state === undefined ? 3 : state ? 0 : 1
}
