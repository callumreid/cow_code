import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
  type JSX,
} from "solid-js"
import { createStore } from "solid-js/store"
import { makeEventListener } from "@solid-primitives/event-listener"
import type { Message, Part, TextPart, ToolPart } from "@opencode-ai/sdk/v2/client"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { getFilename } from "@opencode-ai/core/util/path"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { TextareaV2 } from "@opencode-ai/ui/v2/textarea-v2"
import { Markdown } from "@opencode-ai/session-ui/markdown"
import { readPartText } from "@opencode-ai/session-ui/message-part-text"
import { usePlatform } from "@/context/platform"
import { useServerSync } from "@/context/server-sync"
import { BUCKET_ORDER, errorText, useOffice } from "@/office/context"
import type { OfficeBucket, OfficeThread, OfficeWaiting } from "@/office/types"
import { VoiceStrip } from "@/office/voice/strip"

const BUCKET_META: Record<OfficeBucket, { label: string; dot: string; text: string }> = {
  needs_you: { label: "Needs you", dot: "bg-icon-warning-base", text: "text-icon-warning-base" },
  failed: { label: "Failed", dot: "bg-icon-critical-base", text: "text-icon-critical-base" },
  review: { label: "Review", dot: "bg-icon-success-base", text: "text-icon-success-base" },
  working: { label: "Working", dot: "bg-icon-info-base", text: "text-icon-info-base" },
  done: { label: "Done", dot: "bg-icon-weak-base", text: "text-text-weak" },
}
const DONE_VISIBLE = 10
const INPUT_CLASS =
  "w-full rounded-md border border-border-weak-base bg-background-base px-2 py-1 text-12-regular text-text-strong outline-none placeholder:text-text-weak focus:border-border-strong-focus disabled:opacity-60"

export function relativeAge(time: number, now: number) {
  const diff = now - time
  if (!Number.isFinite(diff) || diff < 60_000) return "now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / 86_400_000)}d`
}

export function waitingReason(waiting: OfficeWaiting | undefined) {
  if (!waiting) return
  if (waiting.kind === "permission") return `permission · ${waiting.permission}`
  if (waiting.kind === "question") return `question · ${waiting.questions[0]?.header ?? ""}`.trim()
  return "error"
}

function projectLabel(thread: OfficeThread) {
  return thread.projectName ?? getFilename(thread.directory)
}

function threadHref(thread: { directory: string; sessionID: string }) {
  return `/${base64Encode(thread.directory)}/session/${thread.sessionID}`
}

const ThreadRow = (props: { thread: OfficeThread; now: number; selected: boolean; onSelect: () => void }) => {
  const meta = () => BUCKET_META[props.thread.bucket]
  const reason = () => waitingReason(props.thread.waiting ?? undefined)
  return (
    <button
      type="button"
      onClick={() => props.onSelect()}
      aria-current={props.selected ? "true" : undefined}
      class="w-full flex items-start gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-surface-base-hover"
      classList={{ "bg-surface-base-active": props.selected, "opacity-60": props.thread.muted }}
    >
      <span
        class={`mt-1.5 size-2 shrink-0 rounded-full ${meta().dot}`}
        classList={{ "animate-pulse": props.thread.bucket === "working" }}
      />
      <span class="flex-1 min-w-0 flex flex-col gap-0.5">
        <span class="flex items-center gap-2 min-w-0">
          <span class="text-12-mono text-text-weak shrink-0 rounded bg-surface-inset-base px-1 truncate max-w-32">
            {projectLabel(props.thread)}
          </span>
          <span class="text-14-medium text-text-strong truncate flex-1 min-w-0">{props.thread.title}</span>
          <span class="text-12-mono text-text-weak shrink-0">{relativeAge(props.thread.time.updated, props.now)}</span>
        </span>
        <span class="text-12-regular text-text-base truncate">{props.thread.summary}</span>
        <Show when={reason()}>
          <span class="text-12-mono text-icon-warning-base truncate">{reason()}</span>
        </Show>
      </span>
    </button>
  )
}

