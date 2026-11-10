import { ServerConnection, serverName } from "@/context/server"
import type { ServerHealth } from "@/utils/server-health"
import { officeFetch } from "@/office/api"
import type { Prompt } from "@/context/prompt"

/**
 * Where a thread runs: this MacBook (the desktop's built-in server) or the always-on Mac mini.
 * Each location is one server connection; the Mac mini can be reached by more than one
 * (the ssh tunnel and the home LAN), so its entry uses whichever of those is up.
 */
export type ThreadLocation = {
  id: string
  label: string
  key: ServerConnection.Key
  server: ServerConnection.Any
}

const MINI = /\bbarn\b|mac ?mini|100\.65\.225\.30|192\.168\.86\.25/i

export function locationID(conn: ServerConnection.Any) {
  if (ServerConnection.local(conn)) return "macbook"
  if (MINI.test(`${conn.displayName ?? ""} ${conn.http.url}`)) return "mini"
  return `server:${ServerConnection.key(conn)}`
}

export function locationLabel(id: string, conn: ServerConnection.Any) {
  if (id === "macbook") return "MacBook Pro"
  if (id === "mini") return "Mac mini"
  return serverName(conn)
}

export function threadLocations(input: {
  servers: ServerConnection.Any[]
  health?: Record<string, ServerHealth | undefined>
  /** The connection the thread is on now: keep it as its location's entry. */
  current?: ServerConnection.Key
}): ThreadLocation[] {
  const groups = new Map<string, ServerConnection.Any[]>()
  for (const conn of input.servers) {
    const id = locationID(conn)
    groups.set(id, [...(groups.get(id) ?? []), conn])
  }
  const order = (id: string) => (id === "macbook" ? 0 : id === "mini" ? 1 : 2)
  return [...groups.entries()]
    .sort(([a], [b]) => order(a) - order(b))
    .map(([id, conns]) => {
      const pick =
        conns.find((conn) => ServerConnection.key(conn) === input.current) ??
        conns.find((conn) => input.health?.[ServerConnection.key(conn)]?.healthy) ??
        conns[0]!
      return { id, label: locationLabel(id, pick), key: ServerConnection.key(pick), server: pick }
    })
}

type Exported = {
  info: { id: string; directory: string }
  messages: unknown[]
  git?: { directory: string; branch?: string; head?: string; changes: string }
}

export type MoveResult = {
  sessionID: string
  directory: string
  changes: "none" | "applied" | "failed"
  error?: string
  branch?: string
}

const query = (directory: string) => `?directory=${encodeURIComponent(directory)}`

/**
 * Moves a thread to another machine: export it (messages, branch, uncommitted edits) from the
 * server it is on, import it into the other one under the same id and folder, then archive the
 * old copy so only one machine runs it. The source checkout is left as it was.
 */
export async function moveThread(input: {
  sessionID: string
  directory: string
  from: ServerConnection.Any
  to: ServerConnection.Any
  fetch?: typeof globalThis.fetch
}): Promise<MoveResult> {
  const source = { url: input.from.http.url, server: input.from }
  const target = { url: input.to.http.url, server: input.to }
  const exported = (await officeFetch(
    source,
    `/experimental/session/${encodeURIComponent(input.sessionID)}/transfer${query(input.directory)}`,
    { fetch: input.fetch },
  ).then((response) => response.json())) as Exported

  const directory = exported.info.directory
  const imported = (await officeFetch(target, `/experimental/session/transfer${query(directory)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ info: exported.info, messages: exported.messages, changes: exported.git?.changes }),
    fetch: input.fetch,
  }).then((response) => response.json())) as MoveResult

  await officeFetch(source, `/session/${encodeURIComponent(input.sessionID)}${query(directory)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time: { archived: Date.now() } }),
    fetch: input.fetch,
  }).catch(() => undefined)

  return { ...imported, branch: exported.git?.branch }
}

// A new thread's typed prompt, held across a server switch (each server keeps its own draft).
const carried = new Map<string, { prompt: Prompt; at: number }>()

export function carryPrompt(directory: string, prompt: Prompt) {
  if (!prompt.some((part) => "content" in part && part.content.trim())) return
  carried.set(directory, { prompt, at: Date.now() })
}

export function takeCarriedPrompt(directory: string) {
  const entry = carried.get(directory)
  carried.delete(directory)
  if (!entry || Date.now() - entry.at > 30_000) return undefined
  return entry.prompt
}
