export type PastureScope = "mine" | "everyone"

export type PastureTimeframe = { id: "day" | "week" | "month" | "quarter"; label: string; days: number }

export const PASTURE_TIMEFRAMES: PastureTimeframe[] = [
  { id: "day", label: "Today", days: 1 },
  { id: "week", label: "This week", days: 7 },
  { id: "month", label: "This month", days: 30 },
  { id: "quarter", label: "This quarter", days: 90 },
]

/** One merged pull request, which becomes one cow. */
export type PasturePullRequest = {
  repo: string
  number: number
  title: string
  url: string
  mergedAt: string
  author: string
  authorAvatar?: string | null
  mergedBy?: string | null
  additions: number
  deletions: number
  changedFiles: number
  base: string
  labels: string[]
}

export type PastureRequest = { days: number; scope: PastureScope }

export type PastureHerd = {
  items: PasturePullRequest[]
  fetchedAt: number
  days: number
  scope: PastureScope
  /** Count actually returned when the window held more merges than the page cap. */
  truncated?: number
  error?: string
}
