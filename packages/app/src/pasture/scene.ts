import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { Breed } from "./breeds"

/**
 * The pasture: a fenced green field with a pond, trees and drifting clouds,
 * and one low-poly cow per merged pull request. Cows wander, graze and idle on
 * their own; a selected cow is lifted off the ground with its legs dangling.
 * Everything is built from primitives and canvas textures, so there are no
 * assets to ship, and the packaged app renders it with plain WebGL.
 */

export type CowSpec = { id: string; breed: Breed; seed: number }

export type PastureEvents = {
  /** Pointer is over a cow (or left one); x/y are client coordinates. */
  onHover(id: string | undefined, x: number, y: number): void
  onSelect(id: string | undefined): void
  onOpen(id: string): void
}

export type PastureScene = {
  setCows(specs: CowSpec[]): void
  select(id: string | undefined): void
  /** Pixel position (relative to the canvas) above a cow's head, for labels. */
  screenPosition(id: string): { x: number; y: number } | undefined
  dispose(): void
}

const FIELD = 26
const POND = { x: -15, z: -11, rx: 7, rz: 4.5 }
const TAU = Math.PI * 2

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function lerpAngle(from: number, to: number, amount: number) {
  let delta = ((to - from + Math.PI) % TAU) - Math.PI
  if (delta < -Math.PI) delta += TAU
  return from + delta * Math.min(1, amount)
}

function inPond(x: number, z: number, margin = 1.5) {
  const dx = (x - POND.x) / (POND.rx + margin)
  const dz = (z - POND.z) / (POND.rz + margin)
  return dx * dx + dz * dz < 1
}

// ---------------------------------------------------------------- textures

function blob(ctx: CanvasRenderingContext2D, color: string, rand: () => number, size: number) {
  const x = rand() * 512
  const y = rand() * 256
  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.ellipse(x + (rand() - 0.5) * size, y + (rand() - 0.5) * size * 0.6, size * (0.35 + rand() * 0.4), size * (0.25 + rand() * 0.35), rand() * Math.PI, 0, TAU)
    ctx.fill()
  }
}

function coatTexture(breed: Breed, seed: number) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext("2d")!
  const rand = mulberry32(seed)
  ctx.fillStyle = breed.body
  ctx.fillRect(0, 0, 512, 256)
  const patch = breed.patch ?? breed.body
  if (breed.pattern === "patches") {
    const count = 7 + Math.floor(rand() * 6)
    for (let i = 0; i < count; i++) blob(ctx, patch, rand, 40 + rand() * 70)
  } else if (breed.pattern === "belt") {
    ctx.fillStyle = patch
    ctx.fillRect(0, 96, 512, 64)
  } else if (breed.pattern === "backstripe") {
    ctx.fillStyle = patch
    ctx.fillRect(96, 0, 64, 256)
  } else if (breed.pattern === "roan") {
    for (let i = 0; i < 420; i++) {
      ctx.globalAlpha = 0.5 + rand() * 0.5
      ctx.fillStyle = patch
      ctx.beginPath()
      ctx.arc(rand() * 512, rand() * 256, 2 + rand() * 6, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
  // A little fur grain so flat colours read as hide, not plastic.
  ctx.globalAlpha = breed.shaggy ? 0.16 : 0.08
  for (let i = 0; i < (breed.shaggy ? 2600 : 1400); i++) {
    ctx.fillStyle = rand() > 0.5 ? "#000000" : "#ffffff"
    ctx.fillRect(rand() * 512, rand() * 256, breed.shaggy ? 3 : 2, 1 + rand() * (breed.shaggy ? 7 : 3))
  }
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

function groundTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext("2d")!
  const rand = mulberry32(7)
  ctx.fillStyle = "#5fae4a"
  ctx.fillRect(0, 0, 512, 512)
  const tones = ["#56a443", "#6ab854", "#4f9c3f", "#73bf5a", "#62ab4b"]
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = tones[Math.floor(rand() * tones.length)]
    ctx.globalAlpha = 0.35 + rand() * 0.4
    ctx.beginPath()
    ctx.ellipse(rand() * 512, rand() * 512, 12 + rand() * 46, 8 + rand() * 30, rand() * Math.PI, 0, TAU)
    ctx.fill()
  }
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#3f8a33" : "#8fd070"
    ctx.fillRect(rand() * 512, rand() * 512, 2, 3 + rand() * 4)
  }
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(7, 7)
  return texture
}

