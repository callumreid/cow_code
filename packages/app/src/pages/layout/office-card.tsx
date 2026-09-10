import { createEffect, For, Match, on, Show, Switch, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { Button } from "@opencode-ai/ui/button"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { usePlatform } from "@/context/platform"
import { errorText, useOffice } from "@/office/context"
import { isLive, projectLabel, relativeAge, threadHref } from "@/office/stream"
import type { OfficeCardAction, OfficeReport, OfficeReportKind, OfficeThread, OfficeWaiting } from "@/office/types"

type CardKind = Exclude<OfficeReportKind, "auto_allowed">

const KIND_META: Record<CardKind, { label: string; stripe: string; text: string }> = {
  permission: { label: "permission", stripe: "bg-icon-warning-base", text: "text-icon-warning-base" },
  question: { label: "question", stripe: "bg-icon-warning-base", text: "text-icon-warning-base" },
  error: { label: "error", stripe: "bg-icon-critical-base", text: "text-icon-critical-base" },
  pr: { label: "pr", stripe: "bg-icon-success-base", text: "text-icon-success-base" },
  finished: { label: "finished", stripe: "bg-icon-success-base", text: "text-icon-success-base" },
  stalled: { label: "stalled", stripe: "bg-icon-warning-base opacity-50", text: "text-text-weak" },
}

const RESOLVED_LABEL: Record<OfficeCardAction, string> = {
  once: "Allowed once",
  always: "Allowed always",
  reject: "Denied",
  answered: "Answered",
}

const RETRY_TEXT = "Please retry the last step and report what failed."
const NUDGE_TEXT = "Status? If you are blocked say what on."

export const INPUT_CLASS =
  "w-full rounded-md border border-border-weak-base bg-background-base px-2 py-1 text-12-regular text-text-strong outline-none placeholder:text-text-weak focus:border-border-strong-focus disabled:opacity-60"

const Chip = (props: { children: JSX.Element; class?: string }) => (
  <span class={`text-12-mono shrink-0 rounded px-1 ${props.class ?? "bg-surface-inset-base text-text-weak"}`}>
    {props.children}
  </span>
)

const Resolved = (props: { label: string }) => (
  <span class="inline-flex items-center gap-1 text-12-medium text-text-weak">
    <Icon name="check" size="small" />
    {props.label}
  </span>
)

const PermissionActions = (props: {
  thread: OfficeThread
  waiting: Extract<OfficeWaiting, { kind: "permission" }>
  onAction: (action: OfficeCardAction) => void
}) => {
  const office = useOffice()
  const [state, setState] = createStore({ busy: false, deny: false, note: "", error: undefined as string | undefined })
  const command = () => {
    const raw = props.waiting.metadata.command
    const lines = [...(typeof raw === "string" ? [raw] : []), ...props.waiting.patterns]
    return [...new Set(lines)].join("\n")
  }
  const reply = (value: "once" | "always" | "reject") => {
    if (state.busy) return
    setState({ busy: true, error: undefined })
    const message = value === "reject" && state.note.trim() ? state.note.trim() : undefined
    office
      .answer({ sessionID: props.thread.sessionID, permission: { id: props.waiting.id, reply: value, message } })
      .then(() => props.onAction(value))
      .catch((cause: unknown) => setState("error", errorText(cause)))
      .finally(() => setState("busy", false))
  }
  return (
    <div class="flex flex-col gap-2">
      <div class="flex items-start gap-2 min-w-0">
        <span class="text-12-mono text-icon-warning-base shrink-0">{props.waiting.permission}</span>
        <Show when={command()}>
          <span class="text-12-mono text-text-base whitespace-pre-wrap break-all min-w-0 flex-1">{command()}</span>
        </Show>
        <Show when={props.waiting.tier}>
          <Chip>tier {props.waiting.tier}</Chip>
        </Show>
      </div>
      <Show when={props.waiting.title}>
        <span class="text-12-regular text-text-base">{props.waiting.title}</span>
      </Show>
      <div class="flex items-center gap-2 flex-wrap">
        <Button size="small" variant="primary" disabled={state.busy} onClick={() => reply("once")}>
          Allow once
        </Button>
        <Button size="small" disabled={state.busy} onClick={() => reply("always")}>
          Allow always
        </Button>
        <Button
          size="small"
          disabled={state.busy}
          aria-expanded={state.deny}
          onClick={() => setState("deny", (value) => !value)}
        >
          Deny
        </Button>
      </div>
      <Show when={state.deny}>
        <div class="flex items-center gap-2">
          <input
            class={`${INPUT_CLASS} flex-1`}
            placeholder="Why? Optional — sent along with the denial"
            value={state.note}
            disabled={state.busy}
            onInput={(event) => setState("note", event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.isComposing) return
              event.preventDefault()
              reply("reject")
            }}
          />
          <Button size="small" disabled={state.busy} onClick={() => reply("reject")}>
            Confirm deny
          </Button>
        </div>
      </Show>
      <Show when={state.error}>
        <span class="text-12-regular text-icon-critical-base">{state.error}</span>
      </Show>
    </div>
  )
}

