import { Effect } from "effect"
import type { Session } from "./session"
import type { SessionID } from "./schema"

export function budgetLimit(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.costBudgetUsd
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined
}

export const descendants = Effect.fn("SessionBudget.descendants")(function* (
  sessions: Pick<Session.Interface, "get" | "children">,
  sessionID: SessionID,
) {
  const root = yield* sessions.get(sessionID)
  const result = [root]
  const seen = new Set([root.id])
  for (let index = 0; index < result.length; index++) {
    for (const child of yield* sessions.children(result[index].id)) {
      if (seen.has(child.id)) continue
      seen.add(child.id)
      result.push(child)
    }
  }
  return result
})

/** Check every ancestor allowance, so a delegated task cannot bypass its parent's budget.
 * This pauses between turns; provider requests already in flight can finish above the limit.
 */
export const checkBudget = Effect.fn("SessionBudget.check")(function* (
  sessions: Pick<Session.Interface, "get" | "children">,
  sessionID: SessionID,
) {
  const ancestors = [yield* sessions.get(sessionID)]
  const seen = new Set([sessionID])
  for (let index = 0; index < ancestors.length; index++) {
    const parent = ancestors[index].parentID
    if (!parent || seen.has(parent)) continue
    seen.add(parent)
    ancestors.push(yield* sessions.get(parent))
  }
  for (const ancestor of ancestors) {
    const limit = budgetLimit(ancestor.metadata)
    if (limit === undefined) continue
    const tree = yield* descendants(sessions, ancestor.id)
    const spent = tree.reduce((total, session) => total + (session.cost ?? 0), 0)
    if (spent >= limit) return { rootID: ancestor.id, limit, spent, blocked: true as const }
  }
  return undefined
})