const BucketGroup = (props: {
  bucket: OfficeBucket
  threads: OfficeThread[]
  now: number
  selected?: string
  onSelect: (sessionID: string) => void
}) => {
  const [expanded, setExpanded] = createSignal(false)
  const meta = () => BUCKET_META[props.bucket]
  const collapsible = () => props.bucket === "done" && props.threads.length > DONE_VISIBLE
  const visible = () => (collapsible() && !expanded() ? props.threads.slice(0, DONE_VISIBLE) : props.threads)
  return (
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-2 px-3 pt-3 pb-1">
        <span class={`size-1.5 rounded-full ${meta().dot}`} />
        <span class={`text-12-medium ${meta().text}`}>{meta().label}</span>
        <span class="text-12-regular text-text-weak">{props.threads.length}</span>
      </div>
      <For each={visible()}>
        {(thread) => (
          <ThreadRow
            thread={thread}
            now={props.now}
            selected={thread.sessionID === props.selected}
            onSelect={() => props.onSelect(thread.sessionID)}
          />
        )}
      </For>
      <Show when={collapsible()}>
        <button
          type="button"
          class="px-3 py-1 text-left text-12-regular text-text-base hover:text-text-strong"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded() ? "Show fewer" : `Show ${props.threads.length - DONE_VISIBLE} more`}
        </button>
      </Show>
    </div>
  )
}

const PermissionCard = (props: { thread: OfficeThread; waiting: Extract<OfficeWaiting, { kind: "permission" }> }) => {
  const office = useOffice()
  const [note, setNote] = createSignal("")
  const [busy, setBusy] = createSignal(false)
  const [error, setError] = createSignal<string>()
  const reply = (value: "once" | "always" | "reject") => {
    if (busy()) return
    setBusy(true)
    setError(undefined)
    const message = value === "reject" && note().trim() ? note().trim() : undefined
    office
      .answer({ sessionID: props.thread.sessionID, permission: { id: props.waiting.id, reply: value, message } })
      .catch((cause: unknown) => setError(errorText(cause)))
      .finally(() => setBusy(false))
  }
  return (
    <div class="rounded-lg border border-border-warning-base bg-surface-warning-weak p-3 flex flex-col gap-2">
      <span class="text-12-mono text-icon-warning-base">permission · {props.waiting.permission}</span>
      <Show when={props.waiting.title}>
        <span class="text-14-medium text-text-strong">{props.waiting.title}</span>
      </Show>
      <Show when={props.waiting.patterns.length}>
        <span class="text-12-mono text-text-base whitespace-pre-wrap break-all">
          {props.waiting.patterns.join("\n")}
        </span>
      </Show>
      <div class="flex items-center gap-2 flex-wrap">
        <Button size="small" variant="primary" disabled={busy()} onClick={() => reply("once")}>
          Allow once
        </Button>
        <Button size="small" disabled={busy()} onClick={() => reply("always")}>
          Allow always
        </Button>
        <Button size="small" disabled={busy()} onClick={() => reply("reject")}>
          Deny
        </Button>
        <input
          class={`${INPUT_CLASS} flex-1 min-w-40`}
          placeholder="Why? Sent along with Deny"
          value={note()}
          disabled={busy()}
          onInput={(event) => setNote(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            event.preventDefault()
            reply("reject")
          }}
        />
      </div>
      <Show when={error()}>
        <span class="text-12-regular text-icon-critical-base">{error()}</span>
      </Show>
    </div>
  )
}

const QuestionCard = (props: { thread: OfficeThread; waiting: Extract<OfficeWaiting, { kind: "question" }> }) => {
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

  return (
    <div class="rounded-lg border border-border-warning-base bg-surface-warning-weak p-3 flex flex-col gap-3">
      <For each={props.waiting.questions}>
        {(question, index) => (
          <div class="flex flex-col gap-1.5">
            <span class="text-12-mono text-icon-warning-base">question · {question.header}</span>
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
                  if (event.key !== "Enter" || !complete()) return
                  event.preventDefault()
                  submit()
                }}
              />
            </Show>
          </div>
        )}
      </For>
      <div class="flex items-center gap-2">
        <Button size="small" variant="primary" disabled={state.busy || !complete()} onClick={() => submit()}>
          Send answer
        </Button>
        <Show when={state.error}>
          <span class="text-12-regular text-icon-critical-base">{state.error}</span>
        </Show>
      </div>
    </div>
  )
}

