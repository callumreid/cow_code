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
import { makeEventListener } from "@solid-primitives/event-listener"
import type { Message, TextPart, ToolPart } from "@opencode-ai/sdk/v2/client"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { TextareaV2 } from "@opencode-ai/ui/v2/textarea-v2"
import { Markdown } from "@opencode-ai/session-ui/markdown"
import { readPartText } from "@opencode-ai/session-ui/message-part-text"
import { useServerSync } from "@/context/server-sync"
import { errorText, useOffice, type OfficeChip } from "@/office/context"
import {
  buildStream,
  projectLabel,
  relativeAge,
  threadHref,
  toolLabel,
  toolTitle,
  waitingReason,
} from "@/office/stream"
import type { OfficeBucket, OfficeThread } from "@/office/types"
import { VoiceStrip } from "@/office/voice/strip"
import { ReportCard } from "./office-card"

const BUCKET_DOT: Record<OfficeBucket, string> = {
  needs_you: "bg-icon-warning-base",
  failed: "bg-icon-critical-base",
  review: "bg-icon-success-base",
  working: "bg-icon-info-base",
  done: "bg-icon-weak-base",
}

/** Strip chips in display order; `always` chips show at zero, the rest only when non-empty. */
const CHIPS: Array<{ chip: OfficeChip; label: (n: number) => string; tone: string; always: boolean }> = [
  {
    chip: "needs_you",
    label: (n) => `${n} need${n === 1 ? "s" : ""} you`,
    tone: "border-border-warning-base bg-surface-warning-weak text-icon-warning-base",
    always: false,
  },
  {
    chip: "working",
    label: (n) => `${n} working`,
    tone: "border-border-info-base bg-surface-info-weak text-icon-info-base",
    always: true,
  },
  {
    chip: "review",
    label: (n) => `${n} to review`,
    tone: "border-border-success-base bg-surface-success-weak text-icon-success-base",
    always: true,
  },
  {
    chip: "failed",
    label: (n) => `${n} failed`,
    tone: "border-border-critical-base bg-surface-critical-weak text-icon-critical-base",
    always: false,
  },
  {
    chip: "claude",
    label: (n) => `${n} Claude`,
    tone: "border-border-weak-base bg-surface-inset-base text-text-weak",
    always: false,
  },
]

const NEAR_BOTTOM_PX = 80

const RosterRow = (props: { thread: OfficeThread; now: number; onOpen: () => void }) => {
  const readOnly = () => props.thread.source === "claude"
  const reason = () => waitingReason(props.thread.waiting)
  return (
    <button
      type="button"
      disabled={readOnly()}
      onClick={() => props.onOpen()}
      class="w-full flex items-center gap-2.5 px-3 py-2 text-left border-b border-border-weaker-base last:border-b-0 enabled:hover:bg-surface-base-hover disabled:cursor-default"
      classList={{ "opacity-60": props.thread.muted }}
    >
      <span
        class={`size-2 shrink-0 rounded-full ${BUCKET_DOT[props.thread.bucket]}`}
        classList={{ "animate-pulse": props.thread.bucket === "working" }}
      />
      <span class="text-12-mono text-text-weak shrink-0 rounded bg-surface-inset-base px-1 truncate max-w-32">
        {projectLabel(props.thread)}
      </span>
      <span class="flex-1 min-w-0 flex items-baseline gap-2">
        <span class="text-14-medium text-text-strong truncate max-w-[45%]">{props.thread.title}</span>
        <span class="text-12-regular text-text-weak truncate flex-1 min-w-0">{reason() ?? props.thread.summary}</span>
      </span>
      <Show when={readOnly()}>
        <span class="text-12-mono text-text-weak shrink-0 rounded bg-surface-inset-base px-1">read-only</span>
      </Show>
      <span class="text-12-mono text-text-weak shrink-0">{relativeAge(props.thread.time.updated, props.now)}</span>
      <Show when={!readOnly()}>
        <Icon name="chevron-right" size="small" class="text-text-weak shrink-0" />
      </Show>
    </button>
  )
}

