import { readFile } from "node:fs/promises"

export function parsePublicCompanion(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  const data = Object.fromEntries(Object.entries(value))
  if (typeof data.origin !== "string" || typeof data.gate !== "string" || data.gate.length < 32) return undefined

  try {
    const url = new URL(data.origin)
    if (url.protocol !== "https:") return undefined
    url.searchParams.set("_cowcode_gate", data.gate)
    return url.toString()
  } catch {
    return undefined
  }
}

export async function getPublicCompanionOrigin(file: string): Promise<string | undefined> {
  try {
    const url = parsePublicCompanion(JSON.parse(await readFile(file, "utf8")))
    if (!url) return undefined
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3_000) })
    if (!response.ok) return undefined
    return url
  } catch {
    return undefined
  }
}