// ---------------------------------------------------------------- scenery

function buildGround(scene: THREE.Scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1, metalness: 0 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

function buildGrass(scene: THREE.Scene) {
  // Three tapered blades per tuft, crossed; vertex colours fade from a dark base to a bright tip.
  const positions: number[] = []
  const colors: number[] = []
  const base = new THREE.Color("#3f8a33")
  const tip = new THREE.Color("#9be07a")
  for (let blade = 0; blade < 3; blade++) {
    const angle = (blade / 3) * Math.PI
    const dx = Math.cos(angle) * 0.09
    const dz = Math.sin(angle) * 0.09
    positions.push(-dx, 0, -dz, dx, 0, dz, 0, 0.62, 0)
    colors.push(base.r, base.g, base.b, base.r, base.g, base.b, tip.r, tip.g, tip.b)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 })
  const count = 2600
  const mesh = new THREE.InstancedMesh(geometry, material, count)
  const rand = mulberry32(11)
  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const rotation = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  let placed = 0
  while (placed < count) {
    const x = (rand() - 0.5) * (FIELD + 9) * 2
    const z = (rand() - 0.5) * (FIELD + 9) * 2
    if (inPond(x, z, 0.5)) continue
    position.set(x, 0, z)
    rotation.setFromAxisAngle(up, rand() * TAU)
    const s = 0.7 + rand() * 0.9
    scale.set(s, s * (0.8 + rand() * 0.6), s)
    matrix.compose(position, rotation, scale)
    mesh.setMatrixAt(placed, matrix)
    placed++
  }
  mesh.receiveShadow = true
  scene.add(mesh)
}

function buildFlowers(scene: THREE.Scene) {
  const geometry = new THREE.SphereGeometry(0.09, 6, 5)
  const material = new THREE.MeshStandardMaterial({ roughness: 0.8 })
  const count = 420
  const mesh = new THREE.InstancedMesh(geometry, material, count)
  const rand = mulberry32(23)
  const palette = ["#ff7eb6", "#ffd166", "#ffffff", "#c58cff", "#ff9f66"].map((c) => new THREE.Color(c))
  const matrix = new THREE.Matrix4()
  let placed = 0
  while (placed < count) {
    const x = (rand() - 0.5) * (FIELD + 6) * 2
    const z = (rand() - 0.5) * (FIELD + 6) * 2
    if (inPond(x, z, 0.5)) continue
    matrix.makeTranslation(x, 0.2 + rand() * 0.15, z)
    mesh.setMatrixAt(placed, matrix)
    mesh.setColorAt(placed, palette[Math.floor(rand() * palette.length)])
    placed++
  }
  scene.add(mesh)
}

