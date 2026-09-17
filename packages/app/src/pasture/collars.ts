import { hashString } from "@/pasture/rng"

/**
 * Every person on the team wears a different collar. Sixteen colours that
 * read against grass and against every coat; the bell underneath is brass.
 */
export const COLLAR_PALETTE = [
  "#e5484d", // red
  "#f76b15", // orange
  "#ffc53d", // amber
  "#8e4ec6", // purple
  "#0090ff", // blue
  "#12a594", // teal
  "#e93d82", // pink
  "#00a2c7", // cyan
  "#3e63dd", // indigo
  "#d6409f", // magenta
  "#f4f4f4", // white
  "#8d6e63", // brown
  "#ff8fab", // rose
  "#7dd3fc", // sky
  "#a3e635", // lime
  "#1c1c1c", // black
] as const

export type CollarColor = (typeof COLLAR_PALETTE)[number]

/**
 * A stable colour per login: hash first, then walk forward past colours
 * somebody else on the field already took. Logins are visited in sorted
 * order so the same herd always gets the same collars.
 */
export function assignCollars(logins: Iterable<string>): Map<string, CollarColor> {
  const sorted = [...new Set(logins)].sort()
  const taken = new Set<number>()
  const out = new Map<string, CollarColor>()
  for (const login of sorted) {
    let index = hashString(login) % COLLAR_PALETTE.length
    for (let tries = 0; tries < COLLAR_PALETTE.length && taken.has(index); tries++) index = (index + 1) % COLLAR_PALETTE.length
    taken.add(index)
    out.set(login, COLLAR_PALETTE[index])
  }
  return out
}

export const collarIndex = (color: string) => Math.max(0, COLLAR_PALETTE.indexOf(color as CollarColor))
