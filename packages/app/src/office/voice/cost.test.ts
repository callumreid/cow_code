import { describe, expect, test } from "bun:test"
import { estimateCost, formatCost, REALTIME_MINI_PRICES, REALTIME_PRICES } from "./cost"

const usage = {
  input_token_details: { text_tokens: 500, audio_tokens: 1000, cached_tokens: 0 },
  output_token_details: { text_tokens: 100, audio_tokens: 200 },
}

describe("estimateCost", () => {
  test("prices each lane of gpt-realtime per 1M tokens", () => {
    expect(estimateCost(usage, "gpt-realtime-2.1")).toBeCloseTo((500 * 4 + 1000 * 32 + 100 * 24 + 200 * 64) / 1e6, 12)
  })

  test("uses mini prices for any mini model", () => {
    expect(estimateCost(usage, "gpt-realtime-mini-2.1")).toBeCloseTo(
      (500 * 0.6 + 1000 * 10 + 100 * 2.4 + 200 * 20) / 1e6,
      12,
    )
    expect(REALTIME_MINI_PRICES.audio.input).toBeLessThan(REALTIME_PRICES.audio.input)
  })

  test("bills the cached share of each lane at the cached rate", () => {
    const usd = estimateCost(
      {
        input_token_details: {
          text_tokens: 500,
          audio_tokens: 1000,
          cached_tokens: 800,
          cached_tokens_details: { text_tokens: 200, audio_tokens: 600 },
        },
      },
      "gpt-realtime-2.1",
    )
    expect(usd).toBeCloseTo((300 * 4 + 200 * 0.4 + 400 * 32 + 600 * 0.4) / 1e6, 12)
  })

  test("attributes unsplit cached tokens to text first, then audio", () => {
    const usd = estimateCost(
      { input_token_details: { text_tokens: 500, audio_tokens: 1000, cached_tokens: 700 } },
      "gpt-realtime-2.1",
    )
    expect(usd).toBeCloseTo((0 * 4 + 500 * 0.4 + 800 * 32 + 200 * 0.4) / 1e6, 12)
  })

  test("treats totals without a breakdown as audio", () => {
    expect(estimateCost({ input_tokens: 100, output_tokens: 50 }, "gpt-realtime-2.1")).toBeCloseTo(
      (100 * 32 + 50 * 64) / 1e6,
      12,
    )
  })

  test("is zero without usage", () => {
    expect(estimateCost(undefined, "gpt-realtime-2.1")).toBe(0)
    expect(estimateCost({}, "gpt-realtime-2.1")).toBe(0)
  })

  test("sums across response.done events", () => {
    const total = [usage, usage, usage].reduce((sum, u) => sum + estimateCost(u, "gpt-realtime-2.1"), 0)
    expect(total).toBeCloseTo(3 * estimateCost(usage, "gpt-realtime-2.1"), 12)
  })
})

describe("formatCost", () => {
  test("shows three decimals under a cent and two above", () => {
    expect(formatCost(0.0042)).toBe("≈$0.004")
    expect(formatCost(0.1234)).toBe("≈$0.12")
    expect(formatCost(0)).toBe("≈$0.000")
  })
})
