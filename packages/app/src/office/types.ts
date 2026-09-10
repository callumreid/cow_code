export type OfficeBucket = "needs_you" | "failed" | "review" | "working" | "done"

/** Who may answer a permission: read-only ones silently, reversible ones the farmer, the rest Callum. */
export type OfficeTier = "auto" | "farmer" | "callum"

export type OfficeWaiting =
  | {
      kind: "permission"
      id: string
      permission: string
      patterns: string[]
      always: string[]
      metadata: Record<string, unknown>
      title?: string
      tier?: OfficeTier
    }
  | {
      kind: "question"
      id: string
      questions: Array<{
        question: string
        header: string
        options: Array<{ label: string; description: string }>
        multiple?: boolean
        custom?: boolean
      }>
    }
  | { kind: "error"; message: string }

export type OfficeDecision = {
  id: string
  sessionID: string
  rootSessionID: string
  runID?: string
  waiting: OfficeWaiting
  status: "pending" | "answered" | "reconciliation_required"
  created: number
}
export type OfficeLifecycle = {
  phase: "accepted" | "running" | "waiting" | "stopped" | "failed" | "canceled" | "unknown"
  runID?: string
  reason?: string
  observedAt: number
  outcome: "unverified" | "reported" | "verified"
  evidence: Array<{
    kind: "implementation" | "check" | "shipment" | "runtime"
    reference: string
    status: "reported" | "verified"
  }>
}
export type OfficeOutcome = {
  id: string
  requestID?: string
  clientID?: string
  generation?: number
  sessionID: string
  text: string
  time: number
  reportIDs: string[]
  urgent: boolean
  observations: Array<{ sessionID: string; runID?: string; updated: number }>
}
export type OfficeThread = {
  hostID?: string
  hostName?: string
  availability?: "available" | "stale" | "unavailable"
  lifecycle?: OfficeLifecycle
  decisions?: OfficeDecision[]
  capabilities?: string[]
  objective?: string
  executionID?: string
  routine?: string
  sessionID: string
  directory: string
  projectID: string
  projectName?: string | null
  title: string
  agent?: string | null
  bucket: OfficeBucket
  waiting?: OfficeWaiting | null
  summary: string // one line, <= 160 chars, never empty
  lastText?: string | null // last assistant text, trimmed, <= 600 chars
  lastTool?: string | null
  pr?: string | null // PR url seen in the transcript
  pinned: boolean
  muted: boolean
  source: "cow" | "claude" | "codex" // claude/codex rows are read-only
  time: { created: number; updated: number; reported?: number }
}

export type OfficeReportKind = "finished" | "permission" | "question" | "error" | "pr" | "stalled" | "auto_allowed"
export type OfficeReport = {
  hostID?: string
  hostName?: string
  requestID?: string
  runID?: string
  id: string
  time: number
  sessionID: string
  directory: string
  kind: OfficeReportKind
  title: string
  summary: string
}

export type OfficeState = {
  outcomes?: OfficeOutcome[]
  host?: { id: string; name: string }
  recovery?: Array<{ id: string; kind: string; sessionID?: string }>
  sources?: Record<string, { status: "loading" | "available" | "unavailable"; observedAt: number }>
  epoch?: string
  cursor?: number
  seeded?: boolean
  overseer: { sessionID: string; directory: string } | null
  threads: OfficeThread[]
  reports: OfficeReport[] // newest last, max 100
  counts: Record<OfficeBucket, number>
  autonomy?: "brief" | "act"
  reminders?: Array<{ id: string; due: number; note: string; sessionID?: string | null }>
  updated: number
}

/** `POST /global/office/brief`: `skipped` means nothing happened since `since`, so no farmer turn ran. */
export type OfficeBrief = { text: string; sessionID: string; skipped: boolean }

/** What the user did on a card here, so a resolved card can say so instead of "Handled". */
export type OfficeCardAction = "once" | "always" | "reject" | "answered"

export type VoiceToken = {
  value: string // ephemeral client secret (ek_...)
  expiresAt: number // epoch ms
  model: string // e.g. "gpt-realtime-2.1"
  voice: string // e.g. "marin"
  session: Record<string, unknown> // the exact realtime session object the server registered (instructions, tools, audio) — send as `session.update` after the data channel opens
}
