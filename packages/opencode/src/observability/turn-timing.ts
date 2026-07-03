// Time-to-first-token bookkeeping for assistant turns. The session processor
// stamps request-start and first-delta times here; the trace exporter consumes
// them when the turn completes. Bounded so it stays inert when export is off.
const LIMIT = 512

export type TurnTimes = {
  requestStart?: number
  firstToken?: number
}

const times = new Map<string, TurnTimes>()

const entry = (messageID: string) => {
  const existing = times.get(messageID)
  if (existing) return existing
  if (times.size >= LIMIT) times.delete(times.keys().next().value ?? "")
  const created: TurnTimes = {}
  times.set(messageID, created)
  return created
}

/** Record when the LLM request for this turn started. First call wins. */
export const markRequestStart = (messageID: string, at = Date.now()) => {
  const record = entry(messageID)
  record.requestStart = record.requestStart ?? at
}

/** Record when the first text/reasoning delta for this turn arrived. First call wins. */
export const markFirstToken = (messageID: string, at = Date.now()) => {
  const record = entry(messageID)
  record.firstToken = record.firstToken ?? at
}

/** Read and clear the recorded times for a turn. */
export const take = (messageID: string) => {
  const record = times.get(messageID)
  if (record) times.delete(messageID)
  return record
}

export * as TurnTiming from "./turn-timing"
