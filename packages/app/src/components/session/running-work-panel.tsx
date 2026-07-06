import { createMemo, For, Show, type Accessor } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { ScrollView } from "@opencode-ai/ui/scroll-view"
import { Spinner } from "@opencode-ai/ui/spinner"
import { createElapsedSeconds } from "@opencode-ai/session-ui/session-status-line"
import { getToolInfo } from "@opencode-ai/session-ui/message-part"
import { clearFinished, finishedRows } from "@/components/session/finished-work-store"
import type { FinishedRow } from "@/components/session/finished-work"

import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { useSDK } from "@/context/sdk"
import { useSync } from "@/context/sync"
import { useSessionLayout } from "@/pages/session/session-layout"
import { legacySessionHref, requireServerKey, sessionHref } from "@/utils/session-route"
import { getSessionTokenTotal } from "@/components/session/session-context-metrics"
import {
  getRunningWork,
  runningWorkCount,
  type RunningSubagentRow,
  type RunningToolRow,
  type RunningWork,
} from "@/components/session/running-work"

const emptyWork: RunningWork = { tools: [], subagents: [] }

// Row presence derives from PARTS (plus busy child sessions for background
// subagents) — session_status is only a secondary badge; memoized on store
// changes, never on the shared clock tick.
export function createRunningWork(sessionID: Accessor<string | undefined>) {
  const sync = useSync()
  return createMemo(() => {
    const id = sessionID()
    if (!id) return emptyWork
    return getRunningWork({
      sessionID: id,
      messages: sync().data.message[id] ?? [],
      parts: (messageID) => sync().data.part[messageID] ?? [],
      sessions: sync().data.session,
      status: (target) => sync().data.session_status[target],
    })
  })
}

export function openSessionWork(args: {
  view: ReturnType<ReturnType<typeof useLayout>["view"]>
  layout: ReturnType<typeof useLayout>
  tabs: ReturnType<ReturnType<typeof useLayout>["tabs"]>
}) {
  args.view.reviewPanel.open(args.view.reviewPanel.opened() ? "other" : "context-button")
  if (args.layout.fileTree.opened() && args.layout.fileTree.tab() !== "all") args.layout.fileTree.setTab("all")
  void args.tabs.open("work")
  args.tabs.setActive("work")
}

function Elapsed(props: { startedAt?: number }) {
  const language = useLanguage()
  const seconds = createElapsedSeconds(() => props.startedAt)
  const text = createMemo(() => {
    const total = seconds()
    if (total === undefined) return undefined
    if (total < 60) return language.t("ui.message.duration.seconds", { count: total })
    return language.t("ui.message.duration.minutesSeconds", { minutes: Math.floor(total / 60), seconds: total % 60 })
  })
  return (
    <Show when={text()}>
      {(value) => <span class="shrink-0 tabular-nums text-11-regular text-text-weaker">{value()}</span>}
    </Show>
  )
}

// Finished rows are dead — format their duration once, never subscribe to the ticker.
function StaticDuration(props: { durationMs?: number }) {
  const language = useLanguage()
  const text = createMemo(() => {
    if (props.durationMs === undefined) return undefined
    const total = Math.max(0, Math.round(props.durationMs / 1000))
    if (total < 60) return language.t("ui.message.duration.seconds", { count: total })
    return language.t("ui.message.duration.minutesSeconds", { minutes: Math.floor(total / 60), seconds: total % 60 })
  })
  return (
    <Show when={text()}>
      {(value) => <span class="shrink-0 tabular-nums text-11-regular text-text-weaker">{value()}</span>}
    </Show>
  )
}

