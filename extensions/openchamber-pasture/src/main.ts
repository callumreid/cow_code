import { connectHost } from "@openchamber/sdk"
import { applyHostReady, mountTabs } from "@openchamber/sdk/ui"
import { createPastureScene } from "../../../packages/app/src/pasture/scene"
import { breedFor, cowSeed } from "../../../packages/app/src/pasture/breeds"
import { assignCollars, collarIndex } from "../../../packages/app/src/pasture/collars"
import { sunPosition } from "../../../packages/app/src/pasture/sky"
import { groupByRepo, searchPulls, type Cow, type Request, type SearchResult } from "./github"

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const host = connectHost()
const status = element("status")
const tip = element("tip")
const detail = element("detail")
const history = element<HTMLDetailsElement>("history")
const byID = new Map<string, Cow>()
let selected: string | undefined
let connected = false
let connectionKey: string | undefined
let generation = 0
let historyGeneration = 0
let loaded = false
let touring = false
let view = "pasture"
let openResult: SearchResult | undefined
let fieldMerged: SearchResult | undefined
let historyResult: SearchResult | undefined
let historyLoading = false
let historyQueued = false
let historyError = ""
let fetchedAt = 0
let lastError = ""
let mergedError = ""
let refreshing = false
let refreshQueued = false

const tabs = mountTabs(element("view-tabs"), {
  items: [{ id: "pasture", label: "Pasture" }, { id: "list", label: "PR list" }],
  activeId: view,
  trackBackground: true,
  onChange(next) {
    view = next
    tabs.update({ activeId: view })
    element("field").hidden = view !== "pasture"
    element("field-help").hidden = view !== "pasture"
    element("tour").hidden = view !== "pasture"
    element("list").hidden = view !== "list"
    renderStatus()
  },
})
host.onReady((context) => applyHostReady(context, document.documentElement))

const scene = createPastureScene(element<HTMLCanvasElement>("scene"), {
  onHover(target) {
    const cow = target?.kind === "cow" ? byID.get(target.id) : undefined
    tip.hidden = !cow
    tip.textContent = cow ? `${cow.title} · ${cow.id} · ${cow.detail}` : ""
  },
  onSelect(target) {
    if (target?.kind === "critter") {
      const line = scene.poke(target.id)
      if (line) { tip.hidden = false; tip.textContent = line }
      return
    }
    select(target?.id)
  },
  onOpen(id) { void open(id) },
})
const sun = sunPosition(new Date())
scene.setSky({ altitude: sun.altitude, azimuth: sun.azimuth, weather: null })

function select(id?: string) {
  selected = id
  scene.select(id)
  const cow = id ? byID.get(id) : undefined
  detail.hidden = !cow
  if (!cow) return
  element("title").textContent = cow.title
  element("meta").textContent = `${cow.id} · ${cow.author} · ${cow.pen}`
  element("explanation").textContent = cow.detail
}

async function open(id?: string) {
  const cow = id ? byID.get(id) : undefined
  if (cow) await openPull(cow)
}

async function openPull(cow: Cow) {
  await host.openUrl(cow.url).catch(() => { status.textContent = "Could not open the PR in OpenChamber." })
}

const request: Request = async (query, variables) => host.request({
  method: "POST",
  path: "/graphql",
  body: JSON.stringify({ query, variables }),
})

function since(days: number) {
  return new Date(Date.now() - days * 864e5).toISOString().slice(0, 10)
}

