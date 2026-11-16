export const QUERY = `query Pasture($open: String!, $merged: String!) {
  open: search(query: $open, type: ISSUE, first: 100) {
    issueCount pageInfo { hasNextPage }
    nodes { ... on PullRequest {
      number title url isDraft reviewDecision mergeStateStatus
      repository { nameWithOwner } author { login }
      reviewThreads(first: 100) { nodes { isResolved } pageInfo { hasNextPage } }
      commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
    } }
  }
  merged: search(query: $merged, type: ISSUE, first: 100) {
    issueCount pageInfo { hasNextPage }
    nodes { ... on PullRequest { number title url mergedAt repository { nameWithOwner } author { login } } }
  }
}`

type Pull = {
  number: number; title: string; url: string; repository: { nameWithOwner: string }; author: { login: string } | null
  isDraft?: boolean; reviewDecision?: string | null; mergeStateStatus?: string; mergedAt?: string
  reviewThreads?: { nodes: { isResolved: boolean }[]; pageInfo: { hasNextPage: boolean } }
  commits?: { nodes: { commit: { statusCheckRollup: { state: string } | null } }[] }
}
type Search = { issueCount: number; pageInfo: { hasNextPage: boolean }; nodes: Pull[] }
export type Cow = { id: string; repo: string; number: number; title: string; url: string; author: string; pen: "draft" | "awaiting" | "changes" | "ready" | "merged"; detail: string }

export function classify(pr: Pull): Cow {
  const repo = pr.repository.nameWithOwner
  const threads = pr.reviewThreads
  const unresolved = threads?.nodes.filter((thread) => !thread.isResolved).length ?? 0
  const checks = pr.commits?.nodes[0]?.commit.statusCheckRollup?.state
  const pen = pr.mergedAt ? "merged" : pr.isDraft ? "draft" : pr.reviewDecision === "CHANGES_REQUESTED" ? "changes" :
    pr.reviewDecision === "APPROVED" && pr.mergeStateStatus === "CLEAN" && threads && !threads.pageInfo.hasNextPage && unresolved === 0 && (!checks || checks === "SUCCESS") ? "ready" : "awaiting"
  const detail = pr.mergedAt ? `Merged ${new Date(pr.mergedAt).toLocaleString()}` : [
    pr.reviewDecision?.replaceAll("_", " ").toLowerCase() ?? "review pending",
    `merge: ${(pr.mergeStateStatus ?? "unknown").toLowerCase()}`,
    checks ? `checks: ${checks.toLowerCase()}` : "no reported checks",
    threads?.pageInfo.hasNextPage ? "review threads incomplete" : `${unresolved} unresolved threads`,
  ].join(" · ")
  return { id: `${repo}#${pr.number}`, repo, number: pr.number, title: pr.title, url: pr.url, author: pr.author?.login ?? "unknown", pen, detail }
}

export function parseResponse(body: string): { cows: Cow[]; notice: string } {
  const value = JSON.parse(body) as { data?: { open: Search; merged: Search }; errors?: { message: string }[] }
  if (value.errors?.length || !value.data?.open || !value.data?.merged) throw new Error(value.errors?.map((error) => error.message).join("; ") || "GitHub returned incomplete data")
  const { open, merged } = value.data
  const cows = [...open.nodes, ...merged.nodes].filter((pr) => pr?.repository && pr.number && pr.url).map(classify).slice(0, 150)
  const limited = open.pageInfo.hasNextPage || merged.pageInfo.hasNextPage || open.issueCount + merged.issueCount > 150
  return { cows, notice: limited ? `Showing ${cows.length} of ${open.issueCount + merged.issueCount} PRs; GitHub search or field limit reached.` : `${open.issueCount} open · ${merged.issueCount} merged in the last 7 days` }
}
