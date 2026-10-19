import { For, Show, createEffect, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { useLanguage } from "@/context/language"
import { usePrompt } from "@/context/prompt"
import { createBlobReference } from "@/utils/draft-store"
import { createBrowserRecording, downloadBrowserArtifact } from "./browser-recording"
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
  const language = useLanguage()
  const prompt = usePrompt()
  const serverSDK = useServerSDK()
  const platform = usePlatform()
  const settings = useSettings()
  const { view } = useSessionLayout()

  const [state, setState] = createStore({
    frameSrc: "",
    urlValue: "",
    status: language.t("browser.connecting"),
    tabs: [] as BrowserTab[],
    currentTab: "",
    mobileText: "",
    owner: "agent",
    recording: false,
    artifacts: [] as { url: string; filename: string; video: boolean }[],
  })
  let disposed = false
  const screenshotTargets = new Map<string, ReturnType<typeof prompt.capture>>()
  const recorder = createBrowserRecording({
    image: () => imgRef,
    complete: (blob) => {
      setState("recording", false)
      const url = URL.createObjectURL(blob)
      const filename = `browser-${Date.now()}.${blob.type.includes("mp4") ? "mp4" : "webm"}`
      if (!disposed) setState("artifacts", (items) => [...items, { url, filename, video: true }])
      else setTimeout(() => URL.revokeObjectURL(url), 60_000)
      downloadBrowserArtifact(url, filename)
    },
    failed: () => setState("status", language.t("browser.recordingFailed")),
  })
  onCleanup(() => {
    disposed = true
    recorder.stop()
    state.artifacts.forEach((item) => URL.revokeObjectURL(item.url))
  })

  let imgRef: HTMLImageElement | undefined
  let urlInputRef: HTMLInputElement | undefined
  let ws: WebSocket | undefined
  let meta: FrameMeta = { deviceWidth: 1440, deviceHeight: 900 }
  let buttons = 0
  let lastMove = 0
  let touchPos: { x: number; y: number } | undefined

  const send = (payload: Record<string, unknown>) => {
    if (!["control", "tabs", "ping", "screenshot"].includes(String(payload.type)) && state.owner !== "human") {
      if (payload.type !== "mouse") setState("status", language.t("browser.takeControlHint"))
      return
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }

  createEffect(() => {
    const candidates = browserCandidates(serverSDK().server.http).ws
    let disposed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    let lastMessage = Date.now()
    let connectionTimer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      if (disposed) return
      const target = candidates[attempt % candidates.length]!
      let opened = false
      setState("status", language.t("browser.connecting"))
      const socket = new WebSocket(target)
      ws = socket
      connectionTimer = setTimeout(() => socket.close(), 8_000)

      socket.onopen = () => {
        if (disposed) return
        opened = true
        lastMessage = Date.now()
        if (connectionTimer) clearTimeout(connectionTimer)
        setState("status", language.t("browser.attaching"))
        send({ type: "tabs" })
      }

      socket.onmessage = (event) => {
        if (disposed || ws !== socket) return
        lastMessage = Date.now()
        try {
          const msg = JSON.parse(String(event.data)) as {
            text?: string
            owner?: string
            request?: string
            type?: string
            data?: string
            meta?: FrameMeta
            url?: string
            target?: BrowserTab
            tabs?: BrowserTab[]
            current?: string
            message?: string
          }
          if (msg.type === "clipboard" && typeof msg.text === "string") {
            void navigator.clipboard
              .writeText(msg.text)
              .catch(() => setState("status", language.t("browser.clipboardFailed")))
            return
          }
          if (msg.type === "control" && msg.owner) {
            setState("owner", msg.owner)
            return
          }
          if (msg.type === "screenshot" && msg.data) {
            const target = msg.request ? screenshotTargets.get(msg.request) : undefined
            if (msg.request) screenshotTargets.delete(msg.request)
            void fetch(`data:image/png;base64,${msg.data}`)
              .then((response) => response.blob())
              .then(async (blob) => {
                const filename = `browser-${Date.now()}.png`
                const url = URL.createObjectURL(blob)
                if (!disposed) setState("artifacts", (items) => [...items, { url, filename, video: false }])
                else URL.revokeObjectURL(url)
                if (target) {
                  const reference = platform.draftStore
                    ? await platform.draftStore.putBlob(blob)
                    : await createBlobReference(blob)
                  target.set(
                    [
                      ...target.current(),
                      { type: "image", id: crypto.randomUUID(), filename, mime: "image/png", blob: reference },
                    ],
                    target.cursor(),
                  )
                }
              })
              .catch(() => setState("status", language.t("browser.captureFailed")))
            return
          }
          if (msg.type === "frame" && msg.data) {
            if (msg.meta) meta = msg.meta
            setState("frameSrc", `data:image/jpeg;base64,${msg.data}`)
            setState("status", `${meta.deviceWidth}×${meta.deviceHeight}`)
          } else if (msg.type === "url" && typeof msg.url === "string") {
            if (document.activeElement !== urlInputRef) setState("urlValue", msg.url)
            send({ type: "tabs" })
          } else if (msg.type === "attached" && msg.target) {
            setState("urlValue", msg.target.url)
            setState("currentTab", msg.target.id)
            setState("status", language.t("browser.attached"))
            send({ type: "tabs" })
          } else if (msg.type === "tabs" && Array.isArray(msg.tabs)) {
            setState("tabs", msg.tabs)
            if (msg.current) setState("currentTab", msg.current)
          } else if (msg.type === "detached") {
            setState("status", language.t("browser.reattaching"))
            send({ type: "tabs" })
          } else if (msg.type === "error" && msg.message) {
            setState("status", msg.message)
          }
        } catch {}
      }

      socket.onclose = () => {
        if (disposed || ws !== socket) return
        if (connectionTimer) clearTimeout(connectionTimer)
        recorder.stop()
        screenshotTargets.clear()
        attempt += 1
        setState("status", language.t("browser.reconnecting"))
        retryTimer = setTimeout(connect, Math.min(10_000, (opened ? 1000 : 400) * 2 ** Math.min(attempt, 4)))
      }
    }

    connect()
    const poll = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN && Date.now() - lastMessage > 25_000) {
        ws.close()
        return
      }
      send({ type: "ping" })
      send({ type: "tabs" })
    }, 10_000)
    const reconnect = () => {
      if (ws?.readyState !== WebSocket.OPEN) {
        if (retryTimer) clearTimeout(retryTimer)
        connect()
      }
    }
    window.addEventListener("online", reconnect)

    onCleanup(() => {
      disposed = true
      clearInterval(poll)
      window.removeEventListener("online", reconnect)
      if (connectionTimer) clearTimeout(connectionTimer)
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
    send({ type: "navigate", url: state.urlValue })
    imgRef?.focus()
  }

  const pasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        send({ type: "text", text })
        imgRef?.focus()
      }
    } catch {
      setState("status", language.t("browser.clipboardFailed"))
    }
  }

  const popOut = () => {
    const url = browserCandidates(serverSDK().server.http).popout
    platform.openExternal(url)
  }

  return (
    <aside
      id="browser-panel"
      aria-label={language.t("browser.title")}
      class="relative min-w-0 h-full flex-1 flex flex-col overflow-hidden"
      classList={{
        "bg-v2-background-bg-base rounded-[10px] shadow-[var(--v2-elevation-raised)]":
          settings.general.newLayoutDesigns(),
        "bg-background-base border-l border-border-weaker-base": !settings.general.newLayoutDesigns(),
        "min-h-0": props.stacked,
      }}
    >
      <div class="shrink-0 flex flex-wrap items-center gap-2 px-2.5 py-2 border-b border-border-weaker-base bg-surface-panel">
        <button
          type="button"
          class="rounded border border-border-base px-2 py-1 text-12-medium"
          onClick={() => send({ type: "control", owner: state.owner === "human" ? "agent" : "human" })}
        >
          {language.t(state.owner === "human" ? "browser.returnAgent" : "browser.takeControl")}
        </button>
        <span role="status" class="text-11-regular text-text-weak flex-1">
          {language.t(state.owner === "human" ? "browser.humanControl" : "browser.agentControl")}
        </span>
        <button
          type="button"
          disabled={!state.frameSrc}
          class="text-12-regular disabled:opacity-40"
          onClick={() => {
            const request = crypto.randomUUID()
            screenshotTargets.set(request, prompt.capture())
            send({ type: "screenshot", request })
          }}
        >
          {language.t("browser.attachScreenshot")}
        </button>
        <button
          type="button"
          disabled={!state.frameSrc}
          class="text-12-regular disabled:opacity-40"
          title={language.t("browser.recordingLimit")}
          onClick={() => {
            if (state.recording) {
              recorder.stop()
              return
            }
            if (recorder.start()) setState("recording", true)
            else setState("status", language.t("browser.recordingUnavailable"))
          }}
        >
          {language.t(state.recording ? "browser.stopRecording" : "browser.record")}
        </button>
      </div>
      <div class="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border-weaker-base bg-surface-panel">
        <Tooltip placement="bottom" value={language.t("browser.back")}>
          <IconButton
            icon="arrow-left"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => send({ type: "back" })}
            aria-label={language.t("browser.back")}
          />
        </Tooltip>
        <Tooltip placement="bottom" value={language.t("browser.reload")}>
          <IconButton
            icon="reset"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => send({ type: "reload" })}
            aria-label={language.t("browser.reload")}
          />
        </Tooltip>

        <select
          title={language.t("browser.tabs")}
          aria-label={language.t("browser.tabs")}
          value={state.currentTab}
          onChange={(e) => {
            const id = e.currentTarget.value
            setState("currentTab", id)
            send({ type: "tab", id })
          }}
          class="h-6 max-w-[160px] rounded border border-border-weak-base bg-background-base px-1.5 text-12-regular text-text-base outline-none"
        >
          <For each={state.tabs}>
            {(t) => (
              <option value={t.id} selected={t.id === state.currentTab}>
                {(t.title || t.url || language.t("browser.tab")).slice(0, 40)}
              </option>
            )}
          </For>
        </select>

        <Tooltip placement="bottom" value={language.t("browser.newTab")}>
          <IconButton
            icon="plus-small"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => send({ type: "newtab", url: "about:blank" })}
            aria-label={language.t("browser.newTab")}
          />
        </Tooltip>

        <Tooltip placement="bottom" value={language.t("browser.closeTab")}>
          <IconButton
            icon="close-small"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            aria-label={language.t("browser.closeTab")}
            onClick={() => send({ type: "closetab", id: state.currentTab })}
          />
        </Tooltip>
        <input
          ref={urlInputRef}
          type="text"
          value={state.urlValue}
          onInput={(e) => setState("urlValue", e.currentTarget.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter") navigate()
          }}
          placeholder={language.t("browser.address")}
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
          {language.t("browser.go")}
        </button>

        <Tooltip placement="bottom" value={language.t("browser.pasteHint")}>
          <button
            type="button"
            onClick={() => void pasteClipboard()}
            class="h-6 shrink-0 rounded border border-border-weak-base bg-surface-raised-base px-2 text-12-regular text-text-base hover:bg-surface-raised-base-hover"
          >
            {language.t("browser.paste")}
          </button>
        </Tooltip>

        <span class="hidden xl:inline text-11-regular text-text-weak whitespace-nowrap px-1">{state.status}</span>

        <Tooltip placement="bottom" value={language.t("browser.popout")}>
          <IconButton
            icon="square-arrow-top-right"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={popOut}
            aria-label={language.t("browser.popout")}
          />
        </Tooltip>

        <Tooltip placement="bottom" value={language.t("browser.close")}>
          <IconButton
            icon="close-small"
            variant="ghost"
            class="h-6 w-6 shrink-0"
            onClick={() => view().browser.close()}
            aria-label={language.t("browser.close")}
          />
        </Tooltip>
      </div>

      <div
        class="relative flex-1 min-h-0 flex items-start justify-center bg-background-stronger overflow-hidden select-none"
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
          when={state.frameSrc}
          fallback={
            <div class="h-full w-full flex items-center justify-center text-13-regular text-text-weak">
              {state.status}
            </div>
          }
        >
          <img
            ref={imgRef}
            src={state.frameSrc}
            tabIndex={0}
            alt=""
            draggable={false}
            data-prevent-autofocus
            class="max-w-full max-h-full outline-none cursor-default select-none"
            onPointerDown={(e) => {
              if (e.pointerType === "mouse") e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerCancel={() => {
              if (buttons) send({ type: "mouse", kind: "mouseReleased", x: 0, y: 0, button: "left", buttons: 0 })
              buttons = 0
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              imgRef?.focus()
              buttons = e.buttons
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
              buttons = e.buttons
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
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
                e.preventDefault()
                send({ type: "copy" })
                return
              }
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

      <Show when={state.artifacts.length}>
        <div class="shrink-0 flex gap-2 p-2 overflow-x-auto border-t border-border-weaker-base">
          <For each={state.artifacts}>
            {(item) => (
              <a href={item.url} download={item.filename} class="shrink-0 text-11-regular text-text-weak">
                <Show
                  when={item.video}
                  fallback={<img src={item.url} alt={language.t("browser.screenshot")} class="h-14 rounded" />}
                >
                  <video src={item.url} controls class="h-20 rounded" />
                </Show>
                {language.t("browser.download")}
              </a>
            )}
          </For>
        </div>
      </Show>
      <div class="md:hidden shrink-0 flex items-center gap-1.5 p-1.5 border-t border-border-weaker-base bg-surface-panel">
        <input
          type="text"
          value={state.mobileText}
          onInput={(e) => setState("mobileText", e.currentTarget.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter" && state.mobileText) {
              send({ type: "text", text: state.mobileText })
              setState("mobileText", "")
            }
          }}
          placeholder={language.t("browser.mobileText")}
          autocapitalize="off"
          class="h-7 flex-1 rounded border border-border-weak-base bg-background-base px-2 text-12-regular text-text-strong outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (!state.mobileText) return
            send({ type: "text", text: state.mobileText })
            setState("mobileText", "")
          }}
          class="h-7 rounded border border-border-weak-base bg-surface-raised-base px-2.5 text-12-regular text-text-strong"
        >
          {language.t("browser.send")}
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
