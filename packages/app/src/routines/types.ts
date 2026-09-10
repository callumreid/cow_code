export type RoutineRunStatus = "ok" | "failed" | "skipped" | "locked" | "running" | "waiting" | "canceled" | "unknown"

export type RoutineRun = {
  executionID?: string
  correlation?: "exact" | "heuristic" | "unmatched"
  processStatus?: RoutineRunStatus
  agentStatus?: string
  outcome?: "unverified" | "reported" | "verified"
  startedAt: number
  endedAt?: number | null
  status: RoutineRunStatus
  rc?: number | null
  summary?: string | null
  /** The office thread the run produced (agent jobs), for opening it. */
  sessionID?: string | null
  directory?: string | null
}

export type Routine = {
  name: string
  label: string
  title: string
  description?: string | null
  kind: "llm" | "shell"
  model?: string | null
  schedule: string
  loaded: boolean
  nextRunAt?: number | null
  running?: RoutineRun | null
  last?: RoutineRun | null
  runs: RoutineRun[] // newest first, at most 20
  lastExitCode?: number | null
  log?: string | null
}

export type RoutineService = {
  name: string
  label: string
  title: string
  running: boolean
  pid?: number | null
  lastExitCode?: number | null
}

/** `GET /global/office/routines`: `available` is false off macOS or with no user LaunchAgents. */
export type RoutinesSnapshot = {
  available: boolean
  host: string
  now: number
  routines: Routine[]
  services: RoutineService[]
}
