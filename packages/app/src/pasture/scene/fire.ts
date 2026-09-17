import * as THREE from "three"

/**
 * Self-immolation. A closed pull request's cow catches fire where it stands:
 * tongues of flame flicker over its back, the coat chars, smoke rises, the
 * cow sinks into the grass and a scorch mark is left to fade.
 */

export const BURN_SECONDS = 3.6
export const SCORCH_SECONDS = 25

type Tongue = { mesh: THREE.Mesh; phase: number; base: number }
type Puff = { mesh: THREE.Mesh; born: number; drift: number }

export type Fire = {
  group: THREE.Group
  tongues: Tongue[]
  puffs: Puff[]
  smokeMaterial: THREE.MeshStandardMaterial
  lastPuff: number
}

const flame = (color: string, opacity: number) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })

/** Flames sized for a cow of `size`; `height` is where its back is. */
export function createFire(size: number, height: number, rand: () => number): Fire {
  const group = new THREE.Group()
  const tongues: Tongue[] = []
  const layers: Array<[string, number, number]> = [
    ["#ff2d12", 0.55, 1.0],
    ["#ff8a1f", 0.8, 0.72],
    ["#ffe066", 0.95, 0.42],
  ]
  for (let i = 0; i < 9; i++) {
    const x = (rand() - 0.5) * 0.9 * size
    const z = (rand() - 0.5) * 1.6 * size
    const base = height * (0.7 + rand() * 0.5)
    for (const [color, opacity, scale] of layers) {
      const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.22 * size * scale, 0.95 * size * scale, 7), flame(color, opacity))
      mesh.position.set(x, base, z)
      group.add(mesh)
      tongues.push({ mesh, phase: rand() * Math.PI * 2, base })
    }
  }
  const smokeMaterial = new THREE.MeshStandardMaterial({ color: "#5a5652", transparent: true, opacity: 0.55, roughness: 1, depthWrite: false })
  return { group, tongues, puffs: [], smokeMaterial, lastPuff: -1 }
}

/**
 * Animate the fire. `intensity` is 0..1 (how much fire), `t` the scene clock,
 * `smoke` whether puffs should keep coming.
 */
export function stepFire(fire: Fire, t: number, dt: number, intensity: number, smoke: boolean, size: number, rand: () => number) {
  fire.group.visible = intensity > 0.02
  for (const tongue of fire.tongues) {
    const flicker = 0.75 + 0.35 * Math.sin(t * 13 + tongue.phase) + 0.2 * Math.sin(t * 29 + tongue.phase * 1.7)
    tongue.mesh.scale.set(intensity * (0.8 + 0.2 * flicker), intensity * flicker, intensity * (0.8 + 0.2 * flicker))
    tongue.mesh.position.y = tongue.base + Math.sin(t * 9 + tongue.phase) * 0.06 * size
    tongue.mesh.rotation.z = Math.sin(t * 7 + tongue.phase) * 0.18
    tongue.mesh.rotation.x = Math.cos(t * 6 + tongue.phase) * 0.14
  }
  if (smoke && t - fire.lastPuff > 0.28) {
    fire.lastPuff = t
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22 * size, 8, 6), fire.smokeMaterial)
    mesh.position.set((rand() - 0.5) * 0.6 * size, size * 1.3, (rand() - 0.5) * 0.8 * size)
    fire.group.add(mesh)
    fire.puffs.push({ mesh, born: t, drift: (rand() - 0.5) * 0.6 })
  }
  for (const puff of [...fire.puffs]) {
    const age = t - puff.born
    if (age > 2.6) {
      fire.group.remove(puff.mesh)
      puff.mesh.geometry.dispose()
      fire.puffs.splice(fire.puffs.indexOf(puff), 1)
      continue
    }
    puff.mesh.position.y += dt * (1.1 + age * 0.4) * size
    puff.mesh.position.x += dt * puff.drift
    const grow = 1 + age * 1.1
    puff.mesh.scale.setScalar(grow)
  }
  fire.smokeMaterial.opacity = 0.5
}

export function disposeFire(fire: Fire) {
  for (const tongue of fire.tongues) {
    tongue.mesh.geometry.dispose()
    ;(tongue.mesh.material as THREE.Material).dispose()
  }
  for (const puff of fire.puffs) puff.mesh.geometry.dispose()
  fire.smokeMaterial.dispose()
}

export type Scorch = { mesh: THREE.Mesh; born: number }

export function createScorch(x: number, z: number, size: number, t: number): Scorch {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(1.1 * size, 20),
    new THREE.MeshBasicMaterial({ color: "#1a1410", transparent: true, opacity: 0.55, depthWrite: false }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(x, 0.025, z)
  return { mesh, born: t }
}

/** Fade a scorch mark; returns false once it has gone. */
export function stepScorch(scorch: Scorch, t: number) {
  const age = t - scorch.born
  const material = scorch.mesh.material as THREE.MeshBasicMaterial
  material.opacity = 0.55 * Math.max(0, 1 - age / SCORCH_SECONDS)
  return age < SCORCH_SECONDS
}
