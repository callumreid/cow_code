import { Binary } from "@opencode-ai/core/util/binary"
import type { AssistantMessage, Message, Part, SessionStatus, UserMessage } from "@opencode-ai/sdk/v2/client"
import type { SessionActivity } from "@opencode-ai/session-ui/session-status-line"

export type { SessionActivity, SessionActivityPhase } from "@opencode-ai/session-ui/session-status-line"

// Mirrors the active-turn derivation in timeline/projection.ts:32-48 as a pure function:
// the user turn the current busy run belongs to.
export function activeUserMessage(messages: Message[], status: SessionStatus): UserMessage | undefined {
  const parentID = messages.findLast(
    (message): message is AssistantMessage =>
      message.role === "assistant" && typeof message.time.completed !== "number",
  )?.parentID
  if (parentID) {
    const result = Binary.search(messages, parentID, (message) => message.id)
    const message = result.found ? messages[result.index] : messages.find((item) => item.id === parentID)
    if (message?.role === "user") return message
  }

  if (status.type === "idle") return
  return messages.findLast((message): message is UserMessage => message.role === "user")
}

const relevant = (part: Part) => part.type === "tool" || part.type === "reasoning" || part.type === "text"

// Pure phase derivation for the live activity indicator. Reads only store data —
// no clocks — so consumers can memoize it on store changes rather than ticks.
export function deriveSessionActivity(input: {
  status: SessionStatus
  messages: Message[]
  parts: (messageID: string) => Part[]
}): SessionActivity | undefined {
  const status = input.status
  if (status.type === "idle") return

  const active = activeUserMessage(input.messages, status)
  const turnStartedAt = active?.time.created
  if (status.type === "retry") return { phase: "retry", startedAt: turnStartedAt, turnStartedAt }

  const last = active
    ? input.messages
        .filter(
          (message): message is AssistantMessage => message.role === "assistant" && message.parentID === active.id,
        )
        .flatMap((message) => input.parts(message.id))
        .findLast(relevant)
    : undefined
  if (!last) return { phase: "working", startedAt: turnStartedAt, turnStartedAt }

  if (last.type === "tool" && (last.state.status === "pending" || last.state.status === "running"))
    return {
      phase: "tool",
      toolName: last.tool,
      startedAt: last.state.status === "running" ? last.state.time.start : turnStartedAt,
      turnStartedAt,
    }
  if (last.type === "reasoning" && typeof last.time.end !== "number")
    return { phase: "thinking", startedAt: last.time.start, turnStartedAt }
  if (last.type === "text" && typeof last.time?.end !== "number")
    return { phase: "streaming", startedAt: last.time?.start ?? turnStartedAt, turnStartedAt }

  // Between steps: the model finished its last visible part but the turn is still busy.
  return { phase: "working", startedAt: turnStartedAt, turnStartedAt }
}
