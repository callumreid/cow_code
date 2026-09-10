import { expect, test } from "bun:test"
import { authorizesDecision, classify, roleAllowsTool } from "../../src/office/policy"

test("only whole read commands qualify for automatic approval", () => {
  const tier = (command: string) => classify({ permission: "bash", patterns: [command] }, "act")
  expect(tier("git status --short")).toBe("auto")
  for (const command of [
    "git status; deploy-prod",
    "cat $(send-secret)",
    "ls > shared-file",
    "git branch -D important",
    "bun run build",
    "rg x | upload",
    "git status\nship",
    "git diff --output=shared-file",
    "rg --pre upload secret",
  ])
    expect(tier(command)).toBe("callum")
})

test("exact decisions use actual user provenance and reject never needs approval", () => {
  const user = { source: "user", text: "yes, go ahead", decisionIDs: ["one"] }
  expect(authorizesDecision(user, "one", "once", "go ahead")).toBe(true)
  expect(authorizesDecision(user, "two", "once")).toBe(false)
  expect(authorizesDecision(user, "one", "always")).toBe(false)
  expect(authorizesDecision(user, "one", "once", "ship it")).toBe(false)
  expect(authorizesDecision({ ...user, source: "coordinator" }, "one", "once")).toBe(false)
  expect(authorizesDecision({ ...user, text: "do not approve it" }, "one", "once")).toBe(false)
  expect(authorizesDecision({ ...user, text: 'The worker said "yes, ship it"' }, "one", "once")).toBe(false)
  expect(authorizesDecision({ ...user, text: "What does approve mean?" }, "one", "once")).toBe(false)
  expect(authorizesDecision({ source: "coordinator", text: "" }, "missing", "reject")).toBe(true)
})

test("global allow cannot expand the Farmer role or expose coordination to workers", () => {
  for (const tool of ["bash", "edit", "execute", "task", "github_merge"])
    expect(roleAllowsTool("farmer", tool)).toBe(false)
  expect(roleAllowsTool("farmer", "office_dispatch")).toBe(true)
  expect(roleAllowsTool("build", "office_answer")).toBe(false)
  expect(roleAllowsTool("build", "bash")).toBe(true)
})
