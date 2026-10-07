import { base64Encode } from "@opencode-ai/core/util/encode"
import { expect, test, type Page } from "@playwright/test"
import { fixture } from "../performance/timeline/session-timeline-stress.fixture"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectSessionTitle } from "../utils/waits"

const directory = "/tmp/cowcode-routines"
const title = "routine: pr-review-queue 2026-10-07T09:00"
const href = `/${base64Encode(directory)}/session/${fixture.targetID}`

test("routine threads retain the regular sidebar across navigation and reload", async ({ page }, testInfo) => {
  await setup(page)
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  const sidebar = page.getByRole("navigation", { name: "Projects and sessions" })
  const routine = sidebar.locator(`[data-session-id="${fixture.targetID}"]`).getByRole("link")
  await expect(routine).toBeVisible()
  const started = performance.now()
  await routine.click()
  await expectSessionTitle(page, title)
  console.log(`ROUTINE_NAVIGATION_MS ${performance.now() - started}`)
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await expect(sidebar.getByRole("button", { name: "New session", exact: true })).toBeVisible()
  await expect(sidebar.getByRole("button", { name: /^Scheduled/ })).toBeVisible()
  await expect(sidebar.getByRole("link", { name: fixture.expected.sourceTitle, exact: true })).toBeVisible()
  await expect(sidebar.locator('[data-component="sidebar-project-header"]')).toContainText("smoke-project")
  await page.screenshot({ path: testInfo.outputPath("routine-sidebar.png") })
  await page.reload()
  await expectSessionTitle(page, title)
  await expect(sidebar.getByRole("button", { name: "New session", exact: true })).toBeVisible()
  await sidebar.getByRole("link", { name: fixture.expected.sourceTitle, exact: true }).click()
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  await expect(routine).toBeVisible()
})

test("closing an old project leaves one workspace and preserves routine navigation", async ({ page }) => {
  await setup(page, true)
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  const sidebar = page.getByRole("navigation", { name: "Projects and sessions" })
  const old = sidebar.getByRole("button", { name: "phase0-docs", exact: true })
  await expect(old).toBeVisible()
  await old.click({ button: "right" })
  await page.getByRole("menuitem", { name: /Close/ }).click()
  await expect(old).toHaveCount(0)
  await expect(sidebar.getByRole("button", { name: "smoke-project", exact: true })).toBeVisible()
  await sidebar.locator(`[data-session-id="${fixture.targetID}"]`).getByRole("link").click()
  await expectSessionTitle(page, title)
  await expect(sidebar.getByRole("button", { name: "New session", exact: true })).toBeVisible()
  await page.reload()
  await expectSessionTitle(page, title)
  await expect(old).toHaveCount(0)
  await expect(sidebar.getByRole("button", { name: "smoke-project", exact: true })).toBeVisible()
})

async function setup(page: Page, extraProject = false) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mockOpenCodeServer(page, {
    directory: fixture.directory,
    project: fixture.project,
    provider: fixture.provider,
    sessions: fixture.sessions.map((session) =>
      session.id === fixture.targetID ? { ...session, directory, projectID: "global", title } : session,
    ),
    pageMessages: (sessionID) => ({ items: (fixture.messages[sessionID] ?? []).slice(-4) }),
  })
  await page.route("**/global/office/routines", (route) =>
    route.fulfill({
      json: {
        available: true,
        host: "test",
        now: Date.now(),
        services: [],
        routines: [{ name: "pr-review-queue", kind: "llm", runs: [{ sessionID: fixture.targetID, directory }] }],
      },
    }),
  )
  await page.route("**/path?**", (route) => {
    const current = new URL(route.request().url()).searchParams.get("directory") ?? fixture.directory
    return route.fulfill({
      json: { directory: current, worktree: current, home: "/tmp", state: "/tmp", config: "/tmp" },
    })
  })
  await page.route("**/project/current?**", (route) => {
    const current = new URL(route.request().url()).searchParams.get("directory")
    return route.fulfill({
      json:
        current === directory
          ? { id: "global", worktree: "/", sandboxes: [] }
          : current === "/tmp/phase0-docs"
            ? { id: "phase0", worktree: current, sandboxes: [] }
            : fixture.project,
    })
  })
  await page.addInitScript(
    ({ root, extraProject }) => {
      if (localStorage.getItem("routine-navigation-seeded")) return
      localStorage.setItem("routine-navigation-seeded", "true")
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
          projects: {
            local: [
              { worktree: root, expanded: true },
              ...(extraProject ? [{ worktree: "/tmp/phase0-docs", expanded: true }] : []),
            ],
          },
          lastProject: { local: root },
        }),
      )
    },
    { root: fixture.directory, extraProject },
  )
  await page.goto(`/${base64Encode(fixture.directory)}/session/${fixture.sourceID}`)
  await dismissTabs(page)
}

async function dismissTabs(page: Page) {
  await page.getByRole("button", { name: "Dismiss Tabs information", exact: true }).click()
  await expect(page.getByRole("button", { name: "Dismiss Tabs information", exact: true })).toHaveCount(0)
}
