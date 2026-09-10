import fs from "fs/promises"
import path from "path"

/** Creation dates are not an activity index: resumed tasks can live in any year. */
export async function rolloutFiles(root: string): Promise<string[]> {
  const walk = async (dir: string, depth: number): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const nested = await Promise.all(
      entries.map((entry) => {
        if (entry.isFile() && entry.name.endsWith(".jsonl")) return [path.join(dir, entry.name)]
        if (entry.isDirectory() && depth < 3 && /^\d{2,4}$/.test(entry.name))
          return walk(path.join(dir, entry.name), depth + 1)
        return []
      }),
    )
    return nested.flat()
  }
  return walk(root, 0)
}