function FinishedRowView(props: { row: FinishedRow }) {
  const language = useLanguage()
  const sdk = useSDK()
  const navigate = useNavigate()
  const { params } = useSessionLayout()
  const info = createMemo(() =>
    getToolInfo(
      props.row.tool ?? "task",
      props.row.input ?? { subagent_type: props.row.agentType, description: props.row.description },
      props.row.metadata,
    ),
  )
  const usd = createMemo(() => new Intl.NumberFormat(language.intl(), { style: "currency", currency: "USD" }))
  const failed = () => props.row.status === "error"
  const clickable = () => props.row.kind === "subagent" && !!props.row.childSessionID
  const open = () => {
    const id = props.row.childSessionID
    if (!id) return
    navigate(
      params.serverKey ? sessionHref(requireServerKey(params.serverKey), id) : legacySessionHref(sdk().directory, id),
    )
  }
  return (
    <button
      type="button"
      data-component="finished-work-row"
      class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md bg-surface-base"
      classList={{
        "cursor-pointer hover:bg-surface-base-hover": clickable(),
        "cursor-default": !clickable(),
      }}
      disabled={!clickable()}
      onClick={open}
    >
      <Icon
        name={failed() ? "circle-x" : "circle-check"}
        size="small"
        class="shrink-0"
        classList={{ "text-text-danger-base": failed(), "text-text-weak": !failed() }}
      />
      <div class="min-w-0 flex-1 flex items-baseline gap-2">
        <span class="shrink-0 text-12-medium text-text-strong">{info().title}</span>
        <Show when={info().subtitle ?? props.row.description}>
          {(subtitle) => <span class="min-w-0 truncate text-12-regular text-text-weak">{subtitle()}</span>}
        </Show>
      </div>
      <Show when={props.row.tokens !== undefined || props.row.cost !== undefined}>
        <span class="shrink-0 tabular-nums text-11-regular text-text-weaker">
          {usd().format(props.row.cost ?? 0)} ·{" "}
          {language.t("work.tokens", { count: (props.row.tokens ?? 0).toLocaleString(language.intl()) })}
        </span>
      </Show>
      <StaticDuration durationMs={props.row.durationMs} />
    </button>
  )
}

function ToolRowView(props: { row: RunningToolRow }) {
  const info = createMemo(() => getToolInfo(props.row.tool, props.row.input, props.row.metadata))
  return (
    <div data-component="running-work-tool" class="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-base">
      <Spinner class="size-3.5 shrink-0 text-text-weak" />
      <div class="min-w-0 flex-1 flex items-baseline gap-2">
        <span class="shrink-0 text-12-medium text-text-strong">{info().title}</span>
        <Show when={info().subtitle}>
          {(subtitle) => <span class="min-w-0 truncate text-12-regular text-text-weak">{subtitle()}</span>}
        </Show>
      </div>
      <Elapsed startedAt={props.row.startedAt} />
    </div>
  )
}

function SubagentRowView(props: { row: RunningSubagentRow }) {
  const sync = useSync()
  const language = useLanguage()
  const sdk = useSDK()
  const navigate = useNavigate()
  const { params } = useSessionLayout()

  const info = createMemo(() =>
    getToolInfo("task", { subagent_type: props.row.agentType, description: props.row.description }),
  )
  const child = createMemo(() => {
    const id = props.row.childSessionID
    return id ? sync().session.get(id) : undefined
  })
  const status = createMemo(() => {
    const id = props.row.childSessionID
    return id ? sync().data.session_status[id] : undefined
  })
  const usd = createMemo(
    () =>
      new Intl.NumberFormat(language.intl(), {
        style: "currency",
        currency: "USD",
      }),
  )
  const usage = createMemo(() => {
    const session = child()
    if (!session) return undefined
    const tokens = getSessionTokenTotal(session.tokens)
    if (tokens === undefined && session.cost === undefined) return undefined
    return {
      cost: usd().format(session.cost ?? 0),
      tokens: language.t("work.tokens", { count: (tokens ?? 0).toLocaleString(language.intl()) }),
    }
  })

  // Click-through uses the child session id carried on the task part metadata —
  // never title heuristics.
  const open = () => {
    const id = props.row.childSessionID
    if (!id) return
    navigate(
      params.serverKey ? sessionHref(requireServerKey(params.serverKey), id) : legacySessionHref(sdk().directory, id),
    )
  }

  return (
    <button
      type="button"
      data-component="running-work-subagent"
      class="w-full text-left flex flex-col gap-1 px-3 py-2 rounded-md bg-surface-base"
      classList={{
        "cursor-pointer hover:bg-surface-base-hover": !!props.row.childSessionID,
        "cursor-default": !props.row.childSessionID,
      }}
      disabled={!props.row.childSessionID}
      onClick={open}
    >
      <div class="w-full flex items-center gap-2">
        <Spinner class="size-3.5 shrink-0 text-text-weak" />
        <div class="min-w-0 flex-1 flex items-baseline gap-2">
          <span class="shrink-0 text-12-medium text-text-strong">{info().title}</span>
          <Show when={props.row.description}>
            {(description) => <span class="min-w-0 truncate text-12-regular text-text-weak">{description()}</span>}
          </Show>
        </div>
        <Show when={props.row.background}>
          <span class="shrink-0 rounded-full px-1.5 py-px text-11-regular text-text-weak bg-surface-base-active">
            {language.t("work.badge.background")}
          </span>
        </Show>
        <Show when={status()?.type === "retry"}>
          <span class="shrink-0 rounded-full px-1.5 py-px text-11-regular text-text-weak bg-surface-base-active">
            {language.t("work.badge.retrying")}
          </span>
        </Show>
        <Elapsed startedAt={props.row.startedAt} />
      </div>
      <Show when={usage()}>
        {(value) => (
          <div class="flex items-center gap-2 pl-5.5 text-11-regular text-text-weaker">
            <span>{value().cost}</span>
            <span>·</span>
            <span>{value().tokens}</span>
          </div>
        )}
      </Show>
    </button>
  )
}

