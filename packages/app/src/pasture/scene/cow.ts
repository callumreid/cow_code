import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { mulberry32 } from "@/pasture/rng"
import type { Breed, HornStyle } from "../breeds"
import type { PenID } from "../pens"
import { COAT_V0, SWATCH, atlasFor, collarSwatch, swatchUV } from "./atlas"

export type CowSpec = { id: string; breed: Breed; seed: number; pen: PenID; author: string; collar: number; queued?: boolean }

export type CowParts = {
  group: THREE.Group
  rig: THREE.Group
  head: THREE.Group
  headRest: THREE.Vector3
  legs: THREE.Group[]
  tail: THREE.Group
  meshes: THREE.Mesh[]
  materials: THREE.MeshStandardMaterial[]
}

/**
 * Proportions of a size-1 cow. The rig is scaled per breed.
 * Forward is +z; the camera sees the field from +z.
 */
const L = 1.7
const R = 0.6
export const LEG_LENGTH = 0.93
const BODY_Y = LEG_LENGTH + R * 0.78

/** The height of a cow's back, where the hand takes hold. */
export const gripHeight = (size: number) => (BODY_Y + R * 0.9) * size

/** Where the label floats: just above the head. */
export const headHeight = (size: number) => (BODY_Y + 1.05) * size

// ---------------------------------------------------------------- uv helpers

function toSwatch(geometry: THREE.BufferGeometry, index: number) {
  const [u, v] = swatchUV(index)
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u, v)
  return geometry
}

/** Map a part's own [0,1] uvs into the coat strip, shifted so no two cows wear the exact same patches. */
function toCoat(geometry: THREE.BufferGeometry, offset: number, vScale = 1, vShift = 0) {
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) {
    const v = Math.min(1, Math.max(0, uv.getY(i) * vScale + vShift))
    uv.setXY(i, uv.getX(i) + offset, COAT_V0 + v * (1 - COAT_V0))
  }
  return geometry
}

function alignY(geometry: THREE.BufferGeometry, direction: THREE.Vector3) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())
  return geometry.applyQuaternion(q)
}

// ---------------------------------------------------------------- parts

function torso(offset: number) {
  // Radius along the body from rump (t = 0) to chest (t = 1).
  const profile: Array<[number, number]> = [
    [0, 0],
    [0.3, 0.015],
    [0.47, 0.07],
    [0.55, 0.17],
    [0.585, 0.32],
    [0.6, 0.5],
    [0.595, 0.66],
    [0.565, 0.8],
    [0.49, 0.92],
    [0.32, 0.98],
    [0, 1],
  ]
  const points = profile.map(([r, t]) => new THREE.Vector2(r, t * L))
  const geometry = new THREE.LatheGeometry(points, 30)
  // Lathe revolves around y; lay it along z with the belly at u = 0 and the back at u = 0.5.
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, 0, -L / 2)
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i)
    const z = position.getZ(i)
    // A flatter back, a rounder belly, a little more chest up front.
    let ny = y > 0 ? y * 0.86 : y * 1.08
    if (y < 0 && z > 0.2) ny -= (z - 0.2) * 0.06
    position.setY(i, ny)
  }
  geometry.computeVertexNormals()
  geometry.translate(0, BODY_Y, 0)
  return toCoat(geometry, offset)
}

function neckShape() {
  const base = new THREE.Vector3(0, BODY_Y + 0.16, L / 2 - 0.14)
  const tip = new THREE.Vector3(0, BODY_Y + 0.5, L / 2 + 0.36)
  const direction = tip.clone().sub(base)
  const length = direction.length()
  return { base, tip, direction: direction.normalize(), length }
}

function neck(offset: number) {
  const { base, direction, length } = neckShape()
  const geometry = new THREE.CylinderGeometry(0.21, 0.34, length + 0.2, 16, 1, false)
  geometry.translate(0, (length + 0.2) / 2 - 0.1, 0)
  alignY(geometry, direction)
  geometry.translate(base.x, base.y, base.z)
  return toCoat(geometry, offset, 0.35, 0.6)
}

