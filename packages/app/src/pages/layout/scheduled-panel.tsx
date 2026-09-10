import { createMemo, createSignal, For, onCleanup, Show, type JSX } from "solid-js"
import { makeEventListener } from "@solid-primitives/event-listener"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { useLanguage } from "@/context/language"
import { threadHref } from "@/office/stream"
import type { RoutinesStore } from "@/routines/store"
import type { Routine, RoutineRun, RoutineRunStatus } from "@/routines/types"

type Status = RoutineRunStatus | "never"

const STATUS_DOT: Record<Status, string> = {
  running: "bg-icon-info-base animate-pulse",
  ok: "bg-icon-success-base",
  failed: "bg-icon-critical-base",
  skipped: "bg-icon-weak-base",
  never: "bg-icon-weak-base",
  locked: "bg-icon-weak-base",
  waiting: "bg-icon-warning-base",
  canceled: "bg-icon-weak-base",
  unknown: "bg-icon-weak-base",
}

const STATUS_TEXT: Record<Status, string> = {
  running: "text-icon-info-base",
  ok: "text-icon-success-base",
  failed: "text-icon-critical-base",
  skipped: "text-text-weak",
  never: "text-text-weak",
  locked: "text-text-weak",
  waiting: "text-icon-warning-base",
  canceled: "text-text-weak",
  unknown: "text-text-weak",
}

const STATUS_LABEL: Record<Status, string> = {
  running: "running",
  ok: "ok",
  failed: "failed",
  skipped: "skipped",
  never: "never ran",
  locked: "locked",
  waiting: "waiting",
  canceled: "canceled",
  unknown: "unknown",
}

function clock(time: number) {
  return new Date(time).toLocaleTimeString(undefined, { timeStyle: "short" })
}

