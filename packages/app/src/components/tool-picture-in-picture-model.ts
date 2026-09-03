import type { FilePart, Part, ToolPart } from "@opencode-ai/sdk/v2/client"

export type ToolSurface = "browser" | "slack" | "integration"

export type SurfacePreview = {
  part: ToolPart
  surface: ToolSurface
  image?: FilePart
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
  if (!LOCAL_TOOLS.has(part.tool) && part.tool.includes("_")) return "integration"
  return undefined
}

function imageAttachment(part: ToolPart): FilePart | undefined {
  if (part.state.status !== "completed") return undefined
  return part.state.attachments?.find((item) => item.mime.startsWith("image/"))
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
  return part.tool
    .replace(/^playwright_/, "")
    .replace(/^browser_/, "")
    .replaceAll("_", " ")
    .replace(/^./, (value) => value.toUpperCase())
}
