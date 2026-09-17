import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { parseMonitors } from "@opencode-ai/app/pasture/datadog-parse"
import { activeEvents, parseICS, parseManualEvents, upcomingEvents, type PartyEvent } from "@opencode-ai/app/pasture/events"
import type { ClosedPullRequest, PastureAlert, PastureExtras, PastureRequest } from "@opencode-ai/app/pasture/types"
import { request, runGh, type PrDashboardRunner } from "./pr-dashboard"

/**
 * The field's extras, read on the renderer's behalf: pull requests closed
 * without merging (their cows burn), Datadog monitors in alert (wolves), the
 * event on right now (the party barn), and who is signed in to gh.
 *
 * Keys and feeds come from `~/.config/cow/pasture.json`:
 *
 *   { "eventsIcs": ["https://api.lu.ma/ics/get?entity=calendar&id=cal-..."],
 *     "events": [{ "name": "Launch party", "start": "2026-09-20T18:00:00-07:00", "end": "2026-09-20T21:00:00-07:00" }],
 *     "datadog": { "apiKey": "...", "appKey": "...", "site": "us5.datadoghq.com", "query": "status:alert" } }
 *
 * or the same-named environment variables (PASTURE_EVENTS_ICS, PASTURE_EVENTS,
 * DD_API_KEY, DD_APP_KEY, DD_SITE, DD_MONITOR_QUERY). Nothing configured means
 * no wolves and no party; the closed PRs and the login always work.
 */
type Datadog = { apiKey: string; appKey: string; site: string; query: string }
type Config = { eventsIcs: string[]; events?: string; datadog?: Datadog }

const CONFIG_PATH = join(homedir(), ".config", "cow", "pasture.json")
/** The most wolves the field will hold at once, however bad the day is. */
const WOLF_CAP = 8
const CLOSED_CACHE_MS = 2 * 60_000
const ALERTS_CACHE_MS = 60_000
const EVENTS_CACHE_MS = 10 * 60_000
const CONFIG_CACHE_MS = 60_000

const CLOSED_QUERY = `
query($closed: String!) {
  closed: search(query: $closed, type: ISSUE, first: 100) {
    nodes { ... on PullRequest {
      number closedAt
      repository { nameWithOwner isArchived }
    } }
  }
}`

type RawClosed = { number: number; closedAt: string; repository: { nameWithOwner: string; isArchived?: boolean | null } }

const isRawClosed = (node: unknown): node is RawClosed => !!node && typeof node === "object" && "closedAt" in node && "number" in node && "repository" in node

const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : typeof value === "string"
      ? value.split(/[\s,]+/).filter(Boolean)
      : []

let configCache: { at: number; value: Promise<Config> } | undefined

