import { createMemo, createSignal, onCleanup, Show, type Accessor } from "solid-js"
import type { SessionStatus } from "@opencode-ai/sdk/v2/client"
import { Spinner } from "@opencode-ai/ui/spinner"
import { TextShimmer } from "@opencode-ai/ui/text-shimmer"
import { useI18n } from "@opencode-ai/ui/context/i18n"

export type SessionActivityPhase = "thinking" | "tool" | "streaming" | "retry" | "working"

export type SessionActivity = {
  phase: SessionActivityPhase
  toolName?: string
  startedAt?: number
  turnStartedAt?: number
}

const [now, setNow] = createSignal(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
let retained = 0

const retainTicker = () => {
  retained += 1
  if (retained === 1) {
    setNow(Date.now())
    ticker = setInterval(() => setNow(Date.now()), 1000)
  }
  onCleanup(() => {
    retained -= 1
    if (retained > 0) return
    if (ticker) clearInterval(ticker)
    ticker = undefined
  })
}

export function createElapsedSeconds(startedAt: Accessor<number | undefined>) {
  retainTicker()
  return createMemo(() => {
    const start = startedAt()
    if (start === undefined) return undefined
    return Math.max(0, Math.floor((now() - start) / 1000))
  })
}

export function createCountdownSeconds(target: Accessor<number | undefined>) {
  retainTicker()
  return createMemo(() => {
    const value = target()
    if (value === undefined) return undefined
    return Math.max(0, Math.round((value - now()) / 1000))
  })
}

export function createSessionActivityText(input: {
  activity: Accessor<SessionActivity | undefined>
  status?: Accessor<SessionStatus | undefined>
}) {
  const i18n = useI18n()
  const elapsedSeconds = createElapsedSeconds(() => input.activity()?.turnStartedAt)
  const countdownSeconds = createCountdownSeconds(() => {
    const status = input.status?.()
    return status?.type === "retry" ? status.next : undefined
  })
  const label = createMemo(() => {
    const activity = input.activity()
    if (!activity) return undefined
    if (activity.phase === "retry") {
      const status = input.status?.()
      const count = countdownSeconds() ?? 0
      const delay = count > 0 ? i18n.t("ui.sessionTurn.retry.inSeconds", { seconds: count }) : ""
      const line = [i18n.t("ui.sessionTurn.retry.retrying"), delay].filter(Boolean).join(" ")
      if (status?.type !== "retry") return line
      return i18n.t("ui.sessionTurn.retry.attemptLine", { line, attempt: status.attempt })
    }
    if (activity.phase === "tool") return i18n.t("ui.sessionTurn.status.runningTool", { tool: activity.toolName ?? "" })
    if (activity.phase === "thinking") return i18n.t("ui.sessionTurn.status.thinking")
    if (activity.phase === "streaming") return i18n.t("ui.sessionTurn.status.responding")
    return i18n.t("ui.sessionTurn.status.working")
  })
  const elapsed = createMemo(() => {
    const activity = input.activity()
    if (!activity || activity.phase === "retry") return undefined
    const total = elapsedSeconds()
    if (total === undefined) return undefined
    if (total < 60) return i18n.t("ui.message.duration.seconds", { count: total })
    return i18n.t("ui.message.duration.minutesSeconds", { minutes: Math.floor(total / 60), seconds: total % 60 })
  })
  const full = createMemo(() => {
    const value = label()
    if (!value) return undefined
    const suffix = elapsed()
    return suffix ? `${value} ${suffix}` : value
  })
  return { label, elapsed, full }
}

export function SessionStatusLine(props: { activity: SessionActivity; status?: SessionStatus; class?: string }) {
  const text = createSessionActivityText({ activity: () => props.activity, status: () => props.status })
  return (
    <div
      data-component="session-status-line"
      class={`flex min-w-0 items-center gap-2 text-text-weak ${props.class ?? ""}`}
    >
      <Spinner class="size-3.5 shrink-0" />
      <TextShimmer text={text.label() ?? ""} class="min-w-0 truncate" />
      <Show when={text.elapsed()}>
        {(value) => (
          <span data-slot="session-status-line-elapsed" class="shrink-0 tabular-nums text-text-weaker">
            {value()}
          </span>
        )}
      </Show>
    </div>
  )
}
