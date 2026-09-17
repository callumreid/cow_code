import { describe, expect, test } from "bun:test"
import { describeWeather, parseOpenMeteo, skyLook, sunPosition } from "./sky"

describe("the sun over San Francisco", () => {
  test("is high and south at solar noon, below the horizon at midnight", () => {
    // 2026-09-14, PDT (UTC-7). Solar noon in SF is about 13:05 local.
    const noon = sunPosition(new Date("2026-09-14T20:05:00Z"))
    expect(noon.altitude).toBeGreaterThan(50)
    expect(noon.altitude).toBeLessThan(60)
    expect(Math.abs(noon.azimuth - 180)).toBeLessThan(6)
    const midnight = sunPosition(new Date("2026-09-14T08:00:00Z"))
    expect(midnight.altitude).toBeLessThan(-30)
    const morning = sunPosition(new Date("2026-09-14T15:30:00Z"))
    expect(morning.altitude).toBeGreaterThan(5)
    expect(morning.azimuth).toBeGreaterThan(80)
    expect(morning.azimuth).toBeLessThan(120)
    const evening = sunPosition(new Date("2026-09-15T01:30:00Z"))
    expect(evening.altitude).toBeGreaterThan(0)
    expect(evening.azimuth).toBeGreaterThan(240)
  })

  test("sunrise happens about when the almanac says", () => {
    // Sunrise 2026-09-14 is roughly 06:52 PDT; the sun crosses the horizon within a few minutes of it.
    const before = sunPosition(new Date("2026-09-14T13:40:00Z")).altitude
    const after = sunPosition(new Date("2026-09-14T14:05:00Z")).altitude
    expect(before).toBeLessThan(0)
    expect(after).toBeGreaterThan(0)
  })
})

describe("sky look", () => {
  test("goes night, twilight, golden hour, day and back", () => {
    expect(skyLook(-30).stars).toBe(1)
    expect(skyLook(-6).stars).toBeGreaterThan(0)
    expect(skyLook(-6).stars).toBeLessThan(1)
    expect(skyLook(5).stars).toBe(0)
    expect(skyLook(60).sunIntensity).toBeGreaterThan(skyLook(5).sunIntensity)
    expect(skyLook(5).sunIntensity).toBeGreaterThan(skyLook(-30).sunIntensity)
  })
})

describe("Open-Meteo", () => {
  test("turns a current block into the field's weather", () => {
    const w = parseOpenMeteo({ current: { temperature_2m: 60.1, weather_code: 61, cloud_cover: 90, precipitation: 1.2, rain: 1.2, snowfall: 0, wind_speed_10m: 12 } }, 5)!
    expect(w.precipitation).toBe("rain")
    expect(w.cloudCover).toBeCloseTo(0.9)
    expect(w.intensity).toBeCloseTo(1.2)
    expect(w.fog).toBe(false)
    expect(w.fetchedAt).toBe(5)
    expect(describeWeather(61)).toBe("Rain")
    expect(parseOpenMeteo({ current: { weather_code: 45, cloud_cover: 100 } })!.fog).toBe(true)
    expect(parseOpenMeteo({ current: { weather_code: 71, snowfall: 0.4 } })!.precipitation).toBe("snow")
    expect(parseOpenMeteo(null)).toBeNull()
    expect(parseOpenMeteo({ current: { weather_code: 0, cloud_cover: 2, precipitation: 0 } })!.precipitation).toBe("none")
  })
})