async function readConfig(now: number): Promise<Config> {
  if (configCache && now - configCache.at < CONFIG_CACHE_MS) return configCache.value
  const value = (async (): Promise<Config> => {
    let raw: Record<string, unknown> = {}
    try {
      raw = JSON.parse(await readFile(CONFIG_PATH, "utf8")) as Record<string, unknown>
    } catch {
      // No file: the environment is the only source.
    }
    const dd = (raw.datadog && typeof raw.datadog === "object" ? raw.datadog : {}) as Record<string, unknown>
    const text = (value: unknown, fallback: string | undefined) => (typeof value === "string" && value ? value : fallback)
    const apiKey = text(dd.apiKey, process.env.DD_API_KEY)
    const appKey = text(dd.appKey, process.env.DD_APP_KEY)
    return {
      eventsIcs: [...list(raw.eventsIcs), ...list(process.env.PASTURE_EVENTS_ICS)].filter((url) => /^https?:\/\//.test(url)),
      events: raw.events !== undefined ? JSON.stringify(raw.events) : process.env.PASTURE_EVENTS,
      datadog:
        apiKey && appKey
          ? {
              apiKey,
              appKey,
              site: text(dd.site, process.env.DD_SITE) ?? "datadoghq.com",
              query: text(dd.query, process.env.DD_MONITOR_QUERY) ?? "status:alert",
            }
          : undefined,
    }
  })()
  configCache = { at: now, value }
  return value
}

/** PRs the signed-in person closed without merging inside the window. */
export async function fetchClosed(days: number, now: number, runner: PrDashboardRunner = runGh): Promise<ClosedPullRequest[]> {
  const window = Math.max(1, Math.min(366, Math.floor(days) || 1))
  const since = new Date(now - window * 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z")
  const query = `is:pr is:closed is:unmerged org:coval-ai author:@me closed:>=${since} sort:updated-desc`
  const parsed = (await request(runner, CLOSED_QUERY, [`closed=${query}`])) as unknown as { data?: { closed?: { nodes?: unknown[] } } }
  const out: ClosedPullRequest[] = []
  for (const node of parsed.data?.closed?.nodes ?? []) {
    if (!isRawClosed(node) || node.repository.isArchived) continue
    out.push({ repo: node.repository.nameWithOwner, number: node.number, closedAt: node.closedAt })
  }
  return out
}

async function fetchAlerts(datadog: Datadog): Promise<PastureAlert[]> {
  const url = new URL(`https://api.${datadog.site}/api/v1/monitor/search`)
  url.searchParams.set("query", datadog.query)
  url.searchParams.set("per_page", "100")
  const response = await fetch(url, {
    headers: { "DD-API-KEY": datadog.apiKey, "DD-APPLICATION-KEY": datadog.appKey, accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Datadog ${response.status}`)
  return parseMonitors(await response.json(), datadog.site).slice(0, WOLF_CAP)
}

async function fetchEvents(config: Config): Promise<PartyEvent[]> {
  const feeds = await Promise.allSettled(
    config.eventsIcs.map(async (feed) => {
      const response = await fetch(feed, { signal: AbortSignal.timeout(8000), headers: { accept: "text/calendar, text/plain;q=0.8, */*;q=0.5" } })
      if (!response.ok) throw new Error(`${feed}: ${response.status}`)
      return parseICS(await response.text())
    }),
  )
  if (feeds.length && feeds.every((result) => result.status === "rejected")) throw (feeds[0] as PromiseRejectedResult).reason
  const fromFeeds = feeds.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
  return [...fromFeeds, ...parseManualEvents(config.events)].sort((a, b) => a.start.localeCompare(b.start))
}

let loginCache: Promise<string | null> | undefined
function fetchLogin(runner: PrDashboardRunner = runGh): Promise<string | null> {
  if (!loginCache) {
    loginCache = runner(["api", "user", "--jq", ".login"])
      .then((out) => out.trim() || null)
      .catch(() => {
        loginCache = undefined
        return null
      })
  }
  return loginCache
}

type Cached<T> = { at: number; value: Promise<T> }
const closedCache = new Map<number, Cached<ClosedPullRequest[]>>()
let alertsCache: Cached<PastureAlert[]> | undefined
let eventsCache: Cached<PartyEvent[]> | undefined

function remember<T>(cached: Cached<T> | undefined, ttl: number, now: number, force: boolean, load: () => Promise<T>): Cached<T> {
  if (!force && cached && now - cached.at < ttl) return cached
  return { at: now, value: load() }
}

/** Everything the field needs beyond the herd; a source that fails is reported in `notice` and answers empty. */
export async function getPastureExtras(input: PastureRequest, force = false): Promise<PastureExtras> {
  const now = Date.now()
  const config = await readConfig(now)
  const days = Math.max(1, Math.floor(input.days) || 1)
  const closed = remember(closedCache.get(days), CLOSED_CACHE_MS, now, force, () => fetchClosed(days, now))
  closedCache.set(days, closed)
  alertsCache = remember(alertsCache, ALERTS_CACHE_MS, now, force, () => (config.datadog ? fetchAlerts(config.datadog) : Promise.resolve([])))
  eventsCache = remember(eventsCache, EVENTS_CACHE_MS, now, force, () => (config.eventsIcs.length || config.events ? fetchEvents(config) : Promise.resolve([])))
  const [closedResult, alertsResult, eventsResult, login] = await Promise.all([
    closed.value.catch((error: Error) => {
      closedCache.delete(days)
      throw error
    }),
    alertsCache.value.catch((error: Error) => {
      alertsCache = undefined
      throw error
    }).then((value) => ({ ok: true as const, value }), (error: Error) => ({ ok: false as const, error })),
    eventsCache.value.catch((error: Error) => {
      eventsCache = undefined
      throw error
    }).then((value) => ({ ok: true as const, value }), (error: Error) => ({ ok: false as const, error })),
    fetchLogin(),
  ])
  const notices: string[] = []
  if (!alertsResult.ok) notices.push(`alerts: ${alertsResult.error.message}`)
  if (!eventsResult.ok) notices.push(`events: ${eventsResult.error.message}`)
  const events = eventsResult.ok ? eventsResult.value : []
  return {
    closed: closedResult,
    alerts: alertsResult.ok ? alertsResult.value : [],
    datadogSite: config.datadog?.site ?? null,
    party: activeEvents(events, now)[0] ?? null,
    upcoming: upcomingEvents(events, now, 3),
    login,
    fetchedAt: now,
    notice: notices.length ? notices.join(" · ") : undefined,
  }
}
