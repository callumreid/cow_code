import * as THREE from "three"
import { mulberry32 } from "@/pasture/rng"
import { skyLook, type Weather } from "@/pasture/sky"

/**
 * The sky over the field, driven by the real sun and weather: the sun and its
 * light track the sky, the colours run night to golden hour to day, stars and
 * a moon come out, clouds thicken with the cloud cover, and rain or snow
 * falls when it is falling in San Francisco.
 */
export type SkyState = { altitude: number; azimuth: number; weather: Weather | null }

export type SkyRig = {
  set(state: SkyState): void
  tick(t: number, dt: number): void
  dispose(): void
}

type SkyParts = {
  scene: THREE.Scene
  sun: THREE.Mesh
  moon: THREE.Mesh
  light: THREE.DirectionalLight
  hemisphere: THREE.HemisphereLight
  ambient: THREE.AmbientLight
  stars: THREE.Points
  clouds: THREE.Group[]
  cloudMaterial: THREE.MeshStandardMaterial
}

const SKY_RADIUS = 210

/** Sun altitude/azimuth into a point on the sky dome. Azimuth is clockwise from north; north is -z. */
function skyPoint(altitude: number, azimuth: number, radius = SKY_RADIUS) {
  const alt = (altitude * Math.PI) / 180
  const az = (azimuth * Math.PI) / 180
  return new THREE.Vector3(Math.sin(az) * Math.cos(alt) * radius, Math.sin(alt) * radius, -Math.cos(az) * Math.cos(alt) * radius)
}

type Drops = { points: THREE.Points; velocities: Float32Array; material: THREE.PointsMaterial; kind: "rain" | "snow" | "none" }

function buildDrops(scene: THREE.Scene): Drops {
  const count = 2600
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count)
  const rand = mulberry32(131)
  for (let i = 0; i < count; i++) {
    positions.set([(rand() - 0.5) * 140, rand() * 40, (rand() - 0.5) * 100 + 4], i * 3)
    velocities[i] = 0.7 + rand() * 0.6
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ color: "#cfe3ff", size: 0.35, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.visible = false
  scene.add(points)
  return { points, velocities, material, kind: "none" }
}

export function createSkyRig(parts: SkyParts): SkyRig {
  const { scene, sun, moon, light, hemisphere, ambient, stars, clouds, cloudMaterial } = parts
  const drops = buildDrops(scene)
  const fog = scene.fog as THREE.Fog
  const background = scene.background as THREE.Color
  let state: SkyState = { altitude: 45, azimuth: 180, weather: null }
  let wind = 1
  let rainAmount = 0
  let rainTarget = 0

  const apply = () => {
    const look = skyLook(state.altitude)
    const weather = state.weather
    const cover = weather?.cloudCover ?? 0.15
    const gloom = weather ? Math.max(cover * 0.55, weather.precipitation !== "none" ? 0.6 : 0, weather.fog ? 0.5 : 0) : 0
    // Sky colours, greyed by cloud cover.
    const skyColor = new THREE.Color(look.sky)
    const horizonColor = new THREE.Color(look.horizon)
    const grey = new THREE.Color(state.altitude > 0 ? "#8b949c" : "#151a26")
    skyColor.lerp(grey, gloom)
    horizonColor.lerp(grey, gloom * 0.8)
    background.copy(skyColor)
    fog.color.copy(horizonColor)
    fog.near = weather?.fog ? 30 : 130
    fog.far = weather?.fog ? 120 : 280
    // The sun, where it really is; below the horizon it drops out of sight and the moon takes over opposite it.
    const sunAt = skyPoint(state.altitude, state.azimuth)
    sun.position.copy(sunAt)
    sun.visible = state.altitude > -3
    ;(sun.material as THREE.MeshBasicMaterial).color.set(state.altitude < 8 ? "#ffb86b" : "#fff1a8")
    const moonAt = skyPoint(Math.max(15, -state.altitude), (state.azimuth + 180) % 360)
    moon.position.copy(moonAt)
    moon.visible = state.altitude < 2
    // Light comes from the sun by day, from the moon by night; never from under the ground.
    const source = state.altitude > -2 ? sunAt : moonAt
    light.position.copy(source.clone().normalize().multiplyScalar(90))
    light.position.y = Math.max(light.position.y, 12)
    light.color.set(look.sunColor)
    light.intensity = look.sunIntensity * (1 - gloom * 0.7)
    hemisphere.intensity = look.ambient * (1 - gloom * 0.3)
    hemisphere.color.copy(skyColor).lerp(new THREE.Color("#ffffff"), 0.3)
    ambient.intensity = 0.12 + look.ambient * 0.18
    ;(stars.material as THREE.PointsMaterial).opacity = look.stars * (1 - cover)
    // Clouds: how many show, and how bright they are.
    const shown = Math.round(2 + cover * (clouds.length - 2))
    clouds.forEach((cloud, i) => {
      cloud.visible = i < shown
    })
    const cloudTone = new THREE.Color(state.altitude > 0 ? "#ffffff" : "#3a3f52").lerp(new THREE.Color(state.altitude > 0 ? "#8e959e" : "#22262f"), gloom)
    cloudMaterial.color.copy(cloudTone)
    cloudMaterial.emissive.copy(cloudTone)
    cloudMaterial.emissiveIntensity = state.altitude > 0 ? 0.3 * (1 - gloom) : 0.05
    // Rain or snow.
    const kind = weather?.precipitation ?? "none"
    rainTarget = kind === "none" ? 0 : Math.min(1, 0.35 + (weather?.intensity ?? 0) * 0.5)
    drops.kind = kind
    drops.material.color.set(kind === "snow" ? "#ffffff" : "#cfe3ff")
    drops.material.size = kind === "snow" ? 0.55 : 0.35
    wind = 0.5 + (weather?.windKph ?? 0) / 20
  }

  return {
    set(next) {
      state = next
      apply()
    },
    tick(t, dt) {
      rainAmount += (rainTarget - rainAmount) * Math.min(1, dt * 0.8)
      drops.points.visible = rainAmount > 0.01
      drops.material.opacity = 0.75 * rainAmount
      if (!drops.points.visible) return
      const positions = drops.points.geometry.attributes.position as THREE.BufferAttribute
      const speed = drops.kind === "snow" ? 4 : 42
      const sway = drops.kind === "snow" ? 1.6 : 0.4
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i) - speed * drops.velocities[i] * dt
        let x = positions.getX(i) + Math.sin(t * 1.3 + i) * sway * dt + wind * dt * (drops.kind === "snow" ? 0.6 : 2)
        if (y < 0) {
          y = 38 + Math.random() * 4
          x = (Math.random() - 0.5) * 140
        }
        if (x > 72) x = -72
        positions.setXY(i, x, y)
      }
      positions.needsUpdate = true
    },
    dispose() {
      drops.points.geometry.dispose()
      drops.material.dispose()
    },
  }
}
