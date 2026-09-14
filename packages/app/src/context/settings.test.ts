import { describe, expect, test } from "bun:test"
import { PersistTesting } from "@/utils/persist"
import {
  hasExistingWebState,
  initialAgentVisibility,
  isAppUpgrade,
  migrateStoredSettings,
  newLayoutDesignsDefault,
  shouldDisplayTabsToast,
} from "./settings"

describe("agent visibility", () => {
  test("shows the picker for existing profiles and hides it for first-time installs", () => {
    expect(initialAgentVisibility(undefined, true)).toBe(true)
    expect(initialAgentVisibility(undefined, false)).toBe(false)
  })

  test("shows the picker when updating from a recent release", () => {
    expect(initialAgentVisibility(undefined, false, "1.18.8")).toBe(true)
  })

  test("preserves the preference after initialization", () => {
    expect(initialAgentVisibility(true, true, "1.18.8")).toBeUndefined()
    expect(initialAgentVisibility(true, false)).toBeUndefined()
  })
})

describe("sidebar navigation", () => {
  test("blank profiles default to the persistent sidebar", () => {
    expect(newLayoutDesignsDefault).toBe(false)
  })

  test("repairs the expired layout preference without changing other settings", () => {
    const stored = {
      general: { newLayoutDesigns: true, followup: "queue", showNavigation: false, layoutTransitionEligible: true },
      office: { voice: "marin", openOnLaunch: true },
      keybinds: { "session.new": "mod+n" },
      appearance: { fontSize: 16 },
    }
    expect(migrateStoredSettings(stored)).toEqual({
      ...stored,
      general: {
        ...stored.general,
        newLayoutDesigns: false,
        sidebarNavigationInitialized: true,
        shouldDisplayTabsToast: false,
      },
    })
    expect(stored.general.newLayoutDesigns).toBe(true)
  })

  test("repairs once and preserves subsequent explicit layout choices", () => {
    const repaired = migrateStoredSettings({ general: { newLayoutDesigns: true } })
    expect(migrateStoredSettings(repaired)).toBe(repaired)
    const optedIn = { general: { newLayoutDesigns: true, sidebarNavigationInitialized: true } }
    expect(migrateStoredSettings(optedIn)).toBe(optedIn)
  })

  test("repairs persisted settings before merging fresh-profile defaults", () => {
    const defaults = { general: { sidebarNavigationInitialized: true, followup: "queue" } }
    const raw = JSON.stringify({ general: { newLayoutDesigns: true, followup: "queue" } })
    const repaired = PersistTesting.normalize(defaults, raw, migrateStoredSettings)!
    expect(JSON.parse(repaired).general.newLayoutDesigns).toBe(false)
    expect(PersistTesting.normalize(defaults, repaired, migrateStoredSettings)).toBe(repaired)
  })

  test("keeps the existing queue-first migration", () => {
    expect(migrateStoredSettings({ general: { followup: "steer", sidebarNavigationInitialized: true } })).toEqual({
      general: { sidebarNavigationInitialized: true },
    })
  })

  test("classifies web profiles from existing settings or a recorded version", () => {
    expect(hasExistingWebState("{}", undefined)).toBe(true)
    expect(hasExistingWebState(null, "1.17.19")).toBe(true)
    expect(hasExistingWebState(null, undefined)).toBe(false)
  })

  test("detects upgrades only when a previous version is older", () => {
    expect(isAppUpgrade("1.17.19", "1.17.20")).toBe(true)
    expect(isAppUpgrade(undefined, "1.17.20")).toBe(false)
    expect(isAppUpgrade("1.17.20", "1.17.20")).toBe(false)
    expect(isAppUpgrade("1.17.21", "1.17.20")).toBe(false)
  })

  test("shows the tabs toast for upgrades and existing installs without a recorded version", () => {
    expect(shouldDisplayTabsToast("1.17.19", "1.17.20", false)).toBe(true)
    expect(shouldDisplayTabsToast(undefined, "1.17.20", true)).toBe(true)
    expect(shouldDisplayTabsToast(undefined, "1.17.20", false)).toBe(false)
  })
})
