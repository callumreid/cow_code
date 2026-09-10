/** Token usage as reported on a realtime `response.done` event. */
export type VoiceUsage = {
  total_tokens?: number
  input_tokens?: number
  output_tokens?: number
  input_token_details?: {
    text_tokens?: number
    audio_tokens?: number
    cached_tokens?: number
    cached_tokens_details?: { text_tokens?: number; audio_tokens?: number }
  }
  output_token_details?: { text_tokens?: number; audio_tokens?: number }
}

/** USD per 1M tokens, per lane. */
export type VoicePrices = {
  audio: { input: number; cached: number; output: number }
  text: { input: number; cached: number; output: number }
}

export const REALTIME_PRICES: VoicePrices = {
  audio: { input: 32, cached: 0.4, output: 64 },
  text: { input: 4, cached: 0.4, output: 24 },
}

export const REALTIME_MINI_PRICES: VoicePrices = {
  audio: { input: 10, cached: 0.3, output: 20 },
  text: { input: 0.6, cached: 0.06, output: 2.4 },
}

export function pricesFor(model: string) {
  if (/mini/i.test(model)) return REALTIME_MINI_PRICES
  return REALTIME_PRICES
}

/**
 * Cost in USD of one `response.done` usage block. Sum the results across
 * responses for the session total.
 *
 * `text_tokens` / `audio_tokens` are totals that include the cached subset, so
 * the cached share is billed at the cached rate and only the remainder at the
 * full input rate.
 */
export function estimateCost(usage: VoiceUsage | undefined, model: string) {
  if (!usage) return 0
  const prices = pricesFor(model)
  const input = usage.input_token_details
  const output = usage.output_token_details
  // No lane breakdown: assume audio, the expensive lane, so the estimate errs high.
  if (!input && !output) {
    return ((usage.input_tokens ?? 0) * prices.audio.input + (usage.output_tokens ?? 0) * prices.audio.output) / 1e6
  }
  const text = input?.text_tokens ?? 0
  const audio = input?.audio_tokens ?? 0
  const cached = input?.cached_tokens ?? 0
  const split = input?.cached_tokens_details
  // Without a per-lane split, attribute cached tokens to text first: text is the
  // cheaper lane to discount, so this again errs high rather than low.
  const cachedText = split ? Math.min(text, split.text_tokens ?? 0) : Math.min(text, cached)
  const cachedAudio = split ? Math.min(audio, split.audio_tokens ?? 0) : Math.min(audio, cached - cachedText)
  const micro =
    (text - cachedText) * prices.text.input +
    cachedText * prices.text.cached +
    (audio - cachedAudio) * prices.audio.input +
    cachedAudio * prices.audio.cached +
    (output?.text_tokens ?? 0) * prices.text.output +
    (output?.audio_tokens ?? 0) * prices.audio.output
  return micro / 1e6
}

/** `≈$0.012` under a cent, `≈$1.23` otherwise. */
export function formatCost(usd: number) {
  if (usd < 0.01) return `≈$${usd.toFixed(3)}`
  return `≈$${usd.toFixed(2)}`
}
