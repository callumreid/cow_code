import { Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import type { RoutinesStore } from "@/routines/store"

/**
 * Sidebar launcher for the Scheduled view.
 *
 * Mirrors the pull-request row: a job count, and a pulsing dot with the
 * number of jobs running right now. Hidden when the server has no routines
 * route or the machine has nothing scheduled (e.g. a web build off the box).
 */
export const SidebarScheduled = (props: { store: RoutinesStore; active: boolean; onOpen: () => void }): JSX.Element => (
  <Show when={props.store.available() && props.store.data()?.available !== false}>
    <div class="shrink-0 border-t border-border-weaker-base py-1">
      <button
        type="button"
        onClick={() => props.onOpen()}
        aria-current={props.active ? "page" : undefined}
        class="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-background-stronger"
        classList={{ "bg-surface-base-active": props.active }}
      >
        <Icon name="checklist" size="small" class="text-text-base" />
        <span class="text-14-regular text-text-strong flex-1 truncate">Scheduled</span>
        <Show when={props.store.runningCount() > 0}>
          <span
            class="flex items-center gap-1 text-12-medium text-icon-info-base"
            title={`${props.store.runningCount()} running now`}
          >
            <span class="size-1.5 rounded-full bg-icon-info-base animate-pulse" />
            {props.store.runningCount()}
          </span>
        </Show>
        <Show when={props.store.data()?.routines.length}>
          {(count) => <span class="text-12-regular text-text-base">{count()}</span>}
        </Show>
        <Icon name="chevron-right" size="small" class="text-text-base" />
      </button>
    </div>
  </Show>
)
