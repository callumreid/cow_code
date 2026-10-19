import { test, expect, chromium, type Browser } from "@playwright/test"
import { spawn, type ChildProcess } from "node:child_process"
import { createServer, type Server } from "node:http"
import { createInterface } from "node:readline"
import { setTimeout } from "node:timers/promises"
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
let directory = ""
const processes: ChildProcess[] = []
let browser: Browser
let viewer: WebSocket
let eyesPort = 0
let proxyPort = 0
const messages: Record<string, any>[] = []
let local: Server
let localPort = 0
async function listen(server: Server) {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  return (server.address() as { port: number }).port
}
const port = async () => {
  const server = createServer()
  const value = await listen(server)
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return value
}
async function until<T>(read: () => T | Promise<T>, test: (value: T) => boolean, timeout = 15_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const value = await read()
    if (test(value)) return value
    await setTimeout(50)
  }
  throw new Error("Condition timed out")
}
const send = (value: unknown) => viewer.send(JSON.stringify(value))
const wait = (type: string, after = 0) =>
  until(
    () => messages.slice(after).find((item) => item.type === type),
    (value) => !!value,
  )
test.beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "cow-eyes-test-"))
  local = createServer((request, response) => {
    response.setHeader("content-type", "text/html")
    response.end(
      '<!doctype html><title>Browser fixture</title><label>Name <input aria-label="Name"></label><button onclick="document.title=String(123)">Click me</button>',
    )
  })
  localPort = await listen(local)
  processes.push(
    spawn(
      process.env.COW_TEST_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      [
        "--headless=new",
        "--no-first-run",
        "--no-default-browser-check",
        "--remote-debugging-port=0",
        `--user-data-dir=${directory}/chrome`,
        "about:blank",
      ],
      { stdio: "ignore" },
    ),
  )
  const active = await until(
    () => readFile(join(directory, "chrome/DevToolsActivePort"), "utf8").catch(() => ""),
    Boolean,
  )
  const cdp = `http://127.0.0.1:${active.split("\n")[0]}`
  await writeFile(join(directory, "password"), "test-password-only")
  eyesPort = await port()
  const proxy = await port()
  proxyPort = proxy
  processes.push(
    spawn(process.env.BUN_EXE ?? "/Users/bronson/.bun/bin/bun", ["src/index.ts"], {
      cwd: new URL("..", import.meta.url).pathname,
      env: {
        ...process.env,
        COW_CDP: cdp,
        COW_EYES_PORT: String(eyesPort),
        COW_AGENT_CDP_PORT: String(proxy),
        COW_SERVER_PASSWORD_FILE: join(directory, "password"),
      },
      stdio: ["ignore", "ignore", "inherit"],
    }),
  )
  await until(
    () =>
      fetch(`http://127.0.0.1:${proxy}/json/version`)
        .then((response) => response.ok)
        .catch(() => false),
    Boolean,
  )
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${proxy}`)
  viewer = new WebSocket(
    `ws://127.0.0.1:${eyesPort}/ws?auth_token=${Buffer.from("cow:test-password-only").toString("base64")}`,
  )
  viewer.onmessage = (event) => messages.push(JSON.parse(String(event.data)))
  await wait("frame")
})
test.afterAll(async () => {
  viewer?.close()
  await browser?.close().catch(() => undefined)
  processes.forEach((process) => process.kill())
  await Promise.all(
    processes.map((process) =>
      process.exitCode === null && process.signalCode === null
        ? new Promise<void>((resolve) => process.once("exit", () => resolve()))
        : Promise.resolve(),
    ),
  )
  await new Promise<void>((resolve) => local.close(() => resolve()))
  await rm(directory, { recursive: true, force: true })
})
test("agent navigation is visible; takeover blocks agent input and resumes on the same tab", async () => {
  const page = await browser.contexts()[0]!.newPage()
  const start = Date.now()
  await page.goto(`http://127.0.0.1:${localPort}`)
  await until(
    () => messages.findLast((item) => item.type === "url" || item.type === "attached"),
    (message) => (message?.url ?? message?.target?.url)?.includes(`:${localPort}`),
  )
  await page.getByRole("textbox", { name: "Name" }).fill("agent input")
  expect(await page.getByRole("textbox").inputValue()).toBe("agent input")
  const taken = messages.length
  send({ type: "control", owner: "human" })
  expect((await wait("control", taken))?.owner).toBe("human")
  await expect(
    page.evaluate(() => {
      document.title = "should not happen"
    }),
  ).rejects.toThrow()
  const human = messages.length
  send({ type: "text", text: "human input" })
  await wait("frame", human)
  const returned = messages.length
  send({ type: "control", owner: "agent" })
  await wait("control", returned)
  expect(await page.getByRole("textbox").inputValue()).toContain("human input")
  await page.getByRole("button", { name: "Click me" }).click()
  expect(await page.title()).toBe("123")
  console.log(JSON.stringify({ scenario: "attach-navigate-input-takeover-resume", elapsedMs: Date.now() - start }))
})
test("screenshots are PNG artifacts and a reconnect keeps the shared tab and takeover", async () => {
  const after = messages.length
  send({ type: "screenshot", request: "capture-1" })
  const screenshot = await wait("screenshot", after)
  expect(screenshot?.request).toBe("capture-1")
  expect(Buffer.from(screenshot!.data, "base64").subarray(1, 4).toString()).toBe("PNG")
  send({ type: "control", owner: "human" })
  await wait("control", after)
  const target = messages.findLast((item) => item.type === "attached")!.target.id
  viewer.close()
  const reconnect = messages.length
  viewer = new WebSocket(
    `ws://127.0.0.1:${eyesPort}/ws?auth_token=${Buffer.from("cow:test-password-only").toString("base64")}`,
  )
  viewer.onmessage = (event) => messages.push(JSON.parse(String(event.data)))
  expect((await wait("control", reconnect))?.owner).toBe("human")
  expect((await wait("attached", reconnect))?.target.id).toBe(target)
  send({ type: "control", owner: "agent" })
})
test("background page inspection cannot steal the visible tab", async () => {
  const current = messages.findLast((item) => item.type === "attached")!.target.id
  const background = browser.contexts()[0]!.pages()[0]!
  await background.evaluate(() => document.title)
  // A second MCP client can inspect its own page while the foreground action settles.
  await setTimeout(150)
  const health = await fetch(`http://127.0.0.1:${eyesPort}/api/health`, {
    headers: { authorization: `Basic ${Buffer.from("cow:test-password-only").toString("base64")}` },
  }).then((response) => response.json())
  expect(health.target).toBe(current)
})
test("health checks the browser and unauthenticated viewers are refused", async () => {
  expect((await fetch(`http://127.0.0.1:${eyesPort}/api/health`)).status).toBe(401)
  const health = await fetch(`http://127.0.0.1:${eyesPort}/api/health`, {
    headers: { authorization: `Basic ${Buffer.from("cow:test-password-only").toString("base64")}` },
  })
  expect((await health.json()).browser).toBe("reachable")
})

