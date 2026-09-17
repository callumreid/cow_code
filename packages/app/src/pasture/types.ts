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

/** A pull request closed without merging inside the window: its cow burns. */
export type ClosedPullRequest = { repo: string; number: number; closedAt: string }

export const cowID = (pr: { repo: string; number: number }) => `${pr.repo}#${pr.number}`

/** A firing alert, as the desktop reads it from Datadog: one wolf each. */
export type PastureAlert = { id: number; name: string; since: string | null; url: string }

/** An event on the team calendar: while it is on, the barn doors are open. */
export type PastureEvent = { name: string; start: string; end: string; url: string | null; location: string | null }

/**
 * Everything the field needs beyond the herd, read by the desktop on the
 * renderer's behalf: closed PRs (they burn), firing alerts (wolves), the
 * event on right now (the party barn), and who the signed-in person is.
 */
export type PastureExtras = {
  closed: ClosedPullRequest[]
  alerts: PastureAlert[]
  /** Where the alerts live, for the link on the wolves pill. */
  datadogSite: string | null
  party: PastureEvent | null
  upcoming: PastureEvent[]
  login: string | null
  fetchedAt: number
  /** Something went wrong reading one of the sources; the rest is still good. */
  notice?: string
}