function buildPond(scene: THREE.Scene) {
  const rim = new THREE.Mesh(
    new THREE.CircleGeometry(1, 40),
    new THREE.MeshStandardMaterial({ color: "#d9c9a3", roughness: 1 }),
  )
  rim.rotation.x = -Math.PI / 2
  rim.position.set(POND.x, 0.015, POND.z)
  rim.scale.set(POND.rx + 0.9, POND.rz + 0.9, 1)
  scene.add(rim)
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(1, 40),
    new THREE.MeshStandardMaterial({ color: "#4aa8e0", roughness: 0.15, metalness: 0.1 }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(POND.x, 0.03, POND.z)
  water.scale.set(POND.rx, POND.rz, 1)
  scene.add(water)
}

function buildTrees(scene: THREE.Scene) {
  const trunk = new THREE.MeshStandardMaterial({ color: "#7a4f2e", roughness: 1 })
  const leaves = ["#3e8f3a", "#4ca046", "#2f7a2e"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }))
  const rand = mulberry32(31)
  const spots: Array<[number, number]> = [
    [-34, -30], [-31, 12], [-36, 28], [33, -28], [36, 4], [31, 26], [-8, -38], [14, -36], [4, 38], [-22, 36], [24, 37],
  ]
  for (const [x, z] of spots) {
    const tree = new THREE.Group()
    const height = 2.2 + rand() * 1.4
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, height, 8), trunk)
    stem.position.y = height / 2
    stem.castShadow = true
    tree.add(stem)
    const puffs = 2 + Math.floor(rand() * 2)
    for (let i = 0; i < puffs; i++) {
      const r = 1.4 + rand() * 1.2
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leaves[Math.floor(rand() * leaves.length)])
      puff.position.set((rand() - 0.5) * 1.6, height + r * 0.6 + i * 0.7, (rand() - 0.5) * 1.6)
      puff.castShadow = true
      tree.add(puff)
    }
    tree.position.set(x, 0, z)
    tree.rotation.y = rand() * TAU
    scene.add(tree)
  }
}

function buildRocks(scene: THREE.Scene) {
  const material = new THREE.MeshStandardMaterial({ color: "#9a9a92", roughness: 1 })
  const rand = mulberry32(41)
  for (let i = 0; i < 7; i++) {
    let x = 0
    let z = 0
    do {
      x = (rand() - 0.5) * FIELD * 1.8
      z = (rand() - 0.5) * FIELD * 1.8
    } while (inPond(x, z, 1))
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + rand() * 0.7, 0), material)
    rock.position.set(x, 0.2, z)
    rock.scale.set(1 + rand() * 0.6, 0.6 + rand() * 0.4, 1 + rand() * 0.6)
    rock.rotation.set(rand(), rand(), rand())
    rock.castShadow = true
    rock.receiveShadow = true
    scene.add(rock)
  }
}

function buildFence(scene: THREE.Scene) {
  const wood = new THREE.MeshStandardMaterial({ color: "#a7783f", roughness: 0.95 })
  const edge = FIELD + 2.5
  const spacing = 3
  const perSide = Math.round((edge * 2) / spacing)
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 1.15, 0.2), wood, perSide * 4)
  const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(spacing, 0.09, 0.07), wood, perSide * 4 * 2)
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  let post = 0
  let rail = 0
  for (let side = 0; side < 4; side++) {
    const along = side % 2 === 0
    const fixed = side < 2 ? -edge : edge
    quaternion.setFromAxisAngle(up, along ? 0 : Math.PI / 2)
    for (let i = 0; i < perSide; i++) {
      const t = -edge + i * spacing
      const x = along ? t : fixed
      const z = along ? fixed : t
      matrix.makeTranslation(x, 0.57, z)
      posts.setMatrixAt(post++, matrix)
      const mx = along ? t + spacing / 2 : fixed
      const mz = along ? fixed : t + spacing / 2
      for (const y of [0.45, 0.85]) {
        matrix.compose(new THREE.Vector3(mx, y, mz), quaternion, new THREE.Vector3(1, 1, 1))
        rails.setMatrixAt(rail++, matrix)
      }
    }
  }
  posts.castShadow = true
  rails.castShadow = true
  scene.add(posts, rails)
}

function buildClouds(scene: THREE.Scene) {
  const material = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, emissive: "#ffffff", emissiveIntensity: 0.35 })
  const rand = mulberry32(53)
  const clouds: THREE.Group[] = []
  for (let i = 0; i < 7; i++) {
    const cloud = new THREE.Group()
    const puffs = 3 + Math.floor(rand() * 4)
    for (let p = 0; p < puffs; p++) {
      const r = 1.6 + rand() * 1.8
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), material)
      puff.position.set(p * 2.2 - puffs, rand() * 0.8, (rand() - 0.5) * 2)
      cloud.add(puff)
    }
    cloud.position.set((rand() - 0.5) * 140, 20 + rand() * 9, -30 - rand() * 60)
    cloud.userData.speed = 0.35 + rand() * 0.5
    scene.add(cloud)
    clouds.push(cloud)
  }
  return clouds
}