const ErrorCard = (props: { message: string; onOpen: () => void }) => (
  <div class="rounded-lg border border-border-critical-base bg-surface-critical-weak p-3 flex flex-col gap-2">
    <span class="text-12-mono text-icon-critical-base">error</span>
    <span class="text-14-regular text-text-strong whitespace-pre-wrap break-words">{props.message}</span>
    <div>
      <Button size="small" onClick={() => props.onOpen()}>
        Open thread
      </Button>
    </div>
  </div>
)

const ThreadDetail = (props: { thread: OfficeThread; now: number; onNavigate: (href: string) => void }) => {
  const office = useOffice()
  const platform = usePlatform()
  const [showText, setShowText] = createSignal(true)
  const [reply, setReply] = createSignal("")
  const [sending, setSending] = createSignal(false)
  const [error, setError] = createSignal<string>()
  const meta = () => BUCKET_META[props.thread.bucket]
  const permission = () => (props.thread.waiting?.kind === "permission" ? props.thread.waiting : undefined)
  const question = () => (props.thread.waiting?.kind === "question" ? props.thread.waiting : undefined)
  const failure = () => (props.thread.waiting?.kind === "error" ? props.thread.waiting : undefined)
  const openThread = () => props.onNavigate(threadHref(props.thread))
  const send = () => {
    const text = reply().trim()
    if (!text || sending()) return
    setSending(true)
    setError(undefined)
    office
      .prompt(props.thread.sessionID, text, "steer")
      .then(() => setReply(""))
      .catch((cause: unknown) => setError(errorText(cause)))
      .finally(() => setSending(false))
  }
  const details = () =>
    [props.thread.agent, props.thread.lastTool ? `last tool: ${props.thread.lastTool}` : undefined]
      .filter((item): item is string => !!item)
      .join(" · ")

  return (
    <div class="shrink-0 border-b border-border-weak-base px-6 py-4 flex flex-col gap-3 max-h-[55%] overflow-y-auto">
      <div class="flex items-center gap-2 min-w-0">
        <span class={`size-2 shrink-0 rounded-full ${meta().dot}`} />
        <span class="text-12-mono text-text-weak shrink-0 rounded bg-surface-inset-base px-1">
          {projectLabel(props.thread)}
        </span>
        <span class="text-16-medium text-text-strong truncate flex-1 min-w-0">{props.thread.title}</span>
        <span class={`text-12-medium shrink-0 ${meta().text}`}>{meta().label}</span>
        <span class="text-12-mono text-text-weak shrink-0">{relativeAge(props.thread.time.updated, props.now)}</span>
        <Tooltip placement="bottom" gutter={2} value={props.thread.pinned ? "Unpin" : "Pin to top"}>
          <IconButton
            icon="arrow-up"
            variant={props.thread.pinned ? "secondary" : "ghost"}
            size="small"
            aria-label={props.thread.pinned ? "Unpin" : "Pin to top"}
            onClick={() =>
              void office.mark(props.thread.sessionID, { pinned: !props.thread.pinned }).catch(() => undefined)
            }
          />
        </Tooltip>
        <Tooltip placement="bottom" gutter={2} value={props.thread.muted ? "Unmute" : "Mute"}>
          <IconButton
            icon={props.thread.muted ? "eye" : "circle-ban-sign"}
            variant={props.thread.muted ? "secondary" : "ghost"}
            size="small"
            aria-label={props.thread.muted ? "Unmute" : "Mute"}
            onClick={() =>
              void office.mark(props.thread.sessionID, { muted: !props.thread.muted }).catch(() => undefined)
            }
          />
        </Tooltip>
        <Button size="small" icon="square-arrow-top-right" onClick={openThread}>
          Open thread
        </Button>
      </div>
      <Show when={details()}>
        <span class="text-12-mono text-text-weak">{details()}</span>
      </Show>
      <Show when={permission()} keyed>
        {(waiting) => <PermissionCard thread={props.thread} waiting={waiting} />}
      </Show>
      <Show when={question()} keyed>
        {(waiting) => <QuestionCard thread={props.thread} waiting={waiting} />}
      </Show>
      <Show when={failure()} keyed>
        {(waiting) => <ErrorCard message={waiting.message} onOpen={openThread} />}
      </Show>
      <Show when={props.thread.lastText}>
        <div class="flex flex-col gap-1">
          <button
            type="button"
            class="flex items-center gap-1 text-12-medium text-text-base hover:text-text-strong"
            aria-expanded={showText()}
            onClick={() => setShowText((value) => !value)}
          >
            <Icon name={showText() ? "chevron-down" : "chevron-right"} size="small" />
            Last message
          </button>
          <Show when={showText()}>
            <Markdown text={props.thread.lastText ?? ""} class="text-14-regular text-text-strong" />
          </Show>
        </div>
      </Show>
      <Show when={props.thread.pr}>
        <button
          type="button"
          class="text-12-regular text-text-interactive-base text-left truncate"
          onClick={() => platform.openExternal(props.thread.pr ?? "")}
        >
          {props.thread.pr}
        </button>
      </Show>
      <Show
        when={props.thread.source === "cow"}
        fallback={<span class="text-12-regular text-text-weak">Read-only: this thread runs outside cow_code.</span>}
      >
        <div class="flex flex-col gap-1">
          <input
            class={INPUT_CLASS}
            placeholder="Reply into this thread… (Enter to steer)"
            value={reply()}
            disabled={sending()}
            onInput={(event) => setReply(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.isComposing) return
              event.preventDefault()
              send()
            }}
          />
          <Show when={error()}>
            <span class="text-12-regular text-icon-critical-base">{error()}</span>
          </Show>
        </div>
      </Show>
    </div>
  )
}

