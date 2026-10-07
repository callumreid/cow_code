import { Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import cowSide from "@/assets/cow/cow-side.png"
import type { PastureStore } from "@/pasture/store"

/**
 * Sidebar launcher for the Pasture: one cow per pull request, open or merged. Hidden
 * where the host cannot reach GitHub (the web build has no `gh`).
 */
export const SidebarPasture = (props: {
  store: PastureStore
  open?: number
  active: boolean
  onOpen: () => void
}): JSX.Element => {
  const language = useLanguage()
  return (
    <Show when={props.store.available()}>
      <div data-component="sidebar-launcher" class="shrink-0 py-0.5">
        <button
          type="button"
          onClick={() => props.onOpen()}
          aria-current={props.active ? "page" : undefined}
          class="sidebar-nav-row w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-raised-base-hover"
          classList={{ "bg-surface-base-active": props.active }}
        >
          <img src={cowSide} alt="" class="size-4 shrink-0 object-contain" />
          <span class="text-14-regular text-text-strong flex-1 truncate">{language.t("sidebar.nav.pasture")}</span>
          <Show when={(props.store.herd()?.items.length ?? 0) + (props.open ?? 0)}>
            {(count) => (
              <span class="sidebar-count text-12-regular text-text-base" title={language.t("sidebar.nav.pastureCount")}>
                {count()}
              </span>
            )}
          </Show>
          <Icon name="chevron-right" size="small" class="sidebar-nav-chevron text-icon-weak" />
        </button>
      </div>
    </Show>
  )
}
