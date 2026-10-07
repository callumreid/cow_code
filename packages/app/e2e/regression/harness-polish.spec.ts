import { base64Encode } from "@opencode-ai/core/util/encode"
import { expect, test, type Page } from "@playwright/test"
import { fixture } from "../performance/timeline/session-timeline-stress.fixture"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectSessionTitle } from "../utils/waits"

const href = `/${base64Encode(fixture.directory)}/session/${fixture.sourceID}`
const responseCount = fixture.messages[fixture.sourceID]
  .slice(-4)
  .filter((message) => message.info.role === "assistant")
  .flatMap((message) => message.parts.filter((part) => part.type === "text")).length

for (const colorScheme of ["light", "dark"] as const) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 900, height: 700 },
    { width: 640, height: 700 },
  ]) {
    test(`legacy harness fits ${viewport.width}x${viewport.height} in ${colorScheme}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      await setup(page, colorScheme)
      await expectSessionTitle(page, fixture.expected.sourceTitle)
      await expect(page.getByRole("heading", { name: "What changed", exact: true })).toHaveCount(responseCount)
      await expect(page.locator("pre code").filter({ hasText: "const nextAction" })).toHaveCount(responseCount)
      const composer = page.locator('[data-component="prompt-composer"]')
      const editor = page.locator('[data-component="prompt-input"][contenteditable="true"]')
      await expect(composer).toBeVisible()
      await expect(editor).toBeVisible()
      await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled()
      await editor.fill("Keep every feature, and refine the conversation experience.")
      await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled()
      await expect(page.getByRole("button", { name: "Add files", exact: true })).toBeVisible()
      await expect(page.getByRole("button", { name: "Claude Opus 4.6", exact: true })).toBeVisible()
      await expect(page.locator("html")).toHaveAttribute("data-color-scheme", colorScheme)
      const box = await composer.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width)
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await page.screenshot({ path: testInfo.outputPath(`harness-${viewport.width}-${colorScheme}.png`) })
      await editor.fill("")
      await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled()
    })
  }
}

test("legacy sidebar rename can be cancelled from F2 and the context menu", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setup(page, "light")
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  const sidebar = page.getByRole("navigation", { name: "Projects and sessions" })
  await expect(sidebar).toBeVisible()
  await expect(sidebar.getByRole("button", { name: "Scheduled", exact: true })).toBeVisible()
  await expect(sidebar.getByRole("button", { name: "Farmer's Office", exact: true })).toBeVisible()
  const row = sidebar.locator(`[data-component="sidebar-session-item"][data-session-id="${fixture.sourceID}"]`)
  const link = row.getByRole("link", { name: fixture.expected.sourceTitle, exact: true })
  const editor = row.getByRole("textbox")
  const updates: string[] = []
  page.on("request", (request) => {
    if (request.method() === "PATCH" && new URL(request.url()).pathname.includes("/session/"))
      updates.push(request.url())
  })
  await link.focus()
  await link.press("F2")
  await expect(editor).toBeFocused()
  await editor.fill("Cancelled rename")
  await editor.press("Escape")
  await expect(editor).toHaveCount(0)
  await expect(link).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await link.click({ button: "right" })
  await expect(page.getByRole("menuitem", { name: /Rename/ })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("sidebar-context-menu.png") })
  await page.getByRole("menuitem", { name: /Rename/ }).click()
  await expect(editor).toBeFocused()
  await editor.fill("Cancelled from context menu")
  await editor.press("Escape")
  await expect(editor).toHaveCount(0)
  await expect(link).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  expect(updates).toEqual([])
})

test("desktop sidebar collapse survives reload and can be reopened", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setup(page, "light")
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  const toggle = page.getByRole("button", { name: "Toggle sidebar", exact: true })
  await expect(toggle).toHaveAttribute("aria-expanded", "true")
  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByRole("button", { name: "Scheduled", exact: true })).toHaveCount(0)
  await page.reload()
  await page.getByRole("button", { name: "Dismiss Tabs information", exact: true }).click()
  await expect(toggle).toHaveAttribute("aria-expanded", "false")
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByRole("button", { name: "Scheduled", exact: true })).toBeVisible()
})

test("collapsed desktop project preview supports focus, Escape, and session navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setup(page, "light")
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  await page.getByRole("button", { name: "Toggle sidebar", exact: true }).click()
  const project = page.locator('[data-component="sidebar-nav-desktop"]').getByRole("button", {
    name: "smoke-project",
    exact: true,
  })
  const peek = page.locator('[data-component="sidebar-project-peek"]')
  await project.focus()
  await expect(peek).toHaveAttribute("aria-hidden", "false")
  await project.press("ArrowRight")
  await expect.poll(() => peek.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press("Escape")
  await expect(peek).toHaveAttribute("aria-hidden", "true")
  await expect(project).toBeFocused()
  await project.hover()
  await expect(peek).toHaveAttribute("aria-hidden", "false")
  await peek.getByRole("link", { name: fixture.expected.sourceTitle, exact: true }).click({ button: "right" })
  await page.getByRole("menuitem", { name: /Rename/ }).click()
  const rename = peek.locator(`[data-session-id="${fixture.sourceID}"]`).getByRole("textbox")
  await expect(rename).toBeFocused()
  await expect(peek).toHaveAttribute("aria-hidden", "false")
  await rename.press("Escape")
  await peek.getByRole("link", { name: fixture.expected.targetTitle, exact: true }).click()
  await expectSessionTitle(page, fixture.expected.targetTitle)
  await expect(peek).toHaveAttribute("aria-hidden", "true")
})

for (const width of [900, 640]) {
  test(`narrow ${width}px sidebar preserves navigation and excludes background focus`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await setup(page, "light")
    await expectSessionTitle(page, fixture.expected.sourceTitle)
    const toggle = page.getByRole("button", { name: "Toggle menu", exact: true })
    const drawer = page.locator("#cowcode-mobile-sidebar")
    const editor = page.locator('[data-component="prompt-input"][contenteditable="true"]')
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(drawer).toHaveAttribute("inert", "")
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    await page.keyboard.press("Escape")
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(toggle).toBeFocused()
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    await expect(drawer).not.toHaveAttribute("inert")
    await expect(drawer.getByRole("button", { name: "Scheduled", exact: true })).toBeVisible()
    await expect(drawer.getByRole("button", { name: "Farmer's Office", exact: true })).toBeVisible()
    await editor.focus()
    await expect(editor).not.toBeFocused()
    await drawer.getByRole("button", { name: "Scheduled", exact: true }).focus()
    await page.keyboard.press("Escape")
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(toggle).toBeFocused()
    await expect(drawer).toHaveAttribute("inert", "")
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    await page.mouse.click(width - 10, 80)
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await toggle.click()
    await drawer.getByRole("link", { name: fixture.expected.targetTitle, exact: true }).click()
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expectSessionTitle(page, fixture.expected.targetTitle)
  })
}

test("new-session surface keeps clear primary actions", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setup(page, "light")
  await expectSessionTitle(page, fixture.expected.sourceTitle)
  await page.getByRole("button", { name: "New session", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Build anything", exact: true })).toBeVisible()
  await expect(page.locator('[data-component="prompt-input"][contenteditable="true"]')).toBeVisible()
  await expect(page.getByRole("button", { name: "Add files", exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled()
  await expect(page.locator('[data-component="cow-brand"]')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath("new-session-light.png") })
})

test("welcome surface keeps the cow brand and project actions together", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setup(page, "light", true)
  const home = page.locator('[data-component="legacy-home"]')
  await expect(home).toBeVisible()
  await expect(home.getByRole("button", { name: "Open project", exact: true })).toBeEnabled()
  await expect(home.locator('[data-component="cow-brand"]')).toBeVisible()
  expect(await page.locator("body").evaluate((element) => getComputedStyle(element, "::before").content)).toBe("none")
  await page.screenshot({ path: testInfo.outputPath("home-light.png") })
})

test("mobile project selection and desktop resize preserve desktop sidebar preference", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setup(page, "light")
  const desktopToggle = page.getByRole("button", { name: "Toggle sidebar", exact: true })
  await expect(desktopToggle).toHaveAttribute("aria-expanded", "true")
  await page.setViewportSize({ width: 900, height: 700 })
  const mobileToggle = page.getByRole("button", { name: "Toggle menu", exact: true })
  const drawer = page.locator("#cowcode-mobile-sidebar")
  await mobileToggle.click()
  await drawer.getByRole("button", { name: "smoke-project", exact: true }).click()
  await expect(mobileToggle).toHaveAttribute("aria-expanded", "false")
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(desktopToggle).toHaveAttribute("aria-expanded", "true")
  await page.setViewportSize({ width: 900, height: 700 })
  await mobileToggle.click()
  await expect(drawer).toHaveAttribute("aria-hidden", "false")
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(drawer).toHaveAttribute("aria-hidden", "true")
  await expect(drawer).toHaveAttribute("inert", "")
  await desktopToggle.focus()
  await page.keyboard.press("Escape")
  await expect(desktopToggle).toBeFocused()
  await page.setViewportSize({ width: 900, height: 700 })
  await expect(mobileToggle).toHaveAttribute("aria-expanded", "false")
})

async function setup(page: Page, colorScheme: "light" | "dark", welcome = false) {
  await mockOpenCodeServer(page, {
    directory: fixture.directory,
    project: fixture.project,
    provider: fixture.provider,
    sessions: fixture.sessions,
    pageMessages: (sessionID) => ({
      items: (fixture.messages[sessionID] ?? []).slice(-4).map((message) => ({
        ...message,
        parts: message.parts.map((part) =>
          part.type !== "text"
            ? part
            : {
                ...part,
                text:
                  message.info.role === "user"
                    ? "Refine the sidebar and conversation view. Keep every feature and make the next action easy to find."
                    : "## What changed\n\n- Clearer session navigation with stable status indicators.\n- A calmer composer with an obvious send action.\n- More readable tool output and conversation spacing.\n\nExisting features remain available through the sidebar and `Command + K`.\n\n```ts\nconst nextAction = { label: 'Continue', enabled: true }\n```",
              },
        ),
      })),
    }),
  })
  await page.addInitScript(
    ({ directory, colorScheme, welcome }) => {
      localStorage.setItem("opencode-theme-id", "oc-2")
      localStorage.setItem("opencode-color-scheme", colorScheme)
      localStorage.setItem(
        "settings.v3",
        JSON.stringify({
          general: {
            newLayoutDesigns: false,
            sidebarNavigationInitialized: true,
            shouldDisplayTabsToast: true,
            editToolPartsExpanded: true,
            shellToolPartsExpanded: true,
          },
          office: { openOnLaunch: false },
        }),
      )
      localStorage.setItem(
        "opencode.global.dat:server",
        JSON.stringify({
          projects: { local: welcome ? [] : [{ worktree: directory, expanded: true }] },
          lastProject: welcome ? {} : { local: directory },
        }),
      )
    },
    { directory: fixture.directory, colorScheme, welcome },
  )
  await page.goto(welcome ? "/" : href)
  await page.getByRole("button", { name: "Dismiss Tabs information", exact: true }).click()
  await expect(page.getByRole("button", { name: "Dismiss Tabs information", exact: true })).toHaveCount(0)
}
