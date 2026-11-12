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

// Where Callum signs in to the agents' browser, in words he can act on. The agent Chrome is a
// separate browser with its own profile: signing in to his everyday Chrome does nothing for it
// (2026-11-12, he signed in there and the job still saw the sign-in page).
export const signInWhere = () =>
  process.env.COW_BROWSER_SIGNIN_WHERE ??
  "on barn's computer view (the Browser panel in CowCode on a barn thread), where the Coval sign-in page is open"

/**
 * Put the Coval sign-in page in front in the agent Chrome: reuse a tab already on app.coval.dev or
 * open one, then raise it. Best effort; nothing here touches cookies.
 */
export async function openSignIn(cdp = process.env.COW_BROWSER_CDP ?? "http://127.0.0.1:9222") {
  try {
    const tabs = (await (await fetch(`${cdp}/json`, { signal: AbortSignal.timeout(5000) })).json()) as {
      id: string
      type: string
      url?: string
    }[]
    const existing = tabs.find((tab) => tab.type === "page" && /^https:\/\/app\.coval\.dev\/sign/.test(tab.url ?? ""))
    const tab =
      existing ??
      ((await (
        await fetch(`${cdp}/json/new?https://app.coval.dev/`, { method: "PUT", signal: AbortSignal.timeout(5000) })
      ).json()) as { id: string })
    await fetch(`${cdp}/json/activate/${tab.id}`, { signal: AbortSignal.timeout(5000) })
    return true
  } catch {
    return false
  }
}

/** `cow-slack browser`: exit 0 signed in, 1 signed out, 3 could not tell. Signed out opens the sign-in page. */
export async function browser(): Promise<number> {
  const state = await covalSignedIn()
  if (state === false) await openSignIn()
  console.log(
    state === undefined
      ? "could not read the agent browser's cookies"
      : state
        ? "the agent browser is signed in to app.coval.dev"
        : `the agent browser is SIGNED OUT of app.coval.dev. Ask Callum to sign in ${signInWhere()}. Tell him plainly it is a separate browser from his everyday Chrome: signing in there does not help.`,
  )
  return state === undefined ? 3 : state ? 0 : 1
}
