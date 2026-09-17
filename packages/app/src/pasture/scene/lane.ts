import { PENS } from "../pens"

/**
 * The lane: a loop around the outside of every pen, where the farmer and the
 * pets stay out of the cows' way and never have to cross a fence. It runs
 * along the front (in front of the signs), up the right side, across the back
 * by the barn, and down the left side. `s` is the distance along the loop.
 */
const MARGIN = 5

export const LANE = (() => {
  const x0 = Math.min(...PENS.map((pen) => pen.rect.x0)) - MARGIN
  const x1 = Math.max(...PENS.map((pen) => pen.rect.x1)) + MARGIN
  const z0 = Math.min(...PENS.map((pen) => pen.rect.z0)) - MARGIN
  const z1 = Math.max(...PENS.map((pen) => pen.rect.z1)) + MARGIN
  const width = x1 - x0
  const depth = z1 - z0
  return { x0, x1, z0, z1, width, depth, length: 2 * (width + depth) }
})()

export type LanePoint = { x: number; z: number; heading: number; side: "front" | "right" | "back" | "left" }

/** Wrap `s` into [0, length). */
export const wrapLane = (s: number) => ((s % LANE.length) + LANE.length) % LANE.length

/**
 * Where the loop is at distance `s`, walking clockwise seen from above
 * (front lane left to right first). `offset` shifts sideways: positive is
 * away from the pens. Heading follows the cow convention: forward is +z at 0.
 */
export function lanePoint(s: number, offset = 0): LanePoint {
  const { x0, x1, z0, z1, width, depth } = LANE
  let d = wrapLane(s)
  if (d < width) return { x: x0 + d, z: z1 + offset, heading: Math.atan2(1, 0), side: "front" }
  d -= width
  if (d < depth) return { x: x1 + offset, z: z1 - d, heading: Math.atan2(0, -1), side: "right" }
  d -= depth
  if (d < width) return { x: x1 - d, z: z0 - offset, heading: Math.atan2(-1, 0), side: "back" }
  d -= width
  return { x: x0 - offset, z: z0 + d, heading: Math.atan2(0, 1), side: "left" }
}

/** The heading that faces the pens from a point on the lane. */
export function towardPens(side: LanePoint["side"]) {
  switch (side) {
    case "front":
      return Math.atan2(0, -1)
    case "right":
      return Math.atan2(-1, 0)
    case "back":
      return Math.atan2(0, 1)
    default:
      return Math.atan2(1, 0)
  }
}