const ToolRun = (props: { parts: ToolPart[] }) => {
  const [open, setOpen] = createSignal(false)
  const status = () => {
    if (props.parts.some((part) => part.state.status === "running" || part.state.status === "pending")) return "running"
    if (props.parts.some((part) => part.state.status === "error")) return "error"
    return "done"
  }
  return (
    <div class="flex flex-col gap-0.5 text-12-mono text-text-weak">
      <button
        type="button"
        class="flex items-center gap-2 min-w-0 text-left enabled:hover:text-text-base disabled:cursor-default"
        disabled={props.parts.length === 1}
        aria-expanded={props.parts.length > 1 ? open() : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          class="size-1.5 shrink-0 rounded-full"
          classList={{
            "bg-icon-info-base animate-pulse": status() === "running",
            "bg-icon-critical-base": status() === "error",
            "bg-icon-weak-base": status() === "done",
          }}
        />
        <span class="truncate">· {toolLabel(props.parts)}</span>
      </button>
      <Show when={open() && props.parts.length > 1}>
        <For each={props.parts}>
          {(part) => (
            <span class="ps-3.5 truncate">
              · {part.tool}
              {toolTitle(part) ? ` → ${toolTitle(part)}` : ""}
            </span>
          )}
        </For>
      </Show>
    </div>
  )
}

const UserBubble = (props: { text: string; pending?: boolean }) => (
  <div
    class="self-end max-w-[80%] rounded-lg bg-surface-inset-base px-3 py-2 text-14-regular text-text-strong whitespace-pre-wrap break-words"
    classList={{ "opacity-70": props.pending }}
  >
    {props.text}
  </div>
)

const AssistantText = (props: { part: TextPart; message: Message; accum: Record<string, string> | undefined }) => (
  <Markdown
    text={readPartText(props.accum, props.part)}
    cacheKey={props.part.id}
    streaming={
      props.message.role === "assistant" &&
      props.message.time.completed === undefined &&
      props.part.time?.end === undefined
    }
    class="text-14-regular text-text-strong"
  />
)

/**
 * The Farmer's Office as one conversation: a sticky strip of status chips
 * (each expanding a compact roster), then a single stream that interleaves
 * the farmer's own messages with report cards, then the composer.
 */
export const OfficePanel = (props: { onClose: () => void; onNavigate: (href: string) => void }): JSX.Element => {
  const office = useOffice()
  const sync = useServerSync()
  const [now, setNow] = createSignal(Date.now())
  const [draft, setDraft] = createSignal("")
  const [pending, setPending] = createSignal<{ text: string; count: number }>()
  const [askError, setAskError] = createSignal<string>()
  const [synced, setSynced] = createSignal(false)
  const [positioned, setPositioned] = createSignal(false)
  // Whether the reader is at the bottom, so new content keeps the stream there.
  const [stick, setStick] = createSignal(true)
  // Pinned to the divider from the first positioning until the reader scrolls.
  const scroll = { target: -1, anchor: "none" as "none" | "divider" }
  let streamRef: HTMLDivElement | undefined
  let contentRef: HTMLDivElement | undefined
  let composerRef: HTMLTextAreaElement | undefined

  const scrollTo = (top: number) => {
    if (!streamRef) return
    scroll.target = Math.max(0, Math.min(top, streamRef.scrollHeight - streamRef.clientHeight))
    streamRef.scrollTop = scroll.target
  }
  const scrollToBottom = () => {
    if (streamRef) scrollTo(streamRef.scrollHeight)
  }
  const pinDivider = () => {
    const divider = streamRef?.querySelector<HTMLElement>("[data-divider]")
    if (!divider) return false
    scrollTo(divider.offsetTop - 12)
    return true
  }
  const nearBottom = () => {
    if (!streamRef) return true
    return streamRef.scrollHeight - streamRef.scrollTop - streamRef.clientHeight < NEAR_BOTTOM_PX
  }
  const onScroll = () => {
    if (!streamRef) return
    setStick(nearBottom())
    // A scroll we did not ask for means the reader took over.
    if (Math.abs(streamRef.scrollTop - scroll.target) > 2) scroll.anchor = "none"
  }

  onMount(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    onCleanup(() => clearInterval(timer))
    composerRef?.focus()
    if (!contentRef) return
    // Content grows after it lands (markdown, streaming text); keep whatever we anchored to in place.
    const observer = new ResizeObserver(() => {
      if (scroll.anchor === "divider" && pinDivider()) return
      if (stick()) scrollToBottom()
    })
    observer.observe(contentRef)
    onCleanup(() => observer.disconnect())
  })

  makeEventListener(document, "keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    if (office.expandedBucket()) {
      office.collapse()
      return
    }
    props.onClose()
  })

  const feed = createMemo(() => {
    const overseer = office.overseer()
    if (!overseer) return
    return { sessionID: overseer.sessionID, dir: sync().ensureDirSyncContext(overseer.directory) }
  })
  createEffect(() => {
    const current = feed()
    if (!current) return
    void current.dir.session
      .sync(current.sessionID)
      .catch(() => undefined)
      .finally(() => setSynced(true))
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

  const rows = createMemo(() =>
    buildStream({ messages: messages(), parts, reports: office.reports(), lastSeen: office.lastSeen() }),
  )
  const dividerIndex = createMemo(() => rows().findIndex((row) => row.kind === "divider"))
  const hasNew = createMemo(() => dividerIndex() !== -1 && dividerIndex() < rows().length - 1)
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
  const briefLine = () => {
    const state = office.briefState()
    if (state === "pending") return "the farmer is catching you up…"
    if (state === "skipped") return "Nothing new since you last looked."
    if (state === "error") return `Brief failed: ${office.briefError() ?? "unknown error"}`
    return
  }

  // First positioning: the divider at the top when anything follows it, else the bottom.
  // Waits for the farmer's history so the stream does not jump once it lands.
  createEffect(() => {
    if (positioned()) return
    if (office.overseer() && !synced()) return
    if (!office.loaded()) return
    setPositioned(true)
    requestAnimationFrame(() => {
      if (hasNew() && pinDivider()) {
        scroll.anchor = "divider"
        return
      }
      scrollToBottom()
    })
  })

  // `office.next` lands on a needs-you card.
  createEffect(
    on(office.focus, (focus) => {
      if (!focus) return
      requestAnimationFrame(() => {
        streamRef?.querySelector<HTMLElement>(`[data-report-id="${focus.id}"]`)?.scrollIntoView({ block: "center" })
      })
    }),
  )

  const send = () => {
    const text = draft().trim()
    if (!text || working() || !office.available()) return
    setDraft("")
    setAskError(undefined)
    setPending({ text, count: messages().length })
    scroll.anchor = "none"
    setStick(true)
    requestAnimationFrame(scrollToBottom)
    office
      .ask(text, "text")
      .catch((cause: unknown) => {
        setAskError(errorText(cause))
        setDraft(text)
      })
      .finally(() => setPending(undefined))
  }

  const chipCount = (chip: OfficeChip) => (chip === "claude" ? office.claude().length : office.counts()[chip])
  const roster = createMemo(() => {
    const chip = office.expandedBucket()
    if (!chip) return []
    if (chip === "claude") return office.claude()
    return office.cow().filter((thread) => thread.bucket === chip)
  })
  const empty = () => rows().length === 0 && !showPending()

  return (
    <div class="flex flex-col size-full bg-background-base">
      <div class="shrink-0 border-b border-border-weak-base bg-background-base">
        <div class="mx-auto w-full max-w-[880px] flex items-center gap-2 px-6 py-3 flex-wrap">
          <Icon name="eye" class="text-text-base" />
          <span class="text-16-medium text-text-strong me-1">Farmer's Office</span>
          <For each={CHIPS}>
            {(item) => (
              <Show when={item.always || chipCount(item.chip) > 0}>
                <button
                  type="button"
                  aria-expanded={office.expandedBucket() === item.chip}
                  class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-12-medium ${item.tone}`}
                  classList={{
                    "ring-1 ring-border-strong-selected": office.expandedBucket() === item.chip,
                    "opacity-60": chipCount(item.chip) === 0,
                  }}
                  onClick={() => office.toggleBucket(item.chip)}
                >
                  <Show when={item.chip === "working" && chipCount("working") > 0}>
                    <span class="size-1.5 rounded-full bg-icon-info-base animate-pulse" />
                  </Show>
                  {item.label(chipCount(item.chip))}
                </button>
              </Show>
            )}
          </For>
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
        <Show when={office.expandedBucket()} keyed>
          {(chip) => (
            <div class="px-6 pb-3">
              <div
                role="list"
                aria-label={`${chip} threads`}
                class="mx-auto w-full max-w-[880px] max-h-[40vh] overflow-y-auto rounded-lg border border-border-weak-base bg-surface-raised-base"
              >
                <Show
                  when={roster().length > 0}
                  fallback={<div class="px-3 py-3 text-12-regular text-text-weak">Nothing here right now.</div>}
                >
                  <For each={roster()}>
                    {(thread) => (
                      <RosterRow thread={thread} now={now()} onOpen={() => props.onNavigate(threadHref(thread))} />
                    )}
                  </For>
                </Show>
              </div>
            </div>
          )}
        </Show>
      </div>

      <div
        ref={streamRef}
        onScroll={onScroll}
        class="relative flex-1 min-h-0 overflow-y-auto px-6 py-4 [overflow-anchor:none]"
      >
        <div ref={contentRef} class="mx-auto w-full max-w-[880px] flex flex-col gap-3">
          <Show when={empty()}>
            <div class="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Icon name="eye" class="text-text-weak" />
              <Show when={office.loaded()} fallback={<span class="text-14-regular text-text-base">Loading…</span>}>
                <Show
                  when={office.available()}
                  fallback={
                    <span class="text-14-regular text-text-base">The farmer needs a newer server to talk to.</span>
                  }
                >
                  <span class="text-14-regular text-text-base max-w-[420px]">
                    Every thread reports in here. Ask the farmer what's going on, or tell it what to do.
                  </span>
                </Show>
              </Show>
            </div>
          </Show>
          <Show when={dividerIndex() === -1 && briefLine()}>
            <span class="text-center text-12-regular text-text-weak">{briefLine()}</span>
          </Show>
          <For each={rows()}>
            {(row) => (
              <Switch>
                <Match when={row.kind === "divider"}>
                  <div data-divider class="flex flex-col gap-1 py-1">
                    <div class="flex items-center gap-3">
                      <span class="h-px flex-1 bg-border-warning-base" />
                      <span class="text-12-mono uppercase tracking-wide text-icon-warning-base">
                        since you last looked · {relativeAge(row.time, now())}
                      </span>
                      <span class="h-px flex-1 bg-border-warning-base" />
                    </div>
                    <Show when={briefLine()}>
                      <span class="text-center text-12-regular text-text-weak">{briefLine()}</span>
                    </Show>
                  </div>
                </Match>
                <Match when={row.kind === "user" ? row : undefined}>
                  {(item) => <UserBubble text={item().text} />}
                </Match>
                <Match when={row.kind === "text" ? row : undefined}>
                  {(item) => <AssistantText part={item().part} message={item().message} accum={accum()} />}
                </Match>
                <Match when={row.kind === "tools" ? row : undefined}>
                  {(item) => <ToolRun parts={item().parts} />}
                </Match>
                <Match when={row.kind === "report" && row.report.kind === "auto_allowed" ? row : undefined}>
                  {(item) => (
                    <span class="text-12-mono text-text-weak truncate">
                      · allowed automatically: {item().report.title} — {item().report.summary}
                    </span>
                  )}
                </Match>
                <Match when={row.kind === "report" ? row : undefined}>
                  {(item) => (
                    <ReportCard
                      report={item().report}
                      thread={office.thread(item().report.sessionID)}
                      now={now()}
                      focused={office.focus()?.id === item().report.id}
                      onNavigate={props.onNavigate}
                    />
                  )}
                </Match>
              </Switch>
            )}
          </For>
          <Show when={showPending()}>{(item) => <UserBubble text={item().text} pending />}</Show>
          <Show when={working()}>
            <span class="text-12-mono text-text-weak">the farmer is thinking…</span>
          </Show>
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

      <div class="shrink-0 border-t border-border-weak-base px-6 py-3">
        <div class="mx-auto w-full max-w-[880px] flex flex-col gap-1">
          <TextareaV2
            ref={composerRef}
            class="!w-full"
            rows={2}
            placeholder="Tell the farmer what to do, or ask what's going on…"
            aria-label="Tell the farmer"
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
  )
}