function buildSky(scene: THREE.Scene) {
  scene.background = new THREE.Color("#a9d8f5")
  scene.fog = new THREE.Fog("#bfe0f5", 80, 190)
  const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshBasicMaterial({ color: "#fff1a8" }))
  sun.position.set(70, 62, -90)
  scene.add(sun)
  const hemi = new THREE.HemisphereLight("#cfe9ff", "#4f8a3a", 0.95)
  scene.add(hemi)
  const light = new THREE.DirectionalLight("#fff4dc", 2.2)
  light.position.set(32, 48, 22)
  light.castShadow = true
  light.shadow.mapSize.set(2048, 2048)
  light.shadow.camera.left = -46
  light.shadow.camera.right = 46
  light.shadow.camera.top = 46
  light.shadow.camera.bottom = -46
  light.shadow.camera.near = 5
  light.shadow.camera.far = 140
  light.shadow.bias = -0.0008
  scene.add(light)
  scene.add(new THREE.AmbientLight("#ffffff", 0.25))
}

// ---------------------------------------------------------------- cows

type CowParts = {
  group: THREE.Group
  rig: THREE.Group
  head: THREE.Group
  legs: THREE.Group[]
  tail: THREE.Group
  shadow: THREE.Mesh
  ring: THREE.Mesh
}

type Cow = {
  spec: CowSpec
  parts: CowParts
  x: number
  z: number
  heading: number
  target: { x: number; z: number }
  mode: "walk" | "graze" | "idle"
  timer: number
  walkPhase: number
  phase: number
  lift: number
  selected: boolean
  rand: () => number
}

