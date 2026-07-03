import type { Message, Part, Session, SessionStatus, ToolPart } from "@opencode-ai/sdk/v2/client"

// Pure derivation for the running-work panel. Reads only store data — no clocks —
// so consumers can memoize on store changes rather than ticks (elapsed time is
// rendered from the shared 1s ticker in session-status-line).

export type RunningToolRow = {
  key: string
  tool: string
  status: "pending" | "running"
  input: Record<string, unknown>
  metadata: Record<string, unknown>
  startedAt?: number
}

export type RunningSubagentRow = {
  key: string
  childSessionID?: string
  description?: string
  agentType?: string
  background: boolean
  partStatus?: "pending" | "running"
  startedAt?: number
}

export type RunningWork = {
  tools: RunningToolRow[]
  subagents: RunningSubagentRow[]
}

const empty: Record<string, unknown> = {}

// Task metadata ({sessionId, background, jobId}) lands on state.metadata for
// running/completed/error states; fall back to the top-level part metadata.
const stateMetadata = (part: ToolPart): Record<string, unknown> =>
  (part.state.status === "pending" ? undefined : part.state.metadata) ?? part.metadata ?? empty

const activeStatus = (status: "pending" | "running" | "completed" | "error") =>
  status === "pending" || status === "running" ? status : undefined

const string = (value: unknown) => (typeof value === "string" && value ? value : undefined)

export function getRunningWork(input: {
  sessionID: string
  messages: Message[]
  parts: (messageID: string) => Part[]
  sessions: Session[]
  status: (sessionID: string) => SessionStatus | undefined
}): RunningWork {
  const tools: RunningToolRow[] = []
  const subagents: RunningSubagentRow[] = []
  // Every task part (any status) keyed by child session id, so a busy child whose
  // task part already completed (background/promoted) keeps its description/badge.
  const tasks = new Map<string, RunningSubagentRow>()

  for (const message of input.messages) {
    if (message.role !== "assistant") continue
    for (const part of input.parts(message.id)) {
      if (part.type !== "tool") continue
      const state = part.state
      const status = activeStatus(state.status)
      if (part.tool === "task") {
        const metadata = stateMetadata(part)
        // Row identity comes from part metadata.sessionId — set on every execution
        // path — never from title heuristics (those mislink on resume/rename).
        const childSessionID = string(metadata.sessionId)
        const row: RunningSubagentRow = {
          key: part.id,
          childSessionID,
          description: string(state.input.description),
          agentType: string(state.input.subagent_type),
          background: metadata.background === true,
          partStatus: status,
          startedAt: state.status === "pending" ? undefined : state.time.start,
        }
        if (childSessionID) tasks.set(childSessionID, row)
        if (status) subagents.push(row)
        continue
      }
      if (!status) continue
      tools.push({
        key: part.id,
        tool: part.tool,
        status,
        input: state.input,
        metadata: stateMetadata(part),
        startedAt: state.status === "running" ? state.time.start : undefined,
      })
    }
  }

  // Child sessions still busy/retrying without an active task part — background
  // subagents whose task part returned early, or promoted foreground tasks.
  const covered = new Set(subagents.map((row) => row.childSessionID).filter(Boolean))
  for (const session of input.sessions) {
    if (session.parentID !== input.sessionID) continue
    if (covered.has(session.id)) continue
    const status = input.status(session.id)
    if (!status || status.type === "idle") continue
    const linked = tasks.get(session.id)
    subagents.push({
      key: session.id,
      childSessionID: session.id,
      description: linked?.description ?? session.title,
      agentType: linked?.agentType,
      background: linked?.background ?? false,
      startedAt: linked?.startedAt ?? session.time.created,
    })
  }

  return { tools, subagents }
}

export const runningWorkCount = (work: RunningWork) => work.tools.length + work.subagents.length