const QuestionActions = (props: {
  thread: OfficeThread
  waiting: Extract<OfficeWaiting, { kind: "question" }>
  onAction: (action: OfficeCardAction) => void
}) => {
  const office = useOffice()
  const blank = () => ({
    picks: props.waiting.questions.map(() => [] as string[]),
    custom: props.waiting.questions.map(() => ""),
    busy: false,
    error: undefined as string | undefined,
  })
  const [state, setState] = createStore(blank())
  createEffect(
    on(
      () => props.waiting.id,
      () => setState(blank()),
      { defer: true },
    ),
  )
  const answers = () =>
    props.waiting.questions.map((_, index) => {
      const custom = (state.custom[index] ?? "").trim()
      return [...(state.picks[index] ?? []), ...(custom ? [custom] : [])]
    })
  const complete = () => answers().every((list) => list.length > 0)
  const submit = (list = answers()) => {
    if (state.busy) return
    setState({ busy: true, error: undefined })
    office
      .answer({ sessionID: props.thread.sessionID, question: { id: props.waiting.id, answers: list } })
      .then(() => props.onAction("answered"))
      .catch((cause: unknown) => setState("error", errorText(cause)))
      .finally(() => setState("busy", false))
  }
  const choose = (index: number, label: string, multiple: boolean) => {
    if (multiple) {
      setState("picks", index, (current = []) =>
        current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
      )
      return
    }
    setState("picks", index, [label])
    // A lone single-choice question answers on click; anything else waits for Send.
    if (props.waiting.questions.length === 1) submit([[label]])
  }
  const needsSend = () => props.waiting.questions.length > 1 || props.waiting.questions.some((q) => q.multiple)
  return (
    <div class="flex flex-col gap-3">
      <For each={props.waiting.questions}>
        {(question, index) => (
          <div class="flex flex-col gap-1.5">
            <span class="text-12-mono text-icon-warning-base">{question.header}</span>
            <span class="text-14-regular text-text-strong whitespace-pre-wrap">{question.question}</span>
            <div class="flex flex-wrap gap-1.5">
              <For each={question.options}>
                {(option) => (
                  <button
                    type="button"
                    disabled={state.busy}
                    title={option.description}
                    class="rounded-md border px-2 py-1 text-12-medium"
                    classList={{
                      "border-border-strong-selected bg-surface-base-active text-text-strong": (
                        state.picks[index()] ?? []
                      ).includes(option.label),
                      "border-border-weak-base text-text-base hover:bg-surface-base-hover": !(
                        state.picks[index()] ?? []
                      ).includes(option.label),
                    }}
                    onClick={() => choose(index(), option.label, !!question.multiple)}
                  >
                    {option.label}
                  </button>
                )}
              </For>
            </div>
            <Show when={question.custom !== false}>
              <input
                class={INPUT_CLASS}
                placeholder="Or type your own answer"
                value={state.custom[index()] ?? ""}
                disabled={state.busy}
                onInput={(event) => setState("custom", index(), event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.isComposing || !complete()) return
                  event.preventDefault()
                  submit()
                }}
              />
            </Show>
          </div>
        )}
      </For>
      <div class="flex items-center gap-2">
        <Show when={needsSend() || props.waiting.questions.some((q) => q.custom !== false)}>
          <Button size="small" variant="primary" disabled={state.busy || !complete()} onClick={() => submit()}>
            Send
          </Button>
        </Show>
        <Show when={state.error}>
          <span class="text-12-regular text-icon-critical-base">{state.error}</span>
        </Show>
      </div>
    </div>
  )
}

