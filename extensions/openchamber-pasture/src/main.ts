import { connectHost } from "@openchamber/sdk"
import { createPastureScene } from "../../../packages/app/src/pasture/scene"
import { breedFor, cowSeed } from "../../../packages/app/src/pasture/breeds"
import { assignCollars, collarIndex } from "../../../packages/app/src/pasture/collars"
import { sunPosition } from "../../../packages/app/src/pasture/sky"
import { QUERY, parseResponse, type Cow } from "./github"

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const host = connectHost()
const status = element("status")
const tip = element("tip")
const detail = element("detail")
const byID = new Map<string, Cow>()
let selected: string | undefined
let connected = false
let connectionKey: string | undefined
let generation = 0
let loaded = false
let touring = false

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
  if (cow) await host.openUrl(cow.url).catch(() => { status.textContent = "Could not open the PR in OpenChamber." })
}
async function refresh() {
  if (!connected) return
  const current = ++generation
  status.textContent = loaded ? "Refreshing GitHub…" : "Loading your pull requests…"
  const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  try {
    const response = await host.request({ method: "POST", path: "/graphql", body: JSON.stringify({
      query: QUERY,
      variables: { open: "is:pr is:open author:@me sort:updated-desc", merged: `is:pr is:merged author:@me merged:>=${since} sort:updated-desc` },
    }) })
    if (current !== generation) return
    if (response.status !== 200) throw new Error(`GitHub returned HTTP ${response.status}`)
    const result = parseResponse(response.body)
    byID.clear()
    for (const cow of result.cows) byID.set(cow.id, cow)
    const collars = assignCollars(result.cows.map((cow) => cow.author))
    scene.setCows(result.cows.map((cow) => ({ id: cow.id, breed: breedFor(cow), seed: cowSeed(cow), pen: cow.pen, author: cow.author, collar: collarIndex(collars.get(cow.author) ?? ""), queued: false })), loaded)
    if (selected && !byID.has(selected)) select(undefined)
    else if (selected) select(selected)
    loaded = true
    status.textContent = result.notice
  } catch (error) {
    if (current !== generation) return
    status.textContent = `${loaded ? "Refresh failed; showing the last successful herd. " : "Could not load GitHub. "}${error instanceof Error ? error.message : "Please check your connection."}`
  }
}
element("refresh").onclick = () => void refresh()
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
  if (connected && connection.connected) { byID.clear(); scene.setCows([], false); select(undefined); loaded = false }
  connected = connection.connected
  if (!connected) {
    generation++
    byID.clear()
    scene.setCows([], false)
    select(undefined)
    loaded = false
    status.textContent = "Connect a GitHub token in Settings → Integrations → Pasture GitHub."
    return
  }
  void refresh()
})
const timer = window.setInterval(() => void refresh(), 60_000)
window.addEventListener("pagehide", () => { generation++; clearInterval(timer); scene.dispose(); host.dispose() }, { once: true })