function buildCow(spec: CowSpec): CowParts {
  const breed = spec.breed
  const coat = new THREE.MeshStandardMaterial({ map: coatTexture(breed, spec.seed), roughness: 0.95, metalness: 0 })
  const solid = new THREE.MeshStandardMaterial({ color: breed.body, roughness: 0.95 })
  const dark = new THREE.MeshStandardMaterial({ color: "#2b2523", roughness: 0.8 })
  const muzzleMaterial = new THREE.MeshStandardMaterial({ color: breed.muzzle, roughness: 0.9 })
  const faceMaterial =
    breed.pattern === "whiteface" ? new THREE.MeshStandardMaterial({ color: breed.patch, roughness: 0.95 }) : coat

  const group = new THREE.Group()
  const rig = new THREE.Group()
  rig.scale.setScalar(breed.size)
  group.add(rig)

  const legLength = 0.75
  const bodyRadius = 0.55
  const bodyLength = 1.25
  const bodyY = legLength + bodyRadius * 0.85

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(bodyRadius, bodyLength, 6, 16), coat)
  body.rotation.x = Math.PI / 2
  body.position.y = bodyY
  if (breed.shaggy) body.scale.set(1.08, 1.08, 1)
  body.castShadow = true
  rig.add(body)

  if (breed.hump) {
    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), coat)
    hump.position.set(0, bodyY + 0.4, 0.4)
    hump.scale.set(1, 0.8, 1.15)
    hump.castShadow = true
    rig.add(hump)
  }
  if (breed.dairy) {
    const udder = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 8), new THREE.MeshStandardMaterial({ color: "#f2b8b0", roughness: 0.9 }))
    udder.position.set(0, bodyY - bodyRadius * 0.8, -0.35)
    udder.scale.set(1.1, 0.7, 1)
    rig.add(udder)
  }

  const head = new THREE.Group()
  head.position.set(0, bodyY + 0.22, bodyLength / 2 + 0.34)
  rig.add(head)
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.48, 0.55), faceMaterial)
  skull.position.z = 0.1
  skull.castShadow = true
  head.add(skull)
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), muzzleMaterial)
  muzzle.position.set(0, -0.12, 0.5)
  head.add(muzzle)
  for (const dx of [-0.1, 0.1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), dark)
    nostril.position.set(dx, -0.1, 0.66)
    head.add(nostril)
  }
  for (const dx of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), dark)
    eye.position.set(dx, 0.08, 0.36)
    head.add(eye)
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), new THREE.MeshBasicMaterial({ color: "#ffffff" }))
    glint.position.set(dx + 0.03, 0.12, 0.42)
    head.add(glint)
  }
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), faceMaterial)
    ear.scale.set(1, 0.45, 0.6)
    ear.position.set(side * 0.34, breed.ears === "droop" ? 0.04 : 0.18, -0.02)
    ear.rotation.z = side * (breed.ears === "droop" ? -0.95 : 0.35)
    head.add(ear)
  }
  if (breed.horns !== "none") {
    const radius = { short: 0.22, long: 0.45, huge: 0.8 }[breed.horns]
    const hornMaterial = new THREE.MeshStandardMaterial({ color: "#e9dcc4", roughness: 0.7 })
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.05 + radius * 0.05, 6, 10, Math.PI * 0.55), hornMaterial)
      horn.position.set(side * 0.24, 0.26, 0)
      horn.rotation.y = (side * Math.PI) / 2
      horn.rotation.z = side > 0 ? Math.PI * 0.08 : Math.PI * 0.92
      head.add(horn)
    }
  }
  if (breed.shaggy) {
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.18, 0.32), coat)
    fringe.position.set(0, 0.26, 0.24)
    fringe.rotation.x = -0.3
    head.add(fringe)
  }

  const legs: THREE.Group[] = []
  for (const [x, z] of [
    [-0.28, 0.42],
    [0.28, 0.42],
    [-0.28, -0.42],
    [0.28, -0.42],
  ]) {
    const pivot = new THREE.Group()
    pivot.position.set(x, legLength, z)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, legLength, 8), solid)
    leg.position.y = -legLength / 2
    leg.castShadow = true
    pivot.add(leg)
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.12, 8), dark)
    hoof.position.y = -legLength + 0.06
    pivot.add(hoof)
    rig.add(pivot)
    legs.push(pivot)
  }

  const tail = new THREE.Group()
  tail.position.set(0, bodyY + 0.28, -bodyLength / 2 - 0.3)
  const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.7, 6), solid)
  tailMesh.position.y = -0.35
  tail.add(tailMesh)
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), dark)
  tuft.position.y = -0.72
  tail.add(tuft)
  rig.add(tail)

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95 * breed.size, 24),
    new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.16, depthWrite: false }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  group.add(shadow)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.05 * breed.size, 1.22 * breed.size, 40),
    new THREE.MeshBasicMaterial({ color: "#ffd166", transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.035
  ring.visible = false
  group.add(ring)

  rig.traverse((object) => {
    object.userData.cowID = spec.id
  })
  return { group, rig, head, legs, tail, shadow, ring }
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (!material) return
    for (const item of Array.isArray(material) ? material : [material]) {
      const map = (item as THREE.MeshStandardMaterial).map
      if (map) map.dispose()
      item.dispose()
    }
  })
}

function pickTarget(cow: Cow) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const angle = cow.rand() * TAU
    const distance = 3 + cow.rand() * 8
    const x = Math.max(-FIELD, Math.min(FIELD, cow.x + Math.sin(angle) * distance))
    const z = Math.max(-FIELD, Math.min(FIELD, cow.z + Math.cos(angle) * distance))
    if (!inPond(x, z)) return { x, z }
  }
  return { x: 0, z: 0 }
}

