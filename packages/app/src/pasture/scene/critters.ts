import * as THREE from "three"
import { mulberry32, hashString } from "@/pasture/rng"
import { CRITTERS, FARMER_ID, FARMER_LINES, type Critter } from "../critters"
import { LANE, lanePoint, towardPens, wrapLane } from "./lane"

const TAU = Math.PI * 2

const mat = (color: string, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 })

/** Signed shortest distance along the loop from `a` to `b`, in (-length/2, length/2]. */
const laneDelta = (a: number, b: number) => wrapLane(b - a + LANE.length / 2) - LANE.length / 2

function lerpAngle(from: number, to: number, amount: number) {
  let delta = ((to - from + Math.PI) % TAU) - Math.PI
  if (delta < -Math.PI) delta += TAU
  return from + delta * Math.min(1, amount)
}

type Parts = {
  group: THREE.Group
  rig: THREE.Group
  head: THREE.Group
  legs: THREE.Group[]
  arms: THREE.Group[]
  tail?: THREE.Group
  brows: THREE.Mesh[]
  smile?: THREE.Mesh
  frown?: THREE.Mesh
  /** Where the label floats, in rig units. */
  top: number
}

// ---------------------------------------------------------------- builders

function shadowed<T extends THREE.Object3D>(object: T) {
  object.castShadow = true
  return object
}

function buildDog(spec: Critter): Parts {
  const group = new THREE.Group()
  const rig = new THREE.Group()
  rig.scale.setScalar(spec.size)
  group.add(rig)
  const coat = mat(spec.body)
  const patch = mat(spec.patch ?? spec.body)
  const dark = mat("#1d1917", 0.7)

  const legLength = spec.legs === "short" ? 0.42 : 0.72
  const bodyY = legLength + 0.34
  const body = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.42, spec.legs === "short" ? 1.25 : 1.05, 6, 14), coat))
  body.rotation.x = Math.PI / 2
  body.position.y = bodyY
  if (spec.fluffy) body.scale.set(1.2, 1.2, 1)
  rig.add(body)
  if (spec.fluffy) {
    // A spaniel's skirt of fur hangs below the body line.
    const skirt = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), coat)
    skirt.scale.set(1.05, 0.7, 1.15)
    skirt.position.set(0, bodyY - 0.28, -0.05)
    rig.add(skirt)
  }
  if (spec.patch) {
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), patch)
    chest.scale.set(1, 0.85, 0.6)
    chest.position.set(0, bodyY - 0.14, 0.62)
    rig.add(chest)
  }

  const head = new THREE.Group()
  head.position.set(0, bodyY + 0.36, 0.82)
  rig.add(head)
  const skull = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), coat))
  if (spec.fluffy) skull.scale.set(1.15, 1.15, 1.05)
  head.add(skull)
  if (spec.fluffy) {
    const topknot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), coat)
    topknot.scale.set(1.1, 0.7, 1)
    topknot.position.set(0, 0.32, -0.02)
    head.add(topknot)
  }
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.36), spec.patch ? patch : coat)
  snout.position.set(0, -0.1, 0.38)
  head.add(snout)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), dark)
  nose.position.set(0, -0.03, 0.57)
  head.add(nose)
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(spec.eyes, 0.4))
    eye.position.set(side * 0.16, 0.1, 0.3)
    head.add(eye)
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), coat)
    if (spec.ears === "long") {
      // Spaniel ears: long curls that hang past the jaw.
      ear.scale.set(0.75, 1.7, 0.55)
      ear.position.set(side * 0.4, -0.12, -0.04)
      ear.rotation.z = side * 0.18
    } else if (spec.ears === "floppy") {
      ear.scale.set(0.55, 1, 0.35)
      ear.position.set(side * 0.36, -0.02, -0.02)
      ear.rotation.z = side * 0.35
    } else {
      // Semi-erect, tips folded forward.
      ear.scale.set(0.5, 0.95, 0.35)
      ear.position.set(side * 0.26, 0.4, -0.06)
      ear.rotation.z = side * -0.45
      ear.rotation.x = -0.35
    }
    head.add(ear)
  }

  const legs: THREE.Group[] = []
  for (const [x, z] of [
    [-0.2, 0.4],
    [0.2, 0.4],
    [-0.2, -0.42],
    [0.2, -0.42],
  ]) {
    const pivot = new THREE.Group()
    pivot.position.set(x, legLength, z)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, legLength, 8), coat)
    leg.position.y = -legLength / 2
    pivot.add(leg)
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), spec.patch ? patch : coat)
    paw.position.set(0, -legLength + 0.04, 0.04)
    pivot.add(paw)
    rig.add(pivot)
    legs.push(pivot)
  }

  const tail = new THREE.Group()
  tail.position.set(0, bodyY + 0.22, -0.62)
  const tailLength = spec.fluffy ? 0.3 : 0.6
  const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, tailLength, 6), coat)
  tailMesh.position.set(0, tailLength * 0.36, -tailLength * 0.27)
  tailMesh.rotation.x = -0.75
  tail.add(tailMesh)
  rig.add(tail)

  return { group, rig, head, legs, arms: [], tail, brows: [], top: bodyY + 0.95 }
}

