import * as THREE from "three"
import { mulberry32 } from "@/pasture/rng"

/**
 * The far distance, north of the barn: the bay, the San Francisco skyline
 * (Salesforce Tower, the Transamerica Pyramid, Coit Tower, Sutro Tower on its
 * hill) and the Golden Gate Bridge off to the west. All of it sits beyond the
 * fog line so it reads as miles away, and it is lit by the same sky.
 */
export function buildBackdrop(scene: THREE.Scene) {
  const group = new THREE.Group()
  const rand = mulberry32(415)

  // The bay: a wide band of water between the far hills and the field.
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(700, 90),
    new THREE.MeshStandardMaterial({ color: "#3b7fb5", roughness: 0.25, metalness: 0.1 }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(0, 0.05, -200)
  group.add(water)

  // Hills behind the city, and a headland the bridge runs to.
  const hill = new THREE.MeshStandardMaterial({ color: "#6b8a5c", roughness: 1 })
  for (const [x, z, w, h] of [
    [-260, -290, 220, 40],
    [-60, -300, 260, 34],
    [170, -295, 240, 44],
    [-200, -250, 80, 22],
  ]) {
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), hill)
    mound.scale.set(w / 2, h, w / 3)
    mound.position.set(x, -2, z)
    group.add(mound)
  }

  // The skyline: a cluster of towers with a few landmarks in it.
  const glass = new THREE.MeshStandardMaterial({ color: "#8fa6bb", roughness: 0.4, metalness: 0.5 })
  const concrete = new THREE.MeshStandardMaterial({ color: "#c9c4b8", roughness: 0.9 })
  const white = new THREE.MeshStandardMaterial({ color: "#e8e4dc", roughness: 0.9 })
  const city = new THREE.Group()
  for (let i = 0; i < 34; i++) {
    const w = 5 + rand() * 9
    const h = 10 + rand() * 30
    const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), rand() < 0.5 ? glass : concrete)
    tower.position.set((rand() - 0.5) * 150, h / 2, (rand() - 0.5) * 40)
    city.add(tower)
  }
  // Salesforce Tower: tall, rounded, tapering.
  const salesforce = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 6, 78, 18), glass)
  salesforce.position.set(12, 39, -6)
  city.add(salesforce)
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.6, 6, 18), new THREE.MeshStandardMaterial({ color: "#dfe8f0", roughness: 0.3, emissive: "#9fc7ff", emissiveIntensity: 0.25 }))
  crown.position.set(12, 81, -6)
  city.add(crown)
  // The Transamerica Pyramid, with its wings and spire.
  const pyramid = new THREE.Mesh(new THREE.ConeGeometry(7, 62, 4), white)
  pyramid.rotation.y = Math.PI / 4
  pyramid.position.set(-22, 31, 4)
  city.add(pyramid)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 12, 6), white)
  spire.position.set(-22, 66, 4)
  city.add(spire)
  // Coit Tower on its hill.
  const coitHill = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 10), hill)
  coitHill.scale.set(1.6, 0.55, 1.2)
  coitHill.position.set(-62, 0, 8)
  city.add(coitHill)
  const coit = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 22, 14), white)
  coit.position.set(-62, 19, 8)
  city.add(coit)
  city.position.set(70, 0, -262)
  group.add(city)

  // Sutro Tower on Twin Peaks, off to the south-west of downtown.
  const sutroHill = new THREE.Mesh(new THREE.SphereGeometry(40, 18, 12), hill)
  sutroHill.scale.set(1.5, 0.45, 1)
  sutroHill.position.set(-30, -4, -270)
  group.add(sutroHill)
  const steel = new THREE.MeshStandardMaterial({ color: "#d9d4cb", roughness: 0.6 })
  for (const dx of [-5, 0, 5]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1, 50, 6), steel)
    leg.position.set(-30 + dx, 39, -270)
    group.add(leg)
  }
  for (const y of [40, 52, 62]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 0.8), steel)
    bar.position.set(-30, y, -270)
    group.add(bar)
  }

  // The Golden Gate Bridge, west (left), its towers in International Orange.
  const orange = new THREE.MeshStandardMaterial({ color: "#c0472b", roughness: 0.7 })
  const bridge = new THREE.Group()
  const span = 150
  const deckY = 16
  const towerH = 62
  const deck = new THREE.Mesh(new THREE.BoxGeometry(span + 60, 1.6, 8), orange)
  deck.position.y = deckY
  bridge.add(deck)
  for (const x of [-span / 2, span / 2]) {
    for (const dz of [-3, 3]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(3, towerH, 2.4), orange)
      leg.position.set(x, towerH / 2, dz)
      bridge.add(leg)
    }
    for (const y of [deckY + 14, deckY + 30, towerH - 4]) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 8.4), orange)
      brace.position.set(x, y, 0)
      bridge.add(brace)
    }
  }
  // Main cables: a sag between the towers and down to the anchorages.
  const cablePoints = (x0: number, x1: number, y0: number, y1: number, sag: number) => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const u = i / 24
      const x = x0 + (x1 - x0) * u
      const y = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * sag
      points.push(new THREE.Vector3(x, y, 0))
    }
    return points
  }
  for (const dz of [-3.6, 3.6]) {
    for (const [x0, x1, y0, y1, sag] of [
      [-span / 2, span / 2, towerH, towerH, towerH - deckY - 4],
      [-span / 2 - 30, -span / 2, deckY + 2, towerH, 0],
      [span / 2, span / 2 + 30, towerH, deckY + 2, 0],
    ]) {
      const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints(x0, x1, y0, y1, sag)), 32, 0.45, 5, false), orange)
      cable.position.z = dz
      bridge.add(cable)
      // Suspenders.
      for (let i = 1; i < 24; i += 2) {
        const p = cablePoints(x0, x1, y0, y1, sag)[i]
        if (p.y - deckY < 2) continue
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, p.y - deckY, 4), orange)
        hanger.position.set(p.x, deckY + (p.y - deckY) / 2, dz)
        bridge.add(hanger)
      }
    }
  }
  bridge.position.set(-150, 0, -235)
  bridge.rotation.y = 0.35
  group.add(bridge)

  group.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (mesh.isMesh) {
      mesh.castShadow = false
      mesh.receiveShadow = false
    }
  })
  scene.add(group)
  return group
}
