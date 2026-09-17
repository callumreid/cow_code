/** Pure parsing of Datadog's monitor search, kept apart from the server-only client so it can be tested. */
export type Alert = {
  /** Datadog monitor id. */
  id: number
  name: string
  /** When the monitor last went into alert, if Datadog says. */
  since: string | null
  url: string
}

type RawMonitor = {
  id?: number
  name?: string
  status?: string
  last_triggered_ts?: number | null
}

/** Pure: Datadog's search page into alerts, alerting ones only, sorted so the freshest come first. */
export function parseMonitors(raw: unknown, base: string): Alert[] {
  const list = (raw as { monitors?: unknown } | null)?.monitors
  const monitors = (Array.isArray(list) ? (list as RawMonitor[]) : []).filter(
    (monitor): monitor is RawMonitor & { id: number; name: string } => typeof monitor?.id === "number" && typeof monitor?.name === "string",
  )
  return monitors
    .filter((monitor) => (monitor.status ?? "Alert").toLowerCase() === "alert")
    .map((monitor) => ({
      id: monitor.id,
      name: monitor.name,
      since: monitor.last_triggered_ts ? new Date(monitor.last_triggered_ts * 1000).toISOString() : null,
      url: `https://app.${base}/monitors/${monitor.id}`,
    }))
    .sort((a, b) => (b.since ?? "").localeCompare(a.since ?? "") || a.name.localeCompare(b.name))
}

