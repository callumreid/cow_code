import { test, expect, chromium, type Browser } from "@playwright/test"
import { execFileSync, spawn, type ChildProcess } from "node:child_process"
import { createServer, type Server } from "node:http"
import { createInterface } from "node:readline"
import { setTimeout } from "node:timers/promises"
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
let directory = ""
const processes: ChildProcess[] = []
let browser: Browser
let viewer: WebSocket
let eyesPort = 0
let proxyPort = 0
const messages: Record<string, any>[] = []
let local: Server
let cow: Server
let localPort = 0
let cdpUrl = ""
const auth = `auth_token=${Buffer.from("cow:test-password-only").toString("base64")}`
const registry = () =>
  fetch(`http://127.0.0.1:${proxyPort}/cowcode/threads`).then(
    (response) => response.json() as Promise<{ session: string; thread: string; tabs: string[]; front?: string }[]>,
  )
const tabsOf = async (session: string) => (await registry()).find((entry) => entry.session === session)?.tabs ?? []
function watch(thread: string) {
  const socket = new WebSocket(`ws://127.0.0.1:${eyesPort}/ws?${auth}&thread=${thread}`)
  const seen: Record<string, any>[] = []
  socket.onmessage = (event) => seen.push(JSON.parse(String(event.data)))
  return {
    seen,
    send: (value: unknown) => socket.send(JSON.stringify(value)),
    close: () => socket.close(),
    last: (type: string) => seen.findLast((item) => item.type === type),
  }
}
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
  // Stands in for the CowCode server: the bridge asks it whether a thread's session still exists.
  cow = createServer((request, response) => {
    const session = request.url?.split("/").at(-1) ?? ""
    response.setHeader("content-type", "application/json")
    if (session === "ses_deleted") {
      response.statusCode = 404
      response.end(JSON.stringify({ name: "NotFoundError", data: { message: "Session not found" } }))
      return
    }
    response.end(JSON.stringify({ id: session, time: session === "ses_archived" ? { archived: 1 } : {} }))
  })
  const cowPort = await listen(cow)
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
  cdpUrl = cdp
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
        COW_BROWSER_THREADS_FILE: join(directory, "threads.json"),
        COW_SERVER_URL: `http://127.0.0.1:${cowPort}`,
        COW_BROWSER_SWEEP_SECONDS: "1",
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
  await new Promise<void>((resolve) => cow.close(() => resolve()))
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
  const returned = messages.length
  send({ type: "control", owner: "agent" })
  await until(
    () => messages.slice(returned).find((item) => item.type === "control"),
    (message) => message?.owner === "agent",
  )
})
test("background page inspection cannot steal the visible tab", async () => {
  const current = messages.findLast((item) => item.type === "attached")!.target.id
  const background = await browser.contexts()[0]!.newPage()
  await background.evaluate(() => document.title)
  // Opening and reading a second page is not an action: the whole-browser view stays put.
  await setTimeout(150)
  const health = await fetch(`http://127.0.0.1:${eyesPort}/api/health`, {
    headers: { authorization: `Basic ${Buffer.from("cow:test-password-only").toString("base64")}` },
  }).then((response) => response.json())
  expect(health.target).toBe(current)
  await background.close()
})
test("health checks the browser and unauthenticated viewers are refused", async () => {
  expect((await fetch(`http://127.0.0.1:${eyesPort}/api/health`)).status).toBe(401)
  const health = await fetch(`http://127.0.0.1:${eyesPort}/api/health`, {
    headers: { authorization: `Basic ${Buffer.from("cow:test-password-only").toString("base64")}` },
  })
  expect((await health.json()).browser).toBe("reachable")
})

