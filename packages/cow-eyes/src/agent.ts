// Preserve Playwright's accessibility/DOM toolset while making human handoff explicit and giving
// every CowCode session its own tab. The CDP proxy enforces both boundaries even for tool calls
// that were already admitted here.
import { createInterface } from "node:readline"
import { homedir } from "node:os"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { createAgentRecording, recordingTools } from "./recording"
import { createAgentRouter } from "./agent-router"
const port = Number(process.env.COW_AGENT_CDP_PORT ?? 4100)
const output = process.env.COW_BROWSER_OUTPUT_DIR ?? join(homedir(), ".config/cow/browser-output")
let shuttingDown = false
const router = createAgentRouter({
  start(session, on) {
    const child = spawn(
      "npx",
      [
        "-y",
        "@playwright/mcp@0.0.80",
        "--cdp-endpoint",
        // The path names the session, so the bridge shows this process only that session's tabs.
        `http://127.0.0.1:${port}/cowcode/thread/${session}`,
        "--image-responses=allow",
        "--caps=vision,pdf",
        "--snapshot-boxes",
        "--output-dir",
        output,
      ],
      { stdio: ["pipe", "pipe", "inherit"] },
    )
    createInterface({ input: child.stdout }).on("line", on.line)
    child.stdin.on("error", () => undefined)
    child.on("error", () => {
      process.stderr.write("CowCode browser tools could not start Playwright. Check that Node and npx are installed.\n")
      process.exitCode = 1
      on.exit()
    })
    child.on("exit", on.exit)
    return { write: (line) => void child.stdin.write(line + "\n"), kill: () => void child.kill() }
  },
  out: (line) => void process.stdout.write(line + "\n"),
  control: (session, thread) =>
    fetch(
      `http://127.0.0.1:${port}/cowcode/control?session=${encodeURIComponent(session)}&thread=${encodeURIComponent(thread)}`,
      { signal: AbortSignal.timeout(4_000) },
    )
      .then((response) => response.json() as Promise<{ owner?: string }>)
      .catch(() => undefined),
  recording: (thread) => createAgentRecording(output, thread),
  tools: recordingTools,
  exit: () => void shutdown(process.exitCode === undefined ? 1 : Number(process.exitCode)),
  idleMs: Number(process.env.COW_BROWSER_PROCESS_IDLE_MINUTES ?? 20) * 60_000,
})
async function shutdown(code: number) {
  if (shuttingDown) return
  shuttingDown = true
  await router.shutdown()
  process.exit(code)
}
process.on("SIGTERM", () => void shutdown(0))
process.on("SIGINT", () => void shutdown(0))
setInterval(() => router.reap(), 60_000).unref()
// Lines are routed without waiting for earlier tool calls, so one thread's slow start or
// takeover check never holds up another thread.
for await (const line of createInterface({ input: process.stdin })) void router.handle(line)
await shutdown(0)
