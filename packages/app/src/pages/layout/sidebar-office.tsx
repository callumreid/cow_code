import { Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"

/**
 * Sidebar launcher for the Farmer's Office.
 *
 * Mirrors the pull-request row: the stream is too wide for the sidebar, so
 * this only carries a badge — threads waiting on you (warning), else reports
 * that arrived since you last looked (muted). Opening it hands the whole
 * session area to `OfficePanel`.
 */
export const SidebarOffice = (props: {
  active: boolean
  needsYou: number
  unread: number
  onOpen: () => void
}): JSX.Element => (
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
      <Show
        when={props.needsYou > 0}
        fallback={
          <Show when={props.unread > 0}>
            <span
              class="rounded-full bg-surface-inset-base px-1.5 text-12-medium text-text-base"
              title={`${props.unread} new since you last looked`}
            >
              {props.unread}
            </span>
          </Show>
        }
      >
        <span
          class="rounded-full bg-surface-warning-strong px-1.5 text-12-medium text-text-on-warning-strong"
          title={`${props.needsYou} need you`}
        >
          {props.needsYou}
        </span>
      </Show>
      <Icon name="chevron-right" size="small" class="text-text-base" />
    </button>
  </div>
)
