import { createStore, reconcile } from "solid-js/store"
import type { ServerEvent } from "./server-sdk"

export type GenerationSample = {
  messageID: string
  characters: number
  firstCharacters: number
  deltas: number
  started?: number
  last?: number
  duration: number
  active: boolean
  complete: boolean
  admitted: boolean
  tokens?: number
}

/** Server-scoped, in-memory observations. Reconnecting mid-turn must not turn partial timing into exact usage. */
export function createGenerationTracker() {
  const [samples, setSamples] = createStore<Record<string, GenerationSample | undefined>>({})
  const seen = new Set<string>()

  const start = (sessionID: string, messageID: string, admitted = false) => {
    if (samples[sessionID]?.messageID === messageID && !samples[sessionID]?.complete) {
      if (admitted && samples[sessionID]?.deltas === 0) setSamples(sessionID, "admitted", true)
      return
    }
    const keys = Object.keys(samples)
    if (keys.length >= 256 && !samples[sessionID]) setSamples(keys[0], undefined)
    setSamples(
      sessionID,
      reconcile({
        messageID,
        characters: 0,
        firstCharacters: 0,
        deltas: 0,
        duration: 0,
        active: false,
        complete: false,
        admitted,
      }),
    )
  }
  const pause = (sessionID: string, complete = false, tokens?: number) => {
    const sample = samples[sessionID]
    if (!sample || sample.complete) return
    setSamples(sessionID, {
      active: false,
      started: undefined,
      duration: sample.duration + (sample.started === undefined ? 0 : (sample.last ?? sample.started) - sample.started),
      complete,
      tokens: sample.admitted && tokens !== undefined && tokens > 0 && Number.isFinite(tokens) ? tokens : undefined,
    })
  }
  const delta = (sessionID: string, messageID: string, text: string, now: number) => {
    if (!text) return
    if (samples[sessionID]?.messageID !== messageID) start(sessionID, messageID)
    const sample = samples[sessionID]!
    if (sample.complete) return
    setSamples(sessionID, {
      characters: sample.characters + text.length,
      firstCharacters: sample.deltas === 0 ? text.length : sample.firstCharacters,
      deltas: sample.deltas + 1,
      started: sample.started ?? now,
      last: now,
      active: true,
    })
  }

  return {
    samples,
    apply(event: ServerEvent, now = performance.now()) {
      if (event.id && seen.has(event.id)) return
      if (event.id) {
        seen.add(event.id)
        if (seen.size > 4096) seen.delete(seen.values().next().value!)
      }
      const current = event.current
      if (current) {
        switch (current.type) {
          case "session.step.started":
            return start(current.data.sessionID, current.data.assistantMessageID, true)
          case "session.text.delta":
          case "session.reasoning.delta":
          case "session.tool.input.delta":
            return delta(current.data.sessionID, current.data.assistantMessageID, current.data.delta, now)
          case "session.tool.called":
            return pause(current.data.sessionID)
          case "session.retry.scheduled":
            return pause(current.data.sessionID, true)
          case "session.execution.succeeded":
          case "session.execution.failed":
          case "session.execution.interrupted":
            return pause(current.data.sessionID, true)
          case "session.step.ended":
            if (samples[current.data.sessionID]?.messageID !== current.data.assistantMessageID) return
            return pause(current.data.sessionID, true, current.data.tokens.output + current.data.tokens.reasoning)
          case "session.step.failed":
            if (samples[current.data.sessionID]?.messageID !== current.data.assistantMessageID) return
            return pause(current.data.sessionID, true)
          case "session.deleted":
            return setSamples(current.data.sessionID, undefined)
        }
        return
      }
      switch (event.type) {
        case "message.part.delta":
          if (event.properties.field !== "text") return
          if (samples[event.properties.sessionID]?.messageID !== event.properties.messageID) return
          return delta(event.properties.sessionID, event.properties.messageID, event.properties.delta, now)
        case "message.part.updated": {
          const part = event.properties.part
          if (part.type === "step-start") return start(part.sessionID, part.messageID, true)
          if (samples[part.sessionID]?.messageID !== part.messageID) return
          if (part.type === "tool" && part.state.status !== "pending") return pause(part.sessionID)
          if (part.type === "step-finish")
            return pause(part.sessionID, true, part.tokens.output + part.tokens.reasoning)
          return
        }
        case "message.updated":
          if (event.properties.info.role !== "assistant") return
          if (event.properties.info.time.completed) {
            if (samples[event.properties.info.sessionID]?.messageID !== event.properties.info.id) return
            return pause(event.properties.info.sessionID, true)
          }
          return start(event.properties.info.sessionID, event.properties.info.id)
        case "session.status":
          if (event.properties.status.type === "idle") return pause(event.properties.sessionID, true)
          if (event.properties.status.type === "retry") return pause(event.properties.sessionID, true)
          return
        case "session.deleted":
          return setSamples(event.properties.info.id, undefined)
      }
    },
    disconnect() {
      Object.keys(samples).forEach((id) => pause(id, true))
    },
  }
}

export function generationRate(sample: GenerationSample | undefined, now = performance.now()) {
  if (!sample || sample.deltas < 2) return undefined
  const duration = sample.duration + (sample.started === undefined ? 0 : Math.max(0, now - sample.started))
  if (duration < 250) return undefined
  const estimated = sample.tokens === undefined
  // The first chunk arrives at the timing origin; counting it as generated afterwards inflates short streams.
  const tokens = estimated ? (sample.characters - sample.firstCharacters) / 4 : sample.tokens!
  if (tokens <= 0) return undefined
  return { value: (tokens * 1000) / duration, estimated, active: sample.active }
}
