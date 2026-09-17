import { describe, expect, test } from "bun:test"
import { parseMonitors } from "./datadog-parse"

describe("Datadog monitors into alerts", () => {
  test("keeps alerting monitors, freshest first, with a link into Datadog", () => {
    const alerts = parseMonitors(
      {
        monitors: [
          { id: 2, name: "Older", status: "Alert", last_triggered_ts: 1_700_000_000 },
          { id: 3, name: "Fine", status: "OK", last_triggered_ts: 1_800_000_000 },
          { id: 1, name: "Fresh", status: "Alert", last_triggered_ts: 1_800_000_000 },
          { id: 4, name: "Warned", status: "Warn" },
          { id: "nope", name: "Broken" },
          { id: 5, name: "Unknown when", status: "Alert" },
        ],
        metadata: { total_count: 6 },
      },
      "us5.datadoghq.com",
    )
    expect(alerts.map((a) => a.id)).toEqual([1, 2, 5])
    expect(alerts[0].url).toBe("https://app.us5.datadoghq.com/monitors/1")
    expect(alerts[0].since).toBe("2027-01-15T08:00:00.000Z")
    expect(alerts[2].since).toBeNull()
  })

  test("an empty or odd response is no alerts", () => {
    expect(parseMonitors(null, "datadoghq.com")).toEqual([])
    expect(parseMonitors({}, "datadoghq.com")).toEqual([])
    expect(parseMonitors({ monitors: "nope" }, "datadoghq.com")).toEqual([])
  })
})
