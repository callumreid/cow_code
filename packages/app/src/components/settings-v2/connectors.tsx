import { Button } from "@opencode-ai/ui/button"
import { TextInputV2 } from "@opencode-ai/ui/v2/text-input-v2"
import { Switch } from "@opencode-ai/ui/switch"
import { type Component, For, Show, createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { showToast } from "@/utils/toast"
import { SettingsListV2 } from "./parts/list"
import "./settings-v2.css"

type McpEntry = { type?: string; url?: string; command?: string[]; enabled?: boolean }

// Connectors that only need a token pasted in. The URL and header shape come
// from the vendor's own docs so nobody has to look them up.
const PRESETS = [
  {
    id: "oneleet",
    label: "Oneleet",
    url: "https://api.oneleet.com/mcp",
    tokenHintKey: "settings.connectors.hint.oneleet",
  },
] as const

export const SettingsConnectorsV2: Component = () => {
  const language = useLanguage()
  const serverSync = useServerSync()
  const [form, setForm] = createStore({ name: "", url: "", token: "", busy: false, hint: "" })

  // Read from the saved config rather than live connection status: the
  // settings dialog can be opened with no directory, and MCP status is
  // instance-scoped while the config is global.
  const servers = createMemo(() => {
    const configured = (serverSync().data.config as { mcp?: Record<string, McpEntry> } | undefined)?.mcp ?? {}
    return Object.entries(configured)
      .map(([name, entry]) => ({
        name,
        url: entry.type === "remote" ? entry.url : (entry.command ?? []).join(" "),
        enabled: entry.enabled !== false,
        entry,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  const setEnabled = async (name: string, entry: McpEntry, enabled: boolean) => {
    await serverSync()
      .updateConfig({ mcp: { [name]: { ...entry, enabled } } })
      .catch((error: unknown) =>
        showToast({
          variant: "error",
          title: language.t("common.requestFailed"),
          description: error instanceof Error ? error.message : String(error),
        }),
      )
  }

  const preset = (item: (typeof PRESETS)[number]) => {
    setForm({ name: item.id, url: item.url, hint: language.t(item.tokenHintKey) })
  }

  const add = async () => {
    const name = form.name.trim()
    const url = form.url.trim()
    if (!name || !url) return
    setForm("busy", true)
    try {
      // Written through the global config so the connector survives a restart.
      // The MCP add endpoint alone only registers it for the running process.
      await serverSync().updateConfig({
        mcp: {
          [name]: {
            type: "remote",
            url,
            enabled: true,
            ...(form.token.trim() ? { headers: { Authorization: `Bearer ${form.token.trim()}` } } : {}),
          },
        },
      })
      setForm({ name: "", url: "", token: "", hint: "" })
      showToast({ variant: "success", title: language.t("settings.connectors.added", { name }) })
    } catch (error) {
      showToast({
        variant: "error",
        title: language.t("common.requestFailed"),
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setForm("busy", false)
    }
  }

  return (
    <div class="settings-v2-section">
      <h3 class="settings-v2-section-title">{language.t("settings.connectors.title")}</h3>
      <p class="settings-v2-row-description">{language.t("settings.connectors.description")}</p>

      <Show
        when={servers().length > 0}
        fallback={<p class="settings-v2-row-description">{language.t("settings.connectors.empty")}</p>}
      >
        <SettingsListV2>
          <For each={servers()}>
            {(server) => (
              <div class="settings-v2-row">
                <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span class="settings-v2-row-title">{server.name}</span>
                  <span class="settings-v2-row-description truncate">{server.url}</span>
                </div>
                <Switch
                  checked={server.enabled}
                  onChange={(value) => void setEnabled(server.name, server.entry, value)}
                />
              </div>
            )}
          </For>
        </SettingsListV2>
      </Show>

      <h3 class="settings-v2-section-title">{language.t("settings.connectors.add.title")}</h3>
      <div class="flex flex-wrap gap-2 items-center mb-2">
        <span class="settings-v2-row-description">{language.t("settings.connectors.presets")}</span>
        <For each={PRESETS}>
          {(item) => (
            <Button type="button" size="small" variant="secondary" class="w-auto" onClick={() => preset(item)}>
              {item.label}
            </Button>
          )}
        </For>
      </div>
      <div class="flex flex-col gap-2 max-w-[420px]">
        <TextInputV2
          placeholder={language.t("settings.connectors.field.name")}
          value={form.name}
          onInput={(event) => setForm("name", event.currentTarget.value)}
        />
        <TextInputV2
          placeholder={language.t("settings.connectors.field.url")}
          value={form.url}
          onInput={(event) => setForm("url", event.currentTarget.value)}
        />
        <TextInputV2
          type="password"
          placeholder={language.t("settings.connectors.field.token")}
          value={form.token}
          onInput={(event) => setForm("token", event.currentTarget.value)}
        />
        <Show when={form.hint}>
          <p class="settings-v2-row-description">{form.hint}</p>
        </Show>
        <Button
          type="button"
          variant="primary"
          class="w-auto self-start"
          disabled={form.busy || !form.name || !form.url}
          onClick={add}
        >
          {language.t("settings.connectors.add.action")}
        </Button>
      </div>
    </div>
  )
}
