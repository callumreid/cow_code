import { execFile } from "node:child_process"
import { parsePullRequestUrl } from "./pr-status"

export type PrDetails = {
  owner: string
  repo: string
  number: number
  title: string
  state: "open" | "draft" | "merged" | "closed"
  author: string | null
  avatarUrl: string | null
  additions: number
  deletions: number
  changedFiles: number
  /** Merge time for a merged PR, last activity otherwise. */
  timestamp: number | null
}

const EXTRA_PATH = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"]

type CacheEntry = { details: PrDetails; at: number }
const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<PrDetails | null>>()
// A settled PR only changes cosmetically, so only open ones are re-fetched.
const OPEN_TTL = 5 * 60_000

const QUERY = `query($owner:String!,$repo:String!,$number:Int!){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$number){
      number title state isDraft mergedAt updatedAt
      additions deletions changedFiles
      author{ login avatarUrl }
    }
  }
}`

type GraphResponse = {
  data?: {
    repository?: {
      pullRequest?: {
        number: number
        title: string
        state: string
        isDraft: boolean
        mergedAt: string | null
        updatedAt: string | null
        additions: number
        deletions: number
        changedFiles: number
        author: { login: string; avatarUrl: string } | null
      } | null
    } | null
  }
}

function state(node: { state: string; isDraft: boolean }): PrDetails["state"] {
  if (node.state === "MERGED") return "merged"
  if (node.state === "CLOSED") return "closed"
  if (node.isDraft) return "draft"
  return "open"
}

function runGh(owner: string, repo: string, number: number): Promise<PrDetails | null> {
  return new Promise((resolve) => {
    execFile(
      "gh",
      ["api", "graphql", "-f", `query=${QUERY}`, "-F", `owner=${owner}`, "-F", `repo=${repo}`, "-F", `number=${number}`],
      { timeout: 10_000, env: { ...process.env, PATH: `${EXTRA_PATH.join(":")}:${process.env.PATH ?? ""}` } },
      (error, stdout) => {
        if (error) return resolve(null)
        const node = parse(stdout)?.data?.repository?.pullRequest
        if (!node) return resolve(null)
        const merged = node.mergedAt ? Date.parse(node.mergedAt) : Number.NaN
        const updated = node.updatedAt ? Date.parse(node.updatedAt) : Number.NaN
        const at = Number.isNaN(merged) ? updated : merged
        resolve({
          owner,
          repo,
          number: node.number,
          title: node.title,
          state: state(node),
          author: node.author?.login ?? null,
          avatarUrl: node.author?.avatarUrl ?? null,
          additions: node.additions,
          deletions: node.deletions,
          changedFiles: node.changedFiles,
          timestamp: Number.isNaN(at) ? null : at,
        })
      },
    )
  })
}

function parse(stdout: string): GraphResponse | undefined {
  try {
    const value: unknown = JSON.parse(stdout)
    return value as GraphResponse
  } catch {
    return undefined
  }
}

export function getPrDetails(url: string): Promise<PrDetails | null> {
  const parsed = parsePullRequestUrl(url)
  if (!parsed) return Promise.resolve(null)

  const cached = cache.get(url)
  if (cached && (cached.details.state !== "open" || Date.now() - cached.at < OPEN_TTL))
    return Promise.resolve(cached.details)

  const pending = inflight.get(url)
  if (pending) return pending

  const promise = (async () => {
    const details = await runGh(parsed.owner, parsed.repo, parsed.number)
    inflight.delete(url)
    if (details) cache.set(url, { details, at: Date.now() })
    return details
  })()
  inflight.set(url, promise)
  return promise
}
