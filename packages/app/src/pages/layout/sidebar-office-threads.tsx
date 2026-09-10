import { createMemo, createSignal, For, onCleanup, Show, type JSX } from "solid-js"
import { compareThreads, useOffice } from "@/office/context"
import { projectLabel, relativeAge, waitingReason } from "@/office/stream"
import type { OfficeBucket, OfficeThread } from "@/office/types"

const DOT: Record<OfficeBucket, string> = {
  needs_you: "bg-icon-warning-base",
  failed: "bg-icon-critical-base",
  review: "bg-icon-success-base",
  working: "bg-icon-info-base",
  done: "bg-icon-weak-base",
}

const ORDER: Record<OfficeBucket, number> = { needs_you: 0, failed: 1, review: 2, working: 3, done: 4 }
const LIMIT = 8

/**
 * The office threads worth a sidebar row: anything waiting on you or failed,
 * plus running and reviewable work that is not a scheduled routine (those
 * live in the Scheduled view). Needs-you first, then pinned, then newest.
 */
export function liveThreads(threads: OfficeThread[]): OfficeThread[] {
  return threads
    .filter((thread) => {
      if (thread.muted) return false
      if (thread.bucket === "needs_you" || thread.bucket === "failed") return true
      return (thread.bucket === "working" || thread.bucket === "review") && !thread.routine
    })
    .sort((a, b) => ORDER[a.bucket] - ORDER[b.bucket] || compareThreads(a, b))
}

const Row = (props: { thread: OfficeThread; now: number; onOpen: () => void }) => (
  <button
    type="button"
    onClick={() => props.onOpen()}
    title={`${props.thread.title} · ${projectLabel(props.thread)}`}
    class="w-full flex items-center gap-2 rounded px-2 py-1 text-left hover:bg-background-stronger"
  >
    <span
      class={`size-1.5 shrink-0 rounded-full ${DOT[props.thread.bucket]}`}
      classList={{ "animate-pulse": props.thread.bucket === "working" }}
    />
    <span class="flex-1 min-w-0 flex flex-col">
      <span class="text-14-regular text-text-strong truncate">{props.thread.title}</span>
      <span class="text-12-regular text-text-weak truncate">
        {projectLabel(props.thread)} · {waitingReason(props.thread.waiting) ?? props.thread.summary}
      </span>
    </span>
    <span class="text-12-mono text-text-weak shrink-0">{relativeAge(props.thread.time.updated, props.now)}</span>
  </button>
)

/**
 * Sidebar list of the office's live threads across every project and host.
 * The project session list below only shows the selected project, so a thread
 * the farmer dispatched into a worktree never appeared there; here it is one
 * click away regardless of which project is selected.
 */
export const SidebarOfficeThreads = (props: { onOpen: (thread: OfficeThread) => void }): JSX.Element => {
  const office = useOffice()
  const [now, setNow] = createSignal(Date.now())
  const tick = setInterval(() => setNow(Date.now()), 30_000)
  onCleanup(() => clearInterval(tick))
  const [all, setAll] = createSignal(false)
  const live = createMemo(() => liveThreads(office.cow()))
  const shown = createMemo(() => (all() ? live() : live().slice(0, LIMIT)))

  return (
    <Show when={live().length > 0}>
      <div class="shrink-0 border-t border-border-weaker-base py-1">
        <div class="flex items-baseline gap-2 px-2 py-1">
          <span class="text-12-medium text-text-strong">Active threads</span>
          <span class="text-12-regular text-text-base">{live().length}</span>
        </div>
        <For each={shown()}>
          {(thread) => <Row thread={thread} now={now()} onOpen={() => props.onOpen(thread)} />}
        </For>
        <Show when={live().length > LIMIT}>
          <button
            type="button"
            class="w-full px-2 py-1 text-left text-12-regular text-text-base hover:underline"
            onClick={() => setAll((value) => !value)}
          >
            {all() ? "Show fewer" : `Show all ${live().length}`}
          </button>
        </Show>
      </div>
    </Show>
  )
}