test("two threads drive their own tabs at the same time and cannot see or touch each other's", async () => {
  const a = await chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/ses_a`)
  const b = await chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/ses_b`)
  // The browser already has tabs (the shared session's and Chrome's own); a new thread sees none.
  expect(a.contexts()[0]!.pages()).toHaveLength(0)
  expect(b.contexts()[0]!.pages()).toHaveLength(0)
  const [pageA, pageB] = await Promise.all([a.contexts()[0]!.newPage(), b.contexts()[0]!.newPage()])
  const drive = async (page: typeof pageA, name: string) => {
    for (let round = 0; round < 6; round++) {
      await page.goto(`http://127.0.0.1:${localPort}/?thread=${name}&round=${round}`)
      await page.getByRole("textbox", { name: "Name" }).fill(`${name}-${round}`)
      await page.getByRole("button", { name: "Click me" }).click()
      expect(page.url()).toContain(`thread=${name}&round=${round}`)
      expect(await page.getByRole("textbox").inputValue()).toBe(`${name}-${round}`)
      expect(await page.title()).toBe("123")
    }
  }
  await Promise.all([drive(pageA, "A"), drive(pageB, "B")])
  expect(a.contexts()[0]!.pages()).toHaveLength(1)
  expect(b.contexts()[0]!.pages()).toHaveLength(1)
  const [tabA] = await tabsOf("ses_a")
  const [tabB] = await tabsOf("ses_b")
  expect(tabA).toBeTruthy()
  expect(tabB).toBeTruthy()
  expect(tabA).not.toBe(tabB)
  // Each tab is the only tab of its own window, so neither page is ever a hidden background tab.
  expect(await pageA.evaluate(() => document.visibilityState)).toBe("visible")
  expect(await pageB.evaluate(() => document.visibilityState)).toBe("visible")

  // The profile is shared: what one thread's sign-in stores, the other thread's tab has.
  await pageA.evaluate(() => (document.cookie = "signed_in=callum; path=/"))
  await pageB.reload()
  expect(await pageB.evaluate(() => document.cookie)).toContain("signed_in=callum")

  // Raw protocol access is fenced too: thread A cannot list, attach to, or close thread B's tab.
  const raw = await a.newBrowserCDPSession()
  const listed = (await raw.send("Target.getTargets")).targetInfos.filter((item) => item.type === "page")
  expect(listed.map((item) => item.targetId)).toEqual([tabA])
  await expect(raw.send("Target.attachToTarget", { targetId: tabB!, flatten: true })).rejects.toThrow(
    /another CowCode thread/,
  )
  await expect(raw.send("Target.closeTarget", { targetId: tabB! })).rejects.toThrow(/another CowCode thread/)
  await expect(raw.send("Storage.clearCookies")).rejects.toThrow(/shared/)
  await expect(raw.send("Browser.close")).rejects.toThrow(/shares this browser/)
  expect(await pageB.title()).toBe("Browser fixture")

  // A popup belongs to the thread whose page opened it, and only that thread sees it.
  const [popup] = await Promise.all([
    pageA.waitForEvent("popup"),
    pageA.evaluate(() => void window.open("about:blank?popup")),
  ])
  await until(
    () => tabsOf("ses_a"),
    (tabs) => tabs.length === 2,
  )
  expect(a.contexts()[0]!.pages()).toHaveLength(2)
  expect(b.contexts()[0]!.pages()).toHaveLength(1)
  await popup.close()
  await until(
    () => tabsOf("ses_a"),
    (tabs) => tabs.length === 1,
  )

  // A thread that reconnects (its Playwright process restarted) gets its own tab back, nothing else.
  await a.close()
  const again = await chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/ses_a`)
  expect(
    again
      .contexts()[0]!
      .pages()
      .map((page) => page.url()),
  ).toEqual([pageA.url()])
  await again.close()
  await b.close()
  console.log(JSON.stringify({ scenario: "two-threads-interleaved", tabA, tabB }))
})

test("the watch view shows the tab of the thread it is asked for; takeover and tabs are per thread", async () => {
  const a = await chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/ses_a`)
  const b = await chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/ses_b`)
  const pageA = a.contexts()[0]!.pages()[0]!
  const pageB = b.contexts()[0]!.pages()[0]!
  const [tabA] = await tabsOf("ses_a")
  const [tabB] = await tabsOf("ses_b")
  const viewA = watch("ses_a")
  const viewB = watch("ses_b")
  const viewNew = watch("ses_new")
  await until(
    () => [viewA.last("attached"), viewB.last("attached"), viewNew.last("empty")],
    (items) => items.every(Boolean),
  )
  expect(viewA.last("attached")!.target.id).toBe(tabA)
  expect(viewB.last("attached")!.target.id).toBe(tabB)
  // A thread that has not used the browser gets an explicit empty state, never someone else's tab.
  expect(viewNew.seen.some((item) => item.type === "attached" || item.type === "frame")).toBe(false)
  expect(viewNew.last("tabs")!.tabs).toEqual([])
  expect(viewA.last("tabs")!.tabs.map((tab: { id: string }) => tab.id)).toEqual([tabA])

  // Thread B working does not move thread A's viewer.
  await pageB.goto(`http://127.0.0.1:${localPort}/?thread=B&watch=1`)
  await pageB.getByRole("textbox", { name: "Name" }).fill("B keeps working")
  expect(viewA.seen.filter((item) => item.type === "attached").every((item) => item.target.id === tabA)).toBe(true)
  await until(
    () => viewB.last("url"),
    (message) => message?.url?.includes("watch=1"),
  )

  // Taking over thread A pauses only thread A's agent; the person's input lands in thread A's tab.
  viewA.send({ type: "control", owner: "human" })
  await until(
    () => viewA.last("control"),
    (message) => message?.owner === "human",
  )
  expect(viewB.last("control")!.owner).toBe("agent")
  await expect(pageA.evaluate(() => document.title)).rejects.toThrow()
  expect(await pageB.evaluate(() => document.title)).toBe("Browser fixture")
  await pageA.bringToFront().catch(() => undefined)
  viewA.send({ type: "navigate", url: `http://127.0.0.1:${localPort}/?thread=A&human=1` })
  await until(
    () => viewA.last("url"),
    (message) => message?.url?.includes("human=1"),
  )
  // A thread's viewer cannot close or switch to another thread's tab.
  viewA.send({ type: "closetab", id: tabB })
  viewA.send({ type: "tab", id: tabB })
  await setTimeout(300)
  expect(await tabsOf("ses_b")).toEqual([tabB])
  expect(viewA.last("attached")!.target.id).toBe(tabA)
  viewA.send({ type: "control", owner: "agent" })
  await until(
    () => viewA.last("control"),
    (message) => message?.owner === "agent",
  )
  expect(pageA.url()).toContain("human=1")
  expect(pageB.url()).toContain("thread=B")

  // A person can open the first tab for a thread; the thread's agent then finds it as its own.
  viewNew.send({ type: "control", owner: "human" })
  await until(
    () => viewNew.last("control"),
    (message) => message?.owner === "human",
  )
  viewNew.send({ type: "navigate", url: `http://127.0.0.1:${localPort}/?thread=new` })
  await until(
    () => viewNew.last("attached"),
    (message) => !!message,
  )
  viewNew.send({ type: "control", owner: "agent" })
  await until(
    () => viewNew.last("control"),
    (message) => message?.owner === "agent",
  )
  const fresh = await chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/ses_new`)
  expect(
    fresh
      .contexts()[0]!
      .pages()
      .map((page) => page.url()),
  ).toEqual([`http://127.0.0.1:${localPort}/?thread=new`])
  await fresh.close()
  viewA.close()
  viewB.close()
  viewNew.close()
  await a.close()
  await b.close()
})

