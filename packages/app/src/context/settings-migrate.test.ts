import { describe, expect, test } from "bun:test"
import { migrateStoredSettings } from "./settings"

describe("migrateStoredSettings", () => {
  test("flips a persisted errors:false to true once for upgraded profiles", () => {
    const migrated = migrateStoredSettings({ notifications: { errors: false, agent: true } }) as {
      notifications: { errors: boolean; agent: boolean }
      errorsNotificationDefaultApplied: boolean
    }
    expect(migrated.notifications.errors).toBe(true)
    expect(migrated.notifications.agent).toBe(true)
    expect(migrated.errorsNotificationDefaultApplied).toBe(true)
  })

  test("is idempotent — leaves a later user opt-out alone once the marker is set", () => {
    const optedOut = { notifications: { errors: false }, errorsNotificationDefaultApplied: true }
    const migrated = migrateStoredSettings(optedOut)
    // Marker already set: the user's false must be preserved and the object
    // returned unchanged so storage is not rewritten on every read.
    expect(migrated).toBe(optedOut)
  })

  test("still strips the legacy coerced followup 'steer'", () => {
    const migrated = migrateStoredSettings({
      general: { followup: "steer", autoSave: true },
      errorsNotificationDefaultApplied: true,
    }) as { general: { followup?: string; autoSave: boolean } }
    expect(migrated.general.followup).toBeUndefined()
    expect(migrated.general.autoSave).toBe(true)
  })

  test("applies both migrations together on a legacy blob", () => {
    const migrated = migrateStoredSettings({
      general: { followup: "steer" },
      notifications: { errors: false },
    }) as {
      general: { followup?: string }
      notifications: { errors: boolean }
      errorsNotificationDefaultApplied: boolean
    }
    expect(migrated.general.followup).toBeUndefined()
    expect(migrated.notifications.errors).toBe(true)
    expect(migrated.errorsNotificationDefaultApplied).toBe(true)
  })

  test("returns the original reference when nothing needs migrating", () => {
    const clean = { notifications: { errors: true }, errorsNotificationDefaultApplied: true }
    expect(migrateStoredSettings(clean)).toBe(clean)
  })
})
