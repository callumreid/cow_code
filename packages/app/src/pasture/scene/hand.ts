import * as THREE from "three"

export type Hand = { group: THREE.Group; fingers: THREE.Group[]; thumb: THREE.Group }

/** The hand of god: a palm, four fingers and a thumb that curl round a cow, and a shirt sleeve. */
export function buildHand(): Hand {
  const skin = new THREE.MeshStandardMaterial({ color: "#f2c9a8", roughness: 0.85 })
  const group = new THREE.Group()
  const palm = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 1.2, 6, 14), skin)
  palm.rotation.x = Math.PI / 2
  palm.scale.set(1.1, 0.42, 1)
  palm.castShadow = true
  group.add(palm)
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.05, 3.2, 16),
    new THREE.MeshStandardMaterial({ color: "#f7f5ef", roughness: 0.9 }),
  )
  sleeve.position.set(0, 1.8, -0.6)
  group.add(sleeve)
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.5, 16), new THREE.MeshStandardMaterial({ color: "#3b5bdb", roughness: 0.8 }))
  cuff.position.set(0, 0.45, -0.6)
  group.add(cuff)
  const fingers: THREE.Group[] = []
  for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Group()
    pivot.position.set(-0.78 + i * 0.52, -0.05, 1.1)
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.2, 4, 10), skin)
    finger.rotation.x = Math.PI / 2
    finger.position.z = 0.7
    finger.castShadow = true
    pivot.add(finger)
    group.add(pivot)
    fingers.push(pivot)
  }
  const thumb = new THREE.Group()
  thumb.position.set(1.15, -0.05, 0.1)
  const thumbMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 1, 4, 10), skin)
  thumbMesh.rotation.z = -Math.PI / 2
  thumbMesh.position.x = 0.6
  thumbMesh.castShadow = true
  thumb.add(thumbMesh)
  group.add(thumb)
  group.scale.setScalar(2.1)
  group.visible = false
  return { group, fingers, thumb }
}

export function curlHand(hand: Hand, curl: number) {
  for (const finger of hand.fingers) finger.rotation.x = 0.25 + curl * 1.05
  hand.thumb.rotation.z = -0.1 - curl * 0.9
}
