import { base64Encode } from "@opencode-ai/core/util/encode"
import { expect, test } from "@playwright/test"
import { fixture } from "../performance/timeline/session-timeline-stress.fixture"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectSessionTitle } from "../utils/waits"

// A real isolated cow-eyes + Chrome fixture is supplied by the browser integration runner.
// Never point this at the shared Barn browser.
test("browser takeover, screenshot draft and recording use the visible browser", async ({ page }, testInfo) => {
  test.skip(!process.env.COW_BROWSER_TEST_WS, "Requires an isolated cow-eyes WebSocket")
  await page.setViewportSize({ width: 1600, height: 1000 })
  const errors: string[] = []
  let browserTabs = 0
  page.on("pageerror", (error) => errors.push(error.message))
  await mockOpenCodeServer(page, {
    directory: fixture.directory,
    project: fixture.project,
    provider: fixture.provider,
    sessions: fixture.sessions,
    pageMessages: (sessionID) => ({ items: (fixture.messages[sessionID] ?? []).slice(-4) }),
  })
  await page.routeWebSocket(/:\d+\/(computer\/)?ws/, (route) => {
    const upstream = new WebSocket(process.env.COW_BROWSER_TEST_WS!)
    const queued: (string | Buffer)[] = []
    upstream.addEventListener("open", () => {
      upstream.send(JSON.stringify({ type: "control", owner: "agent" }))
      queued.splice(0).forEach((value) => upstream.send(value))
    })
    upstream.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data))
      if (message.type === "tabs") browserTabs = message.tabs.length
      route.send(String(event.data))
    })
    upstream.addEventListener("close", () => route.close())
    route.onMessage((value) => {
      if (upstream.readyState === WebSocket.OPEN) upstream.send(value)
      else queued.push(value)
    })
    route.onClose(() => upstream.close())
  })
  await page.addInitScript(
    ({ directory }) => {
      localStorage.setItem("opencode-theme-id", "oc-2")
      localStorage.setItem("opencode-color-scheme", "dark")
      localStorage.setItem(
        "settings.v3",
        JSON.stringify({
          general: { newLayoutDesigns: false, sidebarNavigationInitialized: true, shouldDisplayTabsToast: true },
          office: { openOnLaunch: false },
        }),
      )
      localStorage.setItem(
        "opencode.global.dat:server",
        JSON.stringify({
          projects: { local: [{ worktree: directory, expanded: true }] },
          lastProject: { local: directory },
        }),
      )
    },
    { directory: fixture.directory },
  )
  await page.goto(`/${base64Encode(fixture.directory)}/session/${fixture.sourceID}`)
  await page.getByRole("button", { name: "Dismiss Tabs information", exact: true }).click()
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  await page.getByRole("button", { name: "Toggle browser", exact: true }).click()
  const panel = page.getByRole("complementary", { name: "Browser", exact: true })
  await expect(panel.getByRole("button", { name: "Attach screenshot", exact: true })).toBeEnabled()
  await panel.getByRole("button", { name: "Take control", exact: true }).click()
  await expect(panel.getByText("You have control · agent browser actions paused", { exact: true })).toBeVisible()
  const tabs = panel.getByRole("button", { name: /^Browser tabs/ })
  await tabs.click()
  const originalTabs = await page.getByRole("option").count()
  await page.keyboard.press("Escape")
  await panel.getByRole("button", { name: "New tab", exact: true }).click()
  await expect.poll(() => browserTabs).toBe(originalTabs + 1)
  await tabs.click()
  await expect(page.getByRole("option")).toHaveCount(originalTabs + 1)
  await page.getByRole("option").first().click()
  await panel.getByRole("button", { name: "Close tab", exact: true }).click()
  await expect.poll(() => browserTabs).toBe(originalTabs)
  await tabs.click()
  await expect(page.getByRole("option")).toHaveCount(originalTabs)
  await page.keyboard.press("Escape")
  await panel.getByPlaceholder("URL or search…", { exact: true }).fill("about:blank")
  await panel.getByRole("button", { name: "Go", exact: true }).click()
  await panel.getByRole("button", { name: "Attach screenshot", exact: true }).click()
  await expect(page.locator('[data-slot="prompt-attachments"]')).toBeVisible()
  await expect(panel.getByRole("img", { name: "Browser screenshot", exact: true })).toBeVisible()
  await panel.getByRole("button", { name: "Record", exact: true }).click()
  await expect(panel.getByRole("button", { name: "Stop recording", exact: true })).toBeVisible()
  const download = page.waitForEvent("download")
  await panel.getByRole("button", { name: "Stop recording", exact: true }).click()
  const saved = await download
  expect(saved.suggestedFilename()).toMatch(/browser-\d+\.(webm|mp4)$/)
  await saved.saveAs(testInfo.outputPath(saved.suggestedFilename()))
  await expect(panel.locator("video")).toHaveAttribute("src", /^blob:/)
  await panel.getByRole("button", { name: "Return to agent", exact: true }).click()
  await expect(panel.getByText("Watching the agent’s active tab", { exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("browser-workspace.png") })
  await page.setViewportSize({ width: 1100, height: 1000 })
  // Locator screenshots wait for layout transitions to settle before measuring the controls.
  await panel.screenshot({ path: testInfo.outputPath("browser-toolbar-narrow.png") })
  expect((await panel.boundingBox())?.width ?? Infinity).toBeLessThan(550)
  const toolbar = panel.locator('[data-slot="browser-toolbar"]')
  expect(await toolbar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  for (const control of await toolbar.locator("button, input").all()) {
    await expect(control).toBeVisible()
    const controlBounds = await control.boundingBox()
    const panelBounds = await panel.boundingBox()
    expect(controlBounds!.x).toBeGreaterThanOrEqual(panelBounds!.x)
    expect(controlBounds!.x + controlBounds!.width).toBeLessThanOrEqual(panelBounds!.x + panelBounds!.width)
  }
  expect(errors).toEqual([])
})
