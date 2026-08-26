import { Button } from "@opencode-ai/ui/button"
import { Dialog } from "@opencode-ai/ui/dialog"
import { createMemo, createSignal, For, Match, onMount, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { encode } from "uqr"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useServer } from "@/context/server"
import { authTokenFromCredentials } from "@/utils/server"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { showToast } from "@/utils/toast"

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]"])

type State =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error"; message: string }
  | { status: "ready"; hosts: string[] }

function QrSvg(props: { text: string }) {
  const qr = createMemo(() => encode(props.text, { ecc: "L", border: 2 }))
  const path = createMemo(() => {
    let out = ""
    qr().data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) out += `M${x} ${y}h1v1h-1z`
      }),
    )
    return out
  })
  // Fixed black-on-white regardless of theme so cameras can always read it.
  return (
    <svg viewBox={`0 0 ${qr().size} ${qr().size}`} class="size-60 rounded-md" shape-rendering="crispEdges">
      <rect width={qr().size} height={qr().size} fill="#FFFFFF" />
      <path d={path()} fill="#000000" />
    </svg>
  )
}

export function DialogConnectPhone() {
  const language = useLanguage()
  const platform = usePlatform()
  const server = useServer()
  const [state, setState] = createStore<{ value: State }>({ value: { status: "loading" } })
  const [hostIndex, setHostIndex] = createSignal(0)

  const http = createMemo(() => {
    const current = server.current
    return current && "http" in current ? current.http : undefined
  })

  onMount(async () => {
    const base = http()
    if (!base) return setState("value", { status: "unavailable" })
    const parsed = new URL(base.url)
    if (!LOOPBACK.has(parsed.hostname)) return setState("value", { status: "ready", hosts: [parsed.host] })
    if (!platform.companionInfo) return setState("value", { status: "unavailable" })
    try {
      const info = await platform.companionInfo()
      const hosts = (info.hosts.length ? info.hosts : [parsed.hostname]).map((host) => `${host}:${info.port}`)
      setState("value", { status: "ready", hosts })
    } catch (error) {
      setState("value", { status: "error", message: error instanceof Error ? error.message : String(error) })
    }
  })

  const hosts = createMemo(() => (state.value.status === "ready" ? state.value.hosts : []))
  const url = createMemo(() => {
    const base = http()
    if (!base || !hosts().length) return ""
    const host = hosts()[hostIndex() % hosts().length]
    const params = new URLSearchParams()
    if (base.password) {
      params.set("auth_token", authTokenFromCredentials({ username: base.username, password: base.password }))
    }
    // Carry the workspace list so the phone's home shows these projects
    // immediately (see ProjectsFromUrl).
    for (const project of server.projects.list()) params.append("project", base64Encode(project.worktree))
    const query = params.toString()
    return `http://${host}/${query ? `?${query}` : ""}`
  })

  const copy = () => {
    if (!url()) return
    navigator.clipboard
      .writeText(url())
      .then(() => showToast({ variant: "success", title: language.t("dialog.phone.copied") }))
      .catch(() => {})
  }

  return (
    <Dialog title={language.t("dialog.phone.title")} class="w-full max-w-[400px] mx-auto">
      <div class="flex flex-col gap-4 p-6 pt-0 items-center">
        <Switch>
          <Match when={state.value.status === "loading"}>
            <p class="text-14-regular text-text-weak">{language.t("dialog.phone.loading")}</p>
          </Match>
          <Match when={state.value.status === "unavailable"}>
            <p class="text-14-regular text-text-weak">{language.t("dialog.phone.unavailable")}</p>
          </Match>
          <Match when={state.value.status === "error"}>
            <p class="text-14-regular text-text-weak break-all">
              {language.t("dialog.phone.error")}{" "}
              {state.value.status === "error" ? state.value.message : ""}
            </p>
          </Match>
          <Match when={state.value.status === "ready"}>
            <QrSvg text={url()} />
            <div class="flex flex-col gap-1 items-center">
              <p class="text-14-regular text-text-base text-center">{language.t("dialog.phone.description")}</p>
              <p class="text-12-regular text-text-weak text-center">{language.t("dialog.phone.network")}</p>
              {!http()?.password && (
                <p class="text-12-regular text-text-weak text-center">{language.t("dialog.phone.insecure")}</p>
              )}
            </div>
            {hosts().length > 1 && (
              <div class="flex flex-wrap gap-2 justify-center">
                <For each={hosts()}>
                  {(host, index) => (
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-12-regular border"
                      classList={{
                        "border-border-strong text-text-base": index() === hostIndex() % hosts().length,
                        "border-border-base text-text-weak": index() !== hostIndex() % hosts().length,
                      }}
                      onClick={() => setHostIndex(index())}
                    >
                      {host}
                    </button>
                  )}
                </For>
              </div>
            )}
            <div class="flex flex-col gap-1 items-center w-full">
              <p class="text-12-regular text-text-weak break-all text-center select-text">{url()}</p>
              <Button type="button" variant="primary" onClick={copy}>
                {language.t("dialog.phone.copy")}
              </Button>
            </div>
          </Match>
        </Switch>
      </div>
    </Dialog>
  )
}
