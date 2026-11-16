export const OPEN_QUERY = `query PastureOpen($query: String!, $cursor: String) {
  prs: search(query: $query, type: ISSUE, first: 100, after: $cursor) {
    issueCount pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest {
      number title url isDraft createdAt updatedAt reviewDecision mergeStateStatus
      isInMergeQueue mergeQueueEntry { position }
      repository { nameWithOwner isArchived } author { login }
      reviewRequests(first: 10) { totalCount }
      latestReviews(first: 10) { nodes { state submittedAt } }
      timelineItems(last: 5, itemTypes: [REVIEW_REQUESTED_EVENT]) {
        nodes { ... on ReviewRequestedEvent { createdAt } }
      }
      reviewThreads(first: 100) { nodes { isResolved } pageInfo { hasNextPage } }
      commits(last: 1) { nodes { commit { committedDate statusCheckRollup { state } } } }
    } }
  }
}`

export const MERGED_QUERY = `query PastureMerged($query: String!, $cursor: String) {
  prs: search(query: $query, type: ISSUE, first: 100, after: $cursor) {
    issueCount pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest {
      number title url updatedAt mergedAt repository { nameWithOwner isArchived } author { login }
    } }
  }
}`

type Pull = {
  number: number
  title: string
  url: string
  repository: { nameWithOwner: string; isArchived?: boolean | null }
  author: { login: string } | null
  isDraft?: boolean
  updatedAt?: string
  mergedAt?: string | null
  reviewDecision?: string | null
  mergeStateStatus?: string | null
  isInMergeQueue?: boolean | null
  mergeQueueEntry?: { position?: number | null } | null
  reviewRequests?: { totalCount: number } | null
  latestReviews?: { nodes: { state: string; submittedAt: string }[] } | null
  timelineItems?: { nodes: { createdAt?: string }[] } | null
  reviewThreads?: { nodes: { isResolved: boolean }[]; pageInfo: { hasNextPage: boolean } } | null
  commits?: { nodes: { commit: { committedDate?: string; statusCheckRollup: { state: string } | null } }[] } | null
}

type SearchPage = {
  issueCount: number
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
  nodes: (Pull | null)[]
}

export type Cow = {
  id: string
  repo: string
  number: number
  title: string
  url: string
  author: string
  pen: "draft" | "awaiting" | "changes" | "ready" | "merged"
  label: string
  tone: "success" | "warning" | "error" | "muted"
  detail: string
  updatedAt: string
  mergedAt?: string
  queued: boolean
}

export type SearchResult = { pulls: Cow[]; total: number; incomplete: boolean }
export type Request = (query: string, variables: { query: string; cursor: string | null }) => Promise<{ status: number; body: string }>

