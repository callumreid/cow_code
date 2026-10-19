import { allowedDuringTakeover, takeoverError, type CdpMessage } from "./cdp"

/** Local agents share the visible target and cannot send input while a person owns the browser. */
export function startAgentProxy(input: {
  cdp: string
  port: number
  human: () => boolean
  select: (id: string) => void
}) {
  return Bun.serve<{
    upstream: string
    socket?: WebSocket
    queued: string[]
    sessions: Map<string, string>
    attaches: Map<number, string>
    target?: string
  }>({
    hostname: "127.0.0.1",
    port: input.port,
    async fetch(request, server) {
      // The direct Chrome endpoint is loopback-only too. Never expose it through the phone gate.
      const url = new URL(request.url)
      if (request.headers.has("origin") || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
        return new Response("Local agent connections only", { status: 403 })
      }
      if (url.pathname === "/cowcode/control")
        return Response.json({ owner: input.human() ? "human" : "agent" }, { headers: { "cache-control": "no-store" } })
      url.pathname = url.pathname.replace(/\/$/, "")
      if (url.pathname === "/json/version" || url.pathname === "/json/list" || url.pathname === "/json") {
        const response = await fetch(`${input.cdp}${url.pathname}`, { signal: AbortSignal.timeout(5_000) })
        const rewrite = (value: { webSocketDebuggerUrl?: string }) => ({
          ...value,
          ...(value.webSocketDebuggerUrl
            ? { webSocketDebuggerUrl: `ws://127.0.0.1:${server.port}${new URL(value.webSocketDebuggerUrl).pathname}` }
            : {}),
        })
        const value = await response.json()
        return Response.json(Array.isArray(value) ? value.map(rewrite) : rewrite(value))
      }
      if (!/^\/devtools\/(browser|page)\/[\w-]+$/.test(url.pathname)) return new Response("Not found", { status: 404 })
      const upstream = new URL(input.cdp)
      upstream.protocol = upstream.protocol === "https:" ? "wss:" : "ws:"
      upstream.pathname = url.pathname
      if (
        server.upgrade(request, {
          data: {
            upstream: upstream.href,
            queued: [],
            sessions: new Map(),
            attaches: new Map(),
            target: url.pathname.startsWith("/devtools/page/") ? url.pathname.split("/").at(-1) : undefined,
          },
        })
      )
        return
      return new Response("WebSocket required", { status: 400 })
    },
    websocket: {
      open(client) {
        const socket = new WebSocket(client.data.upstream)
        client.data.socket = socket
        socket.onopen = () => {
          for (const raw of client.data.queued.splice(0)) {
            const message: CdpMessage = JSON.parse(raw)
            if (input.human() && !allowedDuringTakeover(message.method ?? "")) client.send(takeoverError(message))
            else socket.send(raw)
          }
        }
        socket.onmessage = (event) => {
          const message: CdpMessage = JSON.parse(String(event.data))
          if (
            message.method === "Target.attachedToTarget" &&
            message.params?.targetInfo?.type === "page" &&
            typeof message.params.sessionId === "string" &&
            typeof message.params.targetInfo.targetId === "string"
          ) {
            client.data.sessions.set(message.params.sessionId, message.params.targetInfo.targetId)
          }
          if (message.id !== undefined && client.data.attaches.has(message.id)) {
            if (typeof message.result?.sessionId === "string")
              client.data.sessions.set(message.result.sessionId, client.data.attaches.get(message.id)!)
            client.data.attaches.delete(message.id)
          }
          if (message.method === "Target.detachedFromTarget" && typeof message.params?.sessionId === "string")
            client.data.sessions.delete(message.params?.sessionId)
          client.send(String(event.data))
        }
        socket.onclose = () => client.close()
        socket.onerror = () => client.close()
      },
      message(client, raw) {
        let message: CdpMessage
        try {
          message = JSON.parse(String(raw))
        } catch {
          return client.close(1003)
        }
        if (!message.method || message.id === undefined) return
        if (input.human() && !allowedDuringTakeover(message.method)) {
          client.send(takeoverError(message))
          return
        }
        if (message.method === "Target.attachToTarget" && typeof message.params?.targetId === "string") {
          client.data.attaches.set(message.id, message.params.targetId)
        }
        const target = message.sessionId ? client.data.sessions.get(message.sessionId) : client.data.target
        if (
          target &&
          !input.human() &&
          /^(Input\.|Page\.(navigate|bringToFront)|Runtime\.(evaluate|callFunctionOn))/.test(message.method)
        )
          input.select(target)
        if (client.data.socket?.readyState === WebSocket.OPEN) client.data.socket.send(String(raw))
        else if (client.data.queued.length < 100) client.data.queued.push(String(raw))
        else client.close(1013)
      },
      close(client) {
        client.data.socket?.close()
      },
    },
  })
}