test("a thread's tab closes when its session is archived or deleted; other tabs are left alone", async () => {
  const live = () =>
    fetch(`${cdpUrl}/json/list`)
      .then((response) => response.json() as Promise<{ id: string; type: string }[]>)
      .then((list) => list.filter((item) => item.type === "page").map((item) => item.id))
  const before = await live()
  const sessions = ["ses_archived", "ses_deleted", "ses_kept"]
  const browsers = await Promise.all(
    sessions.map((session) => chromium.connectOverCDP(`http://127.0.0.1:${proxyPort}/cowcode/thread/${session}`)),
  )
  await Promise.all(browsers.map((item) => item.contexts()[0]!.newPage()))
  const kept = await tabsOf("ses_kept")
  expect(kept).toHaveLength(1)
  await until(
    () => registry(),
    (entries) => !entries.some((entry) => entry.session === "ses_archived" || entry.session === "ses_deleted"),
    20_000,
  )
  const after = await live()
  // Every tab that existed before is still there, plus the kept thread's tab.
  expect(before.every((id) => after.includes(id))).toBe(true)
  expect(after.filter((id) => !before.includes(id))).toEqual(kept)
  await Promise.all(browsers.map((item) => item.close()))
})

test("the managed tools give each session its own tab from the session id on the tool call", async () => {
  test.setTimeout(120_000)
  const child = spawn(process.env.BUN_EXE ?? "/Users/bronson/.bun/bin/bun", ["src/agent.ts"], {
    cwd: new URL("..", import.meta.url).pathname,
    env: {
      ...process.env,
      COW_AGENT_CDP_PORT: String(proxyPort),
      COW_EYES_PORT: String(eyesPort),
      COW_SERVER_PASSWORD_FILE: join(directory, "password"),
      COW_BROWSER_OUTPUT_DIR: join(directory, "artifacts-threads"),
    },
    stdio: ["pipe", "pipe", "inherit"],
  })
  processes.push(child)
  const output: Record<string, any>[] = []
  createInterface({ input: child.stdout! }).on("line", (line) => {
    output.push(JSON.parse(line))
  })
  const request = async (id: number, method: string, params: unknown) => {
    child.stdin!.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n")
    return until(() => output.find((message) => message.id === id), Boolean, 90_000)
  }
  let next = 100
  const tool = (session: string, name: string, args: unknown, thread = session) =>
    request(++next, "tools/call", {
      name,
      arguments: args,
      _meta: { "cowcode/sessionID": session, "cowcode/threadID": thread, progressToken: next },
    })
  const text = (message: Record<string, any> | undefined) =>
    message?.result.content.map((item: { text?: string }) => item.text).join("\n") ?? ""
  await request(1, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "cowcode-integration-test", version: "1" },
  })
  child.stdin!.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n")
  const where = "() => location.search"
  // Two threads call at the same time, several rounds; a call landing on the wrong tab would
  // read the other thread's address.
  for (let round = 0; round < 3; round++) {
    const [one, two] = await Promise.all([
      tool("ses_w1", "browser_navigate", { url: `http://127.0.0.1:${localPort}/?who=w1&round=${round}` }),
      tool("ses_w2", "browser_navigate", { url: `http://127.0.0.1:${localPort}/?who=w2&round=${round}` }),
    ])
    expect(one?.result.isError).not.toBe(true)
    expect(two?.result.isError).not.toBe(true)
    const [readTwo, readOne] = await Promise.all([
      tool("ses_w2", "browser_evaluate", { function: where }),
      tool("ses_w1", "browser_evaluate", { function: where }),
    ])
    expect(text(readOne)).toContain(`?who=w1&round=${round}`)
    expect(text(readOne)).not.toContain("who=w2")
    expect(text(readTwo)).toContain(`?who=w2&round=${round}`)
    expect(text(readTwo)).not.toContain("who=w1")
  }
  const [tabOne] = await tabsOf("ses_w1")
  const [tabTwo] = await tabsOf("ses_w2")
  expect(await tabsOf("ses_w1")).toHaveLength(1)
  expect(await tabsOf("ses_w2")).toHaveLength(1)
  expect(tabOne).not.toBe(tabTwo)
  // Each thread's tool output lists only its own tab.
  const listed = text(await tool("ses_w1", "browser_tabs", { action: "list" }))
  expect(listed).toContain("who=w1")
  expect(listed).not.toContain("who=w2")

  // The panel for a thread follows that thread; a subagent's tab shows under its root thread.
  const view = watch("ses_w1")
  await until(
    () => view.last("attached"),
    (message) => message?.target.id === tabOne,
  )
  const sub = await tool("ses_w1_sub", "browser_navigate", { url: `http://127.0.0.1:${localPort}/?who=sub` }, "ses_w1")
  expect(sub?.result.isError).not.toBe(true)
  const [tabSub] = await tabsOf("ses_w1_sub")
  await until(
    () => view.last("attached"),
    (message) => message?.target.id === tabSub,
  )
  expect(text(await tool("ses_w1", "browser_evaluate", { function: where }))).toContain("who=w1")

  // Taking over thread w1 pauses w1 and its subagent, not w2.
  view.send({ type: "control", owner: "human" })
  await until(
    () => view.last("control"),
    (message) => message?.owner === "human",
  )
  const [blocked, blockedSub, free] = await Promise.all([
    tool("ses_w1", "browser_evaluate", { function: where }),
    tool("ses_w1_sub", "browser_evaluate", { function: where }, "ses_w1"),
    tool("ses_w2", "browser_evaluate", { function: where }),
  ])
  expect(blocked?.result.isError).toBe(true)
  expect(text(blocked)).toContain("Return to agent")
  expect(blockedSub?.result.isError).toBe(true)
  expect(text(free)).toContain("who=w2")
  view.send({ type: "control", owner: "agent" })
  await until(
    () => view.last("control"),
    (message) => message?.owner === "agent",
  )
  expect(text(await tool("ses_w1", "browser_evaluate", { function: where }))).toContain("who=w1")
  view.close()
  child.stdin!.end()
  console.log(JSON.stringify({ scenario: "managed-tools-per-session-tabs", tabOne, tabTwo, tabSub }))
})