function buildCat(spec: Critter): Parts {
  const group = new THREE.Group()
  const rig = new THREE.Group()
  rig.scale.setScalar(spec.size)
  group.add(rig)
  const coat = mat(spec.body, 0.85)
  const pink = mat("#d98a8a")

  const legLength = 0.55
  const bodyY = legLength + 0.3
  const body = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.05, 6, 14), coat))
  body.rotation.x = Math.PI / 2
  body.position.y = bodyY
  rig.add(body)

  const head = new THREE.Group()
  head.position.set(0, bodyY + 0.3, 0.74)
  rig.add(head)
  head.add(shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), coat)))
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), coat)
  muzzle.scale.set(1.2, 0.7, 0.8)
  muzzle.position.set(0, -0.1, 0.26)
  head.add(muzzle)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), pink)
  nose.position.set(0, -0.05, 0.38)
  head.add(nose)
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mat(spec.eyes, 0.3))
    eye.position.set(side * 0.14, 0.07, 0.27)
    head.add(eye)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), mat("#111111", 0.3))
    pupil.scale.set(0.5, 1.4, 1)
    pupil.position.set(side * 0.14, 0.07, 0.335)
    head.add(pupil)
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 4), coat)
    ear.position.set(side * 0.19, 0.36, -0.02)
    ear.rotation.z = side * -0.35
    ear.rotation.y = Math.PI / 4
    head.add(ear)
  }

  const legs: THREE.Group[] = []
  for (const [x, z] of [
    [-0.16, 0.36],
    [0.16, 0.36],
    [-0.16, -0.38],
    [0.16, -0.38],
  ]) {
    const pivot = new THREE.Group()
    pivot.position.set(x, legLength, z)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, legLength, 8), coat)
    leg.position.y = -legLength / 2
    pivot.add(leg)
    rig.add(pivot)
    legs.push(pivot)
  }

  const tail = new THREE.Group()
  tail.position.set(0, bodyY + 0.12, -0.55)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.3, -0.35),
    new THREE.Vector3(0, 0.75, -0.45),
    new THREE.Vector3(0, 1.0, -0.25),
  ])
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.045, 6, false), coat))
  rig.add(tail)

  return { group, rig, head, legs, arms: [], tail, brows: [], top: bodyY + 0.9 }
}

