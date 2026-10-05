import { base64Encode } from "@opencode-ai/core/util/encode"
import { createMemo, For, type JSX, Show } from "solid-js"
import { useServerSync } from "@/context/server-sync"
import type { RoutinesStore } from "@/routines/store"
import { latestRoutineSessions } from "./helpers"
import { SessionItem } from "./sidebar-items"
import type { WorkspaceSidebarContext } from "./sidebar-workspace"

/**
 * Each scheduled job's latest thread, shown in the sidebar like any other thread whatever project
 * is open: the working cow while it runs, the Scheduled badge once it has finished.
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
}): JSX.Element => {
  const serverSync = useServerSync()

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

  const latest = createMemo(() =>
    latestRoutineSessions(
      stores().flatMap((store) => store.session ?? []),
      new Set(routines().map((routine) => routine.name)),
    ),
  )

  return (
    <Show when={latest().length > 0}>
      <div class="shrink-0 pb-2 mb-2 border-b border-border-weaker-base">
        <For each={latest()}>
          {(session) => (
            <SessionItem
              session={session}
              list={latest()}
              navList={props.ctx.navList}
              slug={base64Encode(session.directory)}
              mobile={props.mobile}
              showChild
              sidebarExpanded={props.ctx.sidebarExpanded}
              clearHoverProjectSoon={props.ctx.clearHoverProjectSoon}
              prefetchSession={props.ctx.prefetchSession}
              archiveSession={props.ctx.archiveSession}
            />
          )}
        </For>
      </div>
    </Show>
  )
}
