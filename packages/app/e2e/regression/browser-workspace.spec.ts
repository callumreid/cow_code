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
    upstream.addEventListener("open", () => queued.splice(0).forEach((value) => upstream.send(value)))
    upstream.addEventListener("message", (event) => route.send(String(event.data)))
    upstream.addEventListener("close", () => route.close())
    route.onMessage((value) => (upstream.readyState === WebSocket.OPEN ? upstream.send(value) : queued.push(value)))
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
})
