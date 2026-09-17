// Dev-only harness for the pasture scene: fake cows, manual transfers, every effect on a button.
import { BREEDS, hashString } from "./breeds"
import { PENS, type PenID } from "./pens"
import { createPastureScene, type CowSpec } from "./scene"
import { sunPosition } from "./sky"

// Hidden browser tabs pause requestAnimationFrame, so the harness can drive the
// scene by hand: `advance(seconds)` runs the frames synchronously on a fake clock.
// Live tabs keep the real clock unless `?fake=1` is on the URL.
const pending: FrameRequestCallback[] = []
let fake = performance.now()
const fakeClock = new URLSearchParams(location.search).get("fake") === "1"
if (fakeClock) {
  performance.now = () => fake
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    pending.push(cb)
    return pending.length
  }
}
const advance = (seconds: number) => {
  const frames = Math.max(1, Math.round(seconds * 60))
  for (let i = 0; i < frames; i++) {
    fake += 1000 / 60
    for (const cb of pending.splice(0)) cb(fake)
  }
  return pending.length
}

const canvas = document.getElementById("c") as HTMLCanvasElement
const status = document.getElementById("status")!
const logEl = document.getElementById("log")!
const lines: string[] = []
const log = (line: string) => {
  lines.unshift(`${new Date().toLocaleTimeString()} ${line}`)
  logEl.textContent = lines.slice(0, 6).join("\n")
}

let counter = 0
const make = (pen: PenID, queued = false): CowSpec => {
  const id = `coval-ai/backend#${7000 + counter++}`
  return { id, breed: BREEDS[hashString(id) % BREEDS.length], seed: hashString(id + "seed"), pen, author: "callumreid", collar: 4, queued }
}
let specs: CowSpec[] = [
  ...Array.from({ length: 14 }, () => make("merged")),
  ...Array.from({ length: 3 }, () => make("draft")),
  ...Array.from({ length: 4 }, () => make("awaiting")),
  ...Array.from({ length: 2 }, () => make("changes")),
  ...Array.from({ length: 2 }, () => make("ready")),
]

const scene = createPastureScene(canvas, {
  onHover: () => {},
  onSelect: (target) => {
    if (!target || target.kind === "cow") {
      scene.select(target?.id)
      log(`select ${target?.id ?? "nothing"}`)
      return
    }
    const line = scene.poke(target.id)
    log(`poke ${target.id}${line ? `: ${line}` : ""}`)
  },
  onOpen: (id) => log(`open ${id}`),
  onCarry: (id) => log(`carry ${id}`),
  onBurn: (id) => log(`burn ${id}`),
  onUpsidedown: (stage) => log(`upsidedown ${stage ?? "over"}`),
})
scene.setCows(specs, false)
const sun = sunPosition(new Date())
scene.setSky({ altitude: sun.altitude, azimuth: sun.azimuth, weather: null })
const order: PenID[] = PENS.map((pen) => pen.id)
const summary = () => {
  const counts = Object.fromEntries(order.map((pen) => [pen, specs.filter((s) => s.pen === pen).length]))
  status.textContent = JSON.stringify(counts)
}
summary()

const move = () => {
  const open = specs.filter((s) => s.pen !== "merged")
  if (!open.length) return log("nothing open to move")
  const cow = open[Math.floor(Math.random() * open.length)]
  const from = cow.pen
  cow.pen = order[order.indexOf(cow.pen) + 1] ?? "merged"
  specs = specs.map((s) => (s.id === cow.id ? { ...cow } : s))
  scene.setCows(specs, true)
  summary()
  log(`move ${cow.id} ${from} → ${cow.pen}`)
}
const arrive = () => {
  const cow = make("draft")
  specs = [...specs, cow]
  scene.setCows(specs, true)
  summary()
  log(`arrive ${cow.id} (draft)`)
}
const depart = () => {
  const open = specs.filter((s) => s.pen !== "merged")
  if (!open.length) return log("nothing open to remove")
  const cow = open[0]
  specs = specs.filter((s) => s.id !== cow.id)
  scene.setCows(specs, true)
  summary()
  log(`depart ${cow.id} (${cow.pen})`)
}
const burn = () => {
  const open = specs.filter((s) => s.pen !== "merged")
  if (!open.length) return log("nothing open to burn")
  const cow = open[open.length - 1]
  scene.burn(cow.id)
  specs = specs.filter((s) => s.id !== cow.id)
  scene.setCows(specs, true)
  summary()
  log(`burn ${cow.id} (${cow.pen})`)
}
const queue = () => {
  const cow = specs.find((s) => s.pen === "ready" && !s.queued) ?? specs.find((s) => s.pen !== "merged" && !s.queued)
  if (!cow) return log("nothing to queue")
  specs = specs.map((s) => (s.id === cow.id ? { ...s, queued: true } : s))
  scene.setCows(specs, false)
  log(`queue ${cow.id}`)
}
const selectOne = () => {
  const cow = specs.find((s) => s.pen === "awaiting") ?? specs[0]
  scene.select(cow.id)
  log(`select ${cow.id}`)
}
let wolves = 0
const wolf = () => {
  wolves = (wolves + 1) % 4
  scene.setWolves(Array.from({ length: wolves }, (_, i) => ({ id: i + 1, name: `Test alert ${i + 1}`, since: null, url: "#" })))
  log(`wolves ${wolves}`)
}
let party = false
const togglePartyBarn = () => {
  party = !party
  scene.setParty(party)
  log(`party ${party ? "on" : "off"}`)
}
let tour = false
const toggleTour = () => {
  tour = !tour
  scene.setTour(tour)
  log(`tour ${tour ? "on" : "off"}`)
}
const flip = () => {
  scene.upsidedownNow()
  log("upsidedown time")
}
const night = () => {
  scene.setSky({ altitude: -30, azimuth: 300, weather: null })
  log("night")
}
const rain = () => {
  scene.setSky({ altitude: 35, azimuth: 200, weather: { cloudCover: 0.95, precipitation: "rain", intensity: 2, fog: false, thunder: false, temperatureF: 55, windKph: 20, code: 63, fetchedAt: 0 } })
  log("rain")
}
const day = () => {
  scene.setSky({ altitude: 55, azimuth: 180, weather: null })
  log("day")
}
const bind = (id: string, fn: () => void) => {
  const el = document.getElementById(id)
  if (el) el.onclick = fn
}
bind("move", move)
bind("arrive", arrive)
bind("depart", depart)
bind("burn", burn)
bind("queue", queue)
bind("select", selectOne)
bind("wolf", wolf)
bind("party", togglePartyBarn)
bind("tour", toggleTour)
bind("flip", flip)
bind("night", night)
bind("rain", rain)
bind("day", day)
;(window as unknown as { harness: unknown }).harness = {
  move, arrive, depart, burn, queue, selectOne, wolf, party: togglePartyBarn, tour: toggleTour, flip, night, rain, day, advance, scene, specs: () => specs,
}
log("ready")
