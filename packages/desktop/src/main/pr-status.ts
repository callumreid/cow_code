import { execFile } from "node:child_process"

export type PrStatus = "open" | "merged" | "closed"

const PATTERN = /^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/

export function parsePullRequestUrl(value: string) {
  const match = value.match(PATTERN)
  if (!match) return
  return { owner: match[1], repo: match[2], number: Number(match[3]) }
}

const EXTRA_PATH = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"]

type CacheEntry = { status: PrStatus; at: number }
const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<PrStatus | null>>()
const OPEN_TTL = 5 * 60_000

function runGh(owner: string, repo: string, number: number): Promise<PrStatus | null> {
  const jq = 'if .merged_at then "merged" elif .state == "closed" then "closed" else "open" end'
  return new Promise((resolve) => {
    execFile(
      "gh",
      ["api", `repos/${owner}/${repo}/pulls/${number}`, "--jq", jq],
      { timeout: 10_000, env: { ...process.env, PATH: `${EXTRA_PATH.join(":")}:${process.env.PATH ?? ""}` } },
      (error, stdout) => {
        if (error) return resolve(null)
        const value = stdout.trim()
        resolve(value === "merged" || value === "closed" || value === "open" ? value : null)
      },
    )
  })
}

async function fetchPublic(owner: string, repo: string, number: number): Promise<PrStatus | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, {
      headers: { accept: "application/vnd.github+json", "user-agent": "opencode-desktop" },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { state?: string; merged_at?: string | null }
    if (data.merged_at) return "merged"
    if (data.state === "closed") return "closed"
    if (data.state === "open") return "open"
    return null
  } catch {
    return null
  }
}

export function getPrStatus(url: string): Promise<PrStatus | null> {
  const parsed = parsePullRequestUrl(url)
  if (!parsed) return Promise.resolve(null)

  const cached = cache.get(url)
  if (cached && (cached.status !== "open" || Date.now() - cached.at < OPEN_TTL)) return Promise.resolve(cached.status)

  const pending = inflight.get(url)
  if (pending) return pending

  const promise = (async () => {
    const status = (await runGh(parsed.owner, parsed.repo, parsed.number)) ?? (await fetchPublic(parsed.owner, parsed.repo, parsed.number))
    inflight.delete(url)
    if (status) cache.set(url, { status, at: Date.now() })
    return status
  })()
  inflight.set(url, promise)
  return promise
}
