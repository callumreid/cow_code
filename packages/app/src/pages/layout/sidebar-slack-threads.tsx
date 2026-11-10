import { base64Encode } from "@opencode-ai/core/util/encode"
import { createEffect, createMemo, For, type JSX, Show, untrack } from "solid-js"
import { createStore } from "solid-js/store"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { Persist, persisted } from "@/utils/persist"
import { useServerSync } from "@/context/server-sync"
import type { RoutinesStore } from "@/routines/store"
import { recentSlackSessions, routineDirectories } from "./helpers"
import { SessionItem } from "./sidebar-items"
import type { WorkspaceSidebarContext } from "./sidebar-workspace"

const RETAINED_ROOTS = 100

/**
 * Threads the Slack door started for an @cowcode mention, shown whatever project is open so the work
 * can be followed while it runs. Like routine threads (see SidebarScheduledRuns) they are started in
 * ~/coval, which the server files under the global "/" project, so no project list ever shows them.
 */
export const SidebarSlackThreads = (props: {
  store: RoutinesStore
  ctx: WorkspaceSidebarContext
  mobile?: boolean
}): JSX.Element => {
  const serverSync = useServerSync()
  const language = useLanguage()
  const [state, setState] = persisted(Persist.global("sidebar-slack-threads"), createStore({ expanded: true }))

  const directories = createMemo(() => routineDirectories(props.store.data()?.routines ?? []), [] as string[], {
    equals: (a, b) => a.length === b.length && a.every((directory, index) => directory === b[index]),
  })
  const stores = createMemo(() => directories().map((directory) => serverSync().child(directory)[0]))
  createEffect(() => {
    const current = directories()
    untrack(() => {
      for (const directory of current) void serverSync().project.loadSessions(directory, { limit: RETAINED_ROOTS })
    })
  })

  const threads = createMemo(() =>
    recentSlackSessions(
      stores().flatMap((store) => store.session ?? []),
      Date.now(),
    ),
  )
  // Rows are keyed by id so a thread that is streaming updates in place instead of being rebuilt.
  const ids = createMemo(() => threads().map((session) => session.id))

  return (
    <Show when={ids().length > 0}>
      <div class="shrink-0 pb-2 mb-2 border-b border-border-weaker-base">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-12-medium text-text-weak hover:bg-surface-raised-base-hover"
          aria-expanded={state.expanded}
          onClick={() => setState("expanded", !state.expanded)}
        >
          <Icon name={state.expanded ? "chevron-down" : "chevron-right"} size="small" />
          <span class="flex-1 text-left">{language.t("sidebar.slackThreads")}</span>
          <span class="tabular-nums">{ids().length}</span>
        </button>
        <Show when={state.expanded}>
          <For each={ids()}>
            {(id) => (
              <Show when={threads().find((session) => session.id === id)}>
                {(session) => (
                  <SessionItem
                    session={session()}
                    list={threads()}
                    navList={props.ctx.navList}
                    slug={base64Encode(session().directory)}
                    mobile={props.mobile}
                    showChild
                    sidebarExpanded={props.ctx.sidebarExpanded}
                    clearHoverProjectSoon={props.ctx.clearHoverProjectSoon}
                    prefetchSession={props.ctx.prefetchSession}
                    archiveSession={props.ctx.archiveSession}
                  />
                )}
              </Show>
            )}
          </For>
        </Show>
      </div>
    </Show>
  )
}
