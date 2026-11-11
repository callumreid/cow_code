import type { ServerWebSocket } from "bun"
import {
  agentPath,
  allowedDuringTakeover,
  closesBrowser,
  foreignTabError,
  refused,
  takeoverError,
  wipeError,
  wipesProfile,
  type CdpMessage,
} from "./cdp"
import { SHARED_SESSION, attachDecision, validSession, type ThreadTabs } from "./threads"

type Waiting = { target: string; opener?: string; paused: boolean; messages: string[] }
type Client = {
  /** The CowCode session this connection drives tabs for. */
  session: string
  upstream: string
  socket?: WebSocket
  queued: string[]
  /** CDP session id to tab, for the tabs this connection may drive. */
  pages: Map<string, string>
  /** Every target Chrome attached and this connection was allowed to see. */
  known: Set<string>
  /** CDP sessions for other threads' tabs: resumed, detached, and never forwarded. */
  hidden: Set<string>
  /** Pages announced while a tab creation was in flight; held until its owner is known. */
  waiting: Map<string, Waiting>
  attaches: Map<number, string>
  creates: Map<number, ReturnType<typeof setTimeout>>
  listings: Set<number>
  internal: number
  /** Set for a direct page socket. */
  target?: string
}
type Sock = ServerWebSocket<Client>
export type WindowBounds = { left: number; top: number; width: number; height: number }

/**
 * Local agents reach Chrome only through this proxy. Each connection belongs to one session and
 * is shown only that session's tabs, so two threads cannot act on each other's tab; nobody can
 * send input while a person owns the thread's browser.
 */