function collar(index: number) {
  const { base, direction, length } = neckShape()
  const band = new THREE.CylinderGeometry(0.33, 0.345, 0.15, 22, 1, true)
  alignY(band, direction)
  const mid = base.clone().addScaledVector(direction, length * 0.5)
  band.translate(mid.x, mid.y, mid.z)
  toSwatch(band, collarSwatch(index))
  // The bell hangs under the throat.
  const bell = new THREE.CylinderGeometry(0.062, 0.095, 0.15, 4, 1, false)
  bell.rotateY(Math.PI / 4)
  bell.translate(0, mid.y - 0.42, mid.z + 0.12)
  toSwatch(bell, SWATCH.brass)
  const loop = new THREE.TorusGeometry(0.032, 0.011, 6, 12)
  loop.translate(0, mid.y - 0.33, mid.z + 0.12)
  toSwatch(loop, SWATCH.brassDark)
  const clapper = new THREE.SphereGeometry(0.02, 6, 5)
  clapper.translate(0, mid.y - 0.51, mid.z + 0.12)
  toSwatch(clapper, SWATCH.brassDark)
  return [band, bell, loop, clapper]
}

function hump(offset: number) {
  const geometry = new THREE.SphereGeometry(0.34, 16, 12)
  geometry.scale(0.95, 0.85, 1.3)
  geometry.translate(0, BODY_Y + 0.4, 0.42)
  return toCoat(geometry, offset)
}

function dewlap(offset: number) {
  const geometry = new THREE.SphereGeometry(0.16, 12, 8)
  geometry.scale(0.75, 1.5, 1.6)
  geometry.translate(0, BODY_Y - 0.42, 0.72)
  return toCoat(geometry, offset)
}

function udder() {
  const bag = new THREE.SphereGeometry(0.27, 14, 10)
  bag.scale(1.1, 0.7, 1.05)
  bag.translate(0, BODY_Y - 0.56, -0.42)
  toSwatch(bag, SWATCH.udder)
  const teats = [-0.1, 0.1].map((x) => {
    const teat = new THREE.CapsuleGeometry(0.028, 0.08, 4, 8)
    teat.translate(x, BODY_Y - 0.76, -0.42)
    return toSwatch(teat, SWATCH.udder)
  })
  return [bag, ...teats]
}

const HORNS: Record<Exclude<HornStyle, "none">, { points: Array<[number, number, number]>; base: number; tip: number }> = {
  short: { points: [[0.2, 0.32, -0.02], [0.36, 0.4, 0.03], [0.47, 0.52, 0.16], [0.5, 0.66, 0.3]], base: 0.075, tip: 0.022 },
  long: { points: [[0.2, 0.32, -0.02], [0.5, 0.45, 0.02], [0.78, 0.7, 0.12], [0.9, 1.05, 0.3]], base: 0.08, tip: 0.02 },
  huge: { points: [[0.2, 0.3, -0.02], [0.7, 0.4, 0.02], [1.35, 0.5, 0.12], [1.85, 0.72, 0.36]], base: 0.09, tip: 0.022 },
  lyre: { points: [[0.2, 0.32, -0.02], [0.55, 0.65, 0], [0.85, 1.25, 0.08], [0.95, 1.85, 0.25]], base: 0.16, tip: 0.04 },
}

