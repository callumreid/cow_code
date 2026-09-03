import { describe, expect, test } from "bun:test"
import type { Part, ToolPart } from "@opencode-ai/sdk/v2/client"
import { activeSurfacePreview, toolAction, toolSurface } from "./tool-picture-in-picture-model"

const tool = (name: string, input: Record<string, unknown> = {}, image?: string): ToolPart => ({
  id: name,
  sessionID: "session",
  messageID: "assistant",
  type: "tool",
  callID: name,
  tool: name,
  state: image
    ? {
        status: "completed",
        input,
        output: "",
        title: "",
        metadata: {},
        time: { start: 1, end: 2 },
        attachments: [
          {
            id: "image",
            sessionID: "session",
            messageID: "assistant",
            type: "file",
            mime: "image/png",
            url: image,
          },
        ],
      }
    : { status: "running", input, time: { start: 1 } },
})

const message = (id: string, role: "user" | "assistant") => ({ id, role })

describe("tool picture in picture", () => {
  test("recognizes browser, Slack, and other MCP surfaces", () => {
    expect(toolSurface(tool("playwright_browser_navigate"))).toBe("browser")
    expect(toolSurface(tool("shell", { command: "curl https://slack.com/api/conversations.history" }))).toBe("slack")
    expect(toolSurface(tool("linear_list_issues"))).toBe("integration")
    expect(toolSurface(tool("read"))).toBeUndefined()
  })

  test("uses only the active turn and retains its latest screenshot", () => {
    const messages = [message("old-user", "user"), message("old", "assistant"), message("user", "user"), message("assistant", "assistant")]
    const byMessage: Record<string, Part[]> = {
      old: [tool("playwright_browser_take_screenshot", {}, "data:image/png;base64,old")],
      assistant: [
        tool("playwright_browser_take_screenshot", {}, "data:image/png;base64,current"),
        tool("playwright_browser_click"),
      ],
    }
    const preview = activeSurfacePreview(messages, (id) => byMessage[id] ?? [])
    expect(preview?.part.tool).toBe("playwright_browser_click")
    expect(preview?.image?.url).toBe("data:image/png;base64,current")
  })

  test("formats MCP tool names for the preview", () => {
    expect(toolAction(tool("playwright_browser_take_screenshot"))).toBe("Take screenshot")
  })
})
