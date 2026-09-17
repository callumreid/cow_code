import { parseOpenMeteo, SAN_FRANCISCO, type Weather } from "./sky"

/**
 * San Francisco's weather right now, from Open-Meteo (free, keyless, answers
 * cross-origin). The field asks every ten minutes.
 */
export async function fetchWeather(): Promise<Weather | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.searchParams.set("latitude", String(SAN_FRANCISCO.lat))
  url.searchParams.set("longitude", String(SAN_FRANCISCO.lon))
  url.searchParams.set("current", "temperature_2m,weather_code,cloud_cover,precipitation,rain,snowfall,wind_speed_10m")
  url.searchParams.set("temperature_unit", "fahrenheit")
  url.searchParams.set("timezone", SAN_FRANCISCO.timeZone)
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) return null
  return parseOpenMeteo(await response.json())
}