const ToolRow = (props: { part: ToolPart }) => {
  const status = () => props.part.state.status
  const title = () => ("title" in props.part.state ? props.part.state.title : undefined)
  const failure = () => ("error" in props.part.state ? props.part.state.error : undefined)
  return (
    <div class="flex items-center gap-2 min-w-0 text-12-mono text-text-weak">
      <span
        class="size-1.5 shrink-0 rounded-full"
        classList={{
          "bg-icon-info-base animate-pulse": status() === "running" || status() === "pending",
          "bg-icon-success-base": status() === "completed",
          "bg-icon-critical-base": status() === "error",
        }}
      />
      <span class="shrink-0 text-text-base">{props.part.tool}</span>
      <span class="truncate">{title() ?? failure() ?? ""}</span>
    </div>
  )
}

const FeedMessage = (props: { message: Message; parts: Part[]; accum: Record<string, string> | undefined }) => {
  const userText = () =>
    props.parts
      .filter((part): part is TextPart => part.type === "text" && !part.synthetic && !part.ignored)
      .map((part) => part.text)
      .join("\n")
      .trim()
  const streaming = () => props.message.role === "assistant" && props.message.time.completed === undefined
  return (
    <Show
      when={props.message.role === "user"}
      fallback={
        <div class="flex flex-col gap-2 min-w-0">
          <For each={props.parts}>
            {(part) => (
              <Switch>
                <Match when={part.type === "text" ? part : undefined}>
                  {(text) => (
                    <Markdown
                      text={readPartText(props.accum, text())}
                      cacheKey={text().id}
                      streaming={streaming() && text().time?.end === undefined}
                      class="text-14-regular text-text-strong"
                    />
                  )}
                </Match>
                <Match when={part.type === "tool" ? part : undefined}>{(tool) => <ToolRow part={tool()} />}</Match>
              </Switch>
            )}
          </For>
        </div>
      }
    >
      <Show when={userText()}>
        <div class="self-end max-w-[80%] rounded-lg bg-surface-inset-base px-3 py-2 text-14-regular text-text-strong whitespace-pre-wrap break-words">
          {userText()}
        </div>
      </Show>
    </Show>
  )
}

/**
 * Full-width Farmer's Office, rendered over the session area like the PR panel.
 *
 * Left: every thread the farmer watches, grouped by what it needs from you.
 * Right: the selected thread's waiting card above the farmer's own conversation.
 */
