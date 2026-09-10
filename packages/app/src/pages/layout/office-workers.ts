import type { Session } from "@opencode-ai/sdk/v2/client"
import { pathKey } from "@/utils/path-key"
import type { OfficeThread } from "@/office/types"

/** A session the farmer dispatched from the office; the office control tags them. */
export const isOfficeWorkerSession = (session: Session) => typeof session.metadata?.officeCommandID === "string"

/** Worktrees the server creates for a project live under `…/opencode/worktree/<projectID>/`. */
export function isWorktreeOf(directory: string, projectID: string | undefined) {
  return !!projectID && directory.includes(`/worktree/${projectID}/`)
}

/**
 * Office threads that belong in a project's normal session list: every
 * dispatched worker when the project is the office's own, otherwise the
 * workers running in that project's worktrees. Routine runs stay in the
 * Scheduled view, and directories the list already covers are skipped.
 */
export function officeWorkerThreads(input: {
  threads: OfficeThread[]
  project: { worktree: string; id?: string }
  officeDirectory?: string
  listed: string[]
}) {
  const home = !!input.officeDirectory && pathKey(input.project.worktree) === pathKey(input.officeDirectory)
  const listed = new Set(input.listed.map(pathKey))
  return input.threads.filter((thread) => {
    if (thread.source !== "cow" || thread.routine || listed.has(pathKey(thread.directory))) return false
    return home || isWorktreeOf(thread.directory, input.project.id)
  })
}

/** Whether a directory is where one of the farmer's workers runs. */
export function isWorkerDirectory(directory: string, threads: OfficeThread[]) {
  const key = pathKey(directory)
  return threads.some((thread) => thread.source === "cow" && !thread.routine && pathKey(thread.directory) === key)
}