/** The first 100 review threads are useful evidence, but not proof there are no more. */
export function classify(pr: Pull): Cow {
  const repo = pr.repository.nameWithOwner
  const threads = pr.reviewThreads
  const unresolved = threads?.nodes.filter((thread) => !thread.isResolved).length ?? 0
  const threadsIncomplete = !threads || threads.pageInfo.hasNextPage
  const checks = pr.commits?.nodes[0]?.commit.statusCheckRollup?.state
  const failing = checks === "FAILURE" || checks === "ERROR"
  const pending = checks === "PENDING" || checks === "EXPECTED"
  const queued = !!pr.isInMergeQueue || !!pr.mergeQueueEntry
  const changes = (pr.latestReviews?.nodes ?? [])
    .filter((review) => review.state === "CHANGES_REQUESTED")
    .map((review) => Date.parse(review.submittedAt) || 0)
  const lastChanges = Math.max(0, ...changes)
  const lastRequest = Math.max(0, ...(pr.timelineItems?.nodes ?? []).map((event) => Date.parse(event.createdAt ?? "") || 0))
  const head = Date.parse(pr.commits?.nodes[0]?.commit.committedDate ?? "") || 0
  const reRequested = lastChanges > 0 && (lastRequest > lastChanges || (!!pr.reviewRequests?.totalCount && head > lastChanges))

  const details = [
    queued ? (pr.mergeQueueEntry?.position ? `Queue #${pr.mergeQueueEntry.position}` : "In merge queue") : "",
    failing ? "Checks failing" : pending ? "Checks running" : checks === "SUCCESS" ? "Checks passed" : "No reported checks",
    pr.reviewDecision === "APPROVED" ? "Approved" : pr.reviewDecision === "CHANGES_REQUESTED" ? "Changes requested" :
      pr.reviewDecision === "REVIEW_REQUIRED" ? "Needs approval" : "No review decision reported",
    !threads ? "Review threads unavailable" : unresolved ? `${unresolved} unresolved` : "No unresolved comments in loaded threads",
    threadsIncomplete ? "Review threads incomplete" : "",
    pr.mergeStateStatus === "BEHIND" ? "Behind base" : pr.mergeStateStatus === "DIRTY" ? "Merge conflicts" : "",
  ].filter(Boolean)

  const status = pr.mergedAt ? { pen: "merged", label: "Merged", tone: "muted" } :
    pr.isDraft ? { pen: "draft", label: "Draft", tone: "muted" } :
    queued ? { pen: "ready", label: "In merge queue", tone: "success" } :
    pr.reviewDecision === "CHANGES_REQUESTED" ? { pen: "changes", label: reRequested ? "Re-review requested" : "Changes requested", tone: "error" } :
    failing ? { pen: "awaiting", label: "Checks failing", tone: "error" } :
    unresolved ? { pen: "awaiting", label: "Unresolved comments", tone: "warning" } :
    threadsIncomplete ? { pen: "awaiting", label: "Review details incomplete", tone: "warning" } :
    pending ? { pen: "awaiting", label: "Checks running", tone: "warning" } :
    pr.mergeStateStatus === "DIRTY" ? { pen: "awaiting", label: "Merge conflicts", tone: "error" } :
    pr.mergeStateStatus === "BEHIND" ? { pen: "awaiting", label: "Behind base", tone: "warning" } :
    pr.reviewDecision !== "APPROVED" ? { pen: "awaiting", label: "Awaiting review", tone: "warning" } :
    pr.mergeStateStatus === "CLEAN" && (!checks || checks === "SUCCESS") ? { pen: "ready", label: "Ready to merge", tone: "success" } :
    pr.mergeStateStatus === "BLOCKED" ? { pen: "awaiting", label: "Merge blocked", tone: "warning" } :
    { pen: "awaiting", label: "Merge status unavailable", tone: "warning" }

  return {
    id: `${repo}#${pr.number}`,
    repo,
    number: pr.number,
    title: pr.title,
    url: pr.url,
    author: pr.author?.login ?? "unknown",
    pen: status.pen as Cow["pen"],
    label: status.label,
    tone: status.tone as Cow["tone"],
    detail: pr.mergedAt ? `Merged ${new Date(pr.mergedAt).toLocaleString()}` : details.join(" · "),
    updatedAt: pr.updatedAt ?? pr.mergedAt ?? "",
    mergedAt: pr.mergedAt ?? undefined,
    queued,
  }
}

/** Fetch every search page GitHub will return, and make any incomplete result visible. */
export async function searchPulls(request: Request, query: string, merged = false): Promise<SearchResult> {
  const pulls = new Map<string, Cow>()
  const seen = new Set<string>()
  let cursor: string | null = null
  let total = 0
  let incomplete = false

  // GitHub search exposes at most 1,000 results per search.
  for (let page = 0; page < 10; page++) {
    const response = await request(merged ? MERGED_QUERY : OPEN_QUERY, { query, cursor })
    if (response.status !== 200) throw new Error(`GitHub returned HTTP ${response.status}`)
    const value = JSON.parse(response.body) as { data?: { prs?: SearchPage }; errors?: { message: string }[] }
    if (value.errors?.length) throw new Error(value.errors.map((error) => error.message).join("; "))
    const result = value.data?.prs
    if (!result || !Array.isArray(result.nodes) || !result.pageInfo || typeof result.issueCount !== "number") {
      throw new Error("GitHub returned incomplete search data")
    }
    total = result.issueCount
    for (const pr of result.nodes) {
      if (!pr?.repository?.nameWithOwner || !pr.number || !pr.url || !pr.title) {
        incomplete = true
        continue
      }
      if (pr.repository.isArchived) continue
      const cow = classify(pr)
      pulls.set(cow.id, cow)
    }
    if (!result.pageInfo.hasNextPage) return { pulls: [...pulls.values()], total, incomplete: incomplete || total > 1000 }
    cursor = result.pageInfo.endCursor
    if (!cursor || seen.has(cursor)) throw new Error("GitHub did not provide the next search page")
    seen.add(cursor)
  }
  return { pulls: [...pulls.values()], total, incomplete: true }
}

/** Repositories alphabetically; most recently updated PR first within each. */
export function groupByRepo(pulls: Cow[]): { repo: string; pulls: Cow[] }[] {
  const groups = new Map<string, Cow[]>()
  for (const pull of pulls) groups.set(pull.repo, [...(groups.get(pull.repo) ?? []), pull])
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([repo, items]) => ({
      repo,
      pulls: items.sort((left, right) =>
        (right.mergedAt ?? right.updatedAt).localeCompare(left.mergedAt ?? left.updatedAt) || right.number - left.number),
    }))
}