export function createPastureScene(canvas: HTMLCanvasElement, events: PastureEvents): PastureScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  buildSky(scene)
  buildGround(scene)
  buildGrass(scene)
  buildFlowers(scene)
  buildPond(scene)
  buildTrees(scene)
  buildRocks(scene)
  buildFence(scene)
  const clouds = buildClouds(scene)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400)
  camera.position.set(0, 17, 36)
  const controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 0.8, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 6
  controls.maxDistance = 75
  controls.maxPolarAngle = Math.PI * 0.47
  controls.enablePan = true
  controls.update()

  const cowRoot = new THREE.Group()
  scene.add(cowRoot)
  const cows = new Map<string, Cow>()
  let selectedID: string | undefined

  const pointer = new THREE.Vector2(2, 2)
  let pointerInside = false
  let pointerClient = { x: 0, y: 0 }
  const raycaster = new THREE.Raycaster()
  let hoveredID: string | undefined
  let down: { x: number; y: number; at: number } | undefined

  const resize = () => {
    const host = canvas.parentElement
    const width = Math.max(1, host?.clientWidth ?? canvas.clientWidth)
    const height = Math.max(1, host?.clientHeight ?? canvas.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  resize()
  const observer = new ResizeObserver(() => resize())
  if (canvas.parentElement) observer.observe(canvas.parentElement)

  const updatePointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    pointerClient = { x: event.clientX, y: event.clientY }
    pointerInside = true
  }
  const onPointerMove = (event: PointerEvent) => updatePointer(event)
  const onPointerLeave = () => {
    pointerInside = false
    if (hoveredID !== undefined) {
      hoveredID = undefined
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
    const id = pick()
    events.onSelect(id)
  }
  const onDoubleClick = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    const id = pick()
    if (id) events.onOpen(id)
  }
  canvas.addEventListener("pointermove", onPointerMove)
  canvas.addEventListener("pointerleave", onPointerLeave)
  canvas.addEventListener("pointerdown", onPointerDown)
  canvas.addEventListener("pointerup", onPointerUp)
  canvas.addEventListener("dblclick", onDoubleClick)

  function pick(): string | undefined {
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(cowRoot.children, true)
    for (const hit of hits) {
      let object: THREE.Object3D | null = hit.object
      while (object) {
        const id = object.userData.cowID as string | undefined
        if (id) return id
        object = object.parent
      }
    }
    return undefined
  }

  const clock = new THREE.Clock()
  let frame = 0
  let raf = 0
  const tmp = new THREE.Vector3()

  function stepCow(cow: Cow, dt: number, t: number) {
    const parts = cow.parts
    const size = cow.spec.breed.size
    cow.lift = cow.selected ? Math.min(1, cow.lift + dt * 1.5) : Math.max(0, cow.lift - dt * 1.3)
    const ease = cow.lift * cow.lift * (3 - 2 * cow.lift)
    parts.shadow.scale.setScalar(1 - ease * 0.35)
    ;(parts.shadow.material as THREE.MeshBasicMaterial).opacity = 0.16 * (1 - ease * 0.5)
    parts.ring.visible = cow.selected

    if (cow.lift > 0.02) {
      parts.rig.position.y = ease * (2.3 + size * 0.5) + (cow.selected ? Math.sin(t * 1.7 + cow.phase) * 0.08 : 0)
      parts.legs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(t * 2.3 + i * 1.3 + cow.phase) * 0.3 * ease
        leg.rotation.z = Math.sin(t * 1.9 + i * 0.8) * 0.14 * ease
      })
      parts.rig.rotation.x = -0.14 * ease
      parts.head.rotation.x = 0.12 * ease
      parts.head.rotation.y = Math.sin(t * 0.9 + cow.phase) * 0.15 * ease
      parts.tail.rotation.x = Math.sin(t * 3 + cow.phase) * 0.35
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
        parts.tail.rotation.z = Math.sin(t * 2.2 + cow.phase) * 0.2
      }
    } else if (cow.mode === "graze") {
      parts.head.rotation.x += (0.95 - parts.head.rotation.x) * Math.min(1, dt * 3)
      parts.head.position.y += (0.95 - parts.head.position.y) * Math.min(1, dt * 3)
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
      parts.head.position.y += (1.2175 - parts.head.position.y) * Math.min(1, dt * 3)
      parts.head.rotation.y = Math.sin(t * 0.7 + cow.phase) * 0.45
      parts.tail.rotation.z = Math.sin(t * 1.4 + cow.phase) * 0.25
      for (const leg of parts.legs) leg.rotation.x *= 1 - Math.min(1, dt * 6)
      if (cow.timer <= 0) {
        cow.mode = "walk"
        cow.target = pickTarget(cow)
        cow.timer = 5 + cow.rand() * 8
      }
    }
    if (cow.mode !== "graze") parts.head.position.y += (1.2175 - parts.head.position.y) * Math.min(1, dt * 3)
    parts.group.position.set(cow.x, 0, cow.z)
    parts.group.rotation.y = cow.heading
  }

  function separate() {
    const list = [...cows.values()]
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        const dx = b.x - a.x
        const dz = b.z - a.z
        const min = (a.spec.breed.size + b.spec.breed.size) * 0.95
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

  function animate() {
    raf = requestAnimationFrame(animate)
    const dt = Math.min(0.05, clock.getDelta())
    const t = clock.elapsedTime
    frame++
    for (const cow of cows.values()) stepCow(cow, dt, t)
    if (frame % 3 === 0 && cows.size > 1) separate()
    for (const cloud of clouds) {
      cloud.position.x += (cloud.userData.speed as number) * dt
      if (cloud.position.x > 90) cloud.position.x = -90
    }
    controls.update()
    if (pointerInside) {
      const id = pick()
      if (id !== hoveredID) {
        hoveredID = id
        canvas.style.cursor = id ? "pointer" : ""
        events.onHover(id, pointerClient.x, pointerClient.y)
      }
    }
    renderer.render(scene, camera)
  }
  animate()

  return {
    setCows(specs) {
      const keep = new Set(specs.map((spec) => spec.id))
      for (const [id, cow] of cows) {
        if (keep.has(id)) continue
        cowRoot.remove(cow.parts.group)
        disposeObject(cow.parts.group)
        cows.delete(id)
      }
      specs.forEach((spec) => {
        if (cows.has(spec.id)) return
        const rand = mulberry32(spec.seed ^ 0x9e3779b9)
        const parts = buildCow(spec)
        let x = 0
        let z = 0
        do {
          x = (rand() - 0.5) * FIELD * 1.9
          z = (rand() - 0.5) * FIELD * 1.9
        } while (inPond(x, z))
        const cow: Cow = {
          spec,
          parts,
          x,
          z,
          heading: rand() * TAU,
          target: { x, z },
          mode: rand() < 0.5 ? "graze" : "idle",
          timer: 1 + rand() * 6,
          walkPhase: rand() * TAU,
          phase: rand() * TAU,
          lift: 0,
          selected: spec.id === selectedID,
          rand,
        }
        parts.group.position.set(x, 0, z)
        parts.group.rotation.y = cow.heading
        cowRoot.add(parts.group)
        cows.set(spec.id, cow)
      })
    },
    select(id) {
      selectedID = id
      for (const cow of cows.values()) cow.selected = cow.spec.id === id
    },
    screenPosition(id) {
      const cow = cows.get(id)
      if (!cow) return undefined
      tmp.set(cow.x, cow.parts.rig.position.y + 1.9 * cow.spec.breed.size, cow.z).project(camera)
      if (tmp.z > 1) return undefined
      return { x: ((tmp.x + 1) / 2) * canvas.clientWidth, y: ((1 - tmp.y) / 2) * canvas.clientHeight }
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
      for (const cow of cows.values()) disposeObject(cow.parts.group)
      cows.clear()
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
      })
      renderer.dispose()
    },
  }
}
