import { createEffect, createSignal, onCleanup, onMount, Show, type JSX } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { toaster } from "@opencode-ai/ui/toast"
import { decode64 } from "@/utils/base64"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useServerSDK } from "@/context/server-sdk"
import { useServerSync } from "@/context/server-sync"
import { useSessionWatchdog } from "@/context/session-watchdog"
import { STUCK_SILENCE_MS } from "@/context/session-watchdog-core"
import { errorMessage } from "./helpers"

// How long the event stream must stay in "reconnecting" before the banner
// shows — brief heartbeat-triggered reconnects (250ms retry) are normal.
const CONNECTION_BANNER_GRACE_MS = 5_000

// Persistent toasts for watchdog "stuck" fires, session.error events that have
// no session to badge (agent/model-not-found, skill/plugin failures publish
// with sessionID undefined), and desktop sidecar death. Mounted once per
// layout shell via AttentionSurface.
export function useAttentionToasts() {
  const language = useLanguage()
  const navigate = useNavigate()
  const params = useParams<{ dir?: string; id?: string }>()
  const platform = usePlatform()
  const serverSDK = useServerSDK()
  const serverSync = useServerSync()
  const watchdog = useSessionWatchdog()

  onMount(() => {
    const toastBySession = new Map<string, number>()

    const dismiss = (key: string) => {
      const toastId = toastBySession.get(key)
      if (toastId === undefined) return
      toaster.dismiss(toastId)
      toastBySession.delete(key)
    }

    const unsubStuck = watchdog.listen((event) => {
      if (event.scope !== serverSDK().scope) return
      const key = `${event.directory}:${event.sessionID}`
      if (event.type === "clear") {
        dismiss(key)
        return
      }

      // The open session already shows the retry card / silence first-hand.
      const currentDir = decode64(params.dir)
      if (currentDir === event.directory && params.id === event.sessionID) return

      const [store] = serverSync().child(event.directory, { bootstrap: false })
      const session = store.session.find((s) => s.id === event.sessionID)
      const sessionTitle = session?.title ?? event.sessionID
      const description =
        event.reason === "retry"
          ? language.t("notification.session.stuck.retryDescription", {
              sessionTitle,
              attempt: `${event.attempt ?? 0}`,
            })
          : language.t("notification.session.stuck.silentDescription", {
              sessionTitle,
              minutes: `${Math.round(STUCK_SILENCE_MS / 60_000)}`,
            })
      const href = `/${base64Encode(event.directory)}/session/${event.sessionID}`

      dismiss(key)
      const toastId = showToast({
        persistent: true,
        icon: "warning",
        title: language.t("notification.session.stuck.title"),
        description,
        actions: [
          {
            label: language.t("notification.action.goToSession"),
            onClick: () => navigate(href),
          },
          {
            label: language.t("common.dismiss"),
            onClick: "dismiss",
          },
        ],
      })
      toastBySession.set(key, toastId)
    })

    const unsubErrors = serverSDK().event.listen((e) => {
      if (e.details?.type !== "session.error") return
      const props = e.details.properties as { sessionID?: string; error?: unknown }
      // Errors with a session badge + roll up through the notification store;
      // only the session-less ones would otherwise vanish entirely.
      if (props.sessionID) return
      showToast({
        icon: "circle-x",
        title: language.t("notification.session.error.title"),
        description: errorMessage(props.error, language.t("notification.session.error.fallbackDescription")),
      })
    })

    const unsubSidecar = platform.onSidecarExit?.((code) => {
      showToast({
        persistent: true,
        icon: "warning",
        title: language.t("toast.sidecarExit.title"),
        description: language.t("toast.sidecarExit.description", { code: `${code ?? "?"}` }),
        actions: [
          {
            label: language.t("toast.sidecarExit.action.restart"),
            onClick: () => void platform.restart(),
          },
          {
            label: language.t("common.dismiss"),
            onClick: "dismiss",
          },
        ],
      })
    })

    onCleanup(() => {
      unsubStuck()
      unsubErrors()
      unsubSidecar?.()
    })
  })
}

// Slim banner shown when the event stream has been disconnected past the grace
// period. Only appears after the stream connected at least once, so server
// startup keeps its dedicated ConnectionError screen.
export function ConnectionBanner(): JSX.Element {
  const language = useLanguage()
  const serverSDK = useServerSDK()
  const [visible, setVisible] = createSignal(false)
  const [everConnected, setEverConnected] = createSignal(false)

  createEffect(() => {
    const state = serverSDK().event.connection()
    if (state === "connected") {
      setEverConnected(true)
      setVisible(false)
      return
    }
    if (!everConnected()) return
    const timer = setTimeout(() => setVisible(true), CONNECTION_BANNER_GRACE_MS)
    onCleanup(() => clearTimeout(timer))
  })

  return (
    <Show when={visible()}>
      <div
        role="status"
        class="shrink-0 flex items-center justify-center gap-2 px-3 py-1 text-12-medium bg-surface-warning-base text-text-strong border-b border-border-weak-base"
      >
        <span class="size-1.5 rounded-full bg-surface-warning-strong animate-pulse" />
        {language.t("status.connection.reconnecting")}
      </div>
    </Show>
  )
}

// Mount point for the layout shells: runs the attention toasts and renders the
// connection-loss banner.
export function AttentionSurface(): JSX.Element {
  useAttentionToasts()
  return <ConnectionBanner />
}
