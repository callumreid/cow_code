import { Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import type { PrDashboardStore } from "@/pr-dashboard/store"

/**
 * Sidebar launcher for the pull-request dashboard.
 *
 * The list itself is too wide for the sidebar, so this row only carries the
 * open count and a green dot when something is ready to merge; opening it hands
 * the whole session area to `PullRequestsPanel`. Renders nothing when the host
 * has no `prDashboard` capability (i.e. the web build, where there is no `gh`
 * to shell out to).
 */
export const SidebarPullRequests = (props: {
  store: PrDashboardStore
  active: boolean
  onOpen: () => void
}): JSX.Element => {
  const platform = usePlatform()
  const language = useLanguage()

  return (
    <Show when={platform.prDashboard}>
      <div data-component="sidebar-launcher" class="shrink-0 py-0.5">
        <button
          type="button"
          onClick={() => props.onOpen()}
          aria-current={props.active ? "page" : undefined}
          class="sidebar-nav-row w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-raised-base-hover"
          classList={{ "bg-surface-base-active": props.active }}
        >
          <Icon name="fork" size="small" class="text-text-base" />
          <span class="text-14-regular text-text-strong flex-1 truncate">{language.t("sidebar.nav.pullRequests")}</span>
          <Show when={props.store.data()?.readyCount}>
            <span class="size-1.5 rounded-full bg-icon-success-base" title={language.t("sidebar.nav.readyToMerge")} />
          </Show>
          <Show when={props.store.data()?.openCount}>
            {(count) => <span class="sidebar-count text-12-regular text-text-base">{count()}</span>}
          </Show>
          <Icon name="chevron-right" size="small" class="sidebar-nav-chevron text-icon-weak" />
        </button>
      </div>
    </Show>
  )
}
