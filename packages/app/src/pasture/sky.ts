/**
 * Where the sun is over a place at an instant, so the field's light can match
 * it. Pure arithmetic (the NOAA solar position algorithm), no network; good to
 * a fraction of a degree, which is plenty for a pasture.
 */
export const SAN_FRANCISCO = { name: "San Francisco", lat: 37.7749, lon: -122.4194, timeZone: "America/Los_Angeles" }

export type SunPosition = {
  /** Degrees above the horizon; negative at night. */
  altitude: number
  /** Degrees clockwise from north. */
  azimuth: number
}

const rad = Math.PI / 180

export function sunPosition(date: Date, lat = SAN_FRANCISCO.lat, lon = SAN_FRANCISCO.lon): SunPosition {
  const ms = date.getTime()
  const julianDay = ms / 86_400_000 + 2440587.5
  const t = (julianDay - 2451545) / 36525
  const meanLongitude = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t)
  const m = meanAnomaly * rad
  const centre = Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(2 * m) * (0.019993 - 0.000101 * t) + Math.sin(3 * m) * 0.000289
  const trueLongitude = meanLongitude + centre
  const omega = 125.04 - 1934.136 * t
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * rad)
  const obliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60
  const correctedObliquity = obliquity + 0.00256 * Math.cos(omega * rad)
  const declination = Math.asin(Math.sin(correctedObliquity * rad) * Math.sin(apparentLongitude * rad))
  const y = Math.tan((correctedObliquity / 2) * rad) ** 2
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
  const equationOfTime =
    4 *
    (180 / Math.PI) *
    (y * Math.sin(2 * meanLongitude * rad) -
      2 * eccentricity * Math.sin(m) +
      4 * eccentricity * y * Math.sin(m) * Math.cos(2 * meanLongitude * rad) -
      0.5 * y * y * Math.sin(4 * meanLongitude * rad) -
      1.25 * eccentricity * eccentricity * Math.sin(2 * m))
  const minutesUtc = (ms % 86_400_000) / 60_000
  const trueSolarTime = (((minutesUtc + equationOfTime + 4 * lon) % 1440) + 1440) % 1440
  let hourAngle = trueSolarTime / 4 - 180
  if (hourAngle < -180) hourAngle += 360
  const phi = lat * rad
  const h = hourAngle * rad
  const cosZenith = Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.cos(h)
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith)))
  let azimuth: number
  const denominator = Math.cos(phi) * Math.sin(zenith)
  if (Math.abs(denominator) < 1e-9) azimuth = 180
  else {
    const cosAz = (Math.sin(phi) * Math.cos(zenith) - Math.sin(declination)) / denominator
    azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) / rad
    azimuth = hourAngle > 0 ? (azimuth + 180) % 360 : (540 - azimuth) % 360
  }
  return { altitude: 90 - zenith / rad, azimuth }
}

/** Current weather as the field understands it. WMO code groups from Open-Meteo. */
export type Weather = {
  /** 0..1 */
  cloudCover: number
  /** rain | snow | none, from precipitation and the code. */
  precipitation: "rain" | "snow" | "none"
  /** mm in the last interval; scales the rain. */
  intensity: number
  fog: boolean
  thunder: boolean
  temperatureF: number | null
  windKph: number
  /** WMO weather code, for the label. */
  code: number
  fetchedAt: number
}

export function describeWeather(code: number): string {
  if (code === 0) return "Clear"
  if (code <= 2) return "Partly cloudy"
  if (code === 3) return "Overcast"
  if (code <= 48) return "Fog"
  if (code <= 57) return "Drizzle"
  if (code <= 67) return "Rain"
  if (code <= 77) return "Snow"
  if (code <= 82) return "Showers"
  if (code <= 86) return "Snow showers"
  return "Thunderstorm"
}

export function parseOpenMeteo(raw: unknown, now = Date.now()): Weather | null {
  const current = (raw as { current?: Record<string, unknown> } | null)?.current
  if (!current || typeof current !== "object") return null
  const num = (key: string) => (typeof current[key] === "number" ? (current[key] as number) : null)
  const code = num("weather_code") ?? 0
  const rain = num("rain") ?? 0
  const snow = num("snowfall") ?? 0
  const precipitation = num("precipitation") ?? 0
  const snowing = snow > 0 || (code >= 71 && code <= 77) || code === 85 || code === 86
  return {
    cloudCover: Math.max(0, Math.min(1, (num("cloud_cover") ?? 0) / 100)),
    precipitation: snowing ? "snow" : rain > 0 || precipitation > 0 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95 ? "rain" : "none",
    intensity: Math.max(0, precipitation, rain, snow * 10),
    fog: code === 45 || code === 48,
    thunder: code >= 95,
    temperatureF: num("temperature_2m"),
    windKph: num("wind_speed_10m") ?? 0,
    code,
    fetchedAt: now,
  }
}

/** The clear-sky look for a sun altitude, in degrees: night, twilight, golden hour, day. */
export type SkyLook = {
  sky: string
  horizon: string
  sunColor: string
  sunIntensity: number
  ambient: number
  stars: number
}

const mix = (a: [number, number, number], b: [number, number, number], u: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * u,
  a[1] + (b[1] - a[1]) * u,
  a[2] + (b[2] - a[2]) * u,
]
const hex = ([r, g, b]: [number, number, number]) =>
  `#${[r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`

const NIGHT: [number, number, number] = [0x0b, 0x12, 0x2a]
const DUSK: [number, number, number] = [0x3a, 0x3f, 0x7a]
const GOLDEN: [number, number, number] = [0xf3, 0xa8, 0x6a]
const DAY: [number, number, number] = [0xa9, 0xd8, 0xf5]
const HORIZON_NIGHT: [number, number, number] = [0x18, 0x1e, 0x3a]
const HORIZON_GOLDEN: [number, number, number] = [0xff, 0xc4, 0x88]
const HORIZON_DAY: [number, number, number] = [0xbf, 0xe0, 0xf5]

export function skyLook(altitude: number): SkyLook {
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
  if (altitude <= -12) return { sky: hex(NIGHT), horizon: hex(HORIZON_NIGHT), sunColor: "#9fb4ff", sunIntensity: 0.12, ambient: 0.12, stars: 1 }
  if (altitude <= 0) {
    const u = clamp01((altitude + 12) / 12)
    return { sky: hex(mix(NIGHT, DUSK, u)), horizon: hex(mix(HORIZON_NIGHT, HORIZON_GOLDEN, u * 0.8)), sunColor: "#ff9a5c", sunIntensity: 0.12 + 0.5 * u, ambient: 0.12 + 0.18 * u, stars: 1 - u }
  }
  if (altitude <= 10) {
    const u = clamp01(altitude / 10)
    return { sky: hex(mix(DUSK, GOLDEN, u)), horizon: hex(HORIZON_GOLDEN), sunColor: "#ffb070", sunIntensity: 0.6 + 1.0 * u, ambient: 0.3 + 0.25 * u, stars: 0 }
  }
  const u = clamp01((altitude - 10) / 30)
  return { sky: hex(mix(GOLDEN, DAY, u)), horizon: hex(mix(HORIZON_GOLDEN, HORIZON_DAY, u)), sunColor: u < 1 ? "#ffe0b8" : "#fff4dc", sunIntensity: 1.6 + 0.6 * u, ambient: 0.55 + 0.4 * u, stars: 0 }
}

export function localClock(date: Date, timeZone = SAN_FRANCISCO.timeZone) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(date)
}
