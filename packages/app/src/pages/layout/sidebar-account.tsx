import { Show, type Accessor, type JSX } from "solid-js"
import { Avatar } from "@opencode-ai/ui/avatar"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { Icon } from "@opencode-ai/ui/icon"
import { getAvatarColors } from "@/context/layout"

// Sits at the bottom of the sidebar panel and owns everything that used to live in the rail's
// footer, so settings and help hang off the signed-in name instead of floating as loose icons.
export const AccountMenu = (props: {
  name: Accessor<string>
  version: Accessor<string | undefined>
  settingsLabel: Accessor<string>
  settingsKeybind: Accessor<string | undefined>
  onOpenSettings: () => void
  helpLabel: Accessor<string>
  onOpenHelp: () => void
}): JSX.Element => (
  <DropdownMenu placement="top-start" gutter={8}>
    <DropdownMenu.Trigger
      data-component="sidebar-account"
      class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-surface-base-hover data-[expanded]:bg-surface-base-active"
      aria-label={props.name()}
    >
      <Avatar fallback={props.name()} size="small" {...getAvatarColors("purple")} />
      <span class="min-w-0 flex-1 truncate text-14-medium text-text-strong">{props.name()}</span>
      <Icon name="chevron-grabber-vertical" size="small" class="shrink-0 text-icon-weak" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content class="w-[232px]">
        <div class="flex items-center gap-2 px-2 py-1.5">
          <Avatar fallback={props.name()} size="large" {...getAvatarColors("purple")} />
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-14-medium text-text-strong">{props.name()}</span>
            <Show when={props.version()}>
              {(version) => <span class="truncate text-12-regular text-text-weak">v{version()}</span>}
            </Show>
          </div>
        </div>
        <DropdownMenu.Separator />
        <DropdownMenu.Item data-action="account-settings" onSelect={props.onOpenSettings}>
          <Icon name="settings-gear" size="small" class="shrink-0 text-icon-weak" />
          <DropdownMenu.ItemLabel>{props.settingsLabel()}</DropdownMenu.ItemLabel>
          <Show when={props.settingsKeybind()}>
            {(keybind) => <span class="shrink-0 text-12-medium text-text-weak">{keybind()}</span>}
          </Show>
        </DropdownMenu.Item>
        <DropdownMenu.Item data-action="account-help" onSelect={props.onOpenHelp}>
          <Icon name="help" size="small" class="shrink-0 text-icon-weak" />
          <DropdownMenu.ItemLabel>{props.helpLabel()}</DropdownMenu.ItemLabel>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu>
)