export function startAgentProxy(input: {
  cdp: string
  port: number
  threads: ThreadTabs
  human: (session: string) => boolean
  /** An agent navigated or sent input to one of its tabs. */
  acted: (target: string) => void
  bounds?: WindowBounds
}) {
  const { threads } = input
  const clients = new Set<Sock>()
  // Tab creations in flight on any connection, or by the bridge itself.
  let creating = 0

  // The bridge's own browser connection: opens tabs for people, sizes windows, closes idle tabs,
  // and hears about popups and closed tabs even when no agent is connected.
  const control = {
    socket: undefined as WebSocket | undefined,
    opening: undefined as Promise<WebSocket> | undefined,
    seq: 0,
    pending: new Map<number, (value: CdpMessage) => void>(),
    async connect(): Promise<WebSocket> {
      if (control.socket?.readyState === WebSocket.OPEN) return control.socket
      control.opening ??= (async () => {
        const version = (await (
          await fetch(`${input.cdp}/json/version`, { signal: AbortSignal.timeout(5_000) })
        ).json()) as {
          webSocketDebuggerUrl: string
        }
        const upstream = new URL(input.cdp)
        upstream.protocol = upstream.protocol === "https:" ? "wss:" : "ws:"
        upstream.pathname = new URL(version.webSocketDebuggerUrl).pathname
        const socket = new WebSocket(upstream.href)
        await new Promise<void>((resolve, reject) => {
          socket.onopen = () => resolve()
          socket.onerror = () => reject(new Error("Browser is unavailable"))
        })
        socket.onmessage = (event) => {
          const message: CdpMessage = JSON.parse(String(event.data))
          if (message.id !== undefined) {
            control.pending.get(message.id)?.(message)
            control.pending.delete(message.id)
            return
          }
          const info = message.params?.targetInfo
          if (message.method === "Target.targetCreated" && info?.type === "page" && info.targetId && info.openerId) {
            const owner = threads.owner(info.openerId)
            if (owner) threads.own(owner, info.targetId)
          }
          if (message.method === "Target.targetDestroyed" && typeof message.params?.targetId === "string")
            threads.drop(message.params.targetId)
        }
        socket.onclose = () => {
          if (control.socket === socket) control.socket = undefined
          for (const resolve of control.pending.values()) resolve({ error: { code: -1, message: "Browser closed" } })
          control.pending.clear()
        }
        control.socket = socket
        socket.send(
          JSON.stringify({ id: ++control.seq, method: "Target.setDiscoverTargets", params: { discover: true } }),
        )
        return socket
      })().finally(() => {
        control.opening = undefined
      })
      return control.opening
    },
    async call(method: string, params: Record<string, unknown> = {}) {
      const socket = await control.connect()
      const id = ++control.seq
      return new Promise<CdpMessage>((resolve) => {
        const timer = setTimeout(() => {
          control.pending.delete(id)
          resolve({ error: { code: -1, message: "Browser command timed out" } })
        }, 10_000)
        control.pending.set(id, (message) => {
          clearTimeout(timer)
          resolve(message)
        })
        socket.send(JSON.stringify({ id, method, params }))
      })
    },
  }
  const watch = () => void control.connect().catch(() => undefined)
  watch()
  const watching = setInterval(watch, 15_000)

  /** Every thread tab is the only tab of its own window, so no thread's page is ever a hidden tab. */
  async function place(target: string) {
    if (!input.bounds) return
    const found = await control.call("Browser.getWindowForTarget", { targetId: target }).catch(() => undefined)
    const windowId = found?.result?.windowId
    if (typeof windowId !== "number") return
    await control
      .call("Browser.setWindowBounds", { windowId, bounds: { ...input.bounds, windowState: "normal" } })
      .catch(() => undefined)
  }

  function hide(client: Sock, cdpSession: string, paused: boolean) {
    const data = client.data
    data.hidden.add(cdpSession)
    // Chrome holds a new page until every auto-attached connection resumes it.
    if (paused)
      data.socket?.send(
        JSON.stringify({ id: --data.internal, sessionId: cdpSession, method: "Runtime.runIfWaitingForDebugger" }),
      )
    data.socket?.send(
      JSON.stringify({ id: --data.internal, method: "Target.detachFromTarget", params: { sessionId: cdpSession } }),
    )
  }

  function decide(client: Sock, cdpSession: string, item: Waiting) {
    const session = client.data.session
    const openerOwner = item.opener ? threads.owner(item.opener) : undefined
    const decision = attachDecision({
      session,
      owner: threads.owner(item.target),
      openerOwner,
      creating: creating > 0,
    })
    if (decision === "wait") return false
    if (decision === "adopt") threads.own(session, item.target)
    // Record a popup for its opener's session even when that session's own connection is away.
    if (decision === "hide" && openerOwner) threads.own(openerOwner, item.target)
    if (decision === "hide") {
      hide(client, cdpSession, item.paused)
      return true
    }
    client.data.pages.set(cdpSession, item.target)
    client.data.known.add(item.target)
    for (const raw of item.messages) client.send(raw)
    return true
  }

  function settle() {
    for (const client of clients)
      for (const [cdpSession, item] of client.data.waiting)
        if (decide(client, cdpSession, item)) client.data.waiting.delete(cdpSession)
  }

  function created(session: string, target: string | undefined) {
    creating = Math.max(0, creating - 1)
    if (target) {
      threads.own(session, target)
      void place(target)
    }
    settle()
  }

  function fromChrome(client: Sock, raw: string) {
    const data = client.data
    const message: CdpMessage = JSON.parse(raw)
    if (typeof message.id === "number" && message.id < 0) return
    if (message.sessionId && data.hidden.has(message.sessionId)) return
    const held = message.sessionId ? data.waiting.get(message.sessionId) : undefined
    if (held) {
      held.messages.push(raw)
      return
    }
    const info = message.params?.targetInfo
    if (message.method === "Target.attachedToTarget" && typeof message.params?.sessionId === "string") {
      if (!message.sessionId && info?.type === "page" && typeof info.targetId === "string") {
        const item = {
          target: info.targetId,
          opener: info.openerId,
          paused: message.params.waitingForDebugger === true,
          messages: [raw],
        }
        if (!decide(client, message.params.sessionId, item)) data.waiting.set(message.params.sessionId, item)
        return
      }
      if (typeof info?.targetId === "string") data.known.add(info.targetId)
    }
    if (message.method === "Target.detachedFromTarget" && typeof message.params?.sessionId === "string") {
      if (data.hidden.delete(message.params.sessionId) || data.waiting.delete(message.params.sessionId)) return
      data.pages.delete(message.params.sessionId)
    }
    // Target discovery must not reveal other threads' tabs either.
    if (
      /^Target\.(targetCreated|targetInfoChanged)$/.test(message.method ?? "") &&
      info?.type === "page" &&
      threads.owner(info.targetId ?? "") !== data.session
    )
      return
    if (/^Target\.(targetDestroyed|targetCrashed)$/.test(message.method ?? "")) {
      const owner = threads.owner(String(message.params?.targetId ?? ""))
      if (owner && owner !== data.session) return
    }
    if (message.id !== undefined) {
      const timer = data.creates.get(message.id)
      if (timer) {
        clearTimeout(timer)
        data.creates.delete(message.id)
        // The page was announced before this answer; release it to its owner first.
        created(data.session, typeof message.result?.targetId === "string" ? message.result.targetId : undefined)
      }
      if (data.listings.delete(message.id) && Array.isArray(message.result?.targetInfos)) {
        const visible = (message.result.targetInfos as { type?: string; targetId?: string }[]).filter(
          (item) => item.type !== "page" || threads.owner(item.targetId ?? "") === data.session,
        )
        client.send(JSON.stringify({ ...message, result: { ...message.result, targetInfos: visible } }))
        return
      }
      if (data.attaches.has(message.id)) {
        if (typeof message.result?.sessionId === "string")
          data.pages.set(message.result.sessionId, data.attaches.get(message.id)!)
        data.attaches.delete(message.id)
      }
    }
    client.send(raw)
  }

  function fromAgent(client: Sock, raw: string) {
    const data = client.data
    let message: CdpMessage
    try {
      message = JSON.parse(raw)
    } catch {
      return client.close(1003)
    }
    if (!message.method || message.id === undefined) return
    const method = message.method
    if (input.human(data.session) && !allowedDuringTakeover(method)) return void client.send(takeoverError(message))
    if (wipesProfile(method)) return void client.send(wipeError(message))
    if (closesBrowser(method))
      return void client.send(
        refused(message, "Refused: every CowCode thread shares this browser. Close your own tabs instead."),
      )
    const named = typeof message.params?.targetId === "string" ? message.params.targetId : undefined
    if (
      named &&
      /^Target\.(attachToTarget|closeTarget|activateTarget|getTargetInfo|sendMessageToTarget)$/.test(method) &&
      threads.owner(named) !== data.session &&
      !data.known.has(named)
    )
      return void client.send(foreignTabError(message))
    if (message.sessionId && data.hidden.has(message.sessionId)) return void client.send(foreignTabError(message))
    let forward = raw
    if (method === "Target.createTarget") {
      creating++
      const id = message.id
      data.creates.set(
        id,
        setTimeout(() => {
          if (data.creates.delete(id)) created(data.session, undefined)
        }, 15_000),
      )
      if (message.params?.newWindow === undefined)
        forward = JSON.stringify({ ...message, params: { ...message.params, newWindow: true } })
    }
    if (method === "Target.getTargets") data.listings.add(message.id)
    if (method === "Target.attachToTarget" && named) data.attaches.set(message.id, named)
    if (threads.get(data.session)) threads.touch(data.session)
    const target = message.sessionId ? data.pages.get(message.sessionId) : data.target
    // Playwright evaluates in every attached page during setup and snapshots. Those
    // background reads must not move the thread's viewers off the tab being driven.
    if (target && /^(Input\.|Page\.(navigate|bringToFront)$)/.test(method)) input.acted(target)
    if (data.socket?.readyState === WebSocket.OPEN) data.socket.send(forward)
    else if (data.queued.length < 100) data.queued.push(forward)
    else client.close(1013)
  }

  const server = Bun.serve<Client>({
    hostname: "127.0.0.1",
    port: input.port,
    async fetch(request, server) {
      // The direct Chrome endpoint is loopback-only too. Never expose it through the phone gate.
      const url = new URL(request.url)
      if (request.headers.has("origin") || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
        return new Response("Local agent connections only", { status: 403 })
      }
      if (url.pathname === "/cowcode/control") {
        const named = url.searchParams.get("session")
        const thread = url.searchParams.get("thread")
        const session = validSession(named) ? named : SHARED_SESSION
        threads.touch(session, validSession(thread) ? thread : undefined)
        return Response.json(
          { owner: input.human(session) ? "human" : "agent", session, thread: threads.thread(session) },
          { headers: { "cache-control": "no-store" } },
        )
      }
      if (url.pathname === "/cowcode/threads")
        return Response.json(threads.list(), { headers: { "cache-control": "no-store" } })
      const route = agentPath(url.pathname.replace(/\/$/, "") || "/")
      const session = route.session ?? SHARED_SESSION
      if (route.path === "/json/version" || route.path === "/json/list" || route.path === "/json") {
        const response = await fetch(`${input.cdp}${route.path}`, { signal: AbortSignal.timeout(5_000) })
        const rewrite = (value: { webSocketDebuggerUrl?: string }) => ({
          ...value,
          ...(value.webSocketDebuggerUrl
            ? {
                webSocketDebuggerUrl: `ws://127.0.0.1:${server.port}${route.prefix}${new URL(value.webSocketDebuggerUrl).pathname}`,
              }
            : {}),
        })
        const value = await response.json()
        if (!Array.isArray(value)) return Response.json(rewrite(value))
        return Response.json(
          value
            .filter(
              (item: { id?: string; type?: string }) =>
                item.type !== "page" || threads.owner(item.id ?? "") === session,
            )
            .map(rewrite),
        )
      }
      if (!/^\/devtools\/(browser|page)\/[\w-]+$/.test(route.path)) return new Response("Not found", { status: 404 })
      const target = route.path.startsWith("/devtools/page/") ? route.path.split("/").at(-1) : undefined
      if (target && threads.owner(target) !== session)
        return new Response("That tab belongs to another thread", { status: 403 })
      const upstream = new URL(input.cdp)
      upstream.protocol = upstream.protocol === "https:" ? "wss:" : "ws:"
      upstream.pathname = route.path
      if (
        server.upgrade(request, {
          data: {
            session,
            upstream: upstream.href,
            queued: [],
            pages: new Map(),
            known: new Set(),
            hidden: new Set(),
            waiting: new Map(),
            attaches: new Map(),
            creates: new Map(),
            listings: new Set(),
            internal: 0,
            target,
          },
        })
      )
        return
      return new Response("WebSocket required", { status: 400 })
    },
    websocket: {
      open(client) {
        clients.add(client)
        const socket = new WebSocket(client.data.upstream)
        client.data.socket = socket
        socket.onopen = () => {
          for (const raw of client.data.queued.splice(0)) socket.send(raw)
        }
        socket.onmessage = (event) => fromChrome(client, String(event.data))
        socket.onclose = () => client.close()
        socket.onerror = () => client.close()
      },
      message(client, raw) {
        fromAgent(client, String(raw))
      },
      close(client) {
        clients.delete(client)
        for (const timer of client.data.creates.values()) {
          clearTimeout(timer)
          creating = Math.max(0, creating - 1)
        }
        client.data.creates.clear()
        client.data.waiting.clear()
        client.data.socket?.close()
        settle()
      },
    },
  })

  return {
    port: server.port,
    stop() {
      clearInterval(watching)
      control.socket?.close()
      void server.stop(true)
    },
    /** Open a tab for a session from outside an agent connection (a person in the watch view). */
    async open(session: string, url: string, thread?: string) {
      creating++
      const result = await control.call("Target.createTarget", { url, newWindow: true }).catch(() => undefined)
      const target = typeof result?.result?.targetId === "string" ? result.result.targetId : undefined
      if (target) threads.touch(session, thread)
      created(session, target)
      if (!target) throw new Error("Could not open a browser tab")
      return target
    },
    /** Close one tab. Callers pass only tabs recorded as opened for a thread. */
    async close(target: string) {
      await control.call("Target.closeTarget", { targetId: target }).catch(() => undefined)
      threads.drop(target)
    },
  }
}
