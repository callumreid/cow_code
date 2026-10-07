import { base64Encode } from "@opencode-ai/core/util/encode"
import { expect, test } from "@playwright/test"
import { fixture } from "../performance/timeline/session-timeline-stress.fixture"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectSessionTitle } from "../utils/waits"

test("workspace reload recovers from unavailable protocol probes with history and models intact", async ({ page }) => {
  await mockOpenCodeServer(page, {
    directory: fixture.directory,
    project: fixture.project,
    provider: fixture.provider,
    sessions: fixture.sessions,
    pageMessages: (sessionID) => ({ items: (fixture.messages[sessionID] ?? []).slice(-4) }),
  })
  let recovering = false
  let probes = 0
  await page.route("**/global/health", (route) => {
    if (recovering && ++probes <= 2) return route.abort("failed")
    return route.fulfill({ json: { healthy: true, version: "1.18.35" } })
  })
  // An older server serves its web fallback for unsupported current API routes.
  await page.route("**/api/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html><title>CowCode</title>" }),
  )
  await page.addInitScript(() => {
    localStorage.setItem(
      "settings.v3",
      JSON.stringify({
        general: { newLayoutDesigns: false, sidebarNavigationInitialized: true },
        office: { openOnLaunch: false },
      }),
    )
  })
  await page.goto(`/${base64Encode(fixture.directory)}/session/${fixture.sourceID}`)
  const message = page.locator(
    `[data-timeline-row="UserMessage"][data-message-id="${fixture.expected.sourceMessageIDs.at(-1)}"]`,
  )
  await expect(message).toBeVisible()
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  const model = page.getByRole("button", { name: "Claude Opus 4.6", exact: true })
  await expect(model).toBeVisible()
  recovering = true
  await page.reload()
  await expect(message).toBeVisible()
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  await expect(model).toBeVisible()
  await model.click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByText("UnsupportedContentType", { exact: true })).toHaveCount(0)
})
