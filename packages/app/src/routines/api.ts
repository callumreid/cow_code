import { officeFetch, type OfficeFetchInit, type OfficeSdk } from "@/office/api"
import type { RoutinesSnapshot } from "./types"

export type RoutineRunResult = { ok: true } | { error: string }
export type RoutineLog = { path?: string | null; text: string }

async function json<T>(sdk: OfficeSdk, path: string, init?: OfficeFetchInit) {
  const response = await officeFetch(sdk, path, init)
  return (await response.json()) as T
}

function post(body: unknown, init?: OfficeFetchInit): OfficeFetchInit {
  return {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body ?? {}),
  }
}

export function getRoutines(sdk: OfficeSdk, init?: OfficeFetchInit) {
  return json<RoutinesSnapshot>(sdk, "/global/office/routines", init)
}

/** Asks launchd to start the job now; `error` carries launchctl's text. */
export function runRoutine(sdk: OfficeSdk, name: string, init?: OfficeFetchInit) {
  return json<RoutineRunResult>(sdk, "/global/office/routines/run", post({ name }, init))
}

export function routineLog(sdk: OfficeSdk, name: string, lines: number, init?: OfficeFetchInit) {
  return json<RoutineLog>(sdk, "/global/office/routines/log", post({ name, lines }, init))
}
