import { Dialog } from "@opencode-ai/ui/dialog"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { createMemo, createResource, createSignal, For, Show, type Component } from "solid-js"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { qrEncode, qrSvgPath } from "@/utils/qr"
import { authTokenFromCredentials } from "@/utils/server"
import { showToast } from "@/utils/toast"

const QUIET_ZONE = 4

// Toggle the local desktop server between loopback-only (default) and
// LAN-reachable, and render a QR join link a phone can scan. The join URL
// reuses the ?auth_token=base64(user:pass) login that the web entry consumes
// and then scrubs from history.
export const DialogRemoteAccess: Component = () => {
  const language = useLanguage()
  const platform = usePlatform()
  const [busy, setBusy] = createSignal(false)
  const [copied, setCopied] = createSignal(false)
  const [selectedIP, setSelectedIP] = createSignal<string>()
  const [info, { mutate }] = createResource(async () => (await platform.getRemoteAccessInfo?.()) ?? null)

  const ip = createMemo(() => {
    const current = info()
    if (!current) return
    const selected = selectedIP()
    return selected && current.lanIPs.includes(selected) ? selected : current.lanIPs[0]
  })

  const joinUrl = createMemo(() => {
    const current = info()
    const host = ip()
    if (!current?.enabled || !host) return
    return `http://${host}:${current.port}/?auth_token=${authTokenFromCredentials(current.credentials)}`
  })

  const qr = createMemo(() => {
    const url = joinUrl()
    if (!url) return
    const modules = qrEncode(url)
    return { path: qrSvgPath(modules), size: modules.length }
  })

  const toggle = (enabled: boolean) => {
    if (busy() || !platform.setRemoteAccess) return
    setBusy(true)
    platform
      .setRemoteAccess(enabled)
      .then((next) => mutate(next))
      .catch((err: unknown) => {
        showToast({
          variant: "error",
          title: language.t("common.requestFailed"),
          description: err instanceof Error ? err.message : String(err),
        })
      })
      .finally(() => setBusy(false))
  }

  const copy = () => {
    const url = joinUrl()
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog title={language.t("dialog.remoteAccess.title")} description={language.t("dialog.remoteAccess.description")}>
      <div class="flex flex-col gap-4 px-4 pb-4">
        <div class="flex items-center justify-between gap-4 rounded-md bg-surface-base p-3">
          <span class="text-14-regular text-text-strong">{language.t("dialog.remoteAccess.toggle")}</span>
          <Switch checked={info()?.enabled ?? false} disabled={busy() || !info()} onChange={toggle} />
        </div>

        <Show
          when={info()?.enabled}
          fallback={<p class="text-14-regular text-text-weak">{language.t("dialog.remoteAccess.off.description")}</p>}
        >
          <Show
            when={joinUrl()}
            fallback={<p class="text-14-regular text-text-weak">{language.t("dialog.remoteAccess.noNetwork")}</p>}
          >
            <div class="flex flex-col items-center gap-3">
              <Show when={qr()}>
                {(code) => (
                  <svg
                    viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${code().size + QUIET_ZONE * 2} ${code().size + QUIET_ZONE * 2}`}
                    class="w-56 h-56 rounded-md"
                    role="img"
                    aria-label={language.t("dialog.remoteAccess.scan")}
                  >
                    <rect
                      x={-QUIET_ZONE}
                      y={-QUIET_ZONE}
                      width={code().size + QUIET_ZONE * 2}
                      height={code().size + QUIET_ZONE * 2}
                      fill="#ffffff"
                    />
                    <path d={code().path} fill="#000000" />
                  </svg>
                )}
              </Show>
              <p class="text-14-regular text-text-weak text-center">{language.t("dialog.remoteAccess.scan")}</p>
              <button
                type="button"
                class="max-w-full text-12-regular font-mono text-text-base break-all text-left rounded-md bg-surface-base p-2 hover:bg-surface-base-hover"
                onClick={copy}
              >
                {copied() ? language.t("session.share.copy.copied") : joinUrl()}
              </button>
              <Show when={(info()?.lanIPs.length ?? 0) > 1}>
                <div class="flex flex-wrap items-center justify-center gap-2">
                  <For each={info()?.lanIPs ?? []}>
                    {(address) => (
                      <button
                        type="button"
                        class="text-12-regular font-mono px-2 py-0.5 rounded-xs"
                        classList={{
                          "bg-surface-base-active text-text-strong": address === ip(),
                          "bg-surface-base text-text-weak hover:bg-surface-base-hover": address !== ip(),
                        }}
                        onClick={() => setSelectedIP(address)}
                      >
                        {address}
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>

          <div class="flex items-start gap-2 rounded-md bg-surface-warning-weak p-3">
            <Icon name="eye" class="shrink-0 size-5 text-icon-warning-base" />
            <p class="text-13-regular text-text-base">{language.t("dialog.remoteAccess.warning")}</p>
          </div>
        </Show>
      </div>
    </Dialog>
  )
}
