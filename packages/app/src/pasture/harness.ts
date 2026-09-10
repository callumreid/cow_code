// Dev-only harness for the pasture scene: fake cows, manual transfers.
import { BREEDS, hashString } from "./breeds"
import { PENS, type PenID } from "./pens"
import { createPastureScene, type CowSpec } from "./scene"

// Hidden browser tabs pause requestAnimationFrame, so the harness drives the
// scene by hand: `advance(seconds)` runs the frames synchronously on a fake clock.
const pending: FrameRequestCallback[] = []
let fake = performance.now()
performance.now = () => fake
window.requestAnimationFrame = (cb: FrameRequestCallback) => {
  pending.push(cb)
  return pending.length
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
const make = (pen: PenID): CowSpec => {
  const id = `coval-ai/backend#${7000 + counter++}`
  return { id, breed: BREEDS[hashString(id) % BREEDS.length], seed: hashString(id + "seed"), pen }
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
  onSelect: (id) => {
    scene.select(id)
    log(`select ${id ?? "nothing"}`)
  },
  onOpen: (id) => log(`open ${id}`),
})
scene.setCows(specs, false)
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
const selectOne = () => {
  const cow = specs.find((s) => s.pen === "awaiting") ?? specs[0]
  scene.select(cow.id)
  log(`select ${cow.id}`)
}
document.getElementById("move")!.onclick = move
document.getElementById("arrive")!.onclick = arrive
document.getElementById("depart")!.onclick = depart
document.getElementById("select")!.onclick = selectOne
;(window as unknown as { harness: unknown }).harness = { move, arrive, depart, selectOne, advance, scene, specs: () => specs }
log("ready")
