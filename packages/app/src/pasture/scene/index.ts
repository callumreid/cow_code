import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { mulberry32 } from "@/pasture/rng"
import { penFor, type PenID } from "../pens"
import { paintSign } from "./atlas"
import { buildCow, disposeCow, gripHeight, headHeight, type CowParts, type CowSpec } from "./cow"
import { wolfFor, type AlertSummary } from "../wolves"
import { createCritters } from "./critters"
import { BURN_SECONDS, createFire, createScorch, disposeFire, stepFire, stepScorch, type Fire, type Scorch } from "./fire"
import { buildHand, curlHand } from "./hand"
import { buildUfo, stepUfo, UFO_HOVER } from "./ufo"
import { POND, buildScenery, inPond } from "./scenery"
import { createTour } from "./tour"
import { createUpsidedown, type UpsidedownStage } from "./upsidedown"

export type { UpsidedownStage } from "./upsidedown"
import type { SkyState } from "./weather"

export type { CowSpec } from "./cow"

/** What the pointer is over: a cow (a pull request) or one of the field's residents. */
export type PickTarget = { kind: "cow"; id: string } | { kind: "critter"; id: string }

/**
 * The pasture: five fenced pens on a green field (drafts, awaiting review,
 * changes requested, ready to merge across the front; merged behind), a
 * pond, trees, a barn and drifting clouds, and one cow per pull request.
 * Cows wander, graze and idle inside their pen; a selected cow is lifted off
 * the ground with its legs dangling. When a pull request changes stage, the
 * hand of god comes down, picks the cow up and carries it to its new pen;
 * new pull requests are lowered in from the sky and closed ones are taken up.
 * Everything is built from primitives and canvas textures: nothing to ship.
 */

export type PastureEvents = {
  /** Pointer is over a cow or a critter (or left one); x/y are client coordinates. */
  onHover(target: PickTarget | undefined, x: number, y: number): void
  onSelect(target: PickTarget | undefined): void
  onOpen(id: string): void
  /** The hand of god has just taken hold of a cow (a move, an arrival or a departure). */
  onCarry?(id: string): void
  /** A cow has just caught fire (its pull request was closed). */
  onBurn?(id: string): void
  /** Upsidedown time is announced, under way, fading out, being put right, or (undefined) over. */
  onUpsidedown?(stage: UpsidedownStage | undefined): void
}

export type PastureScene = {
  /** `animate` plays the hand of god for the differences; otherwise the field just updates. */
  setCows(specs: CowSpec[], animate: boolean): void
  setSign(pen: PenID, name: string): void
  select(id: string | undefined): void
  /** Dim every cow whose author is not in the set; `undefined` clears it. */
  setFilter(authors: Set<string> | undefined): void
  /** Pixel position (relative to the canvas) above a cow's or a critter's head, for labels. */
  screenPosition(id: string): { x: number; y: number } | undefined
  /** Click a critter: the farmer stops and tells you off (his line comes back); a pet hops. */
  poke(id: string): string | undefined
  /** Put the camera on a cow or a critter, `distance` away along the current view direction. */
  focus(id: string, distance?: number): boolean
  /** One wolf per firing alert, prowling outside the fences; an empty list sends them away. */
  setWolves(alerts: AlertSummary[]): void
  /** The pull request was closed: the cow burns where it stands and is gone in a few seconds. */
  burn(id: string): boolean
  /** How often the saucer does the carrying: one transfer in `odds` (1 = every time, 0 = never). */
  setUfoOdds(odds: number): void
  /** The real sky: where the sun is and what the weather is doing. */
  setSky(state: SkyState): void
  /** The screensaver camera tour: on, the camera drifts between shots whenever nobody is touching it. */
  setTour(on: boolean): void
  /** Put the camera exactly here, looking exactly there (for films and screenshots). */
  setCamera(position: [number, number, number], target: [number, number, number]): void
  /** An event is on: the barn doors open and the disco ball comes out (or goes away). */
  setParty(on: boolean): void
  /** Seconds of tour between upsidedown times (0 = never). */
  setUpsidedownEvery(seconds: number): void
  /** Upsidedown time, right now. */
  upsidedownNow(): void
  dispose(): void
}

const TAU = Math.PI * 2
const SKY_Y = 34
const CARRY_Y = 11
const MAX_ANIMATED_CHANGES = 8
/** One transfer in this many is done by the saucer instead of the hand. */
const UFO_ODDS = 10
const MAX_SHADOWS = 400

const ease = (u: number) => u * u * (3 - 2 * u)

function lerpAngle(from: number, to: number, amount: number) {
  let delta = ((to - from + Math.PI) % TAU) - Math.PI
  if (delta < -Math.PI) delta += TAU
  return from + delta * Math.min(1, amount)
}

