/**
 * Shared shape for the sidebar pull-request dashboard.
 *
 * Lives in the app package because the preload bridge and the renderer both
 * import it, mirroring how `wsl/types` is shared.
 */

export type PrCheckState = "success" | "failure" | "pending" | "none"

export type PrReviewState = "approved" | "changes-requested" | "review-required" | "none"

/**
 * The single badge shown next to a PR. Ordered by severity when derived:
 * a draft reads as a draft even if CI is red, and a red check outranks a
 * missing review because it blocks regardless of who approves.
 */
export type PrState = "draft" | "changes-requested" | "checks-failing" | "unresolved" | "awaiting-review" | "ready"

export type OpenPullRequest = {
  repo: string
  number: number
  title: string
  url: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
  review: PrReviewState
  checks: PrCheckState
  unresolvedCount: number
  state: PrState
}

export type MergedPullRequest = {
  repo: string
  number: number
  title: string
  url: string
  mergedAt: string
}

export type PrRepoGroup = {
  repo: string
  items: OpenPullRequest[]
}

export type PrDashboard = {
  /** Open PRs grouped by repo. Groups and items are both oldest-first. */
  groups: PrRepoGroup[]
  openCount: number
  readyCount: number
  fetchedAt: number
  /** Set when the fetch failed; previous data is kept so the panel never blanks. */
  error?: string
}

export type PrMergedHistory = {
  /** Merged in the trailing window, newest merge first. */
  items: MergedPullRequest[]
  fetchedAt: number
  /** Count actually returned when the merged window exceeded the page cap. */
  truncated?: number
  error?: string
}

export type PrDashboardPlatform = {
  /** Open PRs. Cheap enough to paint on app start. */
  fetch(force?: boolean): Promise<PrDashboard>
  /** Merged history. Deferred: it pages the whole window and costs seconds. */
  fetchMerged(force?: boolean): Promise<PrMergedHistory>
}

const CHECKS_RANK: Record<PrCheckState, number> = { failure: 0, pending: 1, none: 2, success: 3 }

/**
 * Derive the badge state from the raw signals.
 *
 * Deliberately ordered so the most actionable problem wins. `ready` is only
 * reached when nothing else is outstanding, so a green badge really does mean
 * "nothing is stopping this from merging".
 */
export function derivePrState(pr: {
  isDraft: boolean
  review: PrReviewState
  checks: PrCheckState
  unresolvedCount: number
}): PrState {
  if (pr.isDraft) return "draft"
  if (pr.review === "changes-requested") return "changes-requested"
  if (pr.checks === "failure") return "checks-failing"
  if (pr.unresolvedCount > 0) return "unresolved"
  if (pr.review !== "approved") return "awaiting-review"
  if (CHECKS_RANK[pr.checks] < CHECKS_RANK.none) return "checks-failing"
  return "ready"
}

/** Group open PRs by repo. Items oldest-first; repos ordered by their oldest PR. */
export function groupByRepo(items: OpenPullRequest[]): PrRepoGroup[] {
  const groups = new Map<string, OpenPullRequest[]>()
  for (const item of items) {
    const bucket = groups.get(item.repo)
    if (bucket) bucket.push(item)
    else groups.set(item.repo, [item])
  }
  const result: PrRepoGroup[] = []
  for (const [repo, bucket] of groups) {
    bucket.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    result.push({ repo, items: bucket })
  }
  result.sort((a, b) => {
    const oldest = a.items[0].createdAt.localeCompare(b.items[0].createdAt)
    return oldest !== 0 ? oldest : a.repo.localeCompare(b.repo)
  })
  return result
}
