import { expect, test } from "@playwright/test"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectAppVisible } from "../utils/waits"

const directory = "C:/OpenCode/coval"
const projectID = "proj_sidebar_account"

const sessions = [
  "Morning chat about voice AI news",
  "Morning update: latest in voice",
  "EOD review for August 25",
  "Fix review comments for PR 780",
  "Identifying internal Coval orgs",
].map((title, index) => ({
  id: `ses_sidebar_account_${index}`,
  slug: `sidebar-account-${index}`,
  projectID,
  directory,
  title,
  version: "dev",
  time: { created: 1700000000000 + index * 1000, updated: 1700000005000 - index * 1000 },
}))

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

test("account row replaces the rail gear and help buttons", async ({ page }) => {
  await mockOpenCodeServer(page, {
    directory,
    project: {
      id: projectID,
      worktree: directory,
      vcs: "git",
      name: "coval",
      time: { created: 1700000000000, updated: 1700000000000 },
      sandboxes: [],
    },
    provider: {
      all: [
        {
          id: "opencode",
          name: "OpenCode",
          models: {
            "claude-opus-4-6": { id: "claude-opus-4-6", name: "Claude Opus 4.6", limit: { context: 200_000 } },
          },
        },
      ],
      connected: ["opencode"],
      default: { providerID: "opencode", modelID: "claude-opus-4-6" },
    },
    sessions,
    pageMessages: () => ({ items: [] }),
  })

  await page.route("**/*config*", (route) => {
    const path = new URL(route.request().url()).pathname
    if (path !== "/config" && path !== "/global/config" && path !== "/api/config") return route.fallback()
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "callum" }) })
  })

  await page.addInitScript((directory) => {
    localStorage.setItem("settings.v3", JSON.stringify({ general: { newLayoutDesigns: false } }))
    localStorage.setItem("app-version.v1", JSON.stringify({ version: "1.17.20" }))
    localStorage.setItem(
      "opencode.global.dat:server",
      JSON.stringify({
        projects: { local: [{ worktree: directory, expanded: true }] },
        lastProject: { local: directory },
      }),
    )
  }, directory)

  await page.goto(`/${base64Encode(directory)}/session`)
  const nav = page.locator('[data-component="sidebar-nav-desktop"]')
  await expectAppVisible(nav.locator('[data-component="sidebar-rail"]'))

  const account = nav.locator('[data-component="sidebar-account"]')
  await expect(account).toHaveCount(1)
  await expect(account).toHaveAccessibleName("callum")
  await expect(nav.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0)
  await expect(nav.getByRole("button", { name: "Help", exact: true })).toHaveCount(0)

  await account.click()
  await expect(page.getByRole("menuitem", { name: "Settings" })).toBeVisible()
  await expect(page.getByRole("menuitem", { name: "Help" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("menuitem", { name: "Settings" })).toHaveCount(0)
})
