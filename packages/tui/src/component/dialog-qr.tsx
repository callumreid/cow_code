import { TextAttributes } from "@opentui/core"
import { createMemo, createSignal, For, onMount, Show } from "solid-js"
import { encode } from "uqr"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { useTheme } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { useRoute } from "../context/route"
import { useProject } from "../context/project"
import { useTuiPaths } from "../context/runtime"
import { useClipboard } from "../context/clipboard"
import { useToast } from "../ui/toast"
import { useBindings } from "../keymap"
import { errorMessage } from "../util/error"

export type CompanionInfo = {
  hosts: string[]
  port: number
  username: string
  password: string
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; info: CompanionInfo }

export function DialogQr(props: { onCompanion: () => Promise<CompanionInfo> }) {
  const dialog = useDialog()
  const { theme } = useTheme()
  const route = useRoute()
  const project = useProject()
  const paths = useTuiPaths()
  const clipboard = useClipboard()
  const toast = useToast()
  const [state, setState] = createSignal<State>({ status: "loading" })
  const [hostIndex, setHostIndex] = createSignal(0)

  dialog.setSize("large")

  onMount(() => {
    props
      .onCompanion()
      .then((info) => setState({ status: "ready", info }))
      .catch((error) => setState({ status: "error", message: errorMessage(error) }))
  })

  const hosts = createMemo(() => {
    const current = state()
    if (current.status !== "ready") return []
    return current.info.hosts.length ? current.info.hosts : ["localhost"]
  })

  const url = createMemo(() => {
    const current = state()
    if (current.status !== "ready") return ""
    const host = hosts()[hostIndex() % hosts().length]
    // btoa emits standard base64 whose +/= are not query-safe; percent-encode
    // so URLSearchParams round-trips the token byte-for-byte.
    const token = encodeURIComponent(btoa(`${current.info.username}:${current.info.password}`))
    const directory = base64Encode(project.instance.directory() || paths.cwd)
    const target = route.data.type === "session" ? `/${directory}/session/${route.data.sessionID}` : ""
    return `http://${host}:${current.info.port}${target}?auth_token=${token}&project=${directory}`
  })

  const lines = createMemo(() => {
    if (!url()) return []
    const qr = encode(url(), { ecc: "L", border: 2 })
    const out: string[] = []
    for (let y = 0; y < qr.size; y += 2) {
      let line = ""
      for (let x = 0; x < qr.size; x++) {
        const top = qr.data[y][x]
        const bottom = y + 1 < qr.size ? qr.data[y + 1][x] : false
        line += top && bottom ? "█" : top ? "▀" : bottom ? "▄" : " "
      }
      out.push(line)
    }
    if (out.length && out[0].length > 84) dialog.setSize("xlarge")
    return out
  })

  useBindings(() => ({
    bindings: [
      { key: "escape", desc: "Close", group: "Dialog", cmd: () => dialog.clear() },
      {
        key: "left",
        desc: "Previous address",
        group: "Dialog",
        cmd: () => setHostIndex((prev) => (prev - 1 + hosts().length) % Math.max(hosts().length, 1)),
      },
      {
        key: "right",
        desc: "Next address",
        group: "Dialog",
        cmd: () => setHostIndex((prev) => (prev + 1) % Math.max(hosts().length, 1)),
      },
      {
        key: "c",
        desc: "Copy link",
        group: "Dialog",
        cmd: async () => {
          if (!url()) return
          await clipboard.write?.(url())
          toast.show({ message: "Link copied to clipboard", variant: "success" })
        },
      },
    ],
  }))

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Connect phone
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc
        </text>
      </box>
      <Show when={state().status === "loading"}>
        <text fg={theme.textMuted}>Starting companion server...</text>
      </Show>
      <Show when={state().status === "error"}>
        <text fg={theme.error}>{(state() as { status: "error"; message: string }).message}</text>
      </Show>
      <Show when={state().status === "ready"}>
        <box alignItems="center">
          <box backgroundColor="#FFFFFF" paddingLeft={2} paddingRight={2}>
            <For each={lines()}>{(line) => <text fg="#000000">{line}</text>}</For>
          </box>
        </box>
        <box gap={0}>
          <text fg={theme.textMuted}>Scan with your phone camera to open this session in the web app.</text>
          <text fg={theme.textMuted}>Phone and computer must share a network (Wi-Fi or tailnet).</text>
        </box>
        <box>
          <text fg={theme.text}>{url()}</text>
        </box>
        <box flexDirection="row" justifyContent="space-between" paddingBottom={1}>
          <Show when={hosts().length > 1} fallback={<text> </text>}>
            <text fg={theme.textMuted}>
              {"◀ ▶ address " + ((hostIndex() % hosts().length) + 1) + "/" + hosts().length}
            </text>
          </Show>
          <text fg={theme.textMuted}>c copy link</text>
        </box>
      </Show>
    </box>
  )
}
