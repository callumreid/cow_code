import type { Routine, RoutineRun } from "./types"

export function routineHealth(routine: Routine, now: number) {
  if (!routine.loaded) return "disabled" as const
  const run = routine.running
  if (run) {
    if (run.status === "waiting") return "waiting" as const
    if (run.status === "failed") return "failed" as const
    if (run.lastProgressAt && now - run.lastProgressAt > 15 * 60_000) return "stalled" as const
    return "running" as const
  }
  const due = routine.previousRunAt
  const attempt = Math.max(...routine.runs.map((run) => run.startedAt), routine.last?.startedAt ?? 0)
  if (due && now - due > 2 * 60_000 && attempt < due - 90_000) return "missed" as const
  if (routine.last?.status === "failed") return "failed" as const
  if (!routine.last) return "unknown" as const
  return routine.last.outcome === "verified" ? ("verified" as const) : ("unverified" as const)
}

export function lastVerified(routine: Routine): RoutineRun | undefined {
  return [routine.last, ...routine.runs]
    .filter((run): run is RoutineRun => !!run)
    .filter((run) => run.outcome === "verified" && run.status === "ok")
    .sort((a, b) => b.startedAt - a.startedAt)[0]
}
