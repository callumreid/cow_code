import { Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"

/**
 * Sidebar launcher for the Farmer's Office.
 *
 * Mirrors the pull-request row: the roster is too wide for the sidebar, so
 * this only carries a count of threads waiting on you; opening it hands the
 * whole session area to `OfficePanel`.
 */
export const SidebarOffice = (props: { active: boolean; count: number; onOpen: () => void }): JSX.Element => (
  <div class="shrink-0 border-t border-border-weaker-base py-1">
    <button
      type="button"
      onClick={() => props.onOpen()}
      aria-current={props.active ? "page" : undefined}
      class="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-background-stronger"
      classList={{ "bg-surface-base-active": props.active }}
    >
      <Icon name="eye" size="small" class="text-text-base" />
      <span class="text-14-regular text-text-strong flex-1 truncate">Farmer's Office</span>
      <Show when={props.count > 0}>
        <span
          class="rounded-full bg-surface-warning-strong px-1.5 text-12-medium text-text-on-warning-strong"
          title={`${props.count} need you`}
        >
          {props.count}
        </span>
      </Show>
      <Icon name="chevron-right" size="small" class="text-text-base" />
    </button>
  </div>
)