test("managed Playwright tools report human takeover explicitly and preserve the visible browser", async () => {
  test.setTimeout(90_000)
  const child = spawn(process.env.BUN_EXE ?? "/Users/bronson/.bun/bin/bun", ["src/agent.ts"], {
    cwd: new URL("..", import.meta.url).pathname,
    env: {
      ...process.env,
      COW_AGENT_CDP_PORT: String(proxyPort),
      COW_EYES_PORT: String(eyesPort),
      COW_SERVER_PASSWORD_FILE: join(directory, "password"),
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
  expect(tools?.result.tools.some((tool: { name: string }) => tool.name === "browser_recording_start")).toBe(true)
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
  const started = await call(5, "tools/call", { name: "browser_recording_start", arguments: {} })
  expect(started?.result.isError).not.toBe(true)
  await setTimeout(350)
  const changed = await call(6, "tools/call", {
    name: "browser_evaluate",
    arguments: {
      function:
        "() => { document.body.style.background = 'lightblue'; document.querySelector('button').textContent = 'Recorded action'; }",
    },
  })
  expect(changed?.result.isError).not.toBe(true)
  await setTimeout(500)
  const take = messages.length
  send({ type: "control", owner: "human" })
  await wait("control", take)
  const stopped = await call(7, "tools/call", { name: "browser_recording_stop", arguments: {} })
  expect(stopped?.result.isError).not.toBe(true)
  const resource = stopped?.result.content.find((item: { type: string }) => item.type === "resource_link")
  expect(resource.mimeType).toBe("video/webm")
  const saved = fileURLToPath(resource.uri)
  expect(saved.startsWith(join(directory, "artifacts"))).toBe(true)
  const probe = JSON.parse(
    execFileSync(
      process.env.COW_TEST_FFPROBE ?? "ffprobe",
      [
        "-v",
        "error",
        "-count_frames",
        "-show_entries",
        "stream=codec_name,width,height,nb_read_frames",
        "-of",
        "json",
        saved,
      ],
      { encoding: "utf8" },
    ),
  )
  expect(probe.streams[0].codec_name).toBe("vp9")
  expect(Number(probe.streams[0].nb_read_frames)).toBeGreaterThan(3)
  expect((await readdir(join(directory, "artifacts"))).some((name) => name.endsWith(".partial"))).toBe(false)
  console.log(JSON.stringify({ scenario: "agent-video-artifact", ...probe.streams[0] }))
  const returnToAgent = messages.length
  send({ type: "control", owner: "agent" })
  await wait("control", returnToAgent)
  const interrupted = await call(8, "tools/call", { name: "browser_recording_start", arguments: {} })
  expect(interrupted?.result.isError).not.toBe(true)
  processes[1]!.kill() // Only this suite's isolated stream server, never the running CowCode browser.
  await until(
    () => viewer.readyState,
    (value) => value === WebSocket.CLOSED,
  )
  const failed = await call(9, "tools/call", { name: "browser_recording_stop", arguments: {} })
  expect(failed?.result.isError).toBe(true)
  expect(JSON.stringify(failed)).toContain("disconnected")
  expect((await readdir(join(directory, "artifacts"))).some((name) => name.endsWith(".partial"))).toBe(false)
  child.stdin!.end()
})
