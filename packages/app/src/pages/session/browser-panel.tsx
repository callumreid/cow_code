import { For, Show, createEffect, createSignal, onCleanup } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { usePlatform } from "@/context/platform"
import { useServerSDK } from "@/context/server-sdk"
import { useSettings } from "@/context/settings"
import { useSessionLayout } from "@/pages/session/session-layout"
import { browserCandidates } from "@/pages/session/session-panel-layout"

type BrowserTab = {
  id: string
  title: string
  url: string
}

type FrameMeta = {
  deviceWidth: number
  deviceHeight: number
}

const MAC_COMMANDS: Record<string, string> = {
  a: "selectAll",
  c: "copy",
  x: "cut",
  z: "undo",
}

export function BrowserPanel(props: { stacked?: boolean } = {}) {
  const serverSDK = useServerSDK()
  const platform = usePlatform()
  const settings = useSettings()
  const { view } = useSessionLayout()

  const [frameSrc, setFrameSrc] = createSignal("")
  const [urlValue, setUrlValue] = createSignal("")
  const [status, setStatus] = createSignal("connecting…")
  const [tabs, setTabs] = createSignal<BrowserTab[]>([])
  const [currentTab, setCurrentTab] = createSignal("")
  const [mobileText, setMobileText] = createSignal("")

  let imgRef: HTMLImageElement | undefined
  let urlInputRef: HTMLInputElement | undefined
  let ws: WebSocket | undefined
  let meta: FrameMeta = { deviceWidth: 1440, deviceHeight: 900 }
  let buttons = 0
  let lastMove = 0
  let touchPos: { x: number; y: number } | undefined

  const send = (payload: Record<string, unknown>) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }

  createEffect(() => {
    const candidates = browserCandidates(serverSDK().server.http).ws
    let disposed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0

    const connect = () => {
      if (disposed) return
      const target = candidates[attempt % candidates.length]!
      let opened = false
      setStatus("connecting…")
      const socket = new WebSocket(target)
      ws = socket

      socket.onopen = () => {
        if (disposed) return
        opened = true
        setStatus("attaching…")
        send({ type: "tabs" })
      }

      socket.onmessage = (event) => {
        if (disposed) return
        try {
          const msg = JSON.parse(String(event.data)) as {
            type?: string
            data?: string
            meta?: FrameMeta
            url?: string
            target?: BrowserTab
            tabs?: BrowserTab[]
            current?: string
            message?: string
          }
          if (msg.type === "frame" && msg.data) {
            if (msg.meta) meta = msg.meta
            setFrameSrc(`data:image/jpeg;base64,${msg.data}`)
            setStatus(`${meta.deviceWidth}×${meta.deviceHeight}`)
          } else if (msg.type === "url" && typeof msg.url === "string") {
            if (document.activeElement !== urlInputRef) setUrlValue(msg.url)
            send({ type: "tabs" })
          } else if (msg.type === "attached" && msg.target) {
            setUrlValue(msg.target.url)
            setCurrentTab(msg.target.id)
            setStatus("attached")
            send({ type: "tabs" })
          } else if (msg.type === "tabs" && Array.isArray(msg.tabs)) {
            setTabs(msg.tabs)
            if (msg.current) setCurrentTab(msg.current)
          } else if (msg.type === "detached") {
            setStatus("reattaching…")
            send({ type: "tabs" })
          } else if (msg.type === "error" && msg.message) {
            setStatus(msg.message)
          }
        } catch {}
      }

      socket.onclose = () => {
        if (disposed) return
        if (!opened) attempt += 1
        setStatus("reconnecting…")
        retryTimer = setTimeout(connect, opened ? 1500 : 400)
      }
    }

    connect()
    const poll = setInterval(() => send({ type: "tabs" }), 15_000)

    onCleanup(() => {
      disposed = true
      clearInterval(poll)
      if (retryTimer) clearTimeout(retryTimer)
      try {
        ws?.close()
      } catch {}
      ws = undefined
    })
  })

  const coords = (clientX: number, clientY: number) => {
    if (!imgRef) return { x: 0, y: 0 }
    const rect = imgRef.getBoundingClientRect()
    if (!rect.width || !rect.height) return { x: 0, y: 0 }
    return {
      x: Math.round(((clientX - rect.left) * meta.deviceWidth) / rect.width),
      y: Math.round(((clientY - rect.top) * meta.deviceHeight) / rect.height),
    }
  }

  const modifiers = (e: MouseEvent | KeyboardEvent | WheelEvent) =>
    (e.altKey ? 1 : 0) | (e.ctrlKey ? 2 : 0) | (e.metaKey ? 4 : 0) | (e.shiftKey ? 8 : 0)

  const buttonName = (button: number) => (["left", "middle", "right"] as const)[button] ?? "left"

  const buildKeyEvent = (e: KeyboardEvent, kind: "keyDown" | "keyUp") => {
    const text =
      kind === "keyDown"
        ? e.key === "Enter"
          ? "\r"
          : e.key.length === 1 && !e.metaKey && !e.ctrlKey
            ? e.key
            : undefined
        : undefined
    const event: Record<string, unknown> = {
      type: kind === "keyDown" ? (text ? "keyDown" : "rawKeyDown") : "keyUp",
      key: e.key,
      code: e.code,
      windowsVirtualKeyCode: e.keyCode,
      modifiers: modifiers(e),
      location: e.location,
    }
    if (text) {
      event.text = text
      event.unmodifiedText = text
    }
    const cmd = MAC_COMMANDS[e.key.toLowerCase()]
    if (kind === "keyDown" && e.metaKey && cmd) {
      event.commands = [cmd]
    }
    return event
  }

  const navigate = () => {
    send({ type: "navigate", url: urlValue() })
    imgRef?.focus()
  }

  const pasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        send({ type: "text", text })
        imgRef?.focus()
      }
    } catch {}
  }

  const popOut = () => {
    const url = browserCandidates(serverSDK().server.http).popout
    platform.openExternal(url)
  }

  return (
    <aside
      id="browser-panel"
      aria-label="Browser"
      class="relative min-w-0 h-full flex-1 flex flex-col overflow-hidden"
      classList={{
        "bg-v2-background-bg-base rounded-[10px] shadow-[var(--v2-elevation-raised)]":
          settings.general.newLayoutDesigns(),
        "bg-background-base border-l border-border-weaker-base": !settings.general.newLayoutDesigns(),
        "min-h-0": props.stacked,
      }}
    >
      <div class="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border-weaker-base bg-surface-panel">
        <Tooltip placement="bottom" value="Back">
          <IconButton
            icon="arrow-left"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => send({ type: "back" })}
            aria-label="Back"
          />
        </Tooltip>
        <Tooltip placement="bottom" value="Reload">
          <IconButton
            icon="reset"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => send({ type: "reload" })}
            aria-label="Reload"
          />
        </Tooltip>

        <select
          title="Browser tabs"
          aria-label="Browser tabs"
          value={currentTab()}
          onChange={(e) => {
            const id = e.currentTarget.value
            setCurrentTab(id)
            send({ type: "tab", id })
          }}
          class="h-6 max-w-[160px] rounded border border-border-weak-base bg-background-base px-1.5 text-12-regular text-text-base outline-none"
        >
          <For each={tabs()}>
            {(t) => (
              <option value={t.id} selected={t.id === currentTab()}>
                {(t.title || t.url || "Tab").slice(0, 40)}
              </option>
            )}
          </For>
        </select>

        <Tooltip placement="bottom" value="New tab">
          <IconButton
            icon="plus-small"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => send({ type: "newtab", url: "about:blank" })}
            aria-label="New tab"
          />
        </Tooltip>

        <input
          ref={urlInputRef}
          type="text"
          value={urlValue()}
          onInput={(e) => setUrlValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter") navigate()
          }}
          placeholder="URL or search…"
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          class="h-6 min-w-[80px] flex-1 rounded border border-border-weak-base bg-background-base px-2 text-12-regular text-text-strong outline-none focus:border-border-strong-base"
        />

        <button
          type="button"
          onClick={navigate}
          class="h-6 shrink-0 rounded border border-border-weak-base bg-surface-raised-base px-2 text-12-regular text-text-strong hover:bg-surface-raised-base-hover"
        >
          Go
        </button>

        <Tooltip placement="bottom" value="Paste clipboard into browser">
          <button
            type="button"
            onClick={() => void pasteClipboard()}
            class="h-6 shrink-0 rounded border border-border-weak-base bg-surface-raised-base px-2 text-12-regular text-text-base hover:bg-surface-raised-base-hover"
          >
            Paste
          </button>
        </Tooltip>

        <span class="hidden xl:inline text-11-regular text-text-weak whitespace-nowrap px-1">{status()}</span>

        <Tooltip placement="bottom" value="Open in separate window">
          <IconButton
            icon="square-arrow-top-right"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={popOut}
            aria-label="Open in separate window"
          />
        </Tooltip>

        <Tooltip placement="bottom" value="Close browser">
          <IconButton
            icon="close-small"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => view().browser.close()}
            aria-label="Close browser"
          />
        </Tooltip>
      </div>

      <div
        class="relative flex-1 min-h-0 flex items-start justify-center bg-[#0d110f] overflow-hidden select-none"
        style={{ "touch-action": "none" }}
        onPaste={(e) => {
          const text = e.clipboardData?.getData("text/plain")
          if (text) {
            e.preventDefault()
            e.stopPropagation()
            send({ type: "text", text })
          }
        }}
      >
        <Show
          when={frameSrc()}
          fallback={
            <div class="h-full w-full flex items-center justify-center text-13-regular text-text-weak">{status()}</div>
          }
        >
          <img
            ref={imgRef}
            src={frameSrc()}
            tabIndex={0}
            alt=""
            draggable={false}
            data-prevent-autofocus
            class="max-w-full max-h-full outline-none cursor-default select-none"
            onMouseDown={(e) => {
              e.preventDefault()
              imgRef?.focus()
              buttons |= 1 << e.button
              send({
                type: "mouse",
                kind: "mousePressed",
                ...coords(e.clientX, e.clientY),
                button: buttonName(e.button),
                clickCount: e.detail || 1,
                modifiers: modifiers(e),
                buttons,
              })
            }}
            onMouseUp={(e) => {
              e.preventDefault()
              buttons &= ~(1 << e.button)
              send({
                type: "mouse",
                kind: "mouseReleased",
                ...coords(e.clientX, e.clientY),
                button: buttonName(e.button),
                clickCount: e.detail || 1,
                modifiers: modifiers(e),
                buttons,
              })
            }}
            onMouseMove={(e) => {
              const now = performance.now()
              if (now - lastMove < 33) return
              lastMove = now
              send({
                type: "mouse",
                kind: "mouseMoved",
                ...coords(e.clientX, e.clientY),
                buttons,
                modifiers: modifiers(e),
              })
            }}
            onContextMenu={(e) => e.preventDefault()}
            onWheel={(e) => {
              e.preventDefault()
              send({
                type: "wheel",
                ...coords(e.clientX, e.clientY),
                deltaX: Math.round(e.deltaX),
                deltaY: Math.round(e.deltaY),
              })
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              const t = e.touches[0]
              if (!t) return
              touchPos = coords(t.clientX, t.clientY)
              send({
                type: "mouse",
                kind: "mousePressed",
                ...touchPos,
                button: "left",
                clickCount: 1,
                buttons: 1,
              })
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              const t = e.touches[0]
              if (!t) return
              touchPos = coords(t.clientX, t.clientY)
              send({
                type: "mouse",
                kind: "mouseMoved",
                ...touchPos,
                buttons: 1,
              })
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              if (touchPos) {
                send({
                  type: "mouse",
                  kind: "mouseReleased",
                  ...touchPos,
                  button: "left",
                  clickCount: 1,
                  buttons: 0,
                })
              }
              touchPos = undefined
            }}
            onKeyDown={(e) => {
              e.stopPropagation()
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") return
              e.preventDefault()
              send({ type: "key", event: buildKeyEvent(e, "keyDown") })
            }}
            onKeyUp={(e) => {
              e.stopPropagation()
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") return
              e.preventDefault()
              send({ type: "key", event: buildKeyEvent(e, "keyUp") })
            }}
          />
        </Show>
      </div>

      <div class="md:hidden shrink-0 flex items-center gap-1.5 p-1.5 border-t border-border-weaker-base bg-surface-panel">
        <input
          type="text"
          value={mobileText()}
          onInput={(e) => setMobileText(e.currentTarget.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter" && mobileText()) {
              send({ type: "text", text: mobileText() })
              setMobileText("")
            }
          }}
          placeholder="Type here, then send…"
          autocapitalize="off"
          class="h-7 flex-1 rounded border border-border-weak-base bg-background-base px-2 text-12-regular text-text-strong outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (!mobileText()) return
            send({ type: "text", text: mobileText() })
            setMobileText("")
          }}
          class="h-7 rounded border border-border-weak-base bg-surface-raised-base px-2.5 text-12-regular text-text-strong"
        >
          Send
        </button>
        <button
          type="button"
          onClick={() => {
            send({
              type: "key",
              event: {
                type: "keyDown",
                key: "Enter",
                code: "Enter",
                text: "\r",
                unmodifiedText: "\r",
                windowsVirtualKeyCode: 13,
              },
            })
            send({
              type: "key",
              event: {
                type: "keyUp",
                key: "Enter",
                code: "Enter",
                windowsVirtualKeyCode: 13,
              },
            })
          }}
          class="h-7 rounded border border-border-weak-base bg-surface-raised-base px-2.5 text-12-regular text-text-strong"
        >
          ⏎
        </button>
      </div>
    </aside>
  )
}
