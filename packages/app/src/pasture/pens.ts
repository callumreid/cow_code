import type { PrState } from "@/pr-dashboard/types"

/** Where a cow lives: one pen per stage of a pull request's life. */
export type PenID = "draft" | "awaiting" | "changes" | "ready" | "merged"

export type Rect = { x0: number; x1: number; z0: number; z1: number }

export type Pen = { id: PenID; name: string; rect: Rect }

/**
 * Four small pens across the front of the field, one wide pen behind them.
 * The camera looks in from the front (+z), so the lifecycle reads left to
 * right and then "up" into the merged herd.
 */
export const PENS: Pen[] = [
  { id: "draft", name: "Drafts", rect: { x0: -46, x1: -24, z0: 6, z1: 28 } },
  { id: "awaiting", name: "Awaiting review", rect: { x0: -22.6, x1: -0.6, z0: 6, z1: 28 } },
  { id: "changes", name: "Changes requested", rect: { x0: 0.8, x1: 22.8, z0: 6, z1: 28 } },
  { id: "ready", name: "Ready to merge", rect: { x0: 24.2, x1: 46.2, z0: 6, z1: 28 } },
  { id: "merged", name: "Merged", rect: { x0: -46, x1: 46.2, z0: -30, z1: 3 } },
]

export function penFor(id: PenID): Pen {
  return PENS.find((pen) => pen.id === id) ?? PENS[PENS.length - 1]
}

/** The pen an open pull request grazes in, from the dashboard's single badge. */
export function penForState(state: PrState): PenID {
  switch (state) {
    case "draft":
      return "draft"
    case "ready":
    case "merge-queue":
      return "ready"
    case "changes-requested":
    case "re-requested":
      return "changes"
    default:
      return "awaiting"
  }
}

export function penCenter(id: PenID) {
  const { rect } = penFor(id)
  return { x: (rect.x0 + rect.x1) / 2, z: (rect.z0 + rect.z1) / 2 }
}

export function insidePen(id: PenID, x: number, z: number, inset = 0) {
  const { rect } = penFor(id)
  return x >= rect.x0 + inset && x <= rect.x1 - inset && z >= rect.z0 + inset && z <= rect.z1 - inset
}