/** A wolf: leaner and longer than any dog, long muzzle, pointed ears, yellow eyes, a bushy tail held low. */
function buildWolf(spec: Critter): Parts {
  const group = new THREE.Group()
  const rig = new THREE.Group()
  rig.scale.setScalar(spec.size)
  group.add(rig)
  const coat = mat(spec.body, 0.95)
  const pale = mat(spec.patch ?? spec.body, 0.95)
  const dark = mat("#141414", 0.6)

  const legLength = 0.82
  const bodyY = legLength + 0.36
  const body = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.35, 6, 14), coat))
  body.rotation.x = Math.PI / 2
  body.position.y = bodyY
  rig.add(body)
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 1.0, 4, 10), pale)
  belly.rotation.x = Math.PI / 2
  belly.position.set(0, bodyY - 0.2, 0.05)
  rig.add(belly)
  const ruff = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 10), coat)
  ruff.scale.set(1.05, 0.95, 0.8)
  ruff.position.set(0, bodyY + 0.08, 0.62)
  rig.add(ruff)

  const head = new THREE.Group()
  head.position.set(0, bodyY + 0.34, 1.0)
  rig.add(head)
  head.add(shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 12), coat)))
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.5), coat)
  muzzle.position.set(0, -0.08, 0.42)
  head.add(muzzle)
  const chin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.42), pale)
  chin.position.set(0, -0.17, 0.38)
  head.add(chin)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), dark)
  nose.position.set(0, -0.02, 0.68)
  head.add(nose)
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat(spec.eyes, 0.3))
    eye.position.set(side * 0.15, 0.1, 0.25)
    head.add(eye)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), dark)
    pupil.position.set(side * 0.15, 0.1, 0.305)
    head.add(pupil)
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 5), coat)
    ear.position.set(side * 0.18, 0.36, -0.06)
    ear.rotation.z = side * -0.3
    head.add(ear)
  }

  const legs: THREE.Group[] = []
  for (const [x, z] of [
    [-0.2, 0.5],
    [0.2, 0.5],
    [-0.2, -0.52],
    [0.2, -0.52],
  ]) {
    const pivot = new THREE.Group()
    pivot.position.set(x, legLength, z)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, legLength, 8), coat)
    leg.position.y = -legLength / 2
    pivot.add(leg)
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), dark)
    paw.position.set(0, -legLength + 0.04, 0.04)
    pivot.add(paw)
    rig.add(pivot)
    legs.push(pivot)
  }

  const tail = new THREE.Group()
  tail.position.set(0, bodyY + 0.12, -0.75)
  const brush = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 4, 8), coat)
  brush.position.set(0, -0.28, -0.22)
  brush.rotation.x = 0.7
  tail.add(brush)
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), pale)
  tip.position.set(0, -0.55, -0.42)
  tail.add(tip)
  rig.add(tail)

  return { group, rig, head, legs, arms: [], tail, brows: [], top: bodyY + 0.95 }
}

