import { base64Encode } from "@opencode-ai/core/util/encode"
import { expect, test } from "@playwright/test"
import { fixture } from "../performance/timeline/session-timeline-stress.fixture"
import { mockOpenCodeServer } from "../utils/mock-server"

test("status remains usable when another saved server is unreachable", async ({ page }, testInfo) => {
  const unavailable = "http://127.0.0.1:19497"
  let failedProbes = 0
  await mockOpenCodeServer(page, {
    directory: fixture.directory,
    project: fixture.project,
    provider: fixture.provider,
    sessions: fixture.sessions,
    pageMessages: () => ({ items: [] }),
  })
  await page.route(unavailable + "/**", (route) => {
    failedProbes++
    return route.fulfill({ status: 503, json: { error: "Offline fixture" } })
  })
  await page.route(/\/mcp(?:\?.*)?$/, (route) => route.fulfill({ json: { fixture: { status: "connected" } } }))
  await page.addInitScript(
    ({ directory, unavailable }) => {
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
          list: [{ type: "http", http: { url: unavailable }, displayName: "Offline laptop" }],
          projects: { local: [{ worktree: directory, expanded: true }] },
          lastProject: { local: directory },
        }),
      )
    },
    { directory: fixture.directory, unavailable },
  )
  await page.goto(`/${base64Encode(fixture.directory)}/session/${fixture.sourceID}`)
  await page.getByRole("button", { name: "Dismiss Tabs information", exact: true }).click()
  await expect.poll(() => failedProbes).toBeGreaterThan(0)
  await page.getByRole("button", { name: "Status", exact: true }).click()
  await expect(page.getByRole("tab", { name: /Servers$/ })).toBeVisible()
  await expect(page.getByText("Offline laptop", { exact: true })).toBeVisible()
  await page.getByRole("tab", { name: /MCP$/ }).click()
  await expect(page.getByText("fixture", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Test connection", exact: true })).toBeEnabled()
  await page.screenshot({ path: testInfo.outputPath("status-with-offline-server.png") })
})
