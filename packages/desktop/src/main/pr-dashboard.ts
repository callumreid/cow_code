import { execFile } from "node:child_process"
import {
  derivePrState,
  groupByRepo,
  type MergedPullRequest,
  type OpenPullRequest,
  type PrCheckState,
  type PrDashboard,
  type PrMergedHistory,
  type PrReviewState,
} from "@opencode-ai/app/pr-dashboard/types"

// Electron does not inherit the login shell PATH, so `gh` is not on PATH by
// default. Same list the PR-status badge fetcher uses.
const EXTRA_PATH = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"]

const REFRESH_MS = 15 * 60_000
const MERGED_WINDOW_DAYS = 30
const GH_TIMEOUT_MS = 20_000
const PAGE_SIZE = 100
const MAX_MERGED_PAGES = 5

const OPEN_QUERY = `
query($open: String!) {
  open: search(query: $open, type: ISSUE, first: 50) {
    nodes { ... on PullRequest {
      number title url isDraft createdAt updatedAt
      repository { nameWithOwner }
      reviewDecision
      reviewThreads(first: 50) { nodes { isResolved } }
      commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
    } }
  }
}`

const MERGED_QUERY = `
query($merged: String!, $cursor: String) {
  merged: search(query: $merged, type: ISSUE, first: ${PAGE_SIZE}, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest {
      number title url mergedAt
      repository { nameWithOwner }
    } }
  }
}`

type RawOpen = {
  number: number
  title: string
  url: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
  repository: { nameWithOwner: string }
  reviewDecision: string | null
  reviewThreads: { nodes: { isResolved: boolean }[] }
  commits: { nodes: { commit: { statusCheckRollup: { state: string } | null } }[] }
}

type RawMerged = {
  number: number
  title: string
  url: string
  mergedAt: string
  repository: { nameWithOwner: string }
}

type RawOpenSummary = {
  number: number
  title: string
  url: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
  repository: { nameWithOwner: string }
}

type SearchNode = RawOpen | RawMerged | Record<string, never>

type RawResponse = {
  data?: {
    open?: { nodes?: SearchNode[] }
    merged?: { pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }; nodes?: SearchNode[] }
  }
  errors?: { message?: string }[]
}

// `search` returns a union; the `... on PullRequest` fragment leaves anything
// else as an empty object, so every node is checked before use.
function isRawOpen(node: SearchNode): node is RawOpen {
  return "number" in node && typeof node.number === "number" && "reviewThreads" in node
}

function isRawMerged(node: SearchNode): node is RawMerged {
  return "number" in node && typeof node.number === "number" && "mergedAt" in node
}

function isRawOpenSummary(node: unknown): node is RawOpenSummary {
  if (!node || typeof node !== "object") return false
  const candidate = node as Partial<RawOpenSummary>
  return (
    typeof candidate.number === "number" &&
    typeof candidate.title === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.isDraft === "boolean" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.repository?.nameWithOwner === "string"
  )
}

function reviewState(decision: string | null): PrReviewState {
  if (decision === "APPROVED") return "approved"
  if (decision === "CHANGES_REQUESTED") return "changes-requested"
  if (decision === "REVIEW_REQUIRED") return "review-required"
  return "none"
}

function checkState(state: string | null | undefined): PrCheckState {
  switch (state) {
    case "SUCCESS":
      return "success"
    case "FAILURE":
    case "ERROR":
      return "failure"
    case "PENDING":
    case "EXPECTED":
      return "pending"
    default:
      return "none"
  }
}

function runGh(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "gh",
      args,
      {
        timeout: GH_TIMEOUT_MS,
        maxBuffer: 8 * 1024 * 1024,
        windowsHide: true,
        env: { ...process.env, PATH: `${EXTRA_PATH.join(":")}:${process.env.PATH ?? ""}` },
      },
      (error, stdout, stderr) => {
        if (error) {
          const detail = (stderr || error.message).trim().split("\n")[0]
          return reject(new Error(detail || "gh failed"))
        }
        resolve(stdout)
      },
    )
  })
}

function mergedSince(now: number) {
  return new Date(now - MERGED_WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10)
}

function toOpen(node: RawOpen): OpenPullRequest {
  const unresolvedCount = node.reviewThreads.nodes.reduce((n, t) => (t.isResolved ? n : n + 1), 0)
  const review = reviewState(node.reviewDecision)
  const checks = checkState(node.commits.nodes[0]?.commit?.statusCheckRollup?.state)
  return {
    repo: node.repository.nameWithOwner,
    number: node.number,
    title: node.title,
    url: node.url,
    isDraft: node.isDraft,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    review,
    checks,
    unresolvedCount,
    state: derivePrState({ isDraft: node.isDraft, review, checks, unresolvedCount }),
  }
}

function toOpenSummary(node: RawOpenSummary): OpenPullRequest {
  return {
    repo: node.repository.nameWithOwner,
    number: node.number,
    title: node.title,
    url: node.url,
    isDraft: node.isDraft,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    review: "none",
    checks: "none",
    unresolvedCount: 0,
    state: node.isDraft ? "draft" : "awaiting-review",
    detailsUnavailable: true,
  }
}

export type PrDashboardRunner = (args: string[]) => Promise<string>

