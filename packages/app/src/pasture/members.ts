import type { OpenPullRequest, PrState } from "@/pr-dashboard/types"
import { breedFor, cowID, cowSeed, type Breed } from "./breeds"
import { penForState, type PenID } from "./pens"
import type { PasturePullRequest } from "./types"

/** One cow on the field: an open pull request in a stage pen, or a merged one out back. */
export type PastureMember =
  | { id: string; kind: "open"; pen: PenID; breed: Breed; seed: number; pr: OpenPullRequest; held: boolean }
  | { id: string; kind: "merged"; pen: "merged"; breed: Breed; seed: number; pr: PasturePullRequest }

export const PR_STATE_LABEL: Record<PrState, string> = {
  ready: "Ready to merge",
  "merge-queue": "In merge queue",
  "re-requested": "Re-review requested",
  draft: "Draft",
  "changes-requested": "Changes requested",
  "checks-failing": "Checks not green",
  unresolved: "Unresolved comments",
  "awaiting-review": "Awaiting review",
}

/**
 * How long a cow whose PR vanished from the open list stays in its pen,
 * waiting for the merged search to catch up. GitHub's search index lags a
 * merge by a minute or two; past this we assume the PR was closed and the
 * hand of god takes the cow away.
 */
export const LIMBO_MS = 3 * 60_000

export type Held = { pr: OpenPullRequest; since: number }
export type Limbo = Map<string, Held>

/**
 * Advance the limbo: open PRs that dropped out of `open` since `previous` are
 * held; anything that reappears, shows up merged, or times out is let go.
 */
export function advanceLimbo(limbo: Limbo, previous: OpenPullRequest[], open: OpenPullRequest[], merged: Set<string>, now: number): Limbo {
  const next: Limbo = new Map()
  const current = new Set(open.map(cowID))
  for (const [id, held] of limbo) {
    if (current.has(id) || merged.has(id) || now - held.since > LIMBO_MS) continue
    next.set(id, held)
  }
  for (const pr of previous) {
    const id = cowID(pr)
    if (current.has(id) || merged.has(id) || next.has(id)) continue
    next.set(id, { pr, since: now })
  }
  return next
}

/** Merged first (capped), then live open PRs, then the held ones. Ids are unique; merged wins a tie. */
export function buildMembers(open: OpenPullRequest[], merged: PasturePullRequest[], limbo: Limbo, cap: number): PastureMember[] {
  const members: PastureMember[] = []
  const seen = new Set<string>()
  for (const pr of merged.slice(0, cap)) {
    const id = cowID(pr)
    if (seen.has(id)) continue
    seen.add(id)
    members.push({ id, kind: "merged", pen: "merged", breed: breedFor(pr), seed: cowSeed(pr), pr })
  }
  for (const pr of open) {
    const id = cowID(pr)
    if (seen.has(id)) continue
    seen.add(id)
    members.push({ id, kind: "open", pen: penForState(pr.state), breed: breedFor(pr), seed: cowSeed(pr), pr, held: false })
  }
  for (const [id, held] of limbo) {
    if (seen.has(id)) continue
    seen.add(id)
    members.push({ id, kind: "open", pen: penForState(held.pr.state), breed: breedFor(held.pr), seed: cowSeed(held.pr), pr: held.pr, held: true })
  }
  return members
}

export function penCounts(members: PastureMember[]): Record<PenID, number> {
  const counts: Record<PenID, number> = { draft: 0, awaiting: 0, changes: 0, ready: 0, merged: 0 }
  for (const member of members) counts[member.pen]++
  return counts
}

/** A one-line status for an open PR's cow: stage, then whatever is holding it up. */
export function openDetail(pr: OpenPullRequest): string {
  const parts = [PR_STATE_LABEL[pr.state]]
  if (pr.state === "merge-queue" && pr.mergeQueuePosition) parts.push(`position ${pr.mergeQueuePosition}`)
  if (pr.state !== "draft") {
    if (pr.review === "approved") parts.push("approved")
    else if (pr.review === "changes-requested" && pr.state !== "changes-requested") parts.push("changes requested")
    if (pr.checks === "failure") parts.push("CI failing")
    else if (pr.checks === "pending") parts.push("CI running")
    else if (pr.checks === "success") parts.push("CI green")
    if (pr.unresolvedCount > 0 && pr.state !== "unresolved") parts.push(`${pr.unresolvedCount} unresolved`)
    else if (pr.state === "unresolved") parts.push(`${pr.unresolvedCount} unresolved`)
  }
  if (pr.behind) parts.push("behind base")
  if (pr.autoMerge) parts.push("auto-merge armed")
  return parts.join(" · ")
}
