import { batch, onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import {
  applyBrowserPanelEvent,
  nextActiveTab,
  normalizeBrowserUrl,
  type BrowserPanelBounds,
  type BrowserTabState,
} from "../browser-panel"
import { usePlatform } from "./platform"

// Renderer-side tab model for the in-app browser panel. The Electron main
// process owns the actual WebContentsViews (see desktop main/browser-views.ts)
// and is the source of truth for per-tab state; this context mirrors it from
// pushed events, holds which tab is active, and forwards user intent over the
// platform bridge. On web (no platform.browserPanel) it renders unsupported.
export const { use: useBrowser, provider: BrowserProvider } = createSimpleContext({
  name: "Browser",
  gate: false,
  init: () => {
    const platform = usePlatform()
    const api = platform.browserPanel

    const [store, setStore] = createStore<{ tabs: BrowserTabState[]; active?: string }>({ tabs: [] })

    onMount(() => {
      if (!api) return

      // Views survive route changes in main; hydrate whatever already exists.
      void api
        .list()
        .then((tabs) => {
          batch(() => {
            setStore("tabs", reconcile(tabs, { key: "id" }))
            if (!store.active || !tabs.some((tab) => tab.id === store.active)) setStore("active", tabs[0]?.id)
          })
        })
        .catch((error: unknown) => console.error("Failed to list browser tabs", error))

      const unsubscribe = api.subscribe((event) => {
        batch(() => {
          if (event.type === "closed") {
            setStore("active", nextActiveTab(store.tabs, store.active, event.tabID))
          }
          setStore("tabs", (tabs) => applyBrowserPanelEvent(tabs, event))
          if (event.type === "opened") setStore("active", event.tab.id)
        })
      })
      onCleanup(unsubscribe)
    })

    const activeTab = () => store.tabs.find((tab) => tab.id === store.active)

    return {
      supported: !!api,
      tabs: () => store.tabs,
      active: () => store.active,
      activeTab,
      open(id: string) {
        if (!store.tabs.some((tab) => tab.id === id)) return
        setStore("active", id)
      },
      async new(url?: string) {
        if (!api) return
        const tab = await api.create(url).catch((error: unknown) => {
          console.error("Failed to create browser tab", error)
          return undefined
        })
        if (!tab) return
        batch(() => {
          setStore("tabs", (tabs) => applyBrowserPanelEvent(tabs, { type: "state", tab }))
          setStore("active", tab.id)
        })
        return tab
      },
      async close(id: string) {
        if (!api) return
        batch(() => {
          setStore("active", nextActiveTab(store.tabs, store.active, id))
          setStore("tabs", (tabs) => applyBrowserPanelEvent(tabs, { type: "closed", tabID: id }))
        })
        await api.close(id).catch((error: unknown) => console.error("Failed to close browser tab", error))
      },
      /** Normalize URL-bar input and navigate; returns false on rejected input. */
      async navigate(id: string, input: string) {
        if (!api) return false
        const url = normalizeBrowserUrl(input)
        if (!url) return false
        return api.navigate(id, url).catch((error: unknown) => {
          console.error("Failed to navigate browser tab", error)
          return false
        })
      },
      back(id: string) {
        void api?.back(id)
      },
      forward(id: string) {
        void api?.forward(id)
      },
      reload(id: string) {
        void api?.reload(id)
      },
      stop(id: string) {
        void api?.stop(id)
      },
      setBounds(id: string, bounds: BrowserPanelBounds) {
        void api?.setBounds(id, bounds)
      },
      hide() {
        void api?.hide()
      },
    }
  },
})
