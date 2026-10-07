import { Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"

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
}): JSX.Element => {
  const language = useLanguage()
  return (
    <div data-component="sidebar-launcher" class="shrink-0 py-0.5">
      <button
        type="button"
        onClick={() => props.onOpen()}
        aria-current={props.active ? "page" : undefined}
        class="sidebar-nav-row w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-raised-base-hover"
        classList={{ "bg-surface-base-active": props.active }}
      >
        <Icon name="eye" size="small" class="text-text-base" />
        <span class="text-14-regular text-text-strong flex-1 truncate">{language.t("sidebar.nav.office")}</span>
        <Show
          when={props.needsYou > 0}
          fallback={
            <Show when={props.unread > 0}>
              <span
                class="sidebar-count rounded-full bg-surface-inset-base px-1.5 text-12-medium text-text-base"
                title={language.plural("sidebar.nav.officeUnread", props.unread)}
              >
                {props.unread}
              </span>
            </Show>
          }
        >
          <span
            class="sidebar-count rounded-full bg-surface-warning-strong px-1.5 text-12-medium text-text-on-warning-strong"
            title={language.plural("sidebar.nav.officeNeedsYou", props.needsYou)}
          >
            {props.needsYou}
          </span>
        </Show>
        <Icon name="chevron-right" size="small" class="sidebar-nav-chevron text-icon-weak" />
      </button>
    </div>
  )
}
