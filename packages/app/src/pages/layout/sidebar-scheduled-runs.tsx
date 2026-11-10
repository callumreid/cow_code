import { base64Encode } from "@opencode-ai/core/util/encode"
import { createEffect, createMemo, For, type JSX, Match, Show, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { Persist, persisted } from "@/utils/persist"
import { useServerSync } from "@/context/server-sync"
import type { RoutinesStore } from "@/routines/store"
import type { Routine } from "@/routines/types"
import { scheduledActivity } from "./helpers"
import { focusScheduledRoutine, STATUS_DOT, statusOf } from "./scheduled-panel"
import { SessionItem } from "./sidebar-items"
import type { WorkspaceSidebarContext } from "./sidebar-workspace"

const RETAINED_ROOTS = 100

/**
 * One row per scheduled job that is set to run: its latest thread, shown like any other thread
 * whatever project is open (the working cow while it runs, the Scheduled badge once it has
 * finished), or, for a job that leaves no thread (a script, like the stamp check), the job itself
 * with its latest run; clicking that opens it in Scheduled.
 *
 * Routine threads never appeared on their own. The runner starts them in ~/coval, which is not a git
 * repo, so the server files them under the global "/" project - one nobody opens, and whose own list
 * would skip them anyway (it only shows threads whose directory is "/"). This loads the runner's
 * directories directly instead.
 */
export const SidebarScheduledRuns = (props: {
  store: RoutinesStore
  ctx: WorkspaceSidebarContext
  mobile?: boolean
  onOpenScheduled?: () => void
}): JSX.Element => {
  const serverSync = useServerSync()
  const language = useLanguage()
  const [state, setState] = persisted(Persist.global("sidebar-scheduled-runs"), createStore({ expanded: false }))

  const routines = createMemo(() => (props.store.data()?.routines ?? []).filter((routine) => routine.kind === "llm"))

  // Where the runner files threads, read off the job feed rather than hard-coded. A job that is
  // running always carries its directory; finished ones do while a threaded run is still inside the
  // feed's 20-run window - a job that skips every half hour overnight can push its last thread out of
  // that window, but every agent job runs from the same directory, so any one of them recovers it.
  const directories = createMemo(() => {
    const seen = new Set<string>()
    for (const routine of routines()) {
      for (const run of [routine.running, ...routine.runs]) {
        if (run?.sessionID && run.directory) seen.add(run.directory)
      }
    }
    return [...seen]
  })

  // child() bootstraps the directory and keeps it live, so new runs and working state stream in.
  const stores = createMemo(() => directories().map((directory) => serverSync().child(directory)[0]))

  // A directory's store keeps only its 5 newest root threads - plenty for a project list, but one
  // morning of sweeps and per-PR fixer runs fills all five, and a job that last ran days ago drops
  // out (on 2026-10-05 eod-review and the queue sat at #10 and #11, so only 2 of 4 jobs showed).
  // ~/coval gains about 9 root threads a day, so 100 still reaches a job idle for ten days or so.
  // The limit is remembered per directory and live events trim to it, so this sticks.
  createEffect(() => {
    for (const directory of directories()) void serverSync().project.loadSessions(directory, { limit: RETAINED_ROOTS })
  })

  const items = createMemo(() =>
    scheduledActivity(
      props.store.data()?.routines ?? [],
      stores().flatMap((store) => store.session ?? []),
    ),
  )
  const threads = createMemo(() => items().flatMap((item) => (item.type === "thread" ? [item.session] : [])))

  return (
    <Show when={items().length > 0}>
      <div class="shrink-0 pb-2 mb-2 border-b border-border-weaker-base">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-12-medium text-text-weak hover:bg-surface-raised-base-hover"
          aria-expanded={state.expanded}
          onClick={() => setState("expanded", !state.expanded)}
        >
          <Icon name={state.expanded ? "chevron-down" : "chevron-right"} size="small" />
          <span class="flex-1 text-left">{language.t("sidebar.scheduledRuns")}</span>
          <Show when={props.store.runningCount() > 0} fallback={<span class="tabular-nums">{items().length}</span>}>
            <span class="text-icon-info-base">
              {language.plural("sidebar.nav.runningNow", props.store.runningCount())}
            </span>
          </Show>
        </button>
        <Show when={state.expanded}>
          <For each={items()}>
            {(item) => (
              <Switch>
                <Match when={item.type === "thread" && item}>
                  {(thread) => (
                    <SessionItem
                      session={thread().session}
                      list={threads()}
                      navList={props.ctx.navList}
                      slug={base64Encode(thread().session.directory)}
                      mobile={props.mobile}
                      showChild
                      sidebarExpanded={props.ctx.sidebarExpanded}
                      clearHoverProjectSoon={props.ctx.clearHoverProjectSoon}
                      prefetchSession={props.ctx.prefetchSession}
                      archiveSession={props.ctx.archiveSession}
                    />
                  )}
                </Match>
                <Match when={item.type === "job" && item}>
                  {(job) => (
                    <ScheduledJobRow
                      routine={job().routine}
                      onOpen={() => {
                        focusScheduledRoutine(job().name)
                        props.onOpenScheduled?.()
                      }}
                    />
                  )}
                </Match>
              </Switch>
            )}
          </For>
        </Show>
      </div>
    </Show>
  )
}

/** A job with no thread to open: its latest run, styled like the thread rows above it. */
const ScheduledJobRow = (props: { routine: Routine; onOpen: () => void }): JSX.Element => {
  const run = () => props.routine.running ?? props.routine.last
  return (
    <button
      type="button"
      onClick={() => props.onOpen()}
      title={run()?.summary ?? props.routine.title}
      class="w-full flex items-center gap-2 rounded-md pl-2 pr-2 py-1.5 text-left hover:bg-surface-raised-base-hover"
    >
      <Icon name="chevron-right" size="small" class="shrink-0 text-icon-weak" />
      <span class="shrink-0 size-4 flex items-center justify-center">
        <span class={`size-1.5 rounded-full ${STATUS_DOT[statusOf(props.routine)]}`} />
      </span>
      <span class="flex-1 min-w-0 truncate text-14-regular text-text-strong">
        routine: {props.routine.name}
        <Show when={run()?.summary}>{(summary) => <span class="text-text-weak"> · {summary()}</span>}</Show>
      </span>
    </button>
  )
}