/** Kobi: black hoodie, brown pants, black sneakers, and the straw hat that makes him the farmer. */
function buildFarmer(spec: Critter): Parts {
  const group = new THREE.Group()
  const rig = new THREE.Group()
  group.add(rig)
  const hoodie = mat(spec.body)
  const pants = mat("#6b4a2d")
  const shoe = mat("#111111", 0.6)
  const skin = mat("#e8b892")
  const straw = mat("#d9b660", 1)
  const dark = mat("#1d1917", 0.7)
  const wood = mat("#8a6238", 1)
  const steel = mat("#9aa0a6", 0.4)

  const legs: THREE.Group[] = []
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.17, 1.02, 0)
    const leg = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 1.0, 10), pants))
    leg.position.y = -0.5
    pivot.add(leg)
    const sneaker = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), shoe)
    sneaker.position.set(0, -0.96, 0.08)
    pivot.add(sneaker)
    rig.add(pivot)
    legs.push(pivot)
  }
  const torso = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.55, 6, 14), hoodie))
  torso.position.y = 1.55
  rig.add(torso)
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), hoodie)
  hood.scale.set(1.1, 0.6, 0.8)
  hood.position.set(0, 1.98, -0.16)
  rig.add(hood)

  const arms: THREE.Group[] = []
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.46, 1.86, 0)
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.62, 4, 10), hoodie)
    arm.position.y = -0.42
    pivot.add(arm)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), skin)
    hand.position.y = -0.86
    pivot.add(hand)
    if (side > 0) {
      // A pitchfork, carried upright in the right hand.
      const fork = new THREE.Group()
      fork.position.set(0.05, -0.86, 0.05)
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 6), wood)
      handle.position.y = 0.35
      fork.add(handle)
      for (const dx of [-0.11, 0, 0.11]) {
        const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.008, 0.36, 5), steel)
        tine.position.set(dx, 1.58, 0)
        fork.add(tine)
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.04), steel)
      bar.position.y = 1.4
      fork.add(bar)
      pivot.add(fork)
    }
    rig.add(pivot)
    arms.push(pivot)
  }

  const head = new THREE.Group()
  head.position.set(0, 2.28, 0)
  rig.add(head)
  head.add(shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 12), skin)))
  const brows: THREE.Mesh[] = []
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), dark)
    eye.position.set(side * 0.11, 0.04, 0.28)
    head.add(eye)
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, 0.03), dark)
    brow.position.set(side * 0.11, 0.14, 0.28)
    head.add(brow)
    brows.push(brow)
  }
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.03), dark)
  smile.position.set(0, -0.12, 0.29)
  head.add(smile)
  const frown = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 6, 12, Math.PI), dark)
  frown.position.set(0, -0.17, 0.29)
  frown.visible = false
  head.add(frown)
  // His black cap, bill forward, with the light patch on the front, and the goatee.
  const cap = mat("#161616", 0.8)
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 12, 0, TAU, 0, Math.PI / 2), cap)
  crown.position.y = 0.06
  head.add(crown)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.06, 16), cap)
  rim.position.y = 0.06
  head.add(rim)
  const bill = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.3), cap)
  bill.position.set(0, 0.05, 0.4)
  bill.rotation.x = 0.12
  head.add(bill)
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.02), mat("#d9d4c7", 0.7))
  badge.position.set(0, 0.2, 0.31)
  head.add(badge)
  const goatee = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), dark)
  goatee.scale.set(1.1, 0.7, 0.6)
  goatee.position.set(0, -0.22, 0.24)
  head.add(goatee)
  const stubble = new THREE.Mesh(new THREE.SphereGeometry(0.29, 14, 10, 0, TAU, Math.PI * 0.62, Math.PI * 0.2), mat("#3a2f28", 0.9))
  stubble.position.y = 0.04
  stubble.scale.set(1.03, 1.03, 1.03)
  head.add(stubble)
  void straw

  return { group, rig, head, legs, arms, brows, smile, frown, top: 2.85 }
}

// ---------------------------------------------------------------- the runners

type Mode = "go" | "rest" | "inspect" | "grumpy" | "flee" | "chase"

type Runner = {
  spec: Critter
  parts: Parts
  s: number
  dir: 1 | -1
  offset: number
  offsetTarget: number
  speed: number
  cruise: number
  mode: Mode
  timer: number
  phase: number
  gait: number
  heading: number
  hop: number
  grump: number
  /** For followers: how far behind the leader they like to be, and a slowly changing whim on top. */
  gap: number
  whim: number
  /** For chasers: which wolf, and until when. */
  chasing?: string
  chaseUntil: number
  x: number
  z: number
  rand: () => number
}

export type CritterField = {
  root: THREE.Group
  tick(dt: number, t: number, camera: THREE.Camera): void
  /** The wolves on the field right now: one per spec, added and removed as the list changes. */
  setWolves(specs: Critter[]): void
  /** Click: the farmer stops and tells you off (returns his line); a pet does a happy hop. */
  poke(id: string): string | undefined
  position(id: string): { x: number; y: number; z: number } | undefined
  dispose(): void
}

