import type { SessionApi } from "@opencode-ai/client/promise"
import { normalizeSessionInfo } from "@/utils/session"
import type { OpencodeClient, Session } from "@opencode-ai/sdk/v2/client"

export async function loadRootSessions(input: { api: Pick<SessionApi, "list">; directory: string; limit: number }) {
  const result = await input.api.list({
    directory: input.directory,
    parentID: null,
    limit: input.limit,
    order: "desc",
  })
  return {
    data: result.data.map(normalizeSessionInfo),
    limit: input.limit,
    limited: true,
  } as const
}

export async function loadRootSessionsV1(input: { client: OpencodeClient; directory: string; limit: number }) {
  try {
    const result = await input.client.session.list({ directory: input.directory, roots: true, limit: input.limit })
    return { data: result.data, limit: input.limit, limited: true } as const
  } catch {
    const result = await input.client.session.list({ directory: input.directory, roots: true })
    return { data: result.data, limit: input.limit, limited: false } as const
  }
}

export async function loadSessionChildren(input: {
  client: OpencodeClient
  api: Pick<SessionApi, "list">
  protocol: "v1" | "v2"
  sessionID: string
}) {
  if (input.protocol === "v1") return (await input.client.session.children({ sessionID: input.sessionID })).data ?? []
  const sessions: Session[] = []
  const cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const result = await input.api.list({ parentID: input.sessionID, limit: 100, cursor, order: "desc" })
    sessions.push(...result.data.map(normalizeSessionInfo).filter((session) => session.parentID === input.sessionID))
    cursor = result.cursor.next ?? undefined
    if (cursor && cursors.has(cursor)) throw new Error("Repeated session page cursor")
    if (cursor) cursors.add(cursor)
  } while (cursor)
  return sessions
}

export function estimateRootSessionTotal(input: { count: number; limit: number; limited: boolean }) {
  if (!input.limited) return input.count
  if (input.count < input.limit) return input.count
  return input.count + 1
}
