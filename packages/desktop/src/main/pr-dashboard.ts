import { execFile } from "node:child_process"
import {
  derivePrState,
  type PrAutomationKey,
  groupByRepo,
  type MergedPullRequest,
  type OpenPullRequest,
  type PrCheckState,
  type PrDashboard,
  type PrMergedHistory,
  type PrReviewState,
} from "@opencode-ai/app/pr-dashboard/types"
import type { PastureHerd, PasturePullRequest, PastureRequest } from "@opencode-ai/app/pasture/types"

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
      repository { nameWithOwner isArchived }
      reviewDecision mergeStateStatus isInMergeQueue autoMergeRequest { enabledAt }
      mergeQueueEntry { position state }
      labels(first: 30) { nodes { name } }
      reviewRequests(first: 10) { totalCount }
      latestReviews(first: 10) { nodes { state submittedAt } }
      timelineItems(last: 5, itemTypes: [REVIEW_REQUESTED_EVENT]) { nodes { ... on ReviewRequestedEvent { createdAt } } }
      reviewThreads(first: 50) { nodes { isResolved } }
      commits(last: 1) { nodes { commit { committedDate statusCheckRollup { state } } } }
    } }
  }
}`

const MERGED_QUERY = `
query($merged: String!, $cursor: String) {
  merged: search(query: $merged, type: ISSUE, first: ${PAGE_SIZE}, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest {
      number title url mergedAt
      repository { nameWithOwner isArchived }
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
  repository: { nameWithOwner: string; isArchived?: boolean | null }
  reviewDecision: string | null
  mergeStateStatus?: string | null
  isInMergeQueue?: boolean | null
  autoMergeRequest?: { enabledAt?: string | null } | null
  mergeQueueEntry?: { position?: number | null; state?: string | null } | null
  labels?: { nodes?: { name: string }[] } | null
  reviewRequests?: { totalCount?: number } | null
  latestReviews?: { nodes?: { state: string; submittedAt: string }[] } | null
  timelineItems?: { nodes?: ({ createdAt?: string } | Record<string, never>)[] } | null
  reviewThreads: { nodes: { isResolved: boolean }[] }
  commits: { nodes: { commit: { committedDate?: string; statusCheckRollup: { state: string } | null } }[] }
}

type RawMerged = {
  number: number
  title: string
  url: string
  mergedAt: string
  repository: { nameWithOwner: string; isArchived?: boolean | null }
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

export const AUTOMATION_LABELS: Record<PrAutomationKey, string> = {
  keepUpdated: "cow:no-update",
  autoFix: "cow:no-autofix",
  merge: "cow:merge",
}
/** keep-updated and auto-fix are on unless their label opts the PR out; merge is off unless its label opts in. */
export const AUTOMATION_LABEL_MEANS_ON: Record<PrAutomationKey, boolean> = {
  keepUpdated: false,
  autoFix: false,
  merge: true,
}

/**
 * "Changes requested, then Callum pushed or re-requested" — the reviewer's turn again.
 * GitHub keeps reviewDecision at CHANGES_REQUESTED until the reviewer comes back, so this is
 * derived from timestamps: a review request or head commit newer than the last change request.
 */
function reRequestedAfterChanges(node: RawOpen): boolean {
  const changes = (node.latestReviews?.nodes ?? []).filter((r) => r.state === "CHANGES_REQUESTED").map((r) => Date.parse(r.submittedAt))
  if (!changes.length) return false
  const lastChanges = Math.max(...changes)
  const requests = (node.timelineItems?.nodes ?? []).map((n) => ("createdAt" in n && n.createdAt ? Date.parse(n.createdAt) : 0))
  const lastRequest = requests.length ? Math.max(...requests) : 0
  const head = Date.parse(node.commits.nodes[0]?.commit?.committedDate ?? "") || 0
  const pending = (node.reviewRequests?.totalCount ?? 0) > 0
  return lastRequest > lastChanges || (pending && head > lastChanges)
}

function toOpen(node: RawOpen): OpenPullRequest {
  const unresolvedCount = node.reviewThreads.nodes.reduce((n, t) => (t.isResolved ? n : n + 1), 0)
  const review = reviewState(node.reviewDecision)
  const checks = checkState(node.commits.nodes[0]?.commit?.statusCheckRollup?.state)
  const labels = (node.labels?.nodes ?? []).map((l) => l.name)
  const inMergeQueue = !!node.isInMergeQueue || !!node.mergeQueueEntry
  const reRequested = reRequestedAfterChanges(node)
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
    inMergeQueue,
    mergeQueuePosition: node.mergeQueueEntry?.position ?? undefined,
    behind: node.mergeStateStatus === "BEHIND",
    reRequested,
    autoMerge: !!node.autoMergeRequest,
    automation: {
      keepUpdated: !labels.includes(AUTOMATION_LABELS.keepUpdated),
      autoFix: !labels.includes(AUTOMATION_LABELS.autoFix),
      merge: labels.includes(AUTOMATION_LABELS.merge),
    },
    state: derivePrState({ isDraft: node.isDraft, review, checks, unresolvedCount, inMergeQueue, reRequested }),
  }
}

/** Flip a per-PR automation switch by adding/removing its label; creates the label in the repo if needed. */
export async function setPrAutomation(
  repo: string,
  number: number,
  key: PrAutomationKey,
  on: boolean,
  runner: PrDashboardRunner = runGh,
): Promise<void> {
  const label = AUTOMATION_LABELS[key]
  const add = on === AUTOMATION_LABEL_MEANS_ON[key]
  if (!add) {
    await runner(["api", "-X", "DELETE", `repos/${repo}/issues/${number}/labels/${encodeURIComponent(label)}`]).catch((error: Error) => {
      if (!/404|not found/i.test(error.message)) throw error
    })
    return
  }
  const description = AUTOMATION_LABEL_MEANS_ON[key]
    ? "cow box: merge this PR (or queue it) once it is green, approved and comment-free; retry after a merge-queue bounce"
    : "cow box: automation switched off for this PR"
  await runner(["label", "create", label, "-R", repo, "--color", AUTOMATION_LABEL_MEANS_ON[key] ? "2DA44E" : "5B6A5F", "--description", description, "--force"]).catch(() => undefined)
  await runner(["api", "-X", "POST", `repos/${repo}/issues/${number}/labels`, "-f", `labels[]=${label}`])
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
    inMergeQueue: false,
    behind: false,
    reRequested: false,
    autoMerge: false,
    automation: { keepUpdated: true, autoFix: true, merge: false },
    state: node.isDraft ? "draft" : "awaiting-review",
    detailsUnavailable: true,
  }
}

export type PrDashboardRunner = (args: string[]) => Promise<string>

const PASTURE_PAGE_SIZE = 50
const MAX_PASTURE_PAGES = 6
const PASTURE_CACHE_MS = 2 * 60_000
const PASTURE_QUERY = `
query($q: String!, $cursor: String) {
  search(query: $q, type: ISSUE, first: ${PASTURE_PAGE_SIZE}, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number title url mergedAt additions deletions changedFiles baseRefName
        author { login avatarUrl }
        mergedBy { login }
        repository { nameWithOwner isArchived }
        labels(first: 10) { nodes { name } }
      }
    }
  }
}`

type RawPasture = {
  number: number
  title: string
  url: string
  mergedAt: string
  additions?: number | null
  deletions?: number | null
  changedFiles?: number | null
  baseRefName?: string | null
  author?: { login?: string | null; avatarUrl?: string | null } | null
  mergedBy?: { login?: string | null } | null
  repository: { nameWithOwner: string; isArchived?: boolean | null }
  labels?: { nodes?: { name: string }[] | null } | null
}

function isRawPasture(node: unknown): node is RawPasture {
  return !!node && typeof node === "object" && "mergedAt" in node && "number" in node && "repository" in node
}

/** One cow per merged PR: Callum's merges inside the window, newest first. */
export async function fetchPrPasture(input: PastureRequest, now: number, runner: PrDashboardRunner = runGh): Promise<PastureHerd> {
  const days = Math.max(1, Math.min(366, Math.floor(input.days) || 7))
  const since = new Date(now - days * 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z")
  // The pasture is Callum's own herd: only PRs he authored, whatever the caller asks for.
  const query = `is:pr is:merged org:coval-ai author:@me merged:>=${since} sort:updated-desc`
  const items: PasturePullRequest[] = []
  let cursor: string | undefined
  let truncated = false
  for (let page = 0; page < MAX_PASTURE_PAGES; page++) {
    const fields = [`q=${query}`]
    if (cursor) fields.push(`cursor=${cursor}`)
    const parsed = (await request(runner, PASTURE_QUERY, fields)) as {
      data?: { search?: { pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }; nodes?: unknown[] } }
    }
    for (const node of parsed.data?.search?.nodes ?? []) {
      if (!isRawPasture(node) || node.repository.isArchived) continue
      items.push({
        repo: node.repository.nameWithOwner,
        number: node.number,
        title: node.title,
        url: node.url,
        mergedAt: node.mergedAt,
        author: node.author?.login ?? "unknown",
        authorAvatar: node.author?.avatarUrl ?? null,
        mergedBy: node.mergedBy?.login ?? null,
        additions: node.additions ?? 0,
        deletions: node.deletions ?? 0,
        changedFiles: node.changedFiles ?? 0,
        base: node.baseRefName ?? "main",
        labels: (node.labels?.nodes ?? []).map((label) => label.name),
      })
    }
    const info = parsed.data?.search?.pageInfo
    if (!info?.hasNextPage || !info.endCursor) break
    cursor = info.endCursor
    if (page === MAX_PASTURE_PAGES - 1) truncated = true
  }
  items.sort((a, b) => Date.parse(b.mergedAt) - Date.parse(a.mergedAt))
  return { items, fetchedAt: now, days, scope: "mine", truncated: truncated ? items.length : undefined }
}

const pastureCache = new Map<string, { at: number; value: Promise<PastureHerd> }>()

export function getPrPasture(input: PastureRequest, force = false): Promise<PastureHerd> {
  const key = `${input.days}:${input.scope}`
  const now = Date.now()
  const cached = pastureCache.get(key)
  if (!force && cached && now - cached.at < PASTURE_CACHE_MS) return cached.value
  const value = fetchPrPasture(input, now).catch((error: Error) => {
    pastureCache.delete(key)
    throw error
  })
  pastureCache.set(key, { at: now, value })
  return value
}

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
    // GitHub search ignores archived:false for pull requests; drop them here.
    if (node.repository.isArchived) continue
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
      if (node.repository.isArchived) continue
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
