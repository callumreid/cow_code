// Preserve Playwright's accessibility/DOM toolset while making human handoff explicit.
// The CDP proxy enforces the same boundary even for already admitted tool calls.
import { createInterface } from "node:readline"
import { homedir } from "node:os"
import { join } from "node:path"
import { spawn } from "node:child_process"
const port = Number(process.env.COW_AGENT_CDP_PORT ?? 4100)
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
    process.env.COW_BROWSER_OUTPUT_DIR ?? join(homedir(), ".config/cow/browser-output"),
  ],
  { stdio: ["pipe", "pipe", "inherit"] },
)
child.stdout.pipe(process.stdout)
child.on("error", () => {
  process.stderr.write("CowCode browser tools could not start Playwright. Check that Node and npx are installed.\n")
  process.exitCode = 1
})
child.on("exit", (code) => {
  process.exit(code ?? 1)
})
const lines = createInterface({ input: process.stdin })
for await (const line of lines) {
  let message: { id?: number | string; method?: string }
  try {
    message = JSON.parse(line)
  } catch {
    continue
  }
  if (message.method === "tools/call") {
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
  child.stdin.write(line + "\n")
}
child.kill()