export function RunningWorkPanel() {
  const language = useLanguage()
  const { params } = useSessionLayout()
  const work = createRunningWork(() => params.id)
  const finished = createMemo(() => finishedRows(params.id))

  return (
    <ScrollView class="h-full">
      <div class="px-4 pt-4 pb-10 flex flex-col gap-6">
        <Show
          when={runningWorkCount(work()) > 0 || finished().length > 0}
          fallback={
            <div class="pt-10 flex items-center justify-center text-center text-12-regular text-text-weak">
              {language.t("work.empty")}
            </div>
          }
        >
          <Show when={work().tools.length > 0}>
            <div class="flex flex-col gap-2">
              <div class="text-12-regular text-text-weak">{language.t("work.tools.title")}</div>
              <For each={work().tools}>{(row) => <ToolRowView row={row} />}</For>
            </div>
          </Show>
          <Show when={work().subagents.length > 0}>
            <div class="flex flex-col gap-2">
              <div class="text-12-regular text-text-weak">{language.t("work.subagents.title")}</div>
              <For each={work().subagents}>{(row) => <SubagentRowView row={row} />}</For>
            </div>
          </Show>
          <Show when={finished().length > 0}>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-12-regular text-text-weak">{language.t("work.finished.title")}</span>
                <Show when={params.id}>
                  {(id) => (
                    <Button
                      type="button"
                      variant="ghost"
                      class="h-6 px-2 text-11-regular text-text-weak"
                      onClick={() => clearFinished(id())}
                    >
                      {language.t("work.finished.clear")}
                    </Button>
                  )}
                </Show>
              </div>
              <For each={finished()}>{(row) => <FinishedRowView row={row} />}</For>
            </div>
          </Show>
        </Show>
      </div>
    </ScrollView>
  )
}

export function RunningWorkChip() {
  const language = useLanguage()
  const layout = useLayout()
  const { params, tabs, view } = useSessionLayout()
  const work = createRunningWork(() => params.id)
  const count = createMemo(() => runningWorkCount(work()))
  const finishedCount = createMemo(() => finishedRows(params.id).length)

  return (
    <Show when={params.id && (count() > 0 || finishedCount() > 0)}>
      <Button
        type="button"
        variant="ghost"
        class="h-6 px-2 flex items-center gap-1.5"
        onClick={() => openSessionWork({ view: view(), layout, tabs: tabs() })}
        aria-label={language.t("work.open")}
      >
        <Show when={count() > 0} fallback={<Icon name="circle-check" size="small" class="shrink-0 text-text-weak" />}>
          <Spinner class="size-3 shrink-0 text-text-weak" />
        </Show>
        <span class="text-12-regular text-text-weak tabular-nums">
          {count() > 0
            ? language.t("work.chip.running", { count: count() })
            : language.t("work.chip.finished", { count: finishedCount() })}
        </span>
      </Button>
    </Show>
  )
}
