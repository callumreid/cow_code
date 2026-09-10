import { expect, test } from "bun:test"
import { createVoiceAdmission } from "./admission"

test("out-of-order transcription admits genuine input in commit order exactly once", () => {
  const gate = createVoiceAdmission()
  const generation = gate.begin()
  gate.commit("first")
  gate.commit("second")
  expect(gate.complete("second", "second input")).toEqual([])
  expect(gate.complete("first", "first input")).toEqual([
    { id: "first", text: "first input", generation },
    { id: "second", text: "second input", generation },
  ])
  gate.commit("first")
  expect(gate.complete("first", "duplicate")).toEqual([])
})

test("pause and reconnect reject old transcripts and uncommitted model text", () => {
  const gate = createVoiceAdmission()
  const before = gate.begin()
  gate.commit("old")
  gate.stop()
  expect(gate.current(before)).toBe(false)
  expect(gate.complete("old", "do not admit")).toEqual([])
  gate.begin()
  expect(gate.complete("old", "late result")).toEqual([])
  expect(gate.complete("invented", "model argument")).toEqual([])
  gate.commit("new")
  expect(gate.complete("new", "new input")).toHaveLength(1)
})

test("a failed transcription does not block later committed input", () => {
  const gate = createVoiceAdmission()
  gate.begin()
  gate.commit("failed")
  gate.commit("good")
  gate.complete("good", "good input")
  expect(gate.complete("failed", "", true).map((item) => item.text)).toEqual(["good input"])
})
