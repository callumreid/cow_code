import type { Message, Part, Session, SessionStatus, ToolPart } from "@opencode-ai/sdk/v2/client"
import { getSessionTokenTotal } from "@/components/session/session-context-metrics"

// Pure derivation + retention for the Activity panel's "Finished" section.
// Mirrors running-work.ts (no clocks, no DOM, store-shaped inputs only) but
// captures rows AFTER they complete so the panel keeps a history the way the
// Claude/Codex background-tasks panels do.

export const FINISHED_WORK_CAP = 50

export type FinishedRow = {
  key: string
  kind: "tool" | "subagent"
  status: "completed" | "error"
  tool?: string
  input?: Record<string, unknown>
  metadata?: Record<string, unknown>
  description?: string
  agentType?: string
  background?: boolean
  childSessionID?: string
  startedAt?: number
  finishedAt: number
  durationMs?: number
  tokens?: number
  cost?: number
}

const empty: Record<string, unknown> = {}

const stateMetadata = (part: ToolPart): Record<string, unknown> =>
  (part.state.status === "pending" ? undefined : part.state.metadata) ?? part.metadata ?? empty

const string = (value: unknown) => (typeof value === "string" && value ? value : undefined)

// A child is still running (belongs to getRunningWork, not here) unless idle/absent.
const stillRunning = (status: SessionStatus | undefined) => !!status && status.type !== "idle"

export function getFinishedWork(input: {
  sessionID: string
  messages: Message[]
  parts: (messageID: string) => Part[]
  sessions: Session[]
  status: (sessionID: string) => SessionStatus | undefined
}): FinishedRow[] {
  const rows: FinishedRow[] = []
  const seenChildren = new Set<string>()

  for (const message of input.messages) {
    if (message.role !== "assistant") continue
    for (const part of input.parts(message.id)) {
      if (part.type !== "tool") continue
      const state = part.state
      // Narrow on state.status directly so the discriminated union exposes time.end.
      if (state.status !== "completed" && state.status !== "error") continue
      const finishedAt = state.time.end ?? 0
      const durationMs = state.time.end !== undefined ? state.time.end - state.time.start : undefined

      if (part.tool === "task") {
        const metadata = stateMetadata(part)
        const childSessionID = string(metadata.sessionId)
        // A completed task part whose child is still busy is still running work —
        // it stays in getRunningWork's busy-child branch, not the finished list.
        if (childSessionID && stillRunning(input.status(childSessionID))) continue
        if (childSessionID) seenChildren.add(childSessionID)
        const child = childSessionID ? input.sessions.find((session) => session.id === childSessionID) : undefined
        rows.push({
          key: part.id,
          kind: "subagent",
          status: state.status,
          description: string(state.input?.description),
          agentType: string(state.input?.subagent_type),
          background: metadata.background === true,
          childSessionID,
          startedAt: state.time.start,
          finishedAt,
          durationMs,
          tokens: child ? getSessionTokenTotal(child.tokens) : undefined,
          cost: child?.cost,
        })
        continue
      }

      rows.push({
        key: part.id,
        kind: "tool",
        status: state.status,
        tool: part.tool,
        input: state.input,
        metadata: stateMetadata(part),
        startedAt: state.time.start,
        finishedAt,
        durationMs,
      })
    }
  }

  // Idle child sessions with no captured task part — background/promoted subagents
  // whose task part returned early. Skip any already captured above or still busy.
  for (const session of input.sessions) {
    if (session.parentID !== input.sessionID) continue
    if (seenChildren.has(session.id)) continue
    if (stillRunning(input.status(session.id))) continue
    rows.push({
      key: session.id,
      kind: "subagent",
      status: "completed",
      description: session.title,
      childSessionID: session.id,
      finishedAt: session.time.updated ?? session.time.created ?? 0,
      tokens: getSessionTokenTotal(session.tokens),
      cost: session.cost,
    })
  }

  return rows
}

// Fields that can change after a row is first observed (tokens/cost land on a
// later session.updated); everything else is stable per key.
const sameRow = (a: FinishedRow, b: FinishedRow) =>
  a.status === b.status &&
  a.tokens === b.tokens &&
  a.cost === b.cost &&
  a.durationMs === b.durationMs &&
  a.finishedAt === b.finishedAt

/**
 * Merge freshly-derived finished rows into the retained set: drop rows cleared by
 * the user, upsert by key (reusing the prior object when nothing changed so the
 * store never churns), newest-first, capped. Returns the `existing` reference
 * unchanged when the result is identical.
 */
export function retainFinished(
  existing: FinishedRow[],
  incoming: FinishedRow[],
  opts?: { cap?: number; clearedBefore?: number },
): FinishedRow[] {
  const cap = opts?.cap ?? FINISHED_WORK_CAP
  const clearedBefore = opts?.clearedBefore ?? 0
  const byKey = new Map<string, FinishedRow>()
  for (const row of existing) if (row.finishedAt > clearedBefore) byKey.set(row.key, row)
  for (const row of incoming) {
    if (row.finishedAt <= clearedBefore) continue
    const prev = byKey.get(row.key)
    byKey.set(row.key, prev && sameRow(prev, row) ? prev : row)
  }
  const merged = [...byKey.values()]
    .sort((a, b) => b.finishedAt - a.finishedAt || (a.key < b.key ? 1 : a.key > b.key ? -1 : 0))
    .slice(0, cap)
  if (merged.length === existing.length && merged.every((row, index) => row === existing[index])) return existing
  return merged
}

export const finishedWorkCount = (rows: FinishedRow[]) => rows.length
