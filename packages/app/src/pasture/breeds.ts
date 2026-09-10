import type { PasturePullRequest } from "./types"

export type BreedPattern = "solid" | "patches" | "belt" | "whiteface" | "roan" | "backstripe"

export type Breed = {
  id: string
  name: string
  /** Body coat colour. */
  body: string
  /** Second colour for patches, belts, stripes or the face. */
  patch?: string
  pattern: BreedPattern
  horns: "none" | "short" | "long" | "huge"
  hump?: boolean
  shaggy?: boolean
  ears: "up" | "droop"
  /** Relative size; 1 is a regular cow. */
  size: number
  muzzle: string
  /** Dairy breeds get an udder. */
  dairy?: boolean
}

export const BREEDS: Breed[] = [
  { id: "hereford", name: "Hereford", body: "#a3492b", patch: "#f6f1e6", pattern: "whiteface", horns: "short", ears: "up", size: 1, muzzle: "#e8c9b8" },
  { id: "belted-galloway", name: "Belted Galloway", body: "#1c1b1b", patch: "#f3efe4", pattern: "belt", horns: "none", shaggy: true, ears: "up", size: 0.95, muzzle: "#2a2727" },
  { id: "brahman", name: "Brahman", body: "#c9c7c2", pattern: "solid", horns: "short", hump: true, ears: "droop", size: 1.05, muzzle: "#4a4442" },
  { id: "angus", name: "Angus", body: "#151515", pattern: "solid", horns: "none", ears: "up", size: 1, muzzle: "#2b2727" },
  { id: "holstein", name: "Holstein", body: "#f5f2ec", patch: "#171717", pattern: "patches", horns: "none", ears: "up", size: 1.05, muzzle: "#d9a8a0", dairy: true },
  { id: "jersey", name: "Jersey", body: "#c58a4b", pattern: "solid", horns: "none", ears: "up", size: 0.9, muzzle: "#3a2a22", dairy: true },
  { id: "highland", name: "Highland", body: "#c8722f", pattern: "solid", horns: "long", shaggy: true, ears: "up", size: 0.95, muzzle: "#7a4a2c" },
  { id: "guernsey", name: "Guernsey", body: "#f3e6cd", patch: "#c8873c", pattern: "patches", horns: "none", ears: "up", size: 1, muzzle: "#d8b09a", dairy: true },
  { id: "texas-longhorn", name: "Texas Longhorn", body: "#8b5a3c", patch: "#f0e6d8", pattern: "roan", horns: "huge", ears: "up", size: 1.05, muzzle: "#5a3a2a" },
  { id: "charolais", name: "Charolais", body: "#efe4cf", pattern: "solid", horns: "short", ears: "up", size: 1.15, muzzle: "#d8b8a0" },
  { id: "simmental", name: "Simmental", body: "#f4efe6", patch: "#b5572e", pattern: "patches", horns: "short", ears: "up", size: 1.1, muzzle: "#e0b8a8" },
  { id: "limousin", name: "Limousin", body: "#c98b4a", pattern: "solid", horns: "none", ears: "up", size: 1.05, muzzle: "#e0c2a0" },
  { id: "ayrshire", name: "Ayrshire", body: "#f4efe6", patch: "#8e3b2a", pattern: "patches", horns: "long", ears: "up", size: 1, muzzle: "#d8a898", dairy: true },
  { id: "dexter", name: "Dexter", body: "#241b18", pattern: "solid", horns: "short", ears: "up", size: 0.7, muzzle: "#3a2a24" },
  { id: "wagyu", name: "Wagyu", body: "#101011", pattern: "solid", horns: "short", ears: "up", size: 1, muzzle: "#2a2626" },
  { id: "zebu", name: "Zebu", body: "#d8d2c8", pattern: "solid", horns: "short", hump: true, ears: "droop", size: 0.8, muzzle: "#5a5250" },
  { id: "galloway", name: "Galloway", body: "#1f1f1f", pattern: "solid", horns: "none", shaggy: true, ears: "up", size: 0.95, muzzle: "#333030" },
  { id: "shorthorn", name: "Shorthorn", body: "#b45a3c", patch: "#f4ece2", pattern: "roan", horns: "short", ears: "up", size: 1.05, muzzle: "#e8c0b0" },
  { id: "brown-swiss", name: "Brown Swiss", body: "#8f8073", pattern: "solid", horns: "none", ears: "up", size: 1.1, muzzle: "#d8cfc4", dairy: true },
  { id: "chianina", name: "Chianina", body: "#f7f4ee", pattern: "solid", horns: "short", ears: "up", size: 1.25, muzzle: "#3a3535" },
  { id: "watusi", name: "Ankole-Watusi", body: "#7a3b2a", patch: "#f2e8dc", pattern: "patches", horns: "huge", ears: "up", size: 1.1, muzzle: "#4a2a20" },
  { id: "pinzgauer", name: "Pinzgauer", body: "#8a4a34", patch: "#f4efe6", pattern: "backstripe", horns: "short", ears: "up", size: 1.05, muzzle: "#e0b8a8" },
  { id: "dutch-belted", name: "Dutch Belted", body: "#1c1c1c", patch: "#f5f2ec", pattern: "belt", horns: "none", ears: "up", size: 1, muzzle: "#2c2828", dairy: true },
  { id: "gloucester", name: "Gloucester", body: "#3a2a24", patch: "#f4efe6", pattern: "backstripe", horns: "long", ears: "up", size: 1, muzzle: "#4a3a34" },
  { id: "red-poll", name: "Red Poll", body: "#9c3f2c", pattern: "solid", horns: "none", ears: "up", size: 0.95, muzzle: "#d8a090" },
  { id: "normande", name: "Normande", body: "#f2ece2", patch: "#7b4a37", pattern: "patches", horns: "short", ears: "up", size: 1.05, muzzle: "#d8b0a0", dairy: true },
  { id: "murray-grey", name: "Murray Grey", body: "#9a9aa0", pattern: "solid", horns: "none", ears: "up", size: 1, muzzle: "#3a3a40" },
  { id: "white-park", name: "White Park", body: "#f6f4ef", patch: "#1a1a1a", pattern: "solid", horns: "long", ears: "up", size: 1.05, muzzle: "#1a1a1a" },
  { id: "speckle-park", name: "Speckle Park", body: "#f4f1ec", patch: "#1e1e1e", pattern: "roan", horns: "none", ears: "up", size: 1, muzzle: "#2a2a2a" },
  { id: "fleckvieh", name: "Fleckvieh", body: "#f6efe4", patch: "#c96a3f", pattern: "patches", horns: "none", ears: "up", size: 1.1, muzzle: "#e4bcac", dairy: true },
]

/** Stable, well-spread hash of a string (FNV-1a). */
export function hashString(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  return hash >>> 0
}

/** The same PR always grows up to be the same cow. */
export function breedFor(pr: Pick<PasturePullRequest, "repo" | "number">): Breed {
  return BREEDS[hashString(`${pr.repo}#${pr.number}`) % BREEDS.length]
}

export const cowID = (pr: Pick<PasturePullRequest, "repo" | "number">) => `${pr.repo}#${pr.number}`

/** Coat and temperament seed. Stage-independent, so a cow keeps its markings as it moves between pens. */
export const cowSeed = (pr: Pick<PasturePullRequest, "repo" | "number">) => hashString(`${pr.number}:${pr.repo}`)

export type HerdMember = { id: string; pr: PasturePullRequest; breed: Breed; seed: number }

export function herd(items: PasturePullRequest[]): HerdMember[] {
  return items.map((pr) => ({
    id: cowID(pr),
    pr,
    breed: breedFor(pr),
    seed: cowSeed(pr),
  }))
}