export const OfficePanel = (props: { onClose: () => void; onNavigate: (href: string) => void }): JSX.Element => {
  const office = useOffice()
  const sync = useServerSync()
  const [now, setNow] = createSignal(Date.now())
  const [draft, setDraft] = createSignal("")
  const [pending, setPending] = createSignal<{ text: string; count: number }>()
  const [askError, setAskError] = createSignal<string>()
  let feedRef: HTMLDivElement | undefined
  let composerRef: HTMLTextAreaElement | undefined

  onMount(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    onCleanup(() => clearInterval(timer))
    composerRef?.focus()
  })

  makeEventListener(document, "keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    props.onClose()
  })

  const grouped = createMemo(() => {
    const result: Record<OfficeBucket, OfficeThread[]> = {
      needs_you: [],
      failed: [],
      review: [],
      working: [],
      done: [],
    }
    office.threads().forEach((thread) => result[thread.bucket].push(thread))
    return result
  })
  const selectedThread = createMemo(() => {
    const sessionID = office.selected()
    return sessionID ? office.thread(sessionID) : undefined
  })

  const feed = createMemo(() => {
    const overseer = office.overseer()
    if (!overseer) return
    return { sessionID: overseer.sessionID, dir: sync().ensureDirSyncContext(overseer.directory) }
  })
  createEffect(() => {
    const current = feed()
    if (!current) return
    void current.dir.session.sync(current.sessionID).catch(() => undefined)
  })
  const messages = createMemo(() => {
    const current = feed()
    if (!current) return []
    return current.dir.data.message[current.sessionID] ?? []
  })
  const parts = (messageID: string) => feed()?.dir.data.part[messageID] ?? []
  const accum = () => feed()?.dir.data.part_text_accum_delta
  const working = () => {
    const current = feed()
    return current ? current.dir.data.session_working(current.sessionID) : false
  }
  const showPending = () => {
    const current = pending()
    if (!current || messages().length > current.count) return
    return current
  }
  const tail = createMemo(() => {
    const last = messages().at(-1)
    if (!last) return 0
    return parts(last.id).reduce(
      (sum, part) => sum + (part.type === "text" ? readPartText(accum(), part).length : 1),
      0,
    )
  })
  createEffect(
    on([() => messages().length, tail, showPending, working], () => {
      requestAnimationFrame(() => {
        if (feedRef) feedRef.scrollTop = feedRef.scrollHeight
      })
    }),
  )

  const send = () => {
    const text = draft().trim()
    if (!text || working() || !office.available()) return
    setDraft("")
    setAskError(undefined)
    setPending({ text, count: messages().length })
    office
      .ask(text, "text")
      .catch((cause: unknown) => {
        setAskError(errorText(cause))
        setDraft(text)
      })
      .finally(() => setPending(undefined))
  }

  const total = () => office.threads().length

  return (
    <div class="flex flex-col size-full bg-background-base">
      <div class="shrink-0 border-b border-border-weak-base">
        <div class="flex items-center gap-3 px-6 py-3">
          <Icon name="eye" class="text-text-base" />
          <span class="text-16-medium text-text-strong">Farmer's Office</span>
          <Show when={office.counts().needs_you > 0}>
            <span class="rounded-full bg-surface-warning-strong px-2 py-0.5 text-12-medium text-text-on-warning-strong">
              {office.counts().needs_you} need you
            </span>
          </Show>
          <span class="text-12-regular text-text-base">
            {total()} {total() === 1 ? "thread" : "threads"} · {office.counts().working} working
          </span>
          <Show when={office.loaded() && !office.available()}>
            <span class="text-12-regular text-text-weak">office not available on this server</span>
          </Show>
          <Show when={office.error()}>
            <span class="text-12-regular text-icon-critical-base truncate">{office.error()}</span>
          </Show>
          <div class="flex-1" />
          <div class="flex items-center rounded-md border border-border-weak-base p-0.5" role="group" aria-label="Mode">
            <button
              type="button"
              class="rounded px-2 py-0.5 text-12-medium"
              classList={{
                "bg-surface-base-active text-text-strong": !office.voice(),
                "text-text-base": office.voice(),
              }}
              aria-pressed={!office.voice()}
              onClick={() => office.setVoice(false)}
            >
              Text
            </button>
            <button
              type="button"
              class="rounded px-2 py-0.5 text-12-medium"
              classList={{
                "bg-surface-base-active text-text-strong": office.voice(),
                "text-text-base": !office.voice(),
              }}
              aria-pressed={office.voice()}
              onClick={() => office.setVoice(true)}
            >
              Voice
            </button>
          </div>
          <Tooltip placement="bottom" gutter={2} value="Refresh">
            <IconButton
              icon="reset"
              variant="ghost"
              aria-label="Refresh office"
              disabled={office.loading()}
              onClick={() => {
                setNow(Date.now())
                void office.refresh()
              }}
            />
          </Tooltip>
          <Tooltip placement="bottom" gutter={2} value="Close">
            <IconButton icon="close" variant="ghost" aria-label="Close office" onClick={() => props.onClose()} />
          </Tooltip>
        </div>
      </div>

      <div class="flex-1 min-h-0 flex">
        <div class="w-[380px] shrink-0 border-e border-border-weak-base overflow-y-auto px-3 pb-4">
          <Show
            when={total() > 0}
            fallback={
              <div class="px-3 py-6 text-14-regular text-text-base">
                <Show when={office.loaded()} fallback="Loading…">
                  <Show when={office.available()} fallback="This server has no Farmer's Office yet.">
                    No threads yet. The farmer reports here when a session needs you.
                  </Show>
                </Show>
              </div>
            }
          >
            <For each={BUCKET_ORDER}>
              {(bucket) => (
                <Show when={grouped()[bucket].length > 0}>
                  <BucketGroup
                    bucket={bucket}
                    threads={grouped()[bucket]}
                    now={now()}
                    selected={office.selected()}
                    onSelect={(sessionID) => office.select(sessionID)}
                  />
                </Show>
              )}
            </For>
          </Show>
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <Show when={selectedThread()} keyed>
            {(thread) => <ThreadDetail thread={thread} now={now()} onNavigate={props.onNavigate} />}
          </Show>

          <div ref={feedRef} class="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            <div class="mx-auto w-full max-w-[860px] flex flex-col gap-4">
              <Show when={messages().length === 0 && !showPending()}>
                <div class="text-14-regular text-text-base">
                  <Show when={office.available()} fallback="The farmer needs a newer server to talk to.">
                    Ask the farmer what needs you, or tell it what to do next.
                  </Show>
                </div>
              </Show>
              <For each={messages()}>
                {(message) => <FeedMessage message={message} parts={parts(message.id)} accum={accum()} />}
              </For>
              <Show when={showPending()}>
                {(item) => (
                  <div class="self-end max-w-[80%] rounded-lg bg-surface-inset-base px-3 py-2 text-14-regular text-text-strong whitespace-pre-wrap break-words opacity-70">
                    {item().text}
                  </div>
                )}
              </Show>
              <Show when={working()}>
                <span class="text-12-mono text-text-weak">the farmer is thinking…</span>
              </Show>
            </div>
          </div>

          <div class="shrink-0 border-t border-border-weak-base px-6 py-3">
            <div class="mx-auto w-full max-w-[860px] flex flex-col gap-1">
              <TextareaV2
                ref={composerRef}
                rows={2}
                placeholder="Ask the farmer…"
                aria-label="Ask the farmer"
                value={draft()}
                disabled={working() || !office.available()}
                onInput={(event) => setDraft(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey || event.isComposing) return
                  event.preventDefault()
                  send()
                }}
              />
              <div class="flex items-center gap-2">
                <span class="text-12-regular text-text-weak">Enter to send · Shift+Enter for a new line</span>
                <Show when={askError()}>
                  <span class="text-12-regular text-icon-critical-base truncate">{askError()}</span>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Show when={office.voice()}>
        <VoiceStrip
          token={() => office.voiceToken()}
          ask={(text) => office.ask(text, "voice")}
          subscribeReports={(cb) => office.onReport(cb)}
          onStop={() => office.setVoice(false)}
        />
      </Show>
    </div>
  )
}
