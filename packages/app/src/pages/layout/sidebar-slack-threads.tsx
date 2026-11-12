import { base64Encode } from "@opencode-ai/core/util/encode"
import { createEffect, createMemo, createSignal, For, type JSX, onCleanup, Show, untrack } from "solid-js"
import { createStore } from "solid-js/store"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { Persist, persisted } from "@/utils/persist"
import { useServerSync } from "@/context/server-sync"
import { officeFetch, type OfficeSdk } from "@/office/api"
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
/**
 * Where this server keeps Slack-started threads, from the global session list. A server that runs
 * no scheduled jobs (the MacBook standing in for barn) has an empty routines feed, so the routines'
 * directory alone would leave its Slack threads unlisted.
 */
async function slackDirectories(sdk: OfficeSdk, fetcher?: typeof fetch) {
  const response = await officeFetch(
    sdk,
    `/experimental/session?roots=true&limit=20&search=${encodeURIComponent("slack · ")}`,
    {
      fetch: fetcher,
      signal: AbortSignal.timeout(15_000),
    },
  )
  const sessions = (await response.json()) as { directory?: string; title?: string }[]
  return [...new Set(sessions.filter((s) => s.directory && s.title?.startsWith("slack · ")).map((s) => s.directory!))]
}

export const SidebarSlackThreads = (props: {
  store: RoutinesStore
  sdk: () => OfficeSdk
  fetcher: () => typeof fetch | undefined
  ctx: WorkspaceSidebarContext
  mobile?: boolean
}): JSX.Element => {
  const serverSync = useServerSync()
  const language = useLanguage()
  const [state, setState] = persisted(Persist.global("sidebar-slack-threads"), createStore({ expanded: true }))

  const [found, setFound] = createSignal<string[]>([])
  const look = () => {
    const sdk = props.sdk()
    void slackDirectories(sdk, props.fetcher())
      .then((list) => props.sdk() === sdk && setFound(list))
      .catch(() => undefined)
  }
  createEffect(() => {
    props.sdk()
    setFound([])
    untrack(look)
  })
  const timer = setInterval(look, 60_000)
  onCleanup(() => clearInterval(timer))

  const directories = createMemo(
    () => [...new Set([...routineDirectories(props.store.data()?.routines ?? []), ...found()])].sort(),
    [] as string[],
    { equals: (a, b) => a.length === b.length && a.every((directory, index) => directory === b[index]) },
  )
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
