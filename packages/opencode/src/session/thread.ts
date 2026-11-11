import { Effect } from "effect"
import type { Session } from "./session"

/**
 * The thread a session belongs to: its oldest ancestor, the session the app lists as a thread.
 * A subagent session reports its parent's thread.
 */
export const threadRoot = Effect.fn("SessionThread.root")(function* (
  sessions: Pick<Session.Interface, "get">,
  session: Pick<Session.Info, "id" | "parentID">,
) {
  const seen = new Set<string>([session.id])
  let current: Pick<Session.Info, "id" | "parentID"> = session
  while (current.parentID && !seen.has(current.parentID)) {
    seen.add(current.parentID)
    const parent = yield* sessions.get(current.parentID).pipe(Effect.catch(() => Effect.succeed(undefined)))
    if (!parent) break
    current = parent
  }
  return current.id
})

export * as SessionThread from "./thread"