/**
 * One report as an inbox card: colour stripe by kind, what happened, and the
 * actions that kind affords. Needs-you cards go live off the thread's current
 * `waiting` and settle into a resolved label once it clears.
 */
export const ReportCard = (props: {
  report: OfficeReport
  thread: OfficeThread | undefined
  now: number
  focused: boolean
  onNavigate: (href: string) => void
}): JSX.Element => {
  const office = useOffice()
  const platform = usePlatform()
  const [state, setState] = createStore({
    busy: false,
    steer: false,
    text: "",
    sent: false,
    error: undefined as string | undefined,
  })
  const kind = () => props.report.kind as CardKind
  const meta = () => KIND_META[kind()]
  const live = () => isLive(props.report, props.thread, office.latest())
  const permission = () =>
    live() && props.thread?.waiting?.kind === "permission"
      ? { thread: props.thread, waiting: props.thread.waiting }
      : undefined
  const question = () =>
    live() && props.thread?.waiting?.kind === "question"
      ? { thread: props.thread, waiting: props.thread.waiting }
      : undefined
  const resolved = () => {
    const action = office.cardAction(props.report.id)
    return action ? RESOLVED_LABEL[action] : "Handled"
  }
  const errorMessage = () =>
    props.thread?.waiting?.kind === "error" ? props.thread.waiting.message : props.report.summary
  const openThread = () => props.onNavigate(threadHref(props.report))
  const run = (task: () => Promise<unknown>, done?: () => void) => {
    if (state.busy) return
    setState({ busy: true, error: undefined })
    task()
      .then(() => done?.())
      .catch((cause: unknown) => setState("error", errorText(cause)))
      .finally(() => setState("busy", false))
  }
  const steer = () => {
    const text = state.text.trim()
    if (!text) return
    run(
      () => office.prompt(props.report.sessionID, text, "steer"),
      () => setState({ text: "", steer: false, sent: true }),
    )
  }
  const mute = () => run(() => office.mark(props.report.sessionID, { muted: !props.thread?.muted }))

  return (
    <div
      data-report-id={props.report.id}
      data-session-id={props.report.sessionID}
      class="relative flex overflow-hidden rounded-lg border bg-surface-raised-base"
      classList={{
        "border-border-strong-focus ring-1 ring-border-strong-focus": props.focused,
        "border-border-weak-base": !props.focused,
      }}
    >
      <span class={`w-1 shrink-0 ${meta().stripe}`} />
      <div class="flex-1 min-w-0 flex flex-col gap-2 px-4 py-3">
        <div class="flex items-center gap-2 min-w-0">
          <span class={`text-12-mono uppercase tracking-wide shrink-0 ${meta().text}`}>{meta().label}</span>
          <Show when={props.thread}>{(thread) => <Chip>{projectLabel(thread())}</Chip>}</Show>
          <span class="text-14-medium text-text-strong truncate flex-1 min-w-0">{props.report.title}</span>
          <Show when={kind() === "pr"}>
            <Chip class="bg-surface-success-weak text-icon-success-base">ready for review</Chip>
          </Show>
          <span class="text-12-mono text-text-weak shrink-0">{relativeAge(props.report.time, props.now)}</span>
          <Tooltip placement="bottom" gutter={2} value="Open thread">
            <IconButton
              icon="chevron-right"
              variant="ghost"
              size="small"
              aria-label="Open thread"
              onClick={openThread}
            />
          </Tooltip>
          <DropdownMenu gutter={4} placement="bottom-end">
            <DropdownMenu.Trigger
              aria-label="More"
              class="size-6 shrink-0 inline-flex items-center justify-center rounded text-text-weak hover:bg-surface-base-hover hover:text-text-strong data-[expanded]:bg-surface-base-active"
            >
              <span class="text-14-medium leading-none">⋯</span>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content class="min-w-[160px]">
                <DropdownMenu.Item
                  disabled={!props.thread}
                  onSelect={() =>
                    void office.mark(props.report.sessionID, { pinned: !props.thread?.pinned }).catch(() => undefined)
                  }
                >
                  {props.thread?.pinned ? "Unpin" : "Pin"}
                </DropdownMenu.Item>
                <DropdownMenu.Item disabled={!props.thread} onSelect={mute}>
                  {props.thread?.muted ? "Unmute" : "Mute"}
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={openThread}>Open thread</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu>
        </div>
        <span class="text-12-regular text-text-base break-words">{props.report.summary}</span>

        <Switch>
          <Match when={kind() === "permission"}>
            <Show when={permission()} keyed fallback={<Resolved label={resolved()} />}>
              {(item) => (
                <PermissionActions
                  thread={item.thread}
                  waiting={item.waiting}
                  onAction={(action) => office.recordAction(props.report.id, action)}
                />
              )}
            </Show>
          </Match>
          <Match when={kind() === "question"}>
            <Show when={question()} keyed fallback={<Resolved label={resolved()} />}>
              {(item) => (
                <QuestionActions
                  thread={item.thread}
                  waiting={item.waiting}
                  onAction={(action) => office.recordAction(props.report.id, action)}
                />
              )}
            </Show>
          </Match>
          <Match when={kind() === "error"}>
            <Show when={errorMessage() !== props.report.summary}>
              <span class="text-12-mono text-icon-critical-base whitespace-pre-wrap break-words">{errorMessage()}</span>
            </Show>
            <div class="flex items-center gap-2 flex-wrap">
              <Button size="small" onClick={openThread}>
                Open thread
              </Button>
              <Button
                size="small"
                disabled={state.busy || state.sent}
                onClick={() =>
                  run(
                    () => office.prompt(props.report.sessionID, RETRY_TEXT, "steer"),
                    () => setState("sent", true),
                  )
                }
              >
                {state.sent ? "Retry sent" : "Retry"}
              </Button>
              <Button size="small" disabled={state.busy || !props.thread} onClick={mute}>
                {props.thread?.muted ? "Unmute" : "Mute"}
              </Button>
            </div>
          </Match>
          <Match when={kind() === "stalled"}>
            <div class="flex items-center gap-2 flex-wrap">
              <Button
                size="small"
                variant="primary"
                disabled={state.busy || state.sent}
                onClick={() =>
                  run(
                    () => office.prompt(props.report.sessionID, NUDGE_TEXT, "steer"),
                    () => setState("sent", true),
                  )
                }
              >
                {state.sent ? "Nudged" : "Nudge"}
              </Button>
              <Button size="small" onClick={openThread}>
                Open thread
              </Button>
              <Button size="small" disabled={state.busy || !props.thread} onClick={mute}>
                {props.thread?.muted ? "Unmute" : "Mute"}
              </Button>
            </div>
          </Match>
          <Match when={kind() === "pr" || kind() === "finished"}>
            <div class="flex items-center gap-2 flex-wrap">
              <Button size="small" onClick={openThread}>
                Open thread
              </Button>
              <Button size="small" aria-expanded={state.steer} onClick={() => setState("steer", (value) => !value)}>
                Steer
              </Button>
              <Show when={kind() === "pr" && props.thread?.pr}>
                {(url) => (
                  <Button size="small" icon="square-arrow-top-right" onClick={() => platform.openExternal(url())}>
                    Open PR
                  </Button>
                )}
              </Show>
              <Show when={state.sent}>
                <Resolved label="Steer sent" />
              </Show>
            </div>
            <Show when={state.steer}>
              <input
                class={INPUT_CLASS}
                placeholder="Steer this thread… (Enter sends)"
                value={state.text}
                disabled={state.busy}
                onInput={(event) => setState("text", event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.isComposing) return
                  event.preventDefault()
                  steer()
                }}
              />
            </Show>
          </Match>
        </Switch>
        <Show when={state.error}>
          <span class="text-12-regular text-icon-critical-base">{state.error}</span>
        </Show>
      </div>
    </div>
  )
}
