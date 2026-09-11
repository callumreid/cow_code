import { Button } from "@opencode-ai/ui/button"
import { Dialog } from "@opencode-ai/ui/dialog"
import { createMemo, createSignal, For, Match, onMount, Show, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { encode } from "uqr"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useServer } from "@/context/server"
import { officeFetch, type OfficeSdk } from "@/office/api"
import { authTokenFromCredentials } from "@/utils/server"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { showToast } from "@/utils/toast"

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]"])

type Door = { url: string; since?: number }
/** One square in the dialog: the barn door (works anywhere) or a same-network origin. */
export type PhoneOption = { kind: "door"; url: string; since?: number } | { kind: "origin"; origin: string }

type State =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error"; message: string }
  | { status: "ready"; origins: string[]; door?: Door }

/**
 * The link a square encodes. The barn door already carries the gate key and
 * the gate injects the server auth, so only same-network doors get auth_token;
 * every square carries the workspace list so the phone's home shows these
 * projects immediately (see ProjectsFromUrl).
 */
export function phoneUrl(
  option: PhoneOption,
  base: { username?: string; password?: string },
  worktrees: readonly string[],
) {
  const params = new URLSearchParams()
  if (option.kind === "origin" && base.password) {
    params.set("auth_token", authTokenFromCredentials({ username: base.username, password: base.password }))
  }
  for (const worktree of worktrees) params.append("project", base64Encode(worktree))
  const target = new URL(option.kind === "door" ? option.url : option.origin)
  for (const [key, value] of params) target.searchParams.append(key, value)
  return target.toString()
}

/**
 * The barn door, when this server is the box: `GET /global/office/phone` is
 * the public link with its gate key, or nulls off the box. Any failure (older
 * build, laptop) means no door.
 */
function readDoor(sdk: OfficeSdk, fetch?: typeof globalThis.fetch) {
  return officeFetch(sdk, "/global/office/phone", { fetch })
    .then((response) => response.json())
    .then((body: unknown): Door | undefined => {
      if (!body || typeof body !== "object" || !("url" in body) || typeof body.url !== "string") return undefined
      return { url: body.url, since: "since" in body && typeof body.since === "number" ? body.since : undefined }
    })
    .catch(() => undefined)
}

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
  const [index, setIndex] = createSignal(0)

  const http = createMemo(() => {
    const current = server.current
    return current && "http" in current ? current.http : undefined
  })

  onMount(async () => {
    const base = http()
    const current = server.current
    if (!base || !current) return setState("value", { status: "unavailable" })
    const door = readDoor({ url: base.url, server: current }, platform.fetch)
    const parsed = new URL(base.url)
    if (!LOOPBACK.has(parsed.hostname))
      return setState("value", { status: "ready", origins: [parsed.origin], door: await door })
    if (!platform.companionInfo) {
      const found = await door
      return setState("value", found ? { status: "ready", origins: [], door: found } : { status: "unavailable" })
    }
    try {
      const info = await platform.companionInfo()
      const insecureOrigins = (info.hosts.length ? info.hosts : [parsed.hostname]).map(
        (host) => `http://${host}:${info.port}/`,
      )
      const origins = [...new Set([...(info.secureOrigins ?? []), ...insecureOrigins])]
      setState("value", { status: "ready", origins, door: await door })
    } catch (error) {
      setState("value", { status: "error", message: error instanceof Error ? error.message : String(error) })
    }
  })

  const options = createMemo((): PhoneOption[] => {
    if (state.value.status !== "ready") return []
    const door = state.value.door
    return [
      ...(door ? [{ kind: "door" as const, url: door.url, since: door.since }] : []),
      ...state.value.origins.map((origin) => ({ kind: "origin" as const, origin })),
    ]
  })
  const selected = createMemo(() => options()[index() % options().length])
  const isDoor = createMemo(() => selected()?.kind === "door")
  const secure = createMemo(() => {
    const option = selected()
    if (!option) return false
    return option.kind === "door" || option.origin.startsWith("https://")
  })
  const url = createMemo(() => {
    const base = http()
    const option = selected()
    if (!base || !option) return ""
    return phoneUrl(
      option,
      base,
      server.projects.list().map((project) => project.worktree),
    )
  })
  const since = createMemo(() => {
    const option = selected()
    if (option?.kind !== "door" || !option.since) return ""
    return new Date(option.since).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
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
              {language.t("dialog.phone.error")} {state.value.status === "error" ? state.value.message : ""}
            </p>
          </Match>
          <Match when={state.value.status === "ready"}>
            <QrSvg text={url()} />
            <div class="flex flex-col gap-1 items-center">
              <Show
                when={isDoor()}
                fallback={
                  <>
                    <p class="text-14-regular text-text-base text-center">{language.t("dialog.phone.description")}</p>
                    <p class="text-12-regular text-text-weak text-center">{language.t("dialog.phone.network")}</p>
                    <p class="text-12-regular text-text-weak text-center">
                      {language.t(secure() ? "dialog.phone.voiceSecure" : "dialog.phone.voiceNeedsHttps")}
                    </p>
                    {!http()?.password && (
                      <p class="text-12-regular text-text-weak text-center">{language.t("dialog.phone.insecure")}</p>
                    )}
                  </>
                }
              >
                <p class="text-14-regular text-text-base text-center">{language.t("dialog.phone.door.description")}</p>
                <p class="text-12-regular text-text-weak text-center">{language.t("dialog.phone.door.anywhere")}</p>
                <p class="text-12-regular text-text-weak text-center">{language.t("dialog.phone.voiceSecure")}</p>
                <Show when={since()}>
                  <p class="text-12-regular text-text-weak text-center">
                    {language.t("dialog.phone.door.since", { date: since() })}
                  </p>
                </Show>
              </Show>
            </div>
            {options().length > 1 && (
              <div class="flex flex-wrap gap-2 justify-center">
                <For each={options()}>
                  {(option, position) => (
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-md text-12-regular border"
                      classList={{
                        "border-border-strong text-text-base": position() === index() % options().length,
                        "border-border-base text-text-weak": position() !== index() % options().length,
                      }}
                      onClick={() => setIndex(position())}
                    >
                      {option.kind === "door" ? language.t("dialog.phone.door.chip") : new URL(option.origin).host}
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
