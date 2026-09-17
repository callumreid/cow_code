import { describe, expect, test } from "bun:test"
import { activeEvents, parseICS, parseManualEvents, upcomingEvents, zonedToUTC } from "./events"

const LUMA = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Luma//Coval//EN",
  "X-WR-CALNAME:Coval",
  "BEGIN:VEVENT",
  "DTSTART:20260917T010000Z",
  "DTEND:20260917T030000Z",
  'ORGANIZER;CN="Coval Events":MAILTO:calendar-invite@lu.ma',
  "UID:evt-duK9evIhfNlqNAC@events.lu.ma",
  "SUMMARY:Voice AI Happy Hour & Fireside Chat",
  "DESCRIPTION:Get up-to-date information at: https://luma.com/h2qu25rt\\n\\nAd",
  " dress:\\nCheck event page for more details.\\n\\nHosted by Coval Events & 3 o",
  " thers",
  "LOCATION:https://luma.com/event/evt-duK9evIhfNlqNAC",
  "STATUS:TENTATIVE",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTSTART:20260806T020000Z",
  "DTEND:20260806T040000Z",
  "SUMMARY:The Future of Voice AI Dinner",
  "LOCATION:Smith & Wollensky - Las Vegas\\, The Grand Canal Shoppes\\, 3377 S La",
  " s Vegas Blvd\\, Las Vegas\\, NV 89109\\, USA",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTSTART:20260920T100000Z",
  "SUMMARY:Cancelled thing",
  "STATUS:CANCELLED",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n")

describe("iCalendar feeds", () => {
  test("reads Luma's feed: folded lines, escaped commas, a link out of the description, cancelled ones dropped", () => {
    const events = parseICS(LUMA)
    expect(events.map((e) => e.name)).toEqual(["The Future of Voice AI Dinner", "Voice AI Happy Hour & Fireside Chat"])
    const party = events[1]
    expect(party.start).toBe("2026-09-17T01:00:00.000Z")
    expect(party.end).toBe("2026-09-17T03:00:00.000Z")
    expect(party.url).toBe("https://luma.com/h2qu25rt")
    expect(party.location).toBeNull()
    expect(events[0].location).toBe("Smith & Wollensky - Las Vegas, The Grand Canal Shoppes, 3377 S Las Vegas Blvd, Las Vegas, NV 89109, USA")
  })

  test("Google's feed: zoned wall-clock times and all-day dates", () => {
    const text = [
      "BEGIN:VCALENDAR",
      "X-WR-TIMEZONE:America/Los_Angeles",
      "BEGIN:VEVENT",
      "DTSTART;TZID=America/Los_Angeles:20260916T180000",
      "DTEND;TZID=America/Los_Angeles:20260916T200000",
      "SUMMARY:Happy hour",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20261225",
      "DTEND;VALUE=DATE:20261226",
      "SUMMARY:Christmas",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART:20261101T090000",
      "SUMMARY:Floating, in the calendar's zone, two hours by default",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n")
    const events = parseICS(text)
    expect(events.find((e) => e.name === "Happy hour")).toMatchObject({ start: "2026-09-17T01:00:00.000Z", end: "2026-09-17T03:00:00.000Z" })
    expect(events.find((e) => e.name === "Christmas")).toMatchObject({ start: "2026-12-25T08:00:00.000Z", end: "2026-12-26T08:00:00.000Z" })
    // November 1 is after the clocks go back? No: 2026 DST ends November 1 at 2am, so 9am is PST (UTC-8).
    expect(events.find((e) => e.name.startsWith("Floating"))).toMatchObject({ start: "2026-11-01T17:00:00.000Z", end: "2026-11-01T19:00:00.000Z" })
  })

  test("zone arithmetic handles both sides of daylight saving", () => {
    expect(new Date(zonedToUTC(2026, 7, 4, 12, 0, 0, "America/Los_Angeles")).toISOString()).toBe("2026-07-04T19:00:00.000Z")
    expect(new Date(zonedToUTC(2026, 1, 4, 12, 0, 0, "America/Los_Angeles")).toISOString()).toBe("2026-01-04T20:00:00.000Z")
  })

  test("what is on now, with the doors opening a little early", () => {
    const events = parseICS(LUMA)
    const before = Date.parse("2026-09-17T00:30:00Z")
    expect(activeEvents(events, before)).toEqual([])
    expect(activeEvents(events, Date.parse("2026-09-17T00:50:00Z")).map((e) => e.name)).toEqual(["Voice AI Happy Hour & Fireside Chat"])
    expect(activeEvents(events, Date.parse("2026-09-17T02:59:00Z"))).toHaveLength(1)
    expect(activeEvents(events, Date.parse("2026-09-17T03:00:00Z"))).toEqual([])
    expect(upcomingEvents(events, before).map((e) => e.name)).toEqual(["Voice AI Happy Hour & Fireside Chat"])
  })

  test("a hand-written list", () => {
    const events = parseManualEvents('[{"name":"Launch party","start":"2026-09-20T18:00:00-07:00","end":"2026-09-20T21:00:00-07:00"},{"name":"bad","start":"x","end":"y"}]')
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ name: "Launch party", start: "2026-09-21T01:00:00.000Z", end: "2026-09-21T04:00:00.000Z", url: null })
    expect(parseManualEvents(undefined)).toEqual([])
    expect(parseManualEvents("not json")).toEqual([])
  })
})
