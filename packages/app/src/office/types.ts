export type OfficeBucket = "needs_you" | "failed" | "review" | "working" | "done"

export type OfficeWaiting =
  | { kind: "permission"; id: string; permission: string; patterns: string[]; always: string[]; metadata: Record<string, unknown>; title?: string }
  | { kind: "question"; id: string; questions: Array<{ question: string; header: string; options: Array<{ label: string; description: string }>; multiple?: boolean; custom?: boolean }> }
  | { kind: "error"; message: string }

export type OfficeThread = {
  sessionID: string
  directory: string
  projectID: string
  projectName?: string | null
  title: string
  agent?: string | null
  bucket: OfficeBucket
  waiting?: OfficeWaiting | null
  summary: string          // one line, <= 160 chars, never empty
  lastText?: string | null // last assistant text, trimmed, <= 600 chars
  lastTool?: string | null
  pr?: string | null       // PR url seen in the transcript
  pinned: boolean
  muted: boolean
  source: "cow" | "claude" // "claude" rows are read-only (stretch goal)
  time: { created: number; updated: number; reported?: number }
}

export type OfficeReportKind = "finished" | "permission" | "question" | "error" | "pr" | "stalled" | "auto_allowed"
export type OfficeReport = { id: string; time: number; sessionID: string; directory: string; kind: OfficeReportKind; title: string; summary: string }

export type OfficeState = {
  overseer: { sessionID: string; directory: string } | null
  threads: OfficeThread[]
  reports: OfficeReport[]                 // newest last, max 100
  counts: Record<OfficeBucket, number>
  autonomy?: "brief" | "act"
  reminders?: Array<{ id: string; due: number; note: string; sessionID?: string | null }>
  updated: number
}

export type VoiceToken = {
  value: string          // ephemeral client secret (ek_...)
  expiresAt: number      // epoch ms
  model: string          // e.g. "gpt-realtime-2.1"
  voice: string          // e.g. "marin"
  session: Record<string, unknown>  // the exact realtime session object the server registered (instructions, tools, audio) — send as `session.update` after the data channel opens
}
