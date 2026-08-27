import { describe, expect, test } from "bun:test"
import { isTimelineRowAbove, normalizeWheelDelta, shouldMarkBoundaryGesture } from "./message-gesture"

describe("normalizeWheelDelta", () => {
  test("converts line mode to px", () => {
    expect(normalizeWheelDelta({ deltaY: 3, deltaMode: 1, rootHeight: 500 })).toBe(120)
  })

  test("converts page mode to container height", () => {
    expect(normalizeWheelDelta({ deltaY: -1, deltaMode: 2, rootHeight: 600 })).toBe(-600)
  })

  test("keeps pixel mode unchanged", () => {
    expect(normalizeWheelDelta({ deltaY: 16, deltaMode: 0, rootHeight: 600 })).toBe(16)
  })
})

describe("shouldMarkBoundaryGesture", () => {
  test("marks when nested scroller cannot scroll", () => {
    expect(
      shouldMarkBoundaryGesture({
        delta: 20,
        scrollTop: 0,
        scrollHeight: 300,
        clientHeight: 300,
      }),
    ).toBe(true)
  })

  test("marks when scrolling beyond top boundary", () => {
    expect(
      shouldMarkBoundaryGesture({
        delta: -40,
        scrollTop: 10,
        scrollHeight: 1000,
        clientHeight: 400,
      }),
    ).toBe(true)
  })

  test("marks when scrolling beyond bottom boundary", () => {
    expect(
      shouldMarkBoundaryGesture({
        delta: 50,
        scrollTop: 580,
        scrollHeight: 1000,
        clientHeight: 400,
      }),
    ).toBe(true)
  })

  test("does not mark when nested scroller can consume movement", () => {
    expect(
      shouldMarkBoundaryGesture({
        delta: 20,
        scrollTop: 200,
        scrollHeight: 1000,
        clientHeight: 400,
      }),
    ).toBe(false)
  })
})

describe("isTimelineRowAbove", () => {
  test("uses the rendered row position when it is available", () => {
    expect(isTimelineRowAbove({ rowTop: 99, viewportTop: 100, rowIndex: 20, firstVisibleIndex: 10 })).toBe(false)
    expect(isTimelineRowAbove({ rowTop: 98, viewportTop: 100, rowIndex: 20, firstVisibleIndex: 10 })).toBe(true)
  })

  test("uses virtual indexes when the row is outside the rendered range", () => {
    expect(isTimelineRowAbove({ viewportTop: 100, rowIndex: 9, firstVisibleIndex: 10 })).toBe(true)
    expect(isTimelineRowAbove({ viewportTop: 100, rowIndex: 11, firstVisibleIndex: 10 })).toBe(false)
  })

  test("returns false until the virtual range is known", () => {
    expect(isTimelineRowAbove({ viewportTop: 100, rowIndex: 9 })).toBe(false)
  })
})