/** A horn: a tube along a curve, tapered to the tip, with a dark cap. */
function horn(style: Exclude<HornStyle, "none">, side: 1 | -1) {
  const spec = HORNS[style]
  const curve = new THREE.CatmullRomCurve3(spec.points.map(([x, y, z]) => new THREE.Vector3(x * side, y, z)))
  const tubular = 16
  const radial = 9
  const geometry = new THREE.TubeGeometry(curve, tubular, spec.base, radial, false)
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular
    const centre = curve.getPointAt(t)
    const scale = (spec.base + (spec.tip - spec.base) * Math.pow(t, 0.85)) / spec.base
    for (let j = 0; j <= radial; j++) {
      const index = i * (radial + 1) + j
      position.setXYZ(
        index,
        centre.x + (position.getX(index) - centre.x) * scale,
        centre.y + (position.getY(index) - centre.y) * scale,
        centre.z + (position.getZ(index) - centre.z) * scale,
      )
    }
  }
  geometry.computeVertexNormals()
  toSwatch(geometry, SWATCH.horn)
  const end = curve.getPointAt(1)
  const cap = new THREE.SphereGeometry(spec.tip * 1.05, 8, 6)
  cap.translate(end.x, end.y, end.z)
  toSwatch(cap, SWATCH.hornTip)
  return [geometry, cap]
}

function headParts(breed: Breed, offset: number): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = []
  const patterned = breed.pattern === "patches" || breed.pattern === "roan" || breed.pattern === "solid" || breed.pattern === "nguni"
  const faceOf = (geometry: THREE.BufferGeometry) =>
    breed.pattern === "whiteface" ? toSwatch(geometry, SWATCH.face) : patterned ? toCoat(geometry, offset + 0.37, 0.5, 0.25) : toSwatch(geometry, SWATCH.body)

  const skull = new THREE.SphereGeometry(0.3, 22, 16)
  skull.scale(1.2, 1.05, 1.55)
  skull.translate(0, 0.06, 0.12)
  parts.push(faceOf(skull))

  const muzzle = new THREE.CapsuleGeometry(0.19, 0.24, 6, 16)
  muzzle.rotateX(Math.PI / 2)
  muzzle.translate(0, -0.08, 0.5)
  parts.push(toSwatch(muzzle, SWATCH.muzzle))

  for (const side of [-1, 1]) {
    const nostril = new THREE.SphereGeometry(0.032, 8, 6)
    nostril.scale(1, 0.8, 1)
    nostril.translate(side * 0.085, -0.06, 0.735)
    parts.push(toSwatch(nostril, SWATCH.nose))

    const eye = new THREE.SphereGeometry(0.078, 12, 10)
    eye.translate(side * 0.31, 0.1, 0.22)
    parts.push(toSwatch(eye, SWATCH.dark))
    const glint = new THREE.SphereGeometry(0.024, 8, 6)
    glint.translate(side * 0.35, 0.135, 0.265)
    parts.push(toSwatch(glint, SWATCH.white))

    // The ear grows outward from the side of the head, then tips up (or hangs, on the droopy breeds).
    const ear = new THREE.SphereGeometry(0.16, 12, 8)
    if (breed.ears === "droop") {
      ear.scale(1.6, 0.3, 0.7)
      ear.translate(side * 0.2, 0, 0)
      ear.rotateZ(side * -1.1)
      ear.translate(side * 0.3, 0.16, -0.05)
    } else {
      ear.scale(1.35, 0.32, 0.75)
      ear.translate(side * 0.14, 0, 0)
      ear.rotateZ(side * 0.45)
      ear.translate(side * 0.3, 0.2, -0.05)
    }
    parts.push(faceOf(ear))

    if (breed.horns !== "none") parts.push(...horn(breed.horns, side as 1 | -1))
  }

  if (breed.shaggy) {
    const fringe = new THREE.SphereGeometry(0.2, 14, 10)
    fringe.scale(1.5, 0.55, 1.05)
    fringe.translate(0, 0.3, 0.2)
    parts.push(faceOf(fringe))
  }
  return parts
}