function randomPointIn(pen: PenID, rand: () => number, inset = 1.8) {
  const { rect } = penFor(pen)
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = rect.x0 + inset + rand() * (rect.x1 - rect.x0 - inset * 2)
    const z = rect.z0 + inset + rand() * (rect.z1 - rect.z0 - inset * 2)
    if (!inPond(x, z)) return { x, z }
  }
  return { x: (rect.x0 + rect.x1) / 2, z: (rect.z0 + rect.z1) / 2 }
}

type Cow = {
  spec: CowSpec
  parts: CowParts
  pen: PenID
  pendingPen?: PenID
  x: number
  z: number
  heading: number
  target: { x: number; z: number }
  mode: "walk" | "graze" | "idle"
  timer: number
  walkPhase: number
  phase: number
  lift: number
  graze: number
  selected: boolean
  carried: boolean
  hidden: boolean
  leaving: boolean
  dimmed: boolean
  burning?: { t: number; fire: Fire }
  rand: () => number
}

type Transfer = { kind: "move"; id: string; to: PenID } | { kind: "arrive"; id: string } | { kind: "depart"; id: string }

type Phase = "descend" | "grab" | "lift" | "travel" | "lower" | "release" | "ascend" | "carry-up" | "carry-down"

type Active = {
  transfer: Transfer
  phase: Phase
  /** Who is doing the carrying. */
  vehicle: "hand" | "ufo"
  t: number
  from: { x: number; z: number }
  to: { x: number; z: number }
  cow: Cow
}

