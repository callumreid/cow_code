import { authTokenFromCredentials } from "@/utils/server"

export function sessionPanelLayout(input: { review: boolean; browser?: boolean; terminal: boolean; files: boolean }) {
  const top = input.review || Boolean(input.browser) || input.files
  return {
    visible: top || input.terminal,
    stacked: (input.review || Boolean(input.browser)) && input.terminal,
  }
}

/** The thread a session belongs to: its root session. The Browser panel shows that thread's tab. */
export function browserThread(sessionID: string | undefined, parentOf: (sessionID: string) => string | undefined) {
  const seen = new Set<string>()
  let current = sessionID
  while (current && !seen.has(current)) {
    seen.add(current)
    const parent = parentOf(current)
    if (!parent) break
    current = parent
  }
  return current
}

export function browserCandidates(http: { url: string; username?: string; password?: string }, thread?: string) {
  const rawOrigin = typeof window !== "undefined" ? window.location.origin : ""
  const origin = /^https?:\/\//i.test(rawOrigin) ? rawOrigin : "http://127.0.0.1:4096"
  const base = new URL(http.url || origin, origin)
  const wsProto = base.protocol === "https:" ? "wss:" : "ws:"
  const httpProto = base.protocol === "https:" ? "https:" : "http:"
  const token = http.password
    ? authTokenFromCredentials({ username: http.username, password: http.password })
    : undefined
  const params = [
    ...(token ? [`auth_token=${encodeURIComponent(token)}`] : []),
    ...(thread ? [`thread=${encodeURIComponent(thread)}`] : []),
  ]
  const query = params.length ? `?${params.join("&")}` : ""
  const proxiedWs = `${wsProto}//${base.host}/computer/ws${query}`
  const proxiedHttp = `${httpProto}//${base.host}/computer/${query}`
  if (base.protocol === "https:") {
    return { ws: [proxiedWs], popout: proxiedHttp }
  }
  const directWs = `ws://${base.hostname}:4099/ws${query}`
  const directHttp = `http://${base.hostname}:4099/${query}`
  return {
    ws: [directWs, proxiedWs],
    popout: directHttp,
  }
}