function dayOf(time: number, now: number) {
  const date = new Date(time)
  if (date.toDateString() === new Date(now).toDateString()) return "today"
  if (date.toDateString() === new Date(now - 86_400_000).toDateString()) return "yesterday"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function when(time: number, now: number) {
  return `${dayOf(time, now)} ${clock(time)}`
}

function duration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function until(time: number, now: number) {
  const diff = time - now
  if (diff <= 0) return "due now"
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return "in under a minute"
  if (minutes < 60) return `in ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `in ${hours}h ${minutes % 60}m`
  return when(time, now)
}

function statusOf(routine: Routine): Status {
  if (routine.running) return "running"
  return routine.last?.status ?? "never"
}

function lastText(routine: Routine, now: number) {
  const last = routine.last
  if (!last) return "never ran"
  const took = duration((last.endedAt ?? last.startedAt) - last.startedAt)
  return `${STATUS_LABEL[last.status]} · ${when(last.startedAt, now)} · ${took}`
}

const RunRow = (props: { run: RoutineRun; now: number; onOpen: (href: string) => void }) => {
  const language = useLanguage()
  const href = () =>
    props.run.sessionID && props.run.directory
      ? threadHref({ directory: props.run.directory, sessionID: props.run.sessionID })
      : undefined
  return (
    <div class="flex items-center gap-2.5 px-3 py-1.5 border-b border-border-weaker-base last:border-b-0">
      <span class={`size-2 shrink-0 rounded-full ${STATUS_DOT[props.run.status]}`} />
      <span class="text-12-mono text-text-weak shrink-0 w-32 truncate">{when(props.run.startedAt, props.now)}</span>
      <span class={`text-12-regular shrink-0 w-14 ${STATUS_TEXT[props.run.status]}`}>
        {STATUS_LABEL[props.run.status]}
      </span>
      <span class="text-12-mono text-text-weak shrink-0 w-16">
        {duration((props.run.endedAt ?? props.now) - props.run.startedAt)}
      </span>
      <span
        class="text-12-regular text-text-base truncate flex-1 min-w-0"
        title={[
          props.run.executionID,
          language.t("routine.process", { status: props.run.processStatus ?? "unknown" }),
          language.t("routine.agent", { status: props.run.agentStatus ?? "unknown" }),
          language.t("routine.outcome", { status: props.run.outcome ?? "unverified" }),
        ]
          .filter(Boolean)
          .join("\n")}
      >
        <span>
          {language.t("routine.correlation." + (props.run.correlation ?? "unmatched"))} ·{" "}
          {language.t("routine.process", { status: props.run.processStatus ?? "unknown" })} ·{" "}
          {language.t("routine.agent", { status: props.run.agentStatus ?? "unknown" })} ·{" "}
          {language.t("routine.outcome", { status: props.run.outcome ?? "unverified" })}
        </span>
        <br />
        {props.run.summary ?? ""}
      </span>
      <Show when={href()}>
        {(link) => (
          <button
            type="button"
            class="shrink-0 text-12-regular text-text-strong hover:underline"
            onClick={() => props.onOpen(link())}
          >
            open thread
          </button>
        )}
      </Show>
    </div>
  )
}

const RoutineRow = (props: {
  routine: Routine
  now: number
  store: RoutinesStore
  onNavigate: (href: string) => void
}) => {
  const [open, setOpen] = createSignal(false)
  const [log, setLog] = createSignal<{ path?: string | null; text: string }>()
  const [logError, setLogError] = createSignal<string>()
  const [starting, setStarting] = createSignal(false)
  const [runError, setRunError] = createSignal<string>()
  const status = createMemo(() => statusOf(props.routine))
  const liveHref = () =>
    props.routine.running?.sessionID && props.routine.running.directory
      ? threadHref({ directory: props.routine.running.directory, sessionID: props.routine.running.sessionID })
      : undefined

  const loadLog = () => {
    setLogError(undefined)
    return props.store.log(props.routine.name).then(setLog, (cause: unknown) => {
      setLogError(cause instanceof Error ? cause.message : String(cause))
    })
  }
  const toggle = () => {
    const next = !open()
    setOpen(next)
    if (next && !log()) void loadLog()
  }
  const runNow = async () => {
    setStarting(true)
    setRunError(undefined)
    setRunError(await props.store.run(props.routine.name))
    setStarting(false)
  }

  return (
    <div class="rounded-lg border border-border-weaker-base">
      <div class="flex items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open()}
          class="flex-1 min-w-0 flex items-center gap-3 text-left rounded-md"
        >
          <span class={`size-2 shrink-0 rounded-full ${STATUS_DOT[status()]}`} />
          <span class="flex-1 min-w-0 flex flex-col">
            <span class="flex items-baseline gap-2 min-w-0">
              <span class="text-14-medium text-text-strong truncate">{props.routine.title}</span>
              <span class="text-12-mono text-text-weak shrink-0 rounded bg-surface-inset-base px-1">
                {props.routine.kind === "llm" ? "agent" : "script"}
              </span>
            </span>
            <span class="text-12-regular text-text-weak truncate">
              {props.routine.schedule}
              <Show when={!props.routine.loaded}> · not loaded in launchd</Show>
            </span>
            <span class="md:hidden text-12-regular text-text-weak truncate">
              <Show when={props.routine.running} fallback={lastText(props.routine, props.now)}>
                {(running) => `running · ${duration(props.now - running().startedAt)}`}
              </Show>
            </span>
          </span>
          <span class="hidden md:flex flex-col items-end shrink-0 w-56">
            <Show
              when={props.routine.running}
              fallback={
                <span class={`text-12-regular ${STATUS_TEXT[status()]}`}>{lastText(props.routine, props.now)}</span>
              }
            >
              {(running) => (
                <span
                  class="text-12-regular text-icon-info-base truncate max-w-full"
                  title={running().summary ?? undefined}
                >
                  running · {duration(props.now - running().startedAt)}
                  <Show when={running().summary}> · {running().summary}</Show>
                </span>
              )}
            </Show>
            <span class="text-12-regular text-text-weak">
              <Show when={props.routine.nextRunAt} fallback="no next run scheduled">
                {(next) => `next ${until(next(), props.now)} (${clock(next())})`}
              </Show>
            </span>
          </span>
        </button>
        <Show when={liveHref()}>
          {(link) => (
            <button
              type="button"
              class="shrink-0 rounded-md border border-border-weak-base px-2 py-1 text-12-medium text-text-strong hover:bg-surface-base-hover"
              onClick={() => props.onNavigate(link())}
            >
              Open thread
            </button>
          )}
        </Show>
        <Tooltip placement="top" gutter={2} value={props.routine.running ? "Already running" : "Start this job now"}>
          <button
            type="button"
            disabled={!!props.routine.running || starting() || !props.routine.loaded}
            onClick={() => void runNow()}
            class="shrink-0 rounded-md border border-border-weak-base px-2 py-1 text-12-medium text-text-strong hover:bg-surface-base-hover disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Run now
          </button>
        </Tooltip>
        <button type="button" onClick={toggle} aria-label={open() ? "Collapse" : "Expand"} class="shrink-0 rounded p-1">
          <Icon name={open() ? "chevron-down" : "chevron-right"} size="small" class="text-text-base" />
        </button>
      </div>
      <Show when={runError()}>
        <div class="px-3 pb-2 text-12-regular text-icon-critical-base">{runError()}</div>
      </Show>
      <Show when={open()}>
        <div class="border-t border-border-weaker-base px-3 py-3 flex flex-col gap-4">
          <Show when={props.routine.description}>
            <p class="text-12-regular text-text-base">{props.routine.description}</p>
          </Show>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-12-regular text-text-weak">
            <span class="text-12-mono">{props.routine.label}</span>
            <Show when={props.routine.model}>{(model) => <span>model {model()}</span>}</Show>
            <Show when={props.routine.lastExitCode !== undefined && props.routine.lastExitCode !== null}>
              <span>last exit code {props.routine.lastExitCode}</span>
            </Show>
          </div>
          <div class="flex flex-col">
            <span class="text-12-medium text-text-strong px-3 pb-1">Recent runs</span>
            <Show
              when={props.routine.runs.length > 0}
              fallback={<span class="px-3 text-12-regular text-text-weak">No runs recorded yet</span>}
            >
              <div class="rounded-md border border-border-weaker-base">
                <For each={props.routine.runs}>
                  {(run) => <RunRow run={run} now={props.now} onOpen={props.onNavigate} />}
                </For>
              </div>
            </Show>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 px-3 min-w-0">
              <span class="text-12-medium text-text-strong shrink-0">Log</span>
              <Show when={log()?.path}>
                <span class="text-12-mono text-text-weak truncate">{log()!.path}</span>
              </Show>
              <button
                type="button"
                class="ms-auto shrink-0 text-12-regular text-text-base hover:underline"
                onClick={() => void loadLog()}
              >
                refresh
              </button>
            </div>
            <Show when={logError()}>
              <span class="px-3 text-12-regular text-icon-critical-base">{logError()}</span>
            </Show>
            <Show when={log()} fallback={<span class="px-3 text-12-regular text-text-weak">Loading…</span>}>
              <pre class="max-h-72 overflow-auto rounded-md bg-surface-inset-base p-3 text-12-mono text-text-base whitespace-pre-wrap break-words">
                {log()!.text || "(empty)"}
              </pre>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}

/**
 * Full-width view of everything launchd runs on the connected machine: each
 * scheduled job with its next run, what it is doing right now, its recent
 * runs (with the thread each produced) and its log, plus the always-on
 * services. Rendered over the session area like the pull-request dashboard.
 */
export const ScheduledPanel = (props: {
  store: RoutinesStore
  onClose: () => void
  onNavigate: (href: string) => void
}): JSX.Element => {
  const [now, setNow] = createSignal(Date.now())
  const tick = setInterval(() => setNow(Date.now()), 1_000)
  onCleanup(() => clearInterval(tick))

  makeEventListener(document, "keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    props.onClose()
  })

  const data = props.store.data
  const running = createMemo(() => data()?.routines.filter((routine) => routine.running).length ?? 0)
  const services = createMemo(() => data()?.services ?? [])
  // Rows are keyed by job name, not by snapshot object, so a poll does not
  // recreate them and lose an expanded row's history and log.
  const names = createMemo(() => data()?.routines.map((routine) => routine.name) ?? [])
  const byName = createMemo(() => new Map((data()?.routines ?? []).map((routine) => [routine.name, routine])))

  return (
    <div class="flex flex-col size-full bg-background-base">
      <div class="shrink-0 border-b border-border-weak-base">
        <div class="mx-auto w-full max-w-[960px] px-6">
          <div class="flex items-center gap-3 px-3 py-4">
            <Icon name="checklist" class="text-text-base" />
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-16-medium text-text-strong">Scheduled</span>
              <Show when={data()} fallback={<span class="text-12-regular text-text-base">Loading…</span>}>
                <span class="text-12-regular text-text-base truncate">
                  <Show when={data()!.available} fallback={<>Nothing scheduled on {data()!.host}</>}>
                    {data()!.host} · {data()!.routines.length} jobs
                    <Show when={running() > 0}>
                      <span class="text-icon-info-base"> · {running()} running now</span>
                    </Show>
                  </Show>
                </span>
              </Show>
            </div>
            <Tooltip placement="bottom" gutter={2} value="Refresh">
              <IconButton
                icon="reset"
                variant="ghost"
                aria-label="Refresh scheduled jobs"
                disabled={props.store.loading()}
                onClick={() => {
                  setNow(Date.now())
                  void props.store.refresh()
                }}
              />
            </Tooltip>
            <Tooltip placement="bottom" gutter={2} value="Close">
              <IconButton
                icon="close"
                variant="ghost"
                aria-label="Close scheduled jobs"
                onClick={() => props.onClose()}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="mx-auto w-full max-w-[960px] px-6 py-4 flex flex-col gap-6">
          <Show when={props.store.error()}>
            <div class="text-12-regular text-icon-critical-base">{props.store.error()}</div>
          </Show>

          <Show
            when={(data()?.routines.length ?? 0) > 0}
            fallback={
              <Show when={data()} fallback={<div class="text-14-regular text-text-base">Loading…</div>}>
                <div class="text-14-regular text-text-base">
                  {data()!.available
                    ? "No scheduled jobs on this machine"
                    : "This server has no scheduled jobs to show (only the box runs launchd jobs)"}
                </div>
              </Show>
            }
          >
            <div class="flex flex-col gap-2">
              <For each={names()}>
                {(name) => (
                  <Show when={byName().get(name)}>
                    {(routine) => (
                      <RoutineRow routine={routine()} now={now()} store={props.store} onNavigate={props.onNavigate} />
                    )}
                  </Show>
                )}
              </For>
            </div>
          </Show>

          <Show when={services().length > 0}>
            <div class="flex flex-col gap-1 border-t border-border-weaker-base pt-4">
              <div class="flex items-baseline gap-2 px-3">
                <span class="text-12-medium text-text-strong">Always-on services</span>
                <span class="text-12-regular text-text-base">{services().length}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <For each={services()}>
                  {(service) => (
                    <div class="flex items-center gap-2.5 px-3 py-1.5 min-w-0">
                      <span
                        class={`size-2 shrink-0 rounded-full ${service.running ? "bg-icon-success-base" : "bg-icon-critical-base"}`}
                      />
                      <span class="text-14-regular text-text-strong truncate">{service.title}</span>
                      <span class="text-12-mono text-text-weak truncate hidden md:inline">{service.label}</span>
                      <span class="ms-auto shrink-0 text-12-regular text-text-weak">
                        {service.running
                          ? `pid ${service.pid ?? "?"}`
                          : service.lastExitCode !== undefined && service.lastExitCode !== null
                            ? `stopped · exit ${service.lastExitCode}`
                            : "stopped"}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
