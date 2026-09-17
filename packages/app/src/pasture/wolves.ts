import type { Critter } from "./critters"

/** An alert as the page sees it: the same shape the alerts route returns. */
export type AlertSummary = { id: number; name: string; since: string | null; url: string }

export const WOLF_PREFIX = "wolf:"

export const wolfID = (alert: Pick<AlertSummary, "id">) => `${WOLF_PREFIX}${alert.id}`

export const isWolf = (id: string) => id.startsWith(WOLF_PREFIX)

/** One wolf per firing alert. They are all grey; the alert is what tells them apart. */
export function wolfFor(alert: AlertSummary): Critter {
  return {
    id: wolfID(alert),
    name: "Wolf",
    kind: "wolf",
    blurb: alert.name,
    body: "#5d6166",
    patch: "#a8abae",
    eyes: "#e8c34a",
    size: 0.9,
    ears: "point",
    legs: "regular",
    speed: 6,
  }
}