export function createPastureScene(canvas: HTMLCanvasElement, events: PastureEvents): PastureScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const scenery = buildScenery(scene)
  const hand = buildHand()
  scene.add(hand.group)
  const ufo = buildUfo()
  scene.add(ufo.group)
  let transfers = 0
  let ufoOdds = UFO_ODDS
  /** Every ufoOdds-th transfer, on a fixed per-session offset so a fresh page does not always open with a saucer. */
  const ufoOffset = Math.floor(Math.random() * UFO_ODDS)
  const nextVehicle = (): Active["vehicle"] => (ufoOdds > 0 && transfers++ % ufoOdds === ufoOffset % ufoOdds ? "ufo" : "hand")
  const critters = createCritters(scene)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500)
  camera.position.set(0, 42, 80)
  const controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 0.8, 2)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 6
  controls.maxDistance = 140
  controls.maxPolarAngle = Math.PI * 0.47
  controls.enablePan = true
  controls.update()

  const cowRoot = new THREE.Group()
  scene.add(cowRoot)
  const cows = new Map<string, Cow>()
  let selectedID: string | undefined
  let filter: Set<string> | undefined
  let seeded = false
  const queue: Transfer[] = []
  let active: Active | undefined

  // Every cow's contact shadow is one instance of the same disc.
  const shadows = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.17, depthWrite: false }),
    MAX_SHADOWS,
  )
  shadows.frustumCulled = false
  shadows.count = 0
  scene.add(shadows)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.05, 1.24, 48),
    new THREE.MeshBasicMaterial({ color: "#ffd166", transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.035
  ring.visible = false
  scene.add(ring)

  const pointer = new THREE.Vector2(2, 2)
  let pointerInside = false
  let pointerClient = { x: 0, y: 0 }
  const raycaster = new THREE.Raycaster()
  let hovered: PickTarget | undefined
  let down: { x: number; y: number; at: number } | undefined

  // Until someone drags or zooms, the camera backs up just enough that all five pens fit across the view.
  let touched = false
  const tour = createTour(camera, controls)
  const upsidedown = createUpsidedown({
    camera,
    target: controls.target,
    cows: () => cows.values(),
    onStage: (stage) => events.onUpsidedown?.(stage),
  })
  controls.addEventListener("start", () => {
    touched = true
    tour.interrupt()
  })
  const frameField = () => {
    if (touched) return
    const halfWidth = 54
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
    const distance = Math.min(controls.maxDistance, Math.max(70, halfWidth / (Math.tan(halfFov) * camera.aspect)))
    const direction = camera.position.clone().sub(controls.target).normalize()
    camera.position.copy(controls.target).addScaledVector(direction, distance)
    controls.update()
  }
  const resize = () => {
    const host = canvas.parentElement
    const width = Math.max(1, host?.clientWidth ?? canvas.clientWidth)
    const height = Math.max(1, host?.clientHeight ?? canvas.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    frameField()
  }
  resize()
  const observer = new ResizeObserver(() => resize())
  if (canvas.parentElement) observer.observe(canvas.parentElement)

  const updatePointer = (event: PointerEvent | MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    pointerClient = { x: event.clientX, y: event.clientY }
    pointerInside = true
  }
  const onPointerMove = (event: PointerEvent) => updatePointer(event)
  const onPointerLeave = () => {
    pointerInside = false
    if (hovered !== undefined) {
      hovered = undefined
      canvas.style.cursor = ""
      events.onHover(undefined, pointerClient.x, pointerClient.y)
    }
  }
  const onPointerDown = (event: PointerEvent) => {
    updatePointer(event)
    down = { x: event.clientX, y: event.clientY, at: performance.now() }
  }
  const onPointerUp = (event: PointerEvent) => {
    if (!down) return
    const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y)
    const quick = performance.now() - down.at < 450
    down = undefined
    if (moved > 6 || !quick) return
    updatePointer(event)
    events.onSelect(pick())
  }
  const onDoubleClick = (event: MouseEvent) => {
    updatePointer(event)
    const target = pick()
    if (target?.kind === "cow") events.onOpen(target.id)
  }
  canvas.addEventListener("pointermove", onPointerMove)
  canvas.addEventListener("pointerleave", onPointerLeave)
  canvas.addEventListener("pointerdown", onPointerDown)
  canvas.addEventListener("pointerup", onPointerUp)
  canvas.addEventListener("dblclick", onDoubleClick)

  function pick(): PickTarget | undefined {
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects([cowRoot, critters.root], true)
    for (const hit of hits) {
      const cowID = hit.object.userData.cowID as string | undefined
      if (cowID) {
        const cow = cows.get(cowID)
        return cow && !cow.hidden && !cow.burning ? { kind: "cow", id: cowID } : undefined
      }
      const critterID = hit.object.userData.critterID as string | undefined
      if (critterID) return { kind: "critter", id: critterID }
    }
    return undefined
  }

  function pickTarget(cow: Cow) {
    const { rect } = penFor(cow.pen)
    for (let attempt = 0; attempt < 12; attempt++) {
      const angle = cow.rand() * TAU
      const distance = 3 + cow.rand() * 8
      const x = Math.max(rect.x0 + 1.8, Math.min(rect.x1 - 1.8, cow.x + Math.sin(angle) * distance))
      const z = Math.max(rect.z0 + 1.8, Math.min(rect.z1 - 1.8, cow.z + Math.cos(angle) * distance))
      if (!inPond(x, z)) return { x, z }
    }
    return randomPointIn(cow.pen, cow.rand)
  }

  function applyDim(cow: Cow) {
    const dim = !!filter && !filter.has(cow.spec.author)
    if (dim === cow.dimmed) return
    cow.dimmed = dim
    for (const material of cow.parts.materials) material.color.setScalar(dim ? 0.42 : 1)
  }

  function makeCow(spec: CowSpec, hidden: boolean): Cow {
    const rand = mulberry32(spec.seed ^ 0x9e3779b9)
    const parts = buildCow(spec)
    const { x, z } = randomPointIn(spec.pen, rand)
    const cow: Cow = {
      spec,
      parts,
      pen: spec.pen,
      x,
      z,
      heading: rand() * TAU,
      target: { x, z },
      mode: rand() < 0.5 ? "graze" : "idle",
      timer: 1 + rand() * 6,
      walkPhase: rand() * TAU,
      phase: rand() * TAU,
      lift: 0,
      graze: 0,
      selected: spec.id === selectedID,
      carried: false,
      hidden,
      leaving: false,
      dimmed: false,
      rand,
    }
    parts.group.visible = !hidden
    parts.group.position.set(x, 0, z)
    parts.group.rotation.y = cow.heading
    cowRoot.add(parts.group)
    cows.set(spec.id, cow)
    applyDim(cow)
    return cow
  }

  function removeCow(cow: Cow) {
    if (cow.burning) {
      cow.parts.group.remove(cow.burning.fire.group)
      disposeFire(cow.burning.fire)
      cow.burning = undefined
    }
    cowRoot.remove(cow.parts.group)
    disposeCow(cow.parts)
    cows.delete(cow.spec.id)
  }

  function dangle(cow: Cow, t: number, amount: number) {
    const parts = cow.parts
    parts.legs.forEach((leg, i) => {
      leg.rotation.x = Math.sin(t * 2.3 + i * 1.3 + cow.phase) * 0.3 * amount
      leg.rotation.z = Math.sin(t * 1.9 + i * 0.8) * 0.14 * amount
    })
    parts.rig.rotation.x = -0.14 * amount
    parts.head.rotation.x = 0.12 * amount
    parts.head.rotation.y = Math.sin(t * 0.9 + cow.phase) * 0.15 * amount
    parts.tail.rotation.x = Math.sin(t * 3 + cow.phase) * 0.35
  }

  function settleHead(cow: Cow, dt: number) {
    const parts = cow.parts
    const target = cow.mode === "graze" ? 1 : 0
    cow.graze += (target - cow.graze) * Math.min(1, dt * 3)
    const g = ease(cow.graze)
    parts.head.position.set(parts.headRest.x, parts.headRest.y - 0.36 * g, parts.headRest.z + 0.12 * g)
    return g
  }

  const scorches: Scorch[] = []

  function stepBurn(cow: Cow, dt: number, t: number) {
    const burn = cow.burning!
    const parts = cow.parts
    const size = cow.spec.breed.size
    burn.t += dt
    const u = burn.t
    const ignite = Math.min(1, u / 0.5)
    const char = Math.min(1, Math.max(0, (u - 0.4) / 1.8))
    const collapse = Math.min(1, Math.max(0, (u - 2.4) / 0.8))
    const out = Math.min(1, Math.max(0, (u - 3.1) / 0.5))
    const intensity = ignite * (1 - 0.6 * collapse) * (1 - out)
    stepFire(burn.fire, t, dt, intensity, u > 0.7 && u < 3.3, size, cow.rand)
    for (const material of parts.materials) {
      material.color.setScalar(1 - 0.85 * char)
      material.emissive.set("#ff6a00")
      material.emissiveIntensity = 0.45 * intensity * (1 - 0.55 * char) * (0.7 + 0.3 * Math.sin(t * 17))
    }
    // Panic, then the legs go and the cow settles into the grass.
    const shake = (1 - collapse) * ignite
    parts.rig.position.x = Math.sin(t * 31) * 0.04 * shake
    parts.rig.position.y = -collapse * 0.9 * size + Math.abs(Math.sin(t * 23)) * 0.05 * shake
    parts.rig.scale.set(size * (1 + 0.15 * collapse), size * (1 - 0.65 * collapse), size)
    parts.rig.rotation.z = collapse * 0.35
    parts.legs.forEach((leg, index) => {
      leg.rotation.x = Math.sin(t * 19 + index * 1.7) * 0.35 * shake + collapse * (index < 2 ? 1.1 : -1.1)
    })
    parts.head.rotation.x = -0.6 * shake + 0.8 * collapse
    parts.tail.rotation.z = Math.sin(t * 25) * 0.6 * shake
    parts.group.position.set(cow.x, 0, cow.z)
    if (u >= BURN_SECONDS) {
      const scorch = createScorch(cow.x, cow.z, size, t)
      scene.add(scorch.mesh)
      scorches.push(scorch)
      removeCow(cow)
    }
  }

  function stepCow(cow: Cow, dt: number, t: number) {
    const parts = cow.parts
    if (cow.hidden) return
    if (cow.burning) return stepBurn(cow, dt, t)
    const size = cow.spec.breed.size
    if (cow.carried) {
      // Position and height come from the hand; the cow just swings.
      dangle(cow, t, 1)
      parts.group.position.set(cow.x, 0, cow.z)
      parts.group.rotation.y = cow.heading
      return
    }
    if (cow.spec.queued && !cow.selected) {
      // In the merge queue: hovering, turning slowly, waiting for its turn.
      cow.lift = Math.min(1, cow.lift + dt * 0.8)
      const up = ease(cow.lift)
      parts.rig.position.y = up * (1.4 + size * 0.3) + Math.sin(t * 1.4 + cow.phase) * 0.12 * up
      parts.rig.rotation.x = -0.05 * up
      cow.heading += dt * 0.9 * up
      dangle(cow, t, up * 0.6)
      cow.mode = "idle"
      settleHead(cow, dt)
      parts.group.position.set(cow.x, 0, cow.z)
      parts.group.rotation.y = cow.heading
      return
    }
    cow.lift = cow.selected ? Math.min(1, cow.lift + dt * 1.5) : Math.max(0, cow.lift - dt * 1.3)
    const lifted = ease(cow.lift)

    if (cow.lift > 0.02) {
      parts.rig.position.y = lifted * (2.3 + size * 0.5) + (cow.selected ? Math.sin(t * 1.7 + cow.phase) * 0.08 : 0)
      dangle(cow, t, lifted)
      cow.mode = "idle"
      settleHead(cow, dt)
      if (cow.selected) {
        const face = Math.atan2(camera.position.x - cow.x, camera.position.z - cow.z)
        cow.heading = lerpAngle(cow.heading, face, dt * 1.2)
      }
      parts.group.position.set(cow.x, 0, cow.z)
      parts.group.rotation.y = cow.heading
      return
    }
    parts.rig.position.y = 0
    parts.rig.rotation.x = 0

    cow.timer -= dt
    if (cow.mode === "walk") {
      const dx = cow.target.x - cow.x
      const dz = cow.target.z - cow.z
      const distance = Math.hypot(dx, dz)
      if (distance < 0.5 || cow.timer <= 0) {
        cow.mode = cow.rand() < 0.72 ? "graze" : "idle"
        cow.timer = 3 + cow.rand() * 7
      } else {
        cow.heading = lerpAngle(cow.heading, Math.atan2(dx, dz), dt * 2.2)
        const speed = 1.15 * (0.85 + size * 0.15)
        cow.x += Math.sin(cow.heading) * speed * dt
        cow.z += Math.cos(cow.heading) * speed * dt
        cow.walkPhase += dt * 7.5
        const swing = Math.sin(cow.walkPhase) * 0.5
        parts.legs[0].rotation.x = swing
        parts.legs[3].rotation.x = swing
        parts.legs[1].rotation.x = -swing
        parts.legs[2].rotation.x = -swing
        parts.rig.position.y = Math.abs(Math.sin(cow.walkPhase)) * 0.035
        parts.head.rotation.x = 0.08 + Math.sin(cow.walkPhase) * 0.05
        parts.head.rotation.y = 0
        parts.tail.rotation.z = Math.sin(t * 2.2 + cow.phase) * 0.2
      }
    } else if (cow.mode === "graze") {
      parts.head.rotation.x += (0.95 - parts.head.rotation.x) * Math.min(1, dt * 3)
      parts.head.rotation.y = Math.sin(t * 2.6 + cow.phase) * 0.06
      parts.tail.rotation.z = Math.sin(t * 1.6 + cow.phase) * 0.25
      for (const leg of parts.legs) leg.rotation.x *= 1 - Math.min(1, dt * 6)
      if (cow.timer <= 0) {
        cow.mode = "walk"
        cow.target = pickTarget(cow)
        cow.timer = 5 + cow.rand() * 8
      }
    } else {
      parts.head.rotation.x += (0 - parts.head.rotation.x) * Math.min(1, dt * 3)
      parts.head.rotation.y = Math.sin(t * 0.7 + cow.phase) * 0.45
      parts.tail.rotation.z = Math.sin(t * 1.4 + cow.phase) * 0.25
      for (const leg of parts.legs) leg.rotation.x *= 1 - Math.min(1, dt * 6)
      if (cow.timer <= 0) {
        cow.mode = "walk"
        cow.target = pickTarget(cow)
        cow.timer = 5 + cow.rand() * 8
      }
    }
    settleHead(cow, dt)
    keepInBounds(cow)
    parts.group.position.set(cow.x, 0, cow.z)
    parts.group.rotation.y = cow.heading
  }

  /** Jostling can shove a cow through a fence or into the pond; put it back. */
  function keepInBounds(cow: Cow) {
    const { rect } = penFor(cow.pen)
    cow.x = Math.max(rect.x0 + 1.2, Math.min(rect.x1 - 1.2, cow.x))
    cow.z = Math.max(rect.z0 + 1.2, Math.min(rect.z1 - 1.2, cow.z))
    if (!inPond(cow.x, cow.z, 1.2)) return
    const dx = (cow.x - POND.x) / (POND.rx + 1.4)
    const dz = (cow.z - POND.z) / (POND.rz + 1.4)
    const length = Math.hypot(dx, dz) || 0.001
    cow.x = POND.x + (dx / length) * (POND.rx + 1.4)
    cow.z = POND.z + (dz / length) * (POND.rz + 1.4)
    if (cow.mode === "walk") cow.target = pickTarget(cow)
  }

  function separate() {
    const list = [...cows.values()].filter((cow) => !cow.hidden && !cow.carried && !cow.burning)
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        if (a.pen !== b.pen) continue
        const dx = b.x - a.x
        const dz = b.z - a.z
        const min = (a.spec.breed.size + b.spec.breed.size) * 1.05
        const distance = Math.hypot(dx, dz) || 0.001
        if (distance >= min) continue
        const push = ((min - distance) / 2) * 0.5
        const nx = dx / distance
        const nz = dz / distance
        if (a.lift < 0.02) {
          a.x -= nx * push
          a.z -= nz * push
        }
        if (b.lift < 0.02) {
          b.x += nx * push
          b.z += nz * push
        }
      }
    }
  }

  const shadowMatrix = new THREE.Matrix4()
  const shadowRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
  const shadowPosition = new THREE.Vector3()
  const shadowScale = new THREE.Vector3()

  function placeShadows() {
    let i = 0
    for (const cow of cows.values()) {
      if (i >= MAX_SHADOWS) break
      const size = cow.spec.breed.size
      const shrink = cow.hidden ? 0 : cow.carried ? 0.55 : cow.burning ? Math.max(0, 1 - cow.burning.t / BURN_SECONDS) : 1 - ease(cow.lift) * 0.35
      shadowPosition.set(cow.x, 0.02, cow.z)
      shadowScale.setScalar(0.95 * size * shrink)
      shadowMatrix.compose(shadowPosition, shadowRotation, shadowScale)
      shadows.setMatrixAt(i++, shadowMatrix)
    }
    shadows.count = i
    shadows.instanceMatrix.needsUpdate = true
    const selected = selectedID ? cows.get(selectedID) : undefined
    ring.visible = !!selected && !selected.hidden && !selected.carried
    if (selected) {
      ring.position.set(selected.x, 0.035, selected.z)
      ring.scale.setScalar(selected.spec.breed.size)
    }
  }

  // ---- the hand of god

  const DURATION: Record<Phase, number> = {
    descend: 1.1,
    grab: 0.35,
    lift: 0.8,
    travel: 2,
    lower: 0.8,
    release: 0.35,
    ascend: 1.0,
    "carry-up": 1.4,
    "carry-down": 1.4,
  }

  /** The carrier's position: the hand grips at (x, y, z); the saucer hovers UFO_HOVER above it with the beam down. */
  const carrier = () => (active?.vehicle === "ufo" ? ufo.group : hand.group)
  function placeHand(x: number, y: number, z: number) {
    if (active?.vehicle === "ufo") ufo.group.position.set(x, y + UFO_HOVER, z)
    else hand.group.position.set(x, y, z)
  }
  /** Where the hand would be gripping (the saucer's beam target), whichever vehicle is out. */
  const gripPoint = () => {
    const p = carrier().position
    return { x: p.x, y: active?.vehicle === "ufo" ? p.y - UFO_HOVER : p.y, z: p.z }
  }

  function holdCow(cow: Cow) {
    cow.carried = true
    cow.selected = false
    cow.lift = 0
    const grip = gripPoint()
    cow.x = grip.x
    cow.z = grip.z
    cow.parts.rig.position.y = Math.max(0, grip.y - gripHeight(cow.spec.breed.size))
    if (active?.vehicle === "ufo") cow.heading += 0.9 * lastDt
  }
  let lastDt = 0

  function startNext() {
    while (!active && queue.length) {
      const transfer = queue.shift()!
      const cow = cows.get(transfer.id)
      if (!cow) continue
      if (transfer.kind === "move") {
        if (cow.pendingPen !== transfer.to) continue
        const to = randomPointIn(transfer.to, cow.rand)
        active = { transfer, phase: "descend", vehicle: nextVehicle(), t: 0, from: { x: cow.x, z: cow.z }, to, cow }
        placeHand(cow.x, SKY_Y, cow.z)
        curlHand(hand, 0)
      } else if (transfer.kind === "arrive") {
        const to = { x: cow.x, z: cow.z }
        active = { transfer, phase: "carry-down", vehicle: nextVehicle(), t: 0, from: to, to, cow }
        placeHand(to.x, SKY_Y, to.z)
        curlHand(hand, 1)
        cow.hidden = false
        cow.parts.group.visible = true
        holdCow(cow)
        events.onCarry?.(cow.spec.id)
      } else {
        if (!cow.leaving) continue
        active = { transfer, phase: "descend", vehicle: nextVehicle(), t: 0, from: { x: cow.x, z: cow.z }, to: { x: cow.x, z: cow.z }, cow }
        placeHand(cow.x, SKY_Y, cow.z)
        curlHand(hand, 0)
      }
      hand.group.visible = active.vehicle === "hand"
      ufo.group.visible = active.vehicle === "ufo"
    }
  }

  function finishActive() {
    hand.group.visible = false
    ufo.group.visible = false
    active = undefined
    startNext()
  }

  function stepHand(dt: number, t: number) {
    if (!active) return
    lastDt = dt
    const a = active
    const cow = a.cow
    const size = cow.spec.breed.size
    const top = gripHeight(size)
    a.t += dt
    const u = Math.min(1, a.t / DURATION[a.phase])
    const e = ease(u)
    if (a.vehicle === "ufo") {
      // The beam reaches the ground while the saucer is low, and holds the cow while carried.
      const strength = a.phase === "grab" ? e : a.phase === "release" ? 1 - e : a.phase === "descend" || a.phase === "ascend" || a.phase === "carry-down" || a.phase === "carry-up" ? 0.35 : 1
      stepUfo(ufo, t, ufo.group.position.y - 0.7, strength)
    }
    switch (a.phase) {
      case "descend":
        placeHand(a.from.x, SKY_Y + (top - SKY_Y) * e, a.from.z)
        break
      case "grab":
        curlHand(hand, e)
        if (u >= 1) {
          holdCow(cow)
          events.onCarry?.(cow.spec.id)
        }
        break
      case "lift":
        placeHand(a.from.x, top + (CARRY_Y - top) * e, a.from.z)
        break
      case "travel": {
        const x = a.from.x + (a.to.x - a.from.x) * e
        const z = a.from.z + (a.to.z - a.from.z) * e
        placeHand(x, CARRY_Y + Math.sin(u * Math.PI) * 3, z)
        cow.heading = lerpAngle(cow.heading, Math.atan2(a.to.x - a.from.x, a.to.z - a.from.z), dt * 2)
        break
      }
      case "lower":
        placeHand(a.to.x, CARRY_Y + (top - CARRY_Y) * e, a.to.z)
        break
      case "release":
        curlHand(hand, 1 - e)
        if (u >= 1) {
          cow.carried = false
          cow.x = a.to.x
          cow.z = a.to.z
          cow.parts.rig.position.y = 0
          if (a.transfer.kind === "move") {
            cow.pen = a.transfer.to
            cow.pendingPen = undefined
          }
          cow.mode = "idle"
          cow.timer = 1.5 + cow.rand() * 3
          cow.target = pickTarget(cow)
        }
        break
      case "ascend": {
        const at = gripPoint()
        placeHand(at.x, top + (SKY_Y - top) * e, at.z)
        break
      }
      case "carry-up":
        placeHand(a.from.x, top + (SKY_Y + 6 - top) * e, a.from.z)
        if (u >= 1) {
          removeCow(cow)
          finishActive()
          return
        }
        break
      case "carry-down":
        placeHand(a.to.x, SKY_Y + (top - SKY_Y) * e, a.to.z)
        break
    }
    if (cow.carried) holdCow(cow)
    if (u < 1) return
    a.t = 0
    const next: Partial<Record<Phase, Phase | "done">> =
      a.transfer.kind === "move"
        ? { descend: "grab", grab: "lift", lift: "travel", travel: "lower", lower: "release", release: "ascend", ascend: "done" }
        : a.transfer.kind === "arrive"
          ? { "carry-down": "release", release: "ascend", ascend: "done" }
          : { descend: "grab", grab: "carry-up" }
    const to = next[a.phase]
    if (!to || to === "done") {
      finishActive()
      return
    }
    if (to === "travel") {
      const distance = Math.hypot(a.to.x - a.from.x, a.to.z - a.from.z)
      DURATION.travel = Math.min(3, Math.max(1.1, distance / 16))
    }
    a.phase = to
  }

  const clock = new THREE.Clock()
  let frame = 0
  let raf = 0
  const tmp = new THREE.Vector3()

  function animate() {
    raf = requestAnimationFrame(animate)
    const dt = Math.min(0.05, clock.getDelta())
    const t = clock.elapsedTime
    frame++
    stepHand(dt, t)
    for (const cow of cows.values()) stepCow(cow, dt, t)
    if (frame % 3 === 0 && cows.size > 1) separate()
    critters.tick(dt, t, camera)
    for (const scorch of [...scorches]) {
      if (stepScorch(scorch, t)) continue
      scene.remove(scorch.mesh)
      scorch.mesh.geometry.dispose()
      ;(scorch.mesh.material as THREE.Material).dispose()
      scorches.splice(scorches.indexOf(scorch), 1)
    }
    placeShadows()
    scenery.tick(t, dt)
    for (const cloud of scenery.clouds) {
      cloud.position.x += (cloud.userData.speed as number) * dt
      if (cloud.position.x > 120) cloud.position.x = -120
    }
    const touring = tour.tick(dt, t)
    if (!touring) controls.update()
    upsidedown.tick(dt, touring)
    if (pointerInside && frame % 2 === 0) {
      const target = pick()
      if (target?.id !== hovered?.id || target?.kind !== hovered?.kind) {
        hovered = target
        canvas.style.cursor = target ? "pointer" : ""
        events.onHover(target, pointerClient.x, pointerClient.y)
      }
    }
    renderer.render(scene, camera)
  }
  animate()

  function updateSigns(specs: CowSpec[]) {
    const counts = new Map<PenID, number>()
    for (const spec of specs) counts.set(spec.pen, (counts.get(spec.pen) ?? 0) + 1)
    for (const [pen, sign] of scenery.signs) {
      const count = counts.get(pen) ?? 0
      if (sign.count === count) continue
      sign.count = count
      paintSign(sign)
    }
  }

  return {
    setCows(specs, animate) {
      const next = new Map(specs.map((spec) => [spec.id, spec]))
      const changes: Transfer[] = []
      for (const [id, cow] of cows) if (!next.has(id) && !cow.leaving) changes.push({ kind: "depart", id })
      for (const spec of specs) {
        const cow = cows.get(spec.id)
        if (!cow) changes.push({ kind: "arrive", id: spec.id })
        else if (cow.burning) continue
        else {
          cow.leaving = false
          cow.spec = spec
          if (cow.pen !== spec.pen && cow.pendingPen !== spec.pen) changes.push({ kind: "move", id: spec.id, to: spec.pen })
        }
      }
      const play = animate && seeded && changes.length > 0 && changes.length <= MAX_ANIMATED_CHANGES
      for (const change of changes) {
        if (change.kind === "depart") {
          const cow = cows.get(change.id)!
          if (play && !cow.hidden) {
            cow.leaving = true
            queue.push(change)
          } else {
            if (active?.cow === cow) finishActive()
            removeCow(cow)
          }
        } else if (change.kind === "arrive") {
          makeCow(next.get(change.id)!, play)
          if (play) queue.push(change)
        } else {
          const cow = cows.get(change.id)!
          if (play || active?.cow === cow) {
            cow.pendingPen = change.to
            queue.push(change)
          } else {
            cow.pen = change.to
            cow.pendingPen = undefined
            const spot = randomPointIn(change.to, cow.rand)
            cow.x = spot.x
            cow.z = spot.z
            cow.target = spot
          }
        }
      }
      // Anything queued for a pen it no longer belongs to is dropped when it comes up.
      seeded = true
      updateSigns(specs)
      for (const cow of cows.values()) applyDim(cow)
      startNext()
    },
    setSign(pen, name) {
      const sign = scenery.signs.get(pen)
      if (!sign || sign.name === name) return
      sign.name = name
      paintSign(sign)
    },
    select(id) {
      selectedID = id
      for (const cow of cows.values()) cow.selected = cow.spec.id === id && !cow.carried && !cow.burning
    },
    burn(id) {
      const cow = cows.get(id)
      if (!cow || cow.hidden || cow.burning) return false
      if (active?.cow === cow) finishActive()
      cow.carried = false
      cow.selected = false
      cow.lift = 0
      cow.leaving = true
      cow.pendingPen = undefined
      const fire = createFire(cow.spec.breed.size, gripHeight(cow.spec.breed.size) * 0.95, cow.rand)
      cow.parts.group.add(fire.group)
      cow.burning = { t: 0, fire }
      events.onBurn?.(id)
      return true
    },
    setFilter(authors) {
      filter = authors
      for (const cow of cows.values()) applyDim(cow)
    },
    screenPosition(id) {
      const cow = cows.get(id)
      if (cow) {
        if (cow.hidden) return undefined
        tmp.set(cow.x, cow.parts.rig.position.y + headHeight(cow.spec.breed.size), cow.z)
      } else if (id === "john-pork") {
        tmp.copy(scenery.porkPosition())
      } else {
        const spot = critters.position(id)
        if (!spot) return undefined
        tmp.set(spot.x, spot.y, spot.z)
      }
      tmp.project(camera)
      if (tmp.z > 1) return undefined
      return { x: ((tmp.x + 1) / 2) * canvas.clientWidth, y: ((1 - tmp.y) / 2) * canvas.clientHeight }
    },
    poke(id) {
      return critters.poke(id)
    },
    setWolves(alerts) {
      critters.setWolves(alerts.map(wolfFor))
    },
    setUfoOdds(odds) {
      ufoOdds = Math.max(0, Math.floor(odds))
    },
    setSky(state) {
      scenery.sky.set(state)
    },
    setTour(on) {
      tour.setEnabled(on)
    },
    setParty(on) {
      scenery.party.set(on)
    },
    setUpsidedownEvery(seconds) {
      upsidedown.setEvery(seconds)
    },
    upsidedownNow() {
      upsidedown.trigger()
    },
    setCamera(position, target) {
      touched = true
      camera.position.set(...position)
      controls.target.set(...target)
      controls.update()
    },
    focus(id, distance = 14) {
      const cow = cows.get(id)
      const spot = cow ? { x: cow.x, y: cow.parts.rig.position.y + 0.9 * cow.spec.breed.size, z: cow.z } : critters.position(id)
      if (!spot) return false
      touched = true
      const direction = camera.position.clone().sub(controls.target).normalize()
      controls.target.set(spot.x, spot.y * 0.6, spot.z)
      camera.position.copy(controls.target).addScaledVector(direction, Math.max(controls.minDistance, distance))
      controls.update()
      return true
    },
    dispose() {
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("dblclick", onDoubleClick)
      controls.dispose()
      critters.dispose()
      scenery.sky.dispose()
      for (const scorch of scorches) {
        scorch.mesh.geometry.dispose()
        ;(scorch.mesh.material as THREE.Material).dispose()
      }
      for (const cow of cows.values()) disposeCow(cow.parts)
      cows.clear()
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
      })
      renderer.dispose()
    },
  }
}
