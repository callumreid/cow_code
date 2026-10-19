// Preserve Playwright's accessibility/DOM toolset while making human handoff explicit.
// The CDP proxy enforces the same boundary even for already admitted tool calls.
import { createInterface } from "node:readline"
import { homedir } from "node:os"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { createAgentRecording, recordingTools } from "./recording"
const port = Number(process.env.COW_AGENT_CDP_PORT ?? 4100)
const output = process.env.COW_BROWSER_OUTPUT_DIR ?? join(homedir(), ".config/cow/browser-output")
const recording = createAgentRecording(output)
const lists = new Set<number | string>()
const child = spawn(
  "npx",
  [
    "-y",
    "@playwright/mcp@0.0.80",
    "--cdp-endpoint",
    `http://127.0.0.1:${port}`,
    "--image-responses=allow",
    "--caps=vision,pdf",
    "--snapshot-boxes",
    "--output-dir",
    output,
  ],
  { stdio: ["pipe", "pipe", "inherit"] },
)
createInterface({ input: child.stdout }).on("line", (line) => {
  try {
    const message = JSON.parse(line)
    if (lists.delete(message.id) && Array.isArray(message.result?.tools)) {
      message.result.tools.push(...recordingTools)
      process.stdout.write(JSON.stringify(message) + "\n")
      return
    }
  } catch {}
  process.stdout.write(line + "\n")
})
let shuttingDown = false
async function shutdown(code: number) {
  if (shuttingDown) return
  shuttingDown = true
  await recording.stop().catch(() => undefined)
  child.kill()
  process.exit(code)
}
process.on("SIGTERM", () => void shutdown(0))
process.on("SIGINT", () => void shutdown(0))
child.on("error", () => {
  process.stderr.write("CowCode browser tools could not start Playwright. Check that Node and npx are installed.\n")
  process.exitCode = 1
})
child.on("exit", (code) => {
  void shutdown(code ?? 1)
})
const lines = createInterface({ input: process.stdin })
for await (const line of lines) {
  let message: { id?: number | string; method?: string; params?: { name?: string } }
  try {
    message = JSON.parse(line)
  } catch {
    continue
  }
  const recordingTool =
    message.method === "tools/call" && recordingTools.some((tool) => tool.name === message.params?.name)
  if (message.method === "tools/list" && message.id !== undefined) lists.add(message.id)
  if (message.method === "tools/call" && message.params?.name !== "browser_recording_stop") {
    const state = await fetch(`http://127.0.0.1:${port}/cowcode/control`, { signal: AbortSignal.timeout(4_000) })
      .then((response) => response.json())
      .catch(() => undefined)
    if (!state || state.owner === "human") {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            isError: true,
            content: [
              {
                type: "text",
                text: state
                  ? "A person has taken control of the shared browser in CowCode. Wait for them to choose Return to agent. Then inspect the page again before continuing; their actions may have changed it."
                  : "The CowCode browser bridge is unavailable. Open the Browser panel to check its connection; do not fall back to a different invisible browser.",
              },
            ],
          },
        }) + "\n",
      )
      continue
    }
  }
  if (recordingTool) {
    const result = await (
      message.params?.name === "browser_recording_start"
        ? recording.start().then((text) => ({ content: [{ type: "text", text }] }))
        : recording.stop()
    ).catch((error: unknown) => ({
      isError: true,
      content: [{ type: "text", text: error instanceof Error ? error.message : "Browser recording failed." }],
    }))
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }) + "\n")
    continue
  }
  child.stdin.write(line + "\n")
}
await shutdown(0)
