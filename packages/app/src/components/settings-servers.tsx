import { Show, type Component } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { DialogRemoteAccess } from "./dialog-remote-access"
import { ServerConnectionForm, ServerConnectionList, useServerManagementController } from "./dialog-select-server"

export const SettingsServers: Component = () => {
  const dialog = useDialog()
  const language = useLanguage()
  const platform = usePlatform()
  const controller = useServerManagementController()

  return (
    <div class="flex flex-col h-full overflow-y-auto no-scrollbar px-4 pb-10 sm:px-10 sm:pb-10">
      <div class="flex flex-col flex-1 min-h-0 max-w-[720px]">
        <Show
          when={controller.isFormMode()}
          fallback={
            <>
              <div class="sticky top-0 z-10 bg-[linear-gradient(to_bottom,var(--surface-stronger-non-alpha)_calc(100%_-_24px),transparent)]">
                <div class="flex items-center justify-between gap-4 pt-6 pb-8">
                  <h2 class="text-16-medium text-text-strong">{language.t("status.popover.tab.servers")}</h2>
                  <Show when={platform.setRemoteAccess}>
                    <Button
                      variant="secondary"
                      onClick={() => dialog.push(() => <DialogRemoteAccess />)}
                      class="px-3 py-1.5"
                    >
                      {language.t("dialog.remoteAccess.title")}
                    </Button>
                  </Show>
                </div>
              </div>
              <ServerConnectionList controller={controller} />
            </>
          }
        >
          <div class="flex flex-1 min-h-0 flex-col gap-4 pt-6">
            <div class="text-16-medium text-text-strong">{controller.formTitle()}</div>
            <ServerConnectionForm controller={controller} />
          </div>
        </Show>
      </div>
    </div>
  )
}
