/**
 * The team's events, for the barn: while one is on, the doors are open and
 * the disco ball is up. Events come from public iCalendar feeds (a Luma
 * calendar's feed, a public Google Calendar) and an optional hand-written
 * list. Nothing here needs a login.
 */
export type PartyEvent = { name: string; start: string; end: string; url: string | null; location: string | null }

/** The doors open this long before an event starts; people arrive early. */
export const PARTY_LEAD_MS = 15 * 60_000

/** Long lines are folded with a line break and one space or tab. */
export function unfoldICS(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "")
}

const unescapeICS = (value: string) => value.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1")

type Line = { name: string; params: Record<string, string>; value: string }

function parseLine(line: string): Line | null {
  // The first colon outside quotes ends the name and parameters.
  let inQuote = false
  let split = -1
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') inQuote = !inQuote
    else if (c === ":" && !inQuote) {
      split = i
      break
    }
  }
  if (split <= 0) return null
  const [name, ...paramParts] = line.slice(0, split).split(";")
  const params: Record<string, string> = {}
  for (const part of paramParts) {
    const eq = part.indexOf("=")
    if (eq > 0) params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1).replace(/^"|"$/g, "")
  }
  return { name: name.toUpperCase(), params, value: line.slice(split + 1) }
}

/** Wall-clock parts in a named zone into the instant, via Intl; two passes cover daylight-saving edges. */
export function zonedToUTC(y: number, mo: number, d: number, h: number, mi: number, s: number, timeZone: string) {
  const asUTC = Date.UTC(y, mo - 1, d, h, mi, s)
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const offset = (at: number) => {
    const parts = format.formatToParts(new Date(at))
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second")) - at
  }
  let guess = asUTC - offset(asUTC)
  guess = asUTC - offset(guess)
  return guess
}

export function parseICSDate(value: string, params: Record<string, string>, defaultZone?: string): { at: number; allDay: boolean } | null {
  const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h, mi, s, z] = m
  const allDay = !h || params.VALUE === "DATE"
  const Y = +y
  const M = +mo
  const D = +d
  const H = +(h ?? 0)
  const MI = +(mi ?? 0)
  const S = +(s ?? 0)
  if (z) return { at: Date.UTC(Y, M - 1, D, H, MI, S), allDay: false }
  const zone = params.TZID || defaultZone
  if (zone) {
    try {
      return { at: zonedToUTC(Y, M, D, H, MI, S, zone), allDay }
    } catch {
      // An unknown zone name: read it as UTC below.
    }
  }
  return { at: Date.UTC(Y, M - 1, D, H, MI, S), allDay }
}

function toEvent(fields: Record<string, Line>, zone: string | undefined): PartyEvent | null {
  if ((fields.STATUS?.value ?? "").trim().toUpperCase() === "CANCELLED") return null
  const start = fields.DTSTART ? parseICSDate(fields.DTSTART.value, fields.DTSTART.params, zone) : null
  if (!start) return null
  const end =
    (fields.DTEND ? parseICSDate(fields.DTEND.value, fields.DTEND.params, zone) : null) ??
    { at: start.at + (start.allDay ? 86_400_000 : 2 * 3_600_000), allDay: start.allDay }
  const name = unescapeICS(fields.SUMMARY?.value ?? "").trim() || "An event"
  const description = unescapeICS(fields.DESCRIPTION?.value ?? "")
  const url = fields.URL?.value.trim() || description.match(/https?:\/\/[^\s)]+/)?.[0] || null
  const rawLocation = fields.LOCATION ? unescapeICS(fields.LOCATION.value).trim() : ""
  const location = rawLocation && !/^https?:\/\//.test(rawLocation) ? rawLocation : null
  return { name, start: new Date(start.at).toISOString(), end: new Date(end.at).toISOString(), url, location }
}

export function parseICS(text: string): PartyEvent[] {
  const events: PartyEvent[] = []
  let zone: string | undefined
  let current: Record<string, Line> | null = null
  for (const raw of unfoldICS(text).split("\n")) {
    const line = parseLine(raw.trim())
    if (!line) continue
    if (line.name === "X-WR-TIMEZONE") zone = line.value.trim()
    else if (line.name === "BEGIN" && line.value.trim().toUpperCase() === "VEVENT") current = {}
    else if (line.name === "END" && line.value.trim().toUpperCase() === "VEVENT") {
      if (current) {
        const event = toEvent(current, zone)
        if (event) events.push(event)
      }
      current = null
    } else if (current) current[line.name] = line
  }
  return events.sort((a, b) => a.start.localeCompare(b.start))
}

/** A hand-written list: `[{"name": "...", "start": "2026-09-16T18:00:00-07:00", "end": "..."}]`. */
export function parseManualEvents(json: string | undefined): PartyEvent[] {
  if (!json?.trim()) return []
  try {
    const raw = JSON.parse(json) as unknown
    if (!Array.isArray(raw)) return []
    const events: PartyEvent[] = []
    for (const item of raw as Array<Record<string, unknown>>) {
      const start = Date.parse(String(item?.start ?? ""))
      const end = Date.parse(String(item?.end ?? ""))
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue
      events.push({
        name: String(item.name ?? "An event"),
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        url: typeof item.url === "string" ? item.url : null,
        location: typeof item.location === "string" ? item.location : null,
      })
    }
    return events.sort((a, b) => a.start.localeCompare(b.start))
  } catch {
    return []
  }
}

/** Events on right now (doors open `lead` early), earliest first. */
export function activeEvents(events: PartyEvent[], now: number, lead = PARTY_LEAD_MS) {
  return events.filter((event) => Date.parse(event.start) - lead <= now && now < Date.parse(event.end)).sort((a, b) => a.start.localeCompare(b.start))
}

export function upcomingEvents(events: PartyEvent[], now: number, count = 3) {
  return events.filter((event) => Date.parse(event.start) > now).slice(0, count)
}