/**
 * One `gh api graphql` call per page. Open PRs come back on the first page
 * only; merged pages until the window is exhausted or the page cap is hit.
 *
 * `archived:false` drops PRs in archived repos: they cannot be merged or
 * closed, so listing them as open work is misleading.
 */
export async function fetchPrDashboard(now: number, runner: PrDashboardRunner = runGh): Promise<PrDashboard> {
  let open: OpenPullRequest[]
  let notice: string | undefined
  try {
    open = await fetchOpen("is:pr is:open author:@me archived:false", runner)
  } catch (error) {
    if (!isRateLimitError(error)) throw error
    open = await fetchOpenSummary(runner)
    notice = "GitHub's detailed status API is rate-limited. Showing current pull requests without review or CI details."
  }
  return {
    groups: groupByRepo(open),
    openCount: open.length,
    readyCount: open.filter((pr) => pr.state === "ready").length,
    fetchedAt: now,
    notice,
  }
}

export async function fetchPrMerged(now: number, runner: PrDashboardRunner = runGh): Promise<PrMergedHistory> {
  const result = await fetchMerged(`is:pr is:merged author:@me merged:>=${mergedSince(now)}`, runner)
  return {
    items: result.items,
    fetchedAt: now,
    // Silent truncation would read as "that is all of them".
    truncated: result.truncated ? result.items.length : undefined,
  }
}

async function request(runner: PrDashboardRunner, query: string, fields: string[]) {
  const args = ["api", "graphql", "-f", `query=${query}`]
  for (const field of fields) args.push("-F", field)
  const parsed: RawResponse = JSON.parse(await runner(args))
  if (parsed.errors?.length) throw new Error(parsed.errors[0]?.message ?? "GraphQL error")
  return parsed
}

async function fetchOpen(query: string, runner: PrDashboardRunner): Promise<OpenPullRequest[]> {
  const parsed = await request(runner, OPEN_QUERY, [`open=${query}`])
  const out: OpenPullRequest[] = []
  for (const node of parsed.data?.open?.nodes ?? []) {
    if (!isRawOpen(node)) continue
    out.push(toOpen(node))
  }
  return out
}

function isRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /rate[ _-]?limit|secondary rate/i.test(message)
}

async function fetchOpenSummary(runner: PrDashboardRunner): Promise<OpenPullRequest[]> {
  const raw = await runner([
    "search",
    "prs",
    "--author=@me",
    "--state=open",
    "--archived=false",
    `--limit=${PAGE_SIZE}`,
    "--json=number,title,url,isDraft,createdAt,updatedAt,repository",
  ])
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error("Invalid GitHub pull request search response")
  return parsed.filter(isRawOpenSummary).map(toOpenSummary)
}

async function fetchMerged(query: string, runner: PrDashboardRunner) {
  const items: MergedPullRequest[] = []
  let cursor: string | undefined
  let truncated = false

  for (let page = 0; page < MAX_MERGED_PAGES; page++) {
    const fields = [`merged=${query}`]
    if (cursor) fields.push(`cursor=${cursor}`)
    const parsed = await request(runner, MERGED_QUERY, fields)

    for (const node of parsed.data?.merged?.nodes ?? []) {
      if (!isRawMerged(node)) continue
      items.push({
        repo: node.repository.nameWithOwner,
        number: node.number,
        title: node.title,
        url: node.url,
        mergedAt: node.mergedAt,
      })
    }

    const info = parsed.data?.merged?.pageInfo
    if (!info?.hasNextPage || !info.endCursor) break
    cursor = info.endCursor
    if (page === MAX_MERGED_PAGES - 1) truncated = true
  }

  items.sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
  return { items, truncated }
}

type Cache<T extends { fetchedAt: number }> = { value?: T; inflight?: Promise<T> }

const openCache: Cache<PrDashboard> = {}
const mergedCache: Cache<PrMergedHistory> = {}

export function __resetPrDashboardCache() {
  openCache.value = undefined
  openCache.inflight = undefined
  mergedCache.value = undefined
  mergedCache.inflight = undefined
}

/**
 * Cached read shared by every window.
 *
 * On failure the last good payload is returned with `error` attached rather
 * than throwing, so a dropped network annotates the panel instead of blanking it.
 */
function cachedFetch<T extends { fetchedAt: number; error?: string }>(
  cache: Cache<T>,
  fetcher: () => Promise<T>,
  empty: () => T,
  force: boolean,
  now: number,
): Promise<T> {
  if (!force && cache.value && now - cache.value.fetchedAt < REFRESH_MS) return Promise.resolve(cache.value)
  if (cache.inflight) return cache.inflight

  cache.inflight = fetcher()
    .then((next) => {
      cache.value = next
      return next
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      const fallback = { ...(cache.value ?? empty()), error: message } as T
      cache.value = fallback
      return fallback
    })
    .finally(() => {
      cache.inflight = undefined
    })

  return cache.inflight
}

export function getPrDashboard(force = false, now = Date.now()): Promise<PrDashboard> {
  return cachedFetch(
    openCache,
    () => fetchPrDashboard(now),
    () => ({ groups: [], openCount: 0, readyCount: 0, fetchedAt: now, unavailable: true }),
    force,
    now,
  )
}

export function getPrMerged(force = false, now = Date.now()): Promise<PrMergedHistory> {
  return cachedFetch(
    mergedCache,
    () => fetchPrMerged(now),
    () => ({ items: [], fetchedAt: now }),
    force,
    now,
  )
}
