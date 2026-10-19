import { test, expect } from "@playwright/test"
import { mockOpenCodeServer } from "../../utils/mock-server"
import { fixture, pageMessages } from "./session-timeline-stress.fixture"
import { installStressSessionTabs, stressSessionHref } from "./timeline-test-helpers"

test("discovers siblings and nested subagents after reload and opens their parent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const root = fixture.sessions.find((session) => session.id === fixture.sourceID)!
  const children = [
    { ...root, id: "ses_child_a", parentID: root.id, title: "Investigate provider failures" },
    { ...root, id: "ses_child_b", parentID: root.id, title: "Verify browser control" },
    { ...root, id: "ses_grandchild", parentID: "ses_child_a", title: "Reproduce rate limit" },
  ]
  await mockOpenCodeServer(page, {
    sessions: [...fixture.sessions, ...children],
    provider: fixture.provider,
    directory: fixture.directory,
    project: fixture.project,
    pageMessages: (id, limit, before) =>
      children.some((child) => child.id === id) ? { items: [] } : pageMessages(id, limit, before),
    sessionStatus: { ses_child_b: { type: "busy" } },
  })
  // The normal sidebar request only returns roots. Children must be discovered
  // from their parent, rather than happening to be present from a live event.
  await page.route(/\/session(?:\?.*)?$/, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(fixture.sessions),
    }),
  )
  await installStressSessionTabs(page)
  await page.addInitScript(() => {
    const settings = JSON.parse(localStorage.getItem("settings.v3") ?? "{}")
    localStorage.setItem(
      "settings.v3",
      JSON.stringify({ ...settings, general: { ...settings.general, newLayoutDesigns: false } }),
    )
  })
  await page.goto(stressSessionHref(root.id))
  const row = (id: string) => page.locator(`[data-component="sidebar-session-item"][data-session-id="${id}"]`).first()
  await row(root.id).getByRole("button", { name: "Show subagents" }).click()
  await expect(row("ses_child_a")).toBeVisible()
  await expect(row("ses_child_b")).toBeVisible()
  await expect(row("ses_child_b").locator('[data-slot="sidebar-session-status"]')).toHaveAttribute(
    "aria-label",
    "Working",
  )
  await row("ses_child_a").getByRole("button", { name: "Show subagents" }).click()
  await expect(row("ses_grandchild")).toBeVisible()
  await row("ses_child_a").getByRole("link").click()
  await page.getByRole("link", { name: "Back to parent task" }).click()
  await expect(page).toHaveURL(new RegExp(root.id))
  await row(root.id).getByRole("button", { name: "Hide subagents" }).click()
  await expect(row("ses_child_b")).toBeHidden()
})
