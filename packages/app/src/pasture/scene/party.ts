import * as THREE from "three"
import { mulberry32 } from "@/pasture/rng"

/**
 * The party barn. When the team has an event on, the doors swing open and
 * inside there is a disco ball: spinning, throwing coloured beams, light
 * spots twinkling over the floor and out across the grass, and a string of
 * bulbs blinking along the eave. When it is over the doors close and the
 * barn is a barn again.
 */
export const DOOR_W = 4.6
export const DOOR_H = 4.4

export type Party = {
  set(on: boolean): void
  on(): boolean
  tick(t: number, dt: number): void
}

const PALETTE = ["#ff4fd8", "#4fe3ff", "#ffe14f", "#7dff5a", "#ff7a4f", "#b14fff"]

function mirrorTiles() {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext("2d")!
  const rand = mulberry32(88)
  ctx.fillStyle = "#1a1c22"
  ctx.fillRect(0, 0, 128, 64)
  for (let y = 0; y < 64; y += 4)
    for (let x = 0; x < 128; x += 4) {
      ctx.fillStyle = `hsl(${205 + rand() * 30}, 18%, ${50 + rand() * 45}%)`
      ctx.fillRect(x, y, 3.3, 3.3)
    }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function buildParty(opts: { barn: THREE.Group; width: number; depth: number; wall: number; dark: THREE.Material; trim: THREE.Material }): Party {
  const { barn, width, depth, wall, dark, trim } = opts
  const rand = mulberry32(2026)

  // The doors: two leaves hinged at the jambs, swinging outward.
  const hinges: THREE.Group[] = []
  for (const side of [-1, 1]) {
    const hinge = new THREE.Group()
    hinge.position.set((side * DOOR_W) / 2, 0, depth / 2 + 0.1)
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W / 2, DOOR_H, 0.16), dark)
    leaf.position.set((-side * DOOR_W) / 4, DOOR_H / 2, 0)
    leaf.castShadow = true
    hinge.add(leaf)
    const brace = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(DOOR_W / 2, DOOR_H) - 0.6, 0.28, 0.1), trim)
    brace.position.set((-side * DOOR_W) / 4, DOOR_H / 2, 0.13)
    brace.rotation.z = -side * Math.atan2(DOOR_H, DOOR_W / 2)
    hinge.add(brace)
    barn.add(hinge)
    hinges.push(hinge)
  }

  // The kit only comes out for a party.
  const kit = new THREE.Group()
  kit.visible = false
  barn.add(kit)
  const ballAt = new THREE.Vector3(0, wall - 1.1, -0.4)
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), new THREE.MeshStandardMaterial({ color: "#8a8a8a" }))
  rod.position.set(ballAt.x, ballAt.y + 1.05, ballAt.z)
  kit.add(rod)
  const tiles = mirrorTiles()
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 24, 16),
    new THREE.MeshStandardMaterial({ map: tiles, metalness: 0.9, roughness: 0.3, emissive: "#ffffff", emissiveMap: tiles, emissiveIntensity: 0.4 }),
  )
  ball.position.copy(ballAt)
  kit.add(ball)

  // Beams out of the ball, short enough to stay inside the walls; the ones facing the door spill out of it.
  const beams = new THREE.Group()
  beams.position.copy(ballAt)
  kit.add(beams)
  const beamMaterials: THREE.MeshBasicMaterial[] = []
  PALETTE.slice(0, 5).forEach((color, i) => {
    const geometry = new THREE.ConeGeometry(1.4, 6, 18, 1, true)
    geometry.translate(0, -3, 0)
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = 0.55 + (i % 2) * 0.25
    const pivot = new THREE.Group()
    pivot.rotation.y = (i / 5) * Math.PI * 2
    pivot.add(mesh)
    beams.add(pivot)
    beamMaterials.push(material)
  })

  // The light itself, cycling through colours.
  const light = new THREE.PointLight("#ffffff", 0, 40, 2)
  light.position.copy(ballAt)
  kit.add(light)

  // Spots twinkling over the floor inside and in a fan out of the door.
  const count = 280
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const bases: THREE.Color[] = []
  const phases = new Float32Array(count)
  let placed = 0
  while (placed < count) {
    const x = (rand() - 0.5) * (width - 1)
    const z = -depth / 2 + 0.5 + rand() * (depth + 9)
    const outside = z > depth / 2
    if (outside && Math.abs(x) > DOOR_W / 2 + (z - depth / 2) * 0.55) continue
    positions.set([x, 0.09, z], placed * 3)
    const base = new THREE.Color(PALETTE[Math.floor(rand() * PALETTE.length)])
    bases.push(base)
    colors.set([base.r, base.g, base.b], placed * 3)
    phases[placed] = rand() * Math.PI * 2
    placed++
  }
  const spotsGeometry = new THREE.BufferGeometry()
  spotsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  const colorAttribute = new THREE.BufferAttribute(colors, 3)
  spotsGeometry.setAttribute("color", colorAttribute)
  const spots = new THREE.Points(
    spotsGeometry,
    new THREE.PointsMaterial({ size: 0.42, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }),
  )
  kit.add(spots)

  // Bulbs along the eave.
  const bulbs: Array<{ material: THREE.MeshBasicMaterial; base: THREE.Color }> = []
  for (let i = 0; i <= 14; i++) {
    const base = new THREE.Color(PALETTE[i % PALETTE.length])
    const material = new THREE.MeshBasicMaterial({ color: base })
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), material)
    bulb.position.set(-7 + i, wall + 0.25 - Math.abs(Math.sin(i * 0.9)) * 0.22, depth / 2 + 0.45)
    kit.add(bulb)
    bulbs.push({ material, base })
  }

  let target = 0
  let open = 0
  return {
    set(on) {
      target = on ? 1 : 0
      if (on) kit.visible = true
    },
    on: () => target === 1,
    tick(t, dt) {
      open += (target - open) * Math.min(1, dt * 1.6)
      if (target === 0 && open < 0.01) {
        open = 0
        kit.visible = false
      }
      const e = open * open * (3 - 2 * open)
      hinges[0].rotation.y = -e * 1.9
      hinges[1].rotation.y = e * 1.9
      if (!kit.visible) return
      ball.rotation.y = t * 0.9
      beams.rotation.y = t * 0.55
      light.intensity = 140 * e
      light.color.setHSL((t * 0.1) % 1, 0.9, 0.6)
      beamMaterials.forEach((material, i) => {
        material.opacity = e * (0.14 + 0.1 * (0.5 + 0.5 * Math.sin(t * 3 + i)))
      })
      ;(spots.material as THREE.PointsMaterial).opacity = 0.9 * e
      for (let i = 0; i < count; i++) {
        const glow = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 4 + phases[i]))
        colorAttribute.setXYZ(i, bases[i].r * glow, bases[i].g * glow, bases[i].b * glow)
      }
      colorAttribute.needsUpdate = true
      bulbs.forEach(({ material, base }, i) => {
        material.color.copy(base).multiplyScalar(0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 5 - i * 0.7)))
      })
    },
  }
}
