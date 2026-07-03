import { describe, expect, test } from "bun:test"
import { DESKTOP_MENU } from "./desktop-menu"

describe("desktop menu", () => {
  test("exports logs through the desktop command registry", () => {
    const items = DESKTOP_MENU.flatMap((menu) => menu.items ?? []).filter(
      (item) => item.type === "item" && item.label === "Export Logs...",
    )

    expect(items).toHaveLength(2)
    expect(items.every((item) => item.type === "item" && item.command === "logs.export" && !item.action)).toBe(true)
  })

  test("cmd+w closes the tab, not the window", () => {
    const items = (DESKTOP_MENU.find((menu) => menu.id === "file")?.items ?? []).filter(
      (item) => item.type === "item",
    )
    const closeTab = items.find((item) => item.command === "tab.close")
    const closeWindow = items.find((item) => item.label === "Close Window")

    expect(closeTab).toMatchObject({ label: "Close Tab", accelerator: { macos: "Cmd+W" } })
    // A close role would register a native Cmd+W accelerator that intercepts Close Tab.
    expect(closeWindow?.role).toBeUndefined()
    expect(closeWindow?.action).toBe("window.close")
  })

  test("reopens closed tabs through the command registry", () => {
    const items = DESKTOP_MENU.flatMap((menu) => menu.items ?? []).filter(
      (item) => item.type === "item" && item.command === "tab.reopenClosed",
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      label: "Reopen Closed Tab",
      accelerator: { macos: "Shift+Cmd+T" },
    })
    expect(items[0]?.type === "item" && !items[0].action).toBe(true)
  })
})
