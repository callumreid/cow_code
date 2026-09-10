// big dog census — counts the sacred exchange between a user and their agent.
// user side: any version of "big dog" ("big dog", "big dawg", "big dogging", ...)
// agent side: any version of announcing big dog mode ("going into big dog mode", ...)

export const USER_BIG_DOG_RE = /\bbig\s+d(?:og|awg)(?:s|g(?:in|ing|ed|er)?)?\b/gi
export const AGENT_BIG_DOG_MODE_RE = /\bbig\s+d(?:og|awg)\s+mode\b/gi

export type BigDogCensus = {
  userBigDogs: number
  agentBigDogModes: number
  sessionsScanned: number
  messagesScanned: number
  countedAt: number
}

export type BigDogClient = {
  session: {
    list: (input: {
      limit?: number
      start?: number
    }) => Promise<{ data?: Array<{ id: string; directory: string }> | null }>
    messages: (input: {
      sessionID: string
      directory?: string
      limit?: number
    }) => Promise<{
      data?: Array<{
        info?: { role?: string } | null
        parts?: Array<{ type?: string; text?: string | null }> | null
      }> | null
    }>
  }
}

export function countMatches(text: string, re: RegExp) {
  re.lastIndex = 0
  let count = 0
  while (re.exec(text) !== null) count++
  return count
}

const PAGE = 200
const MAX_PAGES = 25
const CONCURRENCY = 5

export async function listAllSessions(client: BigDogClient) {
  const seen = new Set<string>()
  const sessions: Array<{ id: string; directory: string }> = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await client.session.list({ limit: PAGE, start: page * PAGE })
    const data = response.data ?? []
    let fresh = 0
    for (const item of data) {
      if (!item?.id || seen.has(item.id)) continue
      seen.add(item.id)
      sessions.push(item)
      fresh++
    }
    if (data.length < PAGE || fresh === 0) break
  }
  return sessions
}

export async function runBigDogCensus(
  client: BigDogClient,
  onProgress?: (scanned: number, total: number) => void,
): Promise<BigDogCensus> {
  const sessions = await listAllSessions(client)
  const census: BigDogCensus = {
    userBigDogs: 0,
    agentBigDogModes: 0,
    sessionsScanned: 0,
    messagesScanned: 0,
    countedAt: Date.now(),
  }
  let cursor = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, sessions.length) }, async () => {
    while (cursor < sessions.length) {
      const session = sessions[cursor++]
      try {
        const response = await client.session.messages({
          sessionID: session.id,
          directory: session.directory,
          limit: 1000,
        })
        for (const message of response.data ?? []) {
          census.messagesScanned++
          const role = message.info?.role
          for (const part of message.parts ?? []) {
            if (part?.type !== "text" || !part.text) continue
            if (role === "user") census.userBigDogs += countMatches(part.text, USER_BIG_DOG_RE)
            if (role === "assistant") census.agentBigDogModes += countMatches(part.text, AGENT_BIG_DOG_MODE_RE)
          }
        }
      } catch {
        // a session that will not be counted is a session that keeps its secrets
      }
      census.sessionsScanned++
      onProgress?.(census.sessionsScanned, sessions.length)
    }
  })
  await Promise.all(workers)
  return census
}