export function createCritters(scene: THREE.Scene): CritterField {
  const root = new THREE.Group()
  scene.add(root)
  const runners = new Map<string, Runner>()
  let lastLine = -1

  function addRunner(spec: Critter, index: number) {
    const rand = mulberry32(hashString(spec.id))
    const parts =
      spec.kind === "dog" ? buildDog(spec) : spec.kind === "cat" ? buildCat(spec) : spec.kind === "wolf" ? buildWolf(spec) : buildFarmer(spec)
    parts.rig.traverse((object) => {
      object.userData.critterID = spec.id
    })
    root.add(parts.group)
    const wolf = spec.kind === "wolf"
    const runner: Runner = {
      spec,
      parts,
      s: wrapLane((LANE.length / 6) * index + rand() * 8),
      dir: rand() < 0.5 ? 1 : -1,
      offset: (wolf ? 1.8 : 0.6) + rand() * (wolf ? 1.6 : 1.4),
      offsetTarget: 0,
      speed: spec.speed,
      cruise: spec.speed,
      mode: "go",
      timer: 2 + rand() * 6,
      phase: rand() * TAU,
      gait: rand() * TAU,
      heading: 0,
      hop: 0,
      grump: 0,
      gap: 0,
      whim: 0,
      chaseUntil: 0,
      x: 0,
      z: 0,
      rand,
    }
    runner.offsetTarget = runner.offset
    if (spec.kind === "farmer") runner.dir = 1
    runners.set(spec.id, runner)
    place(runner, 0)
    runner.heading = lanePoint(runner.s).heading + (runner.dir > 0 ? 0 : Math.PI)
    parts.group.position.set(runner.x, 0, runner.z)
    parts.group.rotation.y = runner.heading
    return runner
  }

  function removeRunner(id: string) {
    const runner = runners.get(id)
    if (!runner) return
    root.remove(runner.parts.group)
    runner.parts.group.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (!material) return
      for (const item of Array.isArray(material) ? material : [material]) item.dispose()
    })
    runners.delete(id)
  }

  CRITTERS.forEach((spec, index) => addRunner(spec, index))
  // Followers start on their leader's heels, each a little further back.
  let trailing = 0
  for (const runner of runners.values()) {
    if (!runner.spec.follows) continue
    const leader = runners.get(runner.spec.follows)
    if (!leader) continue
    runner.gap = 2.6 + trailing * 2.2
    trailing++
    runner.s = wrapLane(leader.s - leader.dir * runner.gap)
    runner.dir = leader.dir
    runner.offset = leader.offset + 0.8 + trailing * 0.5
    runner.offsetTarget = runner.offset
  }

  function place(runner: Runner, dt: number) {
    const point = lanePoint(runner.s, runner.offset)
    runner.x = point.x
    runner.z = point.z
    const forward = runner.dir > 0 ? point.heading : point.heading + Math.PI
    return forward
  }

  function stepRunner(runner: Runner, dt: number, t: number, camera: THREE.Camera) {
    const { parts, spec } = runner
    runner.timer -= dt
    runner.hop = Math.max(0, runner.hop - dt * 2.2)
    // Drift sideways a little so they do not all run the same line.
    if (runner.rand() < dt * 0.3) runner.offsetTarget = spec.kind === "wolf" ? 1.6 + runner.rand() * 2 : 0.5 + runner.rand() * (spec.kind === "farmer" ? 1 : 2.2)
    runner.offset += (runner.offsetTarget - runner.offset) * Math.min(1, dt * 0.8)

    if (runner.mode === "flee") {
      // A chased-off wolf: flat out along the lane, tail down, until it is gone.
      runner.speed = spec.speed * 2.6
      runner.s = wrapLane(runner.s + runner.dir * runner.speed * dt)
      runner.offsetTarget = 3.5
      const forward = place(runner, dt)
      runner.heading = lerpAngle(runner.heading, forward, dt * 6)
      runner.gait += dt * 16
      const swing = Math.sin(runner.gait) * 0.8
      parts.legs[0].rotation.x = swing
      parts.legs[3].rotation.x = swing
      parts.legs[1].rotation.x = -swing
      parts.legs[2].rotation.x = -swing
      parts.rig.position.y = Math.abs(Math.sin(runner.gait)) * 0.14
      if (parts.tail) parts.tail.rotation.x = 0.9
      const fade = Math.max(0, Math.min(1, runner.timer / 1.2))
      parts.rig.scale.setScalar(spec.size * (0.4 + 0.6 * fade))
      parts.group.position.set(runner.x, 0, runner.z)
      parts.group.rotation.y = runner.heading
      if (runner.timer <= 0) removeRunner(spec.id)
      return
    }
    const quarry = runner.chasing ? runners.get(runner.chasing) : undefined
    if (runner.chasing && (!quarry || t > runner.chaseUntil)) {
      runner.chasing = undefined
      runner.mode = "go"
      runner.timer = 1
    }
    if (quarry && runner.chasing) {
      // On the wolf's heels, barking, until it is out of sight.
      runner.mode = "chase"
      const delta = laneDelta(runner.s, quarry.s)
      runner.speed = spec.speed * 2.6
      runner.dir = delta >= 0 ? 1 : -1
      runner.s = wrapLane(runner.s + runner.dir * Math.min(Math.abs(delta) - 1.5 > 0 ? runner.speed * dt : 0, Math.abs(delta)))
      runner.offset += (quarry.offset - runner.offset) * Math.min(1, dt * 2)
      const forward = place(runner, dt)
      runner.heading = lerpAngle(runner.heading, forward, dt * 6)
      runner.gait += dt * 14
      const swing = Math.sin(runner.gait) * 0.75
      parts.legs[0].rotation.x = swing
      parts.legs[3].rotation.x = swing
      parts.legs[1].rotation.x = -swing
      parts.legs[2].rotation.x = -swing
      parts.rig.position.y = Math.abs(Math.sin(runner.gait)) * 0.12
      parts.head.rotation.x = Math.sin(t * 12) * 0.12
      if (parts.tail) parts.tail.rotation.y = Math.sin(t * 22) * 0.5
      parts.group.position.set(runner.x, 0, runner.z)
      parts.group.rotation.y = runner.heading
      return
    }
    const leader = spec.follows ? runners.get(spec.follows) : undefined
    if (leader && runner.mode !== "grumpy") {
      // Stay on the leader's heels: a spot `gap` behind him, with a whim that
      // sometimes sends them darting ahead and drifting back.
      if (runner.timer <= 0) {
        runner.whim = runner.rand() < 0.3 ? -(2 + runner.rand() * 4) : (runner.rand() - 0.5) * 2
        runner.timer = 2 + runner.rand() * 5
      }
      const wanted = wrapLane(leader.s - leader.dir * (runner.gap + runner.whim))
      const delta = laneDelta(runner.s, wanted)
      const distance = Math.abs(delta)
      const leaderStill = leader.mode !== "go"
      if (distance > (leaderStill ? 0.6 : 0.35)) {
        runner.mode = "go"
        const chase = Math.min(spec.speed * 2.4, 0.9 + distance * 1.4)
        runner.speed += (chase - runner.speed) * Math.min(1, dt * 3)
        const step = Math.sign(delta) * Math.min(distance, runner.speed * dt)
        runner.s = wrapLane(runner.s + step)
        runner.dir = delta >= 0 ? 1 : -1
        const forward = place(runner, dt)
        runner.heading = lerpAngle(runner.heading, forward, dt * 5)
        runner.gait += dt * (4 + runner.speed * 2.2)
        const swing = Math.sin(runner.gait) * 0.6
        parts.legs[0].rotation.x = swing
        parts.legs[3].rotation.x = swing
        parts.legs[1].rotation.x = -swing
        parts.legs[2].rotation.x = -swing
        parts.rig.position.y = Math.abs(Math.sin(runner.gait)) * (0.05 + runner.speed * 0.02)
        parts.head.rotation.x = Math.sin(runner.gait) * 0.08
        parts.head.rotation.y = Math.sin(t * 1.3 + runner.phase) * 0.2
      } else {
        // Close enough: face him and wait, or lean, depending on who you are.
        runner.mode = "rest"
        runner.speed = 0
        place(runner, dt)
        const face = Math.atan2(leader.x - runner.x, leader.z - runner.z)
        runner.heading = lerpAngle(runner.heading, face, dt * 3)
        for (const leg of parts.legs) leg.rotation.x *= 1 - Math.min(1, dt * 6)
        parts.rig.position.y += (0 - parts.rig.position.y) * Math.min(1, dt * 6)
        parts.rig.rotation.z = spec.id === "bean" ? Math.sin(t * 0.6 + runner.phase) * 0.12 : 0
        parts.head.rotation.x += (-0.1 - parts.head.rotation.x) * Math.min(1, dt * 3)
        parts.head.rotation.y = Math.sin(t * 0.9 + runner.phase) * 0.4
      }
    } else if (runner.mode === "go") {
      runner.speed += (runner.cruise - runner.speed) * Math.min(1, dt * 1.5)
      runner.s = wrapLane(runner.s + runner.dir * runner.speed * dt)
      const forward = place(runner, dt)
      runner.heading = lerpAngle(runner.heading, forward, dt * 4)
      runner.gait += dt * (spec.kind === "farmer" ? 5.5 : 4 + runner.speed * 2.2)
      const swing = Math.sin(runner.gait) * (spec.kind === "farmer" ? 0.45 : 0.6)
      if (spec.kind === "farmer") {
        parts.legs[0].rotation.x = swing
        parts.legs[1].rotation.x = -swing
        parts.arms[0].rotation.x = -swing * 0.6
        parts.arms[1].rotation.x = swing * 0.25
        parts.rig.position.y = Math.abs(Math.sin(runner.gait)) * 0.03
        parts.head.rotation.y = Math.sin(t * 0.8 + runner.phase) * 0.25
      } else {
        parts.legs[0].rotation.x = swing
        parts.legs[3].rotation.x = swing
        parts.legs[1].rotation.x = -swing
        parts.legs[2].rotation.x = -swing
        const bound = spec.kind === "dog" ? 0.06 + runner.speed * 0.02 : 0.03
        parts.rig.position.y = Math.abs(Math.sin(runner.gait)) * bound
        parts.head.rotation.x = Math.sin(runner.gait) * 0.08
        parts.head.rotation.y = Math.sin(t * 1.3 + runner.phase) * 0.2
      }
      if (runner.timer <= 0) {
        const roll = runner.rand()
        if (spec.kind === "farmer") {
          runner.mode = "inspect"
          runner.timer = 3 + runner.rand() * 4
        } else if (roll < 0.35) {
          runner.mode = "rest"
          runner.timer = 1.5 + runner.rand() * 4
        } else if (roll < 0.6) {
          // Zoomies.
          runner.cruise = spec.speed * (1.8 + runner.rand())
          runner.timer = 1.5 + runner.rand() * 2
        } else if (roll < 0.75) {
          runner.dir = runner.dir > 0 ? -1 : 1
          runner.cruise = spec.speed
          runner.timer = 2 + runner.rand() * 5
        } else {
          runner.cruise = spec.speed * (0.6 + runner.rand() * 0.6)
          runner.timer = 3 + runner.rand() * 6
        }
      }
    } else {
      // Standing still: rest, inspect the herd, or be grumpy at whoever clicked.
      runner.speed = 0
      for (const leg of parts.legs) leg.rotation.x *= 1 - Math.min(1, dt * 6)
      for (const arm of parts.arms) arm.rotation.x *= 1 - Math.min(1, dt * 6)
      parts.rig.position.y += (0 - parts.rig.position.y) * Math.min(1, dt * 6)
      if (runner.mode === "inspect") {
        const side = lanePoint(runner.s).side
        runner.heading = lerpAngle(runner.heading, towardPens(side), dt * 3)
        parts.head.rotation.y = Math.sin(t * 0.9 + runner.phase) * 0.5
      } else if (runner.mode === "grumpy") {
        const face = Math.atan2(camera.position.x - runner.x, camera.position.z - runner.z)
        runner.heading = lerpAngle(runner.heading, face, dt * 5)
        parts.head.rotation.y = 0
        parts.head.rotation.x = -0.08
      } else if (spec.kind === "wolf") {
        // A howl: nose to the sky, held.
        parts.head.rotation.x += (-0.85 - parts.head.rotation.x) * Math.min(1, dt * 4)
        parts.head.rotation.y = 0
      } else {
        parts.head.rotation.x += (spec.kind === "cat" ? 0.15 : -0.1 - parts.head.rotation.x) * Math.min(1, dt * 3)
        parts.head.rotation.y = Math.sin(t * 0.7 + runner.phase) * 0.5
      }
      if (runner.timer <= 0) {
        runner.mode = "go"
        runner.cruise = spec.speed
        runner.timer = (spec.kind === "farmer" ? 8 : 3) + runner.rand() * 8
        parts.head.rotation.x = 0
      }
    }

    // The face: grumpy brows and a frown fade in and out.
    runner.grump = runner.mode === "grumpy" ? Math.min(1, runner.grump + dt * 6) : Math.max(0, runner.grump - dt * 3)
    if (parts.brows.length) {
      parts.brows[0].rotation.z = -0.55 * runner.grump
      parts.brows[1].rotation.z = 0.55 * runner.grump
      parts.brows[0].position.y = 0.14 - 0.05 * runner.grump
      parts.brows[1].position.y = 0.14 - 0.05 * runner.grump
      if (parts.smile) parts.smile.visible = runner.grump < 0.5
      if (parts.frown) parts.frown.visible = runner.grump >= 0.5
      if (runner.mode === "grumpy") {
        // Arms crossed, more or less.
        parts.arms[0].rotation.x = -1.3 * runner.grump
        parts.arms[1].rotation.x = -1.3 * runner.grump
        parts.arms[0].rotation.z = 0.9 * runner.grump
        parts.arms[1].rotation.z = -0.9 * runner.grump
      } else {
        parts.arms[0].rotation.z *= 1 - Math.min(1, dt * 6)
        parts.arms[1].rotation.z *= 1 - Math.min(1, dt * 6)
      }
    }
    if (parts.tail) {
      const wag = spec.kind === "dog" ? Math.sin(t * (runner.mode === "go" ? 16 : 9) + runner.phase) * 0.55 : Math.sin(t * 1.8 + runner.phase) * 0.35
      parts.tail.rotation.y = wag
      if (spec.kind === "cat") parts.tail.rotation.x = Math.sin(t * 1.1 + runner.phase) * 0.15
    }

    const hop = Math.sin(Math.min(1, runner.hop) * Math.PI) * (spec.kind === "farmer" ? 0 : 0.9)
    parts.group.position.set(runner.x, hop, runner.z)
    parts.group.rotation.y = runner.heading
  }

  return {
    root,
    tick(dt, t, camera) {
      for (const runner of runners.values()) stepRunner(runner, dt, t, camera)
    },
    setWolves(specs) {
      const wanted = new Map(specs.map((spec) => [spec.id, spec]))
      const chasers = ["bean", "moon"].map((id) => runners.get(id)).filter((r): r is Runner => !!r && !r.chasing)
      for (const [id, runner] of runners) {
        if (runner.spec.kind !== "wolf" || wanted.has(id) || runner.mode === "flee") continue
        // The alert cleared: a dog sees the wolf off instead of it just vanishing.
        runner.mode = "flee"
        runner.timer = 5
        const dog = chasers.shift()
        if (dog) {
          dog.chasing = id
          dog.chaseUntil = Number.POSITIVE_INFINITY
          dog.hop = 1
        }
      }
      let index = 0
      for (const spec of specs) {
        if (!runners.has(spec.id)) addRunner(spec, index)
        index++
      }
    },
    poke(id) {
      const runner = runners.get(id)
      if (!runner) return undefined
      if (runner.spec.id === FARMER_ID) {
        runner.mode = "grumpy"
        runner.timer = 4.5
        let pick = Math.floor(runner.rand() * FARMER_LINES.length)
        if (pick === lastLine) pick = (pick + 1) % FARMER_LINES.length
        lastLine = pick
        return FARMER_LINES[pick]
      }
      runner.hop = 1
      if (runner.mode !== "go") {
        runner.mode = "go"
        runner.timer = 3 + runner.rand() * 4
      }
      runner.cruise = runner.spec.speed * 2
      return undefined
    },
    position(id) {
      const runner = runners.get(id)
      if (!runner) return undefined
      return { x: runner.x, y: runner.parts.top * runner.spec.size + runner.parts.group.position.y, z: runner.z }
    },
    dispose() {
      scene.remove(root)
      root.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (!material) return
        for (const item of Array.isArray(material) ? material : [material]) item.dispose()
      })
    },
  }
}
