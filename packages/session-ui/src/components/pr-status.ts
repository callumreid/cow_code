export type PrStatus = "open" | "merged" | "closed"

type Fetcher = (url: string) => Promise<PrStatus | null>

const PATTERN = /^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/

export function parsePullRequestUrl(value: string) {
  const match = value.match(PATTERN)
  if (!match) return
  return { owner: match[1], repo: match[2], number: Number(match[3]) }
}

async function publicFetch(url: string): Promise<PrStatus | null> {
  const parsed = parsePullRequestUrl(url)
  if (!parsed) return null
  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`, {
      headers: { accept: "application/vnd.github+json" },
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

let fetcher: Fetcher = publicFetch

export function setPrStatusFetcher(next?: Fetcher) {
  if (next) fetcher = next
}

const statusCache = new Map<string, PrStatus>()
const inflight = new Set<string>()

function applyStatus(url: string, status: PrStatus) {
  statusCache.set(url, status)
  const nodes = document.querySelectorAll<HTMLElement>(`[data-pr-url="${CSS.escape(url)}"]`)
  for (const node of nodes) {
    node.dataset.prStatus = status
    node.textContent = status
  }
}

export function resolvePrStatus(url: string) {
  const cached = statusCache.get(url)
  if (cached) return cached
  if (inflight.has(url)) return
  inflight.add(url)
  void fetcher(url)
    .then((status) => {
      inflight.delete(url)
      if (status) applyStatus(url, status)
    })
    .catch(() => {
      inflight.delete(url)
    })
}

export function decoratePrLinks(root: HTMLElement) {
  const links = Array.from(root.querySelectorAll("a.external-link"))
  for (const link of links) {
    if (link.querySelector("[data-pr-status]")) continue
    const href = link.getAttribute("href") ?? ""
    if (!parsePullRequestUrl(href)) continue

    const status = statusCache.get(href)
    const badge = document.createElement("span")
    badge.className = "pr-status"
    badge.setAttribute("data-pr-url", href)
    badge.dataset.prStatus = status ?? "pending"
    badge.textContent = status ?? ""
    link.appendChild(badge)
    resolvePrStatus(href)
  }
}
