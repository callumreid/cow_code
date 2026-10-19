import { expect, test } from "@playwright/test"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { fixture } from "../performance/timeline/session-timeline-stress.fixture"
import { mockOpenCodeServer } from "../utils/mock-server"

test("task recovery, spend and slash skills are available from the conversation", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await mockOpenCodeServer(page, {
    directory: fixture.directory,
    project: fixture.project,
    provider: fixture.provider,
    sessions: fixture.sessions,
    pageMessages: () => ({ items: [] }),
  })
  const total = { amount: 1.25, reported: 1, estimated: 0.25, unknown: 0, turns: 3 }
  let budget = 5
  let reads = 0
  let releaseRead!: () => void
  const staleRead = new Promise<void>((resolve) => (releaseRead = resolve))
  await page.route("**/global/office/spend", async (route) => {
    const snapshot = budget
    if (++reads === 2) await staleRead
    return route.fulfill({
      json: {
        sessionID: fixture.sourceID,
        children: 2,
        task: total,
        day: total,
        providers: [{ ...total, provider: "openrouter" }],
        updated: Date.now(),
        budget: snapshot,
      },
    })
  })
  await page.route(new RegExp(`/session/${fixture.sourceID}(?:\\?.*)?$`), (route) => {
    if (route.request().method() !== "PATCH") return route.fallback()
    budget = route.request().postDataJSON().metadata.costBudgetUsd
    return route.fulfill({ json: { ...fixture.sessions[0], metadata: { costBudgetUsd: budget } } })
  })
  await page.route("**/session/*/recovery?*", (route) =>
    route.fulfill({
      json: {
        state: "blocked",
        lastProgressAt: Date.now(),
        deadline: Date.now() + 1000,
        reason: "A tool was interrupted. Inspect its result before continuing.",
      },
    }),
  )
  await page.route(/\/command(?:\?.*)?$/, (route) =>
    route.fulfill({
      json: [
        {
          name: "cow-verify",
          description: "Verify completed work with evidence",
          template: "Check the work",
          source: "skill",
          hints: [],
        },
      ],
    }),
  )
  await page.route(/\/skill(?:\?.*)?$/, (route) =>
    route.fulfill({
      json: [
        {
          name: "cow-verify",
          description: "Verify completed work with evidence",
          location: "builtin:cow-verify",
          content: "Check the work",
        },
      ],
    }),
  )
  await page.addInitScript(
    ({ directory }) => {
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
  await expect(page.getByText("Needs attention", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Resume after review", exact: true })).toBeEnabled()
  await page.getByRole("button", { name: "Spend and budget", exact: true }).click()
  await expect(page.getByText("openrouter", { exact: true })).toBeVisible()
  await expect(page.getByText("Task and descendants", { exact: true })).toBeVisible()
  const limit = page.getByRole("spinbutton")
  await limit.fill("10")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect.poll(() => budget).toBe(10)
  await expect(limit).toHaveValue("10")
  releaseRead()
  await expect.poll(() => reads).toBeGreaterThanOrEqual(3)
  await expect(limit).toHaveValue("10")
  await page.keyboard.press("Escape")
  const composer = page.locator('[contenteditable="true"]').first()
  await composer.fill("/cow-ver")
  await page.getByRole("button").filter({ hasText: "Verify completed work with evidence" }).click()
  await expect(composer).toHaveText("/cow-verify ")
  await expect(page.getByText("Skill /cow-verify selected. Add instructions, then send to run it.")).toBeVisible()
})
