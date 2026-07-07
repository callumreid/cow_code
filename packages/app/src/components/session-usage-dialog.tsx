import { createMemo, For, Show } from "solid-js"
import { Dialog as DialogV2, DialogBody, DialogHeader, DialogTitleGroup } from "@opencode-ai/ui/v2/dialog-v2"
import { ScrollView } from "@opencode-ai/ui/scroll-view"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"
import { useSync } from "@/context/sync"
import { getSessionsUsage } from "@/components/session/session-context-metrics"

// Aggregate cost/token usage across the loaded sessions in the current project.
// Per-session detail already lives in the context pill/tab; this fills the gap
// of a project-wide total reachable from the command palette.
function UsageDialog() {
  const language = useLanguage()
  const sync = useSync()
  const usd = createMemo(() => new Intl.NumberFormat(language.intl(), { style: "currency", currency: "USD" }))
  const aggregate = createMemo(() => getSessionsUsage(sync().data.session))
  const total = createMemo(() => sync().data.sessionTotal ?? aggregate().count)
  const rows = createMemo(() =>
    aggregate()
      .rows.slice()
      .sort((a, b) => b.cost - a.cost || b.updated - a.updated),
  )
  const number = (value: number) => value.toLocaleString(language.intl())

  return (
    <DialogV2 size="large" variant="settings">
      <DialogHeader hideClose={true} closeLabel={language.t("common.close")}>
        <DialogTitleGroup title={language.t("usage.title")} description={language.t("usage.perSession")} />
      </DialogHeader>
      <DialogBody class="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <div class="flex gap-6">
          <div class="flex flex-col">
            <span class="text-11-regular text-text-weak">{language.t("usage.totalCost")}</span>
            <span class="text-18-medium text-text-strong tabular-nums">{usd().format(aggregate().totalCost)}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-11-regular text-text-weak">{language.t("usage.totalTokens")}</span>
            <span class="text-18-medium text-text-strong tabular-nums">{number(aggregate().totalTokens)}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-11-regular text-text-weak">{language.t("usage.sessions")}</span>
            <span class="text-18-medium text-text-strong tabular-nums">{number(aggregate().count)}</span>
          </div>
        </div>
        <Show when={aggregate().count < total()}>
          <div class="text-11-regular text-text-weak">
            {language.t("usage.partial", { loaded: number(aggregate().count), total: number(total()) })}
          </div>
        </Show>
        <Show
          when={rows().length > 0}
          fallback={<div class="py-8 text-center text-12-regular text-text-weak">{language.t("usage.empty")}</div>}
        >
          <ScrollView class="min-h-0 flex-1">
            <div class="flex flex-col">
              <For each={rows()}>
                {(row) => (
                  <div class="flex items-center gap-3 py-1.5 border-b border-border-weaker-base">
                    <span class="min-w-0 flex-1 truncate text-12-regular text-text-base">
                      {row.title || row.id}
                      <Show when={row.isChild}>
                        <span class="ml-1.5 rounded px-1 py-px text-10-regular text-text-weak bg-surface-base">
                          {language.t("usage.subagentTag")}
                        </span>
                      </Show>
                    </span>
                    <span class="shrink-0 w-20 text-right tabular-nums text-12-regular text-text-weak">
                      {number(row.tokens)}
                    </span>
                    <span class="shrink-0 w-16 text-right tabular-nums text-12-medium text-text-base">
                      {usd().format(row.cost)}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </ScrollView>
        </Show>
      </DialogBody>
    </DialogV2>
  )
}

export function useUsageDialog() {
  const dialog = useDialog()
  return () => void dialog.show(() => <UsageDialog />)
}

export function useUsageCommand() {
  const command = useCommand()
  const language = useLanguage()
  const show = useUsageDialog()

  command.register("usage", () => [
    {
      id: "usage.open",
      title: language.t("command.usage.open"),
      category: language.t("command.category.session"),
      keybind: "mod+shift+u",
      onSelect: show,
    },
  ])

  return show
}
