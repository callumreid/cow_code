import test from "node:test"
import assert from "node:assert/strict"
import { namedCommand, asksToAct } from "../src/commands.js"

test("a spoken steer in two sentences preserves the actual target and instruction", async () => {
  let action
  const rows = [{ id: "ses_relay", title: "Office acceptance relay 20 November" }]
  const inventory = {
    list: async (query) => {
      assert.equal(query.toLowerCase(), "office acceptance relay")
      return { rows }
    },
  }
  const text =
    "Please steer the office acceptance relay thread. Ask it to reply only with the words third relay complete. Prepare that instruction now."
  await namedCommand(text, {}, inventory, async (a) => {
    action = a
    return { proposal: { label: "Prepared" } }
  })
  assert.deepEqual(action, {
    kind: "steer",
    id: "ses_relay",
    text: "reply only with the words third relay complete.",
  })
})
test("an informational question about past work is not a worker command", () => {
  assert.equal(asksToAct("When did we start this thread?"), false)
  assert.equal(asksToAct("Please stop this thread"), true)
})