test("managed Playwright tools report human takeover explicitly and preserve the visible browser", async () => {
  test.setTimeout(90_000)
  const child = spawn(process.env.BUN_EXE ?? "/Users/bronson/.bun/bin/bun", ["src/agent.ts"], {
    cwd: new URL("..", import.meta.url).pathname,
    env: {
      ...process.env,
      COW_AGENT_CDP_PORT: String(proxyPort),
      COW_BROWSER_OUTPUT_DIR: join(directory, "artifacts"),
    },
    stdio: ["pipe", "pipe", "inherit"],
  })
  processes.push(child)
  const output: Record<string, any>[] = []
  createInterface({ input: child.stdout! }).on("line", (line) => {
    output.push(JSON.parse(line))
  })
  const call = async (id: number, method: string, params: unknown) => {
    child.stdin!.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n")
    return until(() => output.find((message) => message.id === id), Boolean, 60_000)
  }
  await call(1, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "cowcode-integration-test", version: "1" },
  })
  child.stdin!.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n")
  const tools = await call(2, "tools/list", {})
  expect(tools?.result.tools.some((tool: { name: string }) => tool.name === "browser_snapshot")).toBe(true)
  const after = messages.length
  send({ type: "control", owner: "human" })
  await wait("control", after)
  const blocked = await call(3, "tools/call", {
    name: "browser_navigate",
    arguments: { url: `http://127.0.0.1:${localPort}` },
  })
  expect(blocked?.result.isError).toBe(true)
  expect(blocked?.result.content[0].text).toContain("Return to agent")
  const resume = messages.length
  send({ type: "control", owner: "agent" })
  await wait("control", resume)
  const result = await call(4, "tools/call", {
    name: "browser_navigate",
    arguments: { url: `http://127.0.0.1:${localPort}` },
  })
  expect(result?.result.isError).not.toBe(true)
  expect(result?.result.content.map((item: { text?: string }) => item.text).join("\n")).toContain("Browser fixture")
  const files = (await readdir(join(directory, "artifacts"))).filter((file) => file.endsWith(".yml"))
  expect(files.length).toBeGreaterThan(0)
  expect(await readFile(join(directory, "artifacts", files.at(-1)!), "utf8")).toContain("Name")
  child.stdin!.end()
})
