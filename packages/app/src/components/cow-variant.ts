export const COW_TYPE_COUNT = 10

/** Stable random-looking assignment so a thread keeps its cow across renders. */
export function cowTypeForSeed(seed: string, count = COW_TYPE_COUNT) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % count
}
