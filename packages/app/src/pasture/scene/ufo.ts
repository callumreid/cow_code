import * as THREE from "three"

/**
 * The flying saucer that, one time in ten, does the hand of god's job: a
 * brushed-metal disc with a glass dome and a ring of running lights, and a
 * tractor beam that hauls the cow up, spinning slowly, and sets it down again.
 */
export type Ufo = {
  group: THREE.Group
  beam: THREE.Mesh
  beamMaterial: THREE.MeshBasicMaterial
  lights: THREE.Mesh[]
  disc: THREE.Mesh
  /** The saucer hovers this far above where the hand would have gripped. */
  hover: number
}

export const UFO_HOVER = 7

export function buildUfo(): Ufo {
  const group = new THREE.Group()
  const hull = new THREE.MeshStandardMaterial({ color: "#c9ced6", roughness: 0.35, metalness: 0.85 })
  const dark = new THREE.MeshStandardMaterial({ color: "#5a6070", roughness: 0.5, metalness: 0.7 })
  const disc = new THREE.Mesh(new THREE.SphereGeometry(3.2, 28, 10), hull)
  disc.scale.set(1, 0.22, 1)
  disc.castShadow = true
  group.add(disc)
  const belly = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 0.5, 20), dark)
  belly.position.y = -0.5
  group.add(belly)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: "#8fd8ff", roughness: 0.05, metalness: 0, transmission: 0.6, transparent: true, opacity: 0.85, thickness: 0.5 }),
  )
  dome.position.y = 0.55
  group.add(dome)
  const pilot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), new THREE.MeshStandardMaterial({ color: "#7fd66b", roughness: 0.8 }))
  pilot.scale.set(0.8, 1.1, 0.8)
  pilot.position.y = 0.85
  group.add(pilot)
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ color: "#111111" }))
    eye.scale.set(0.7, 1.4, 0.6)
    eye.position.set(side * 0.16, 1.02, 0.34)
    group.add(eye)
  }
  const lights: THREE.Mesh[] = []
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffd166" }))
    light.position.set(Math.cos(angle) * 2.55, -0.18, Math.sin(angle) * 2.55)
    group.add(light)
    lights.push(light)
  }
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: "#9ef7c8",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  // A cone with its apex at the belly, opening downward; scaled per frame to reach the ground.
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1, 24, 1, true), beamMaterial)
  beam.geometry.translate(0, -0.5, 0)
  beam.position.y = -0.7
  group.add(beam)
  group.visible = false
  return { group, beam, beamMaterial, lights, disc, hover: UFO_HOVER }
}

/** `reach` is how far below the saucer the beam should shine; `strength` 0..1 fades it. */
export function stepUfo(ufo: Ufo, t: number, reach: number, strength: number) {
  ufo.group.rotation.y = t * 0.6
  ufo.lights.forEach((light, i) => {
    const on = (Math.sin(t * 6 - i * 0.55) + 1) / 2
    ;(light.material as THREE.MeshBasicMaterial).color.setHSL(0.13, 1, 0.45 + on * 0.35)
  })
  ufo.beam.scale.set(1, Math.max(0.01, reach), 1)
  ufo.beamMaterial.opacity = 0.32 * strength * (0.85 + 0.15 * Math.sin(t * 9))
  ufo.beam.visible = strength > 0.01
  // The beam should not spin with the hull.
  ufo.beam.rotation.y = -ufo.group.rotation.y
}
