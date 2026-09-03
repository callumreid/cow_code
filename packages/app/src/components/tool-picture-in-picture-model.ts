import type { Part, ToolPart } from "@opencode-ai/sdk/v2/client"

export type ToolSurface = "browser" | "slack" | "integration"

export type SurfacePreview = {
  part: ToolPart
  surface: ToolSurface
  image?: { url: string }
}

const LOCAL_TOOLS = new Set([
  "apply_patch",
  "bash",
  "edit",
  "glob",
  "grep",
  "list",
  "patch",
  "question",
  "read",
  "shell",
  "skill",
  "task",
  "todo",
  "write",
])

const CODE_MODE_LOCAL_NAMESPACES = new Set(["apply_patch", "exec", "read", "search", "shell", "skill", "task", "write"])

function toolText(part: ToolPart) {
  const input = part.state.input ?? {}
  try {
    return `${part.tool} ${JSON.stringify(input)}`
  } catch {
    return part.tool
  }
}

export function toolSurface(part: ToolPart): ToolSurface | undefined {
  const text = toolText(part)
  if (/slack/i.test(text)) return "slack"
  if (/playwright|browser|chrome|computer.?use|\bcua\b|websearch|webfetch/i.test(text)) return "browser"
  const namespaces = Array.from(text.matchAll(/\btools\.([a-z0-9_-]+)/gi), (match) => match[1].toLowerCase())
  if (namespaces.some((name) => !CODE_MODE_LOCAL_NAMESPACES.has(name))) return "integration"
  if (!LOCAL_TOOLS.has(part.tool) && part.tool.includes("_")) return "integration"
  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function codeModeContent(part: ToolPart): unknown[] {
  if (!("metadata" in part.state) || !isRecord(part.state.metadata)) return []
  const content = part.state.metadata.content
  return Array.isArray(content) ? content : []
}

function imageAttachment(part: ToolPart): { url: string } | undefined {
  if (part.state.status !== "completed") return undefined
  const attachment = part.state.attachments?.find((item) => item.mime.startsWith("image/"))
  if (attachment) return { url: attachment.url }

  const file = codeModeContent(part).find(
    (item) =>
      isRecord(item) && item.type === "file" && typeof item.uri === "string" && item.uri.startsWith("data:image/"),
  )
  return isRecord(file) && typeof file.uri === "string" ? { url: file.uri } : undefined
}

export function activeSurfacePreview(
  messages: { id: string; role: "user" | "assistant" }[],
  parts: (messageID: string) => Part[],
): SurfacePreview | undefined {
  let start = -1
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index]?.role !== "user") continue
    start = index
    break
  }
  if (start === -1) return undefined

  const surfaceParts: SurfacePreview[] = messages
    .slice(start)
    .flatMap((message) => parts(message.id))
    .filter((part): part is ToolPart => part.type === "tool")
    .flatMap((part) => {
      const surface = toolSurface(part)
      return surface ? [{ part, surface }] : []
    })

  const latest = surfaceParts.at(-1)
  if (!latest) return undefined

  for (let index = surfaceParts.length - 1; index >= 0; index--) {
    const current = surfaceParts[index]
    if (!current) continue
    const image = imageAttachment(current.part)
    if (image) return { ...latest, image }
  }
  return latest
}

export function toolAction(part: ToolPart) {
  const details = "metadata" in part.state && isRecord(part.state.metadata) ? part.state.metadata.metadata : undefined
  const calls = isRecord(details) && Array.isArray(details.toolCalls) ? details.toolCalls : []
  const nested = calls.findLast((item) => isRecord(item) && typeof item.tool === "string")
  const name = isRecord(nested) && typeof nested.tool === "string" ? nested.tool.split(".").at(-1)! : part.tool
  return name
    .replace(/^playwright_/, "")
    .replace(/^browser_/, "")
    .replaceAll("_", " ")
    .replace(/^./, (value) => value.toUpperCase())
}