function renderStatus() {
  if (!connected) {
    status.textContent = "Connect a GitHub token in Settings → Integrations → Pasture GitHub."
    return
  }
  if (!openResult) {
    status.textContent = lastError || "Loading your pull requests…"
    return
  }
  const notices = [
    lastError ? `Open PR refresh failed; showing the last successful results. ${lastError}` :
      `${openResult.pulls.length} open · updated ${new Date(fetchedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
    openResult.incomplete ? "Some open PRs could not be loaded; GitHub search may be limited." : "",
    view === "pasture" && mergedError ? `Recent merges could not be refreshed. ${mergedError}` : "",
    view === "pasture" && fieldMerged?.incomplete ? "Some recent merges could not be loaded." : "",
    view === "pasture" && openResult.pulls.length + (fieldMerged?.pulls.length ?? 0) > 150 ?
      "The field shows up to 150 cows; the PR list shows open PRs separately." : "",
  ].filter(Boolean)
  status.textContent = notices.join(" · ")
}

function relativeTime(value: string) {
  const elapsed = Date.now() - Date.parse(value)
  if (!Number.isFinite(elapsed)) return ""
  if (elapsed < 60_000) return "just now"
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`
  return `${Math.floor(elapsed / 86_400_000)}d ago`
}

function renderGroups(target: HTMLElement, pulls: Cow[], empty: string) {
  const active = document.activeElement instanceof HTMLElement && target.contains(document.activeElement)
    ? document.activeElement.dataset.prId
    : undefined
  target.replaceChildren()
  if (!pulls.length) {
    const message = document.createElement("p")
    message.className = "empty"
    message.textContent = empty
    target.append(message)
    return
  }
  for (const group of groupByRepo(pulls)) {
    const section = document.createElement("section")
    section.className = "repo"
    const heading = document.createElement("h3")
    heading.className = "repo-heading"
    heading.textContent = group.repo
    const count = document.createElement("span")
    count.className = "repo-count"
    count.textContent = String(group.pulls.length)
    heading.append(count)
    const rows = document.createElement("div")
    rows.className = "rows"
    for (const pull of group.pulls) {
      const row = document.createElement("button")
      row.type = "button"
      row.className = "pr-row"
      row.dataset.prId = pull.id
      row.addEventListener("click", () => void openPull(pull))
      const state = document.createElement("span")
      state.className = "pr-state"
      state.dataset.tone = pull.tone
      state.textContent = pull.label
      const main = document.createElement("span")
      main.className = "pr-main"
      const name = document.createElement("span")
      name.className = "pr-name"
      const number = document.createElement("span")
      number.className = "pr-number"
      number.textContent = `#${pull.number}`
      name.append(number, document.createTextNode(pull.title))
      const explanation = document.createElement("span")
      explanation.className = "pr-detail"
      explanation.textContent = pull.detail
      main.append(name, explanation)
      const time = document.createElement("span")
      time.className = "pr-time"
      time.textContent = relativeTime(pull.mergedAt ?? pull.updatedAt)
      if (pull.mergedAt ?? pull.updatedAt) time.title = new Date(pull.mergedAt ?? pull.updatedAt).toLocaleString()
      row.append(state, main, time)
      rows.append(row)
    }
    section.append(heading, rows)
    target.append(section)
  }
  if (active) [...target.querySelectorAll<HTMLButtonElement>(".pr-row")].find((row) => row.dataset.prId === active)?.focus({ preventScroll: true })
}

function renderOpen() {
  element("open-count").textContent = openResult ? `${openResult.pulls.length} open · newest updates first` : ""
  renderGroups(
    element("open-list"),
    openResult?.pulls ?? [],
    !connected ? "Connect Pasture GitHub in Settings → Integrations to see your PRs." :
      lastError && !openResult ? "Could not load your PRs. Use Refresh to try again." :
      openResult ? "No open pull requests." : "Loading your pull requests…",
  )
}

function renderHistory() {
  element("history-count").textContent = historyLoading ? " · refreshing…" :
    historyResult ? ` · ${historyResult.pulls.length}` : ""
  const target = element("history-list")
  renderGroups(target, historyResult?.pulls ?? [], historyLoading ? "Loading recent merges…" :
    historyError ? `Could not load recent merges. ${historyError} Use Refresh to try again.` : "No pull requests merged in the last 30 days.")
  const notice = [
    historyError && historyResult ? `Refresh failed; showing the last successful results. ${historyError}` : "",
    historyResult?.incomplete ? "Some merges could not be loaded; GitHub search may be limited." : "",
  ].filter(Boolean).join(" ")
  if (notice) {
    const message = document.createElement("p")
    message.className = "empty"
    message.textContent = notice
    target.prepend(message)
  }
}

async function refresh() {
  if (!connected) return
  if (refreshing) {
    refreshQueued = true
    return
  }
  refreshing = true
  const current = ++generation
  status.textContent = loaded ? "Refreshing GitHub…" : "Loading your pull requests…"
  try {
    const [openPulls, mergedPulls] = await Promise.allSettled([
      searchPulls(request, "is:pr is:open author:@me archived:false sort:updated-desc"),
      searchPulls(request, `is:pr is:merged author:@me merged:>=${since(7)} sort:updated-desc`, true),
    ])
    if (current !== generation) return
    if (openPulls.status === "fulfilled") {
      openResult = openPulls.value
      fetchedAt = Date.now()
      lastError = ""
    } else {
      lastError = openPulls.reason instanceof Error ? openPulls.reason.message : "Please check your connection."
    }
    if (mergedPulls.status === "fulfilled") {
      fieldMerged = mergedPulls.value
      mergedError = ""
    } else {
      mergedError = mergedPulls.reason instanceof Error ? mergedPulls.reason.message : "Please check your connection."
    }
    if (openResult) {
      const cows = [...openResult.pulls, ...(fieldMerged?.pulls ?? [])].slice(0, 150)
      byID.clear()
      for (const cow of cows) byID.set(cow.id, cow)
      const collars = assignCollars(cows.map((cow) => cow.author))
      scene.setCows(cows.map((cow) => ({
        id: cow.id, breed: breedFor(cow), seed: cowSeed(cow), pen: cow.pen,
        author: cow.author, collar: collarIndex(collars.get(cow.author) ?? ""), queued: cow.queued,
      })), loaded)
      if (selected && !byID.has(selected)) select(undefined)
      else if (selected) select(selected)
      loaded = true
    }
    renderStatus()
    renderOpen()
  } finally {
    refreshing = false
    if (refreshQueued && connected) {
      refreshQueued = false
      void refresh()
    }
  }
}

async function loadHistory(force = false) {
  if (!connected || (historyResult && !force)) return
  if (historyLoading) {
    if (force) historyQueued = true
    return
  }
  const current = ++historyGeneration
  historyLoading = true
  historyError = ""
  renderHistory()
  try {
    const result = await searchPulls(request, `is:pr is:merged author:@me merged:>=${since(30)} sort:updated-desc`, true)
    if (current !== historyGeneration) return
    historyResult = result
  } catch (error) {
    if (current !== historyGeneration) return
    historyError = error instanceof Error ? error.message : "Please check your connection."
  }
  if (current !== historyGeneration) return
  historyLoading = false
  renderHistory()
  const queued = historyQueued
  historyQueued = false
  if (queued && connected && history.open) void loadHistory(true)
}

element("refresh").onclick = () => {
  void refresh()
  if (history.open) void loadHistory(true)
}
history.addEventListener("toggle", () => { if (history.open) void loadHistory() })
element("tour").onclick = (event) => {
  touring = !touring
  scene.setTour(touring)
  ;(event.currentTarget as HTMLButtonElement).setAttribute("aria-pressed", String(touring))
}
element("down").onclick = () => select(undefined)
element("open").onclick = () => void open(selected)
element("moo").onclick = () => {
  const cow = selected ? byID.get(selected) : undefined
  if (!cow) return
  const audio = new Audio("moo.mp3")
  audio.preservesPitch = false
  audio.playbackRate = Math.min(1.5, Math.max(0.7, 1.05 / Math.max(0.6, breedFor(cow).size)))
  void audio.play().catch(() => { status.textContent = "Sound could not be played in this panel." })
}
window.addEventListener("keydown", (event) => { if (event.key === "Escape") select(undefined) })
host.onConnection((connection) => {
  const key = JSON.stringify(connection)
  if (connectionKey === key) return
  connectionKey = key
  generation++
  historyGeneration++
  connected = connection.connected
  byID.clear()
  scene.setCows([], false)
  select(undefined)
  loaded = false
  openResult = undefined
  fieldMerged = undefined
  historyResult = undefined
  historyLoading = false
  historyQueued = false
  historyError = ""
  lastError = ""
  mergedError = ""
  refreshQueued = false
  renderStatus()
  renderOpen()
  renderHistory()
  if (!connected) return
  void refresh()
  if (history.open) void loadHistory()
})
const timer = window.setInterval(() => {
  void refresh()
  if (history.open) void loadHistory(true)
}, 60_000)
window.addEventListener("pagehide", () => {
  connected = false
  refreshQueued = false
  historyQueued = false
  generation++
  historyGeneration++
  clearInterval(timer)
  scene.dispose()
  tabs.dispose()
  host.dispose()
}, { once: true })