function legParts(breed: Breed, offset: number): THREE.BufferGeometry[] {
  const solidLegs = breed.pattern === "belt" || breed.pattern === "backstripe"
  const coatOf = (geometry: THREE.BufferGeometry) => (solidLegs ? toSwatch(geometry, SWATCH.body) : toCoat(geometry, offset + 0.12, 0.3, 0.1))
  const upper = new THREE.CylinderGeometry(0.115, 0.095, 0.47, 12)
  upper.translate(0, -0.235, 0)
  const knee = new THREE.SphereGeometry(0.1, 10, 8)
  knee.translate(0, -0.47, 0)
  const lower = new THREE.CylinderGeometry(0.09, 0.075, 0.38, 12)
  lower.translate(0, -0.66, 0.012)
  const hoof = new THREE.CylinderGeometry(0.095, 0.11, 0.1, 12)
  hoof.translate(0, -LEG_LENGTH + 0.05, 0.012)
  return [coatOf(upper), coatOf(knee), coatOf(lower), toSwatch(hoof, SWATCH.hoof)]
}

function tailParts(): THREE.BufferGeometry[] {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.22, -0.1),
    new THREE.Vector3(0, -0.5, -0.1),
    new THREE.Vector3(0, -0.72, -0.03),
  ])
  const geometry = new THREE.TubeGeometry(curve, 10, 0.036, 7, false)
  toSwatch(geometry, SWATCH.body)
  const tuft = new THREE.SphereGeometry(0.078, 10, 8)
  tuft.scale(1, 1.5, 1)
  tuft.translate(0, -0.8, -0.02)
  toSwatch(tuft, SWATCH.tuft)
  return [geometry, tuft]
}

function merged(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const geometry = mergeGeometries(parts, false)
  for (const part of parts) part.dispose()
  if (!geometry) throw new Error("could not merge cow parts")
  return geometry
}

// ---------------------------------------------------------------- the cow

export function buildCow(spec: CowSpec): CowParts {
  const breed = spec.breed
  const rand = mulberry32(spec.seed)
  const offset = rand()
  const material = new THREE.MeshStandardMaterial({ map: atlasFor(breed), roughness: 0.92, metalness: 0 })

  const group = new THREE.Group()
  const rig = new THREE.Group()
  rig.scale.setScalar(breed.size)
  group.add(rig)

  const meshes: THREE.Mesh[] = []
  const make = (geometry: THREE.BufferGeometry, shadow: boolean) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = shadow
    mesh.userData.cowID = spec.id
    meshes.push(mesh)
    return mesh
  }

  const bodyParts = [torso(offset), neck(offset), ...collar(spec.collar)]
  if (breed.shaggy) {
    // A thicker coat: the torso reads bigger under the same skeleton.
    const shag = torso(offset + 0.5)
    shag.scale(1.05, 1.05, 1.01)
    shag.translate(0, -BODY_Y * 0.05, 0)
    bodyParts.push(shag)
  }
  if (breed.hump) bodyParts.push(hump(offset), dewlap(offset))
  if (breed.dairy) bodyParts.push(...udder())
  rig.add(make(merged(bodyParts), true))

  const { tip } = neckShape()
  const head = new THREE.Group()
  head.position.copy(tip)
  head.add(make(merged(headParts(breed, offset)), true))
  rig.add(head)

  const legs: THREE.Group[] = []
  for (const [x, z] of [
    [-0.26, 0.52],
    [0.26, 0.52],
    [-0.27, -0.56],
    [0.27, -0.56],
  ]) {
    const pivot = new THREE.Group()
    pivot.position.set(x, LEG_LENGTH, z)
    pivot.add(make(merged(legParts(breed, offset)), false))
    rig.add(pivot)
    legs.push(pivot)
  }

  const tail = new THREE.Group()
  tail.position.set(0, BODY_Y + 0.3, -L / 2 - 0.02)
  tail.add(make(merged(tailParts()), false))
  rig.add(tail)

  return { group, rig, head, headRest: tip.clone(), legs, tail, meshes, materials: [material] }
}

export function disposeCow(parts: CowParts) {
  for (const mesh of parts.meshes) mesh.geometry.dispose()
  for (const material of parts.materials) material.dispose()
}
