import type { Message, Part, TextPart, ToolPart } from "@opencode-ai/sdk/v2/client"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { getFilename } from "@opencode-ai/core/util/path"
import type { OfficeReport, OfficeThread, OfficeWaiting } from "./types"

/**
 * The office stream is one chronological list: the farmer's own conversation
 * (user bubbles, assistant text, runs of tool calls) interleaved with report
 * cards by time, with a "since you last looked" divider at `lastSeen`.
 */
export type StreamItem =
  | { kind: "user"; id: string; time: number; text: string }
  | { kind: "text"; id: string; time: number; part: TextPart; message: Message }
  | { kind: "tools"; id: string; time: number; parts: ToolPart[] }
  | { kind: "report"; id: string; time: number; report: OfficeReport }

export type StreamRow = StreamItem | { kind: "divider"; id: "divider"; time: number }

/** Report kinds that mean a thread is blocked on the user. */
export const NEEDS_YOU_KINDS = new Set<OfficeReport["kind"]>(["permission", "question"])

export function relativeAge(time: number, now: number) {
  const diff = now - time
  if (!Number.isFinite(diff) || diff < 60_000) return "now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / 86_400_000)}d`
}

export function waitingReason(waiting: OfficeWaiting | null | undefined) {
  if (!waiting) return
  if (waiting.kind === "permission") return `permission · ${waiting.permission}`
  if (waiting.kind === "question") return `question · ${waiting.questions[0]?.header ?? ""}`.trim()
  return "error"
}

export function projectLabel(thread: { projectName?: string | null; directory: string }) {
  return thread.projectName ?? getFilename(thread.directory)
}

export function threadHref(thread: { directory: string; sessionID: string }) {
  return `/${base64Encode(thread.directory)}/session/${thread.sessionID}`
}

/**
 * The farmer session as stream items. Synthetic user parts are the server's
 * `<office_reports>` injections; the cards already stand for those, so they
 * are dropped. Consecutive tool parts collapse into one run, across messages.
 */
export function messageItems(messages: Message[], parts: (messageID: string) => Part[]): StreamItem[] {
  return messages.reduce<StreamItem[]>((items, message) => {
    const list = parts(message.id)
    if (message.role === "user") {
      const text = list
        .filter((part): part is TextPart => part.type === "text" && !part.synthetic && !part.ignored)
        .map((part) => part.text)
        .join("\n")
        .trim()
      if (text) items.push({ kind: "user", id: message.id, time: message.time.created, text })
      return items
    }
    list.forEach((part) => {
      if (part.type === "text") {
        items.push({ kind: "text", id: part.id, time: message.time.created, part, message })
        return
      }
      if (part.type !== "tool") return
      const last = items.at(-1)
      if (last?.kind === "tools") {
        last.parts.push(part)
        return
      }
      items.push({ kind: "tools", id: part.id, time: message.time.created, parts: [part] })
    })
    return items
  }, [])
}

/** Merge two time-ordered lists; on a tie the report leads, since the farmer reacts to it. */
export function mergeStream(items: StreamItem[], reports: OfficeReport[]): StreamItem[] {
  const cards = reports.map((report): StreamItem => ({ kind: "report", id: report.id, time: report.time, report }))
  const result: StreamItem[] = []
  const cursor = { item: 0, card: 0 }
  while (cursor.item < items.length || cursor.card < cards.length) {
    const item = items[cursor.item]
    const card = cards[cursor.card]
    if (item && (!card || item.time < card.time)) {
      result.push(item)
      cursor.item += 1
      continue
    }
    if (!card) break
    result.push(card)
    cursor.card += 1
  }
  return result
}

/**
 * Place the divider before the first item newer than `lastSeen`. No divider
 * when nothing predates it (a first open) — everything would be "new".
 */
export function withDivider(items: StreamItem[], lastSeen: number): StreamRow[] {
  if (lastSeen <= 0) return items
  const index = items.findIndex((item) => item.time > lastSeen)
  const at = index === -1 ? items.length : index
  if (at === 0) return items
  return [...items.slice(0, at), { kind: "divider", id: "divider", time: lastSeen }, ...items.slice(at)]
}

export function buildStream(input: {
  messages: Message[]
  parts: (messageID: string) => Part[]
  reports: OfficeReport[]
  lastSeen: number
}): StreamRow[] {
  return withDivider(mergeStream(messageItems(input.messages, input.parts), input.reports), input.lastSeen)
}

export function unreadReports(reports: OfficeReport[], lastSeen: number) {
  return reports.filter((report) => report.time > lastSeen && report.kind !== "auto_allowed")
}

/**
 * Reports carry no waiting id, so the newest permission/question report per
 * thread is the one its current `waiting` belongs to; older ones are resolved.
 */
export function latestOfKind(reports: OfficeReport[]) {
  const seen = new Map<string, string>()
  reports.forEach((report) => seen.set(`${report.sessionID}:${report.kind}`, report.id))
  return new Set(seen.values())
}

/** A needs-you card is live while its thread still waits on the same kind of answer. */
export function isLive(report: OfficeReport, thread: OfficeThread | undefined, latest: Set<string>) {
  if (!NEEDS_YOU_KINDS.has(report.kind)) return false
  if (!latest.has(report.id)) return false
  return thread?.waiting?.kind === report.kind
}

/** The live needs-you card after `current` (oldest first, wrapping), for `office.next`. */
export function nextNeedsYou(
  reports: OfficeReport[],
  thread: (sessionID: string) => OfficeThread | undefined,
  latest: Set<string>,
  current: string | undefined,
) {
  const live = reports.filter((report) => isLive(report, thread(report.sessionID), latest))
  if (live.length === 0) return
  const index = live.findIndex((report) => report.id === current)
  return live[(index + 1) % live.length]
}

export function toolTitle(part: ToolPart) {
  if ("title" in part.state && part.state.title) return part.state.title
  if ("error" in part.state && part.state.error) return part.state.error
  return ""
}

export function toolLabel(parts: ToolPart[]) {
  if (parts.length !== 1) return `${parts.length} actions`
  const part = parts[0]
  const title = toolTitle(part)
  return title ? `${part.tool} → ${title}` : part.tool
}
