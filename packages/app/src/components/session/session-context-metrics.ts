import type { AssistantMessage, Message, Session } from "@opencode-ai/sdk/v2/client"

type Provider = {
  id: string
  name?: string
  models: Record<string, Model | undefined>
}

type Model = {
  name?: string
  limit: {
    context: number
  }
}

type Context = {
  message: AssistantMessage
  provider?: Provider
  model?: Model
  providerLabel: string
  modelLabel: string
  limit: number | undefined
  input: number
  usage: number | null
}

const tokenTotal = (msg: AssistantMessage) => {
  return msg.tokens.input + msg.tokens.output + msg.tokens.reasoning + msg.tokens.cache.read + msg.tokens.cache.write
}

const lastAssistantWithTokens = (messages: Message[]) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.role !== "assistant") continue
    if (tokenTotal(msg) <= 0) continue
    return msg
  }
}

const build = (messages: Message[] = [], providers: Provider[] = []): Context | undefined => {
  const message = lastAssistantWithTokens(messages)
  if (!message) return undefined

  const provider = providers.find((item) => item.id === message.providerID)
  const model = provider?.models[message.modelID]
  const limit = model?.limit.context
  const total = tokenTotal(message)

  return {
    message,
    provider,
    model,
    providerLabel: provider?.name ?? message.providerID,
    modelLabel: model?.name ?? message.modelID,
    limit,
    input: message.tokens.input,
    usage: limit ? Math.round((total / limit) * 100) : null,
  }
}

export function getSessionContext(messages: Message[] = [], providers: Provider[] = []) {
  return build(messages, providers)
}

export function getSessionTokenTotal(tokens: Session["tokens"] | undefined) {
  if (!tokens) return undefined
  return tokens.input + tokens.output + tokens.reasoning + tokens.cache.read + tokens.cache.write
}

type SubagentSource = Pick<Session, "parentID" | "cost" | "tokens">

// Child (subagent) sessions accumulate their own cumulative cost/tokens; the engine
// never rolls them into the parent. Report them as a separate line — merging them
// into the parent numbers would disagree with every other surface and double-count.
export function getSubagentTotals(sessions: readonly SubagentSource[] | undefined, sessionID: string | undefined) {
  if (!sessions || !sessionID) return undefined
  const children = sessions.filter((session) => session.parentID === sessionID)
  if (children.length === 0) return undefined
  return {
    count: children.length,
    cost: children.reduce((sum, child) => sum + (child.cost ?? 0), 0),
    tokens: children.reduce((sum, child) => sum + (getSessionTokenTotal(child.tokens) ?? 0), 0),
  }
}
