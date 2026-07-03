import { For, Show, createEffect, createMemo, on, onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { makeEventListener } from "@solid-primitives/event-listener"
import { Tabs } from "@opencode-ai/ui/tabs"
import { ResizeHandle } from "@opencode-ai/ui/resize-handle"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { TooltipKeybind } from "@opencode-ai/ui/tooltip"

import { useBrowser } from "@/context/browser"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { usePlatform } from "@/context/platform"
import { useSettings } from "@/context/settings"
import { createSizing } from "@/pages/session/helpers"

// Bottom browser panel, mirroring the terminal panel's layout mechanics. The
// page itself renders in a native WebContentsView owned by the Electron main
// process; this component only draws the chrome (tabs, URL bar, toolbar) and
// keeps main informed of where the content rectangle is (bounds sync). Desktop
// only: on web platforms `useBrowser().supported` is false and nothing mounts.
export function BrowserPanel() {
  const layout = useLayout()
  const browser = useBrowser()
  const language = useLanguage()
  const command = useCommand()
  const platform = usePlatform()
  const settings = useSettings()

  const opened = createMemo(() => browser.supported && layout.browser.opened())
  const size = createSizing()
  const height = createMemo(() => layout.browser.height())
  const close = () => layout.browser.close()

  let root: HTMLDivElement | undefined
  let content: HTMLDivElement | undefined
  let urlInput: HTMLInputElement | undefined

  const [store, setStore] = createStore({
    autoCreated: false,
    input: "",
    editing: false,
    view: typeof window === "undefined" ? 1000 : (window.visualViewport?.height ?? window.innerHeight),
  })

  const max = () => store.view * 0.6
  const pane = () => Math.min(height(), max())
  const activeTab = browser.activeTab

  const focusUrlBar = () => {
    requestAnimationFrame(() => {
      urlInput?.focus()
      urlInput?.select()
    })
  }

  onMount(() => {
    if (typeof window === "undefined") return

    const view = () => setStore("view", window.visualViewport?.height ?? window.innerHeight)
    const port = window.visualViewport

    view()
    makeEventListener(window, "resize", view)
    if (port) makeEventListener(port, "resize", view)
  })

  onCleanup(() => browser.hide())

  // Bounds sync: while the panel is open, a rAF loop measures the content rect
  // and forwards changes to the main process. Polling (instead of observers)
  // deliberately covers every way the rect can move WITHOUT resizing — sibling
  // panels (terminal) opening below, sidebar drags, height animations — and
  // dedupes on a change key so main only hears about actual moves.
  let sent = ""
  const measure = () => {
    const tab = activeTab()
    if (!tab || !tab.url || !content) {
      if (sent !== "hidden") {
        sent = "hidden"
        browser.hide()
      }
      return
    }
    const rect = content.getBoundingClientRect()
    const zoom = platform.webviewZoom?.() ?? 1
    const key = [tab.id, zoom, Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)]
      .map(String)
      .join(":")
    if (key === sent) return
    sent = key
    browser.setBounds(tab.id, { x: rect.x, y: rect.y, width: rect.width, height: rect.height })
  }

  createEffect(() => {
    if (!opened()) {
      sent = "hidden"
      browser.hide()
      return
    }
    let raf = requestAnimationFrame(function loop() {
      measure()
      raf = requestAnimationFrame(loop)
    })
    onCleanup(() => cancelAnimationFrame(raf))
  })

  createEffect(() => {
    if (!opened()) {
      setStore("autoCreated", false)
      return
    }
    if (browser.tabs().length !== 0 || store.autoCreated) return
    setStore("autoCreated", true)
    void browser.new().then(() => focusUrlBar())
  })

  createEffect(
    on(
      () => [browser.active(), activeTab()?.url] as const,
      () => {
        if (store.editing) return
        setStore("input", activeTab()?.url ?? "")
      },
    ),
  )

  createEffect(() => {
    if (opened()) return
    const active = document.activeElement
    if (!(active instanceof HTMLElement)) return
    if (!root?.contains(active)) return
    active.blur()
  })

  const submit = () => {
    const tab = activeTab()
    if (!tab) return
    void browser.navigate(tab.id, store.input).then((ok) => {
      if (!ok) return
      setStore("editing", false)
      urlInput?.blur()
    })
  }

  const closeTab = (id: string) => {
    const count = browser.tabs().length
    void browser.close(id)
    if (count === 1) close()
  }

  const newTab = () => {
    void browser.new().then(() => focusUrlBar())
  }

  const tabLabel = (tab: { title: string; url: string }) => {
    if (tab.title) return tab.title
    if (tab.url) return tab.url
    return language.t("browser.tab.untitled")
  }

  return (
    <div
      ref={root}
      id="browser-panel"
      role="region"
      aria-label={language.t("browser.title")}
      aria-hidden={!opened()}
      inert={!opened()}
      class="relative w-full shrink-0 bg-background-stronger"
      classList={{
        "transition-[height] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[height] motion-reduce:transition-none":
          !size.active(),
      }}
      style={{ height: opened() ? `${pane()}px` : "0px" }}
    >
      <div class="hidden md:block" onPointerDown={() => size.start()}>
        <ResizeHandle
          classList={{
            "-top-1": settings.general.newLayoutDesigns(),
          }}
          direction="vertical"
          size={pane()}
          min={150}
          max={max()}
          collapseThreshold={50}
          onResize={(next) => {
            size.touch()
            layout.browser.resize(next)
          }}
          onCollapse={close}
        />
      </div>
      <div
        class="absolute inset-x-0 top-0 flex flex-col overflow-hidden"
        classList={{
          "border-t border-border-weak-base": opened(),
          "pointer-events-none": !opened(),
        }}
        style={{ height: `${pane()}px` }}
      >
        <div class="flex flex-col h-full">
          <Tabs variant="alt" value={browser.active()} onChange={(id) => browser.open(id)} class="!h-auto !flex-none">
            <Tabs.List class="h-10 border-b border-border-weaker-base">
              <For each={browser.tabs()}>
                {(tab) => (
                  <div class="h-full">
                    <Tabs.Trigger
                      value={tab.id}
                      class="!shadow-none"
                      classes={{
                        button:
                          "border-0 outline-none focus:outline-none focus-visible:outline-none !shadow-none !ring-0",
                      }}
                      onMiddleClick={() => closeTab(tab.id)}
                      closeButton={
                        <IconButton
                          icon="close"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            closeTab(tab.id)
                          }}
                          aria-label={language.t("browser.tab.close")}
                        />
                      }
                    >
                      <span class="flex items-center gap-1.5 max-w-40">
                        <Show when={tab.favicon}>
                          {(favicon) => <img src={favicon()} alt="" class="w-4 h-4 shrink-0" />}
                        </Show>
                        <span class="truncate">{tabLabel(tab)}</span>
                      </span>
                    </Tabs.Trigger>
                  </div>
                )}
              </For>
              <div class="h-full flex items-center justify-center">
                <TooltipKeybind
                  title={language.t("command.browser.new")}
                  keybind={command.keybind("browser.new")}
                  class="flex items-center"
                >
                  <IconButton
                    icon="plus-small"
                    variant="ghost"
                    iconSize="large"
                    onClick={newTab}
                    aria-label={language.t("command.browser.new")}
                  />
                </TooltipKeybind>
              </div>
            </Tabs.List>
          </Tabs>
          <div class="h-10 flex items-center gap-1 px-2 border-b border-border-weaker-base">
            <IconButton
              icon="arrow-left"
              variant="ghost"
              disabled={!activeTab()?.canGoBack}
              onClick={() => {
                const tab = activeTab()
                if (tab) browser.back(tab.id)
              }}
              aria-label={language.t("browser.action.back")}
            />
            <IconButton
              icon="arrow-right"
              variant="ghost"
              disabled={!activeTab()?.canGoForward}
              onClick={() => {
                const tab = activeTab()
                if (tab) browser.forward(tab.id)
              }}
              aria-label={language.t("browser.action.forward")}
            />
            <IconButton
              icon={activeTab()?.loading ? "stop" : "reset"}
              variant="ghost"
              disabled={!activeTab()?.url}
              onClick={() => {
                const tab = activeTab()
                if (!tab) return
                if (tab.loading) browser.stop(tab.id)
                else browser.reload(tab.id)
              }}
              aria-label={
                activeTab()?.loading ? language.t("browser.action.stop") : language.t("browser.action.reload")
              }
            />
            <input
              ref={urlInput}
              type="text"
              spellcheck={false}
              autocomplete="off"
              value={store.input}
              placeholder={language.t("browser.urlbar.placeholder")}
              onFocus={(e) => {
                setStore("editing", true)
                e.currentTarget.select()
              }}
              onBlur={() => {
                setStore("editing", false)
                setStore("input", activeTab()?.url ?? "")
              }}
              onInput={(e) => setStore("input", e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  submit()
                  return
                }
                if (e.key === "Escape") {
                  e.preventDefault()
                  setStore("input", activeTab()?.url ?? "")
                  e.currentTarget.blur()
                }
              }}
              class="flex-1 min-w-0 h-7 px-3 rounded-md bg-surface-base text-14-regular text-text-base placeholder:text-text-weak border border-border-weaker-base outline-none focus:border-border-weak-base"
            />
          </div>
          <div class="flex-1 min-h-0 relative">
            {/* The native WebContentsView is positioned over this element. */}
            <div ref={content} class="absolute inset-0" />
            <Show when={!activeTab()?.url}>
              <div class="absolute inset-0 flex items-center justify-center text-text-weak pointer-events-none">
                {language.t("browser.empty")}
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
