import type { Session } from "@opencode-ai/sdk/v2/client"
import { Avatar } from "@opencode-ai/ui/avatar"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { Icon as IconV2 } from "@opencode-ai/ui/v2/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { InlineInput } from "@opencode-ai/ui/inline-input"
import { Spinner } from "@opencode-ai/ui/spinner"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { getFilename } from "@opencode-ai/core/util/path"
import { A, useParams } from "@solidjs/router"
import { type Accessor, createMemo, For, type JSX, Match, Show, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { useServerSDK } from "@/context/server-sdk"
import { useServerSync } from "@/context/server-sync"
import { useLanguage } from "@/context/language"
import { getAvatarColors, type LocalProject, useLayout } from "@/context/layout"
import { useNotification } from "@/context/notification"
import { usePermission } from "@/context/permission"
import { messageAgentColor } from "@/utils/agent"
import { sessionTitle } from "@/utils/session-title"
import { showToast } from "@/utils/toast"
import { sessionPermissionRequest } from "../session/composer/session-request-tree"
import { childSessionOnPath, errorMessage, getProjectAvatarSource, hasProjectPermissions } from "./helpers"
import { SidebarSessionActivitySpinner } from "./sidebar-session-activity"

export const ProjectIcon = (props: {
  project: LocalProject
  class?: string
  notify?: boolean
  working?: boolean
}): JSX.Element => {
  const serverSync = useServerSync()
  const notification = useNotification()
  const permission = usePermission()
  const dirs = createMemo(() => [props.project.worktree, ...(props.project.sandboxes ?? [])])
  const unseenCount = createMemo(() =>
    dirs().reduce((total, directory) => total + notification.project.unseenCount(directory), 0),
  )
  const hasError = createMemo(() => dirs().some((directory) => notification.project.unseenHasError(directory)))
  const hasPermissions = createMemo(() =>
    dirs().some((directory) => {
      return hasProjectPermissions(serverSync().session.data.permission, (item) => {
        if (serverSync().session.get(item.sessionID)?.directory !== directory) return false
        return !permission.autoResponds(item, directory)
      })
    }),
  )
  const notify = createMemo(() => props.notify && (hasPermissions() || unseenCount() > 0))
  const name = createMemo(() => props.project.name || getFilename(props.project.worktree))

  return (
    <div class={`relative size-8 shrink-0 rounded ${props.class ?? ""}`}>
      <div class="size-full rounded overflow-clip">
        <Avatar
          fallback={name()}
          src={getProjectAvatarSource(props.project.id, props.project.icon)}
          {...getAvatarColors(props.project.icon?.color)}
          class="size-full rounded"
          classList={{ "badge-mask": notify() }}
        />
      </div>
      <Show when={notify()}>
        <div
          classList={{
            "absolute top-px right-px size-1.5 rounded-full z-10": true,
            "bg-surface-warning-strong": hasPermissions(),
            "bg-icon-critical-base": !hasPermissions() && hasError(),
            "bg-text-interactive-base": !hasPermissions() && !hasError(),
          }}
        />
      </Show>
      <Show when={props.working}>
        <div class="absolute bottom-px right-px size-3 rounded-full bg-background-base z-10 flex items-center justify-center">
          <Spinner class="size-[9px]" />
        </div>
      </Show>
    </div>
  )
}

export type SessionItemProps = {
  session: Session
  list: Session[]
  navList?: Accessor<Session[]>
  slug: string
  mobile?: boolean
  dense?: boolean
  showTooltip?: boolean
  showChild?: boolean
  level?: number
  sidebarExpanded: Accessor<boolean>
  clearHoverProjectSoon: () => void
  prefetchSession: (session: Session, priority?: "high" | "low") => void
  archiveSession: (session: Session) => Promise<void>
}

const SessionRow = (props: {
  session: Session
  slug: string
  mobile?: boolean
  dense?: boolean
  tint: Accessor<string | undefined>
  isWorking: Accessor<boolean>
  hasPermissions: Accessor<boolean>
  hasError: Accessor<boolean>
  unseenCount: Accessor<number>
  clearHoverProjectSoon: () => void
  sidebarOpened: Accessor<boolean>
  warmPress: () => void
  warmFocus: () => void
}): JSX.Element => {
  const title = () => sessionTitle(props.session.title)

  return (
    <A
      href={`/${props.slug}/session/${props.session.id}`}
      class={`flex items-center gap-2 min-w-0 w-full text-left focus:outline-none ${props.dense ? "py-0.5" : "py-1"}`}
      onPointerDown={props.warmPress}
      onFocus={props.warmFocus}
      onClick={() => {
        if (props.sidebarOpened()) return
        props.clearHoverProjectSoon()
      }}
    >
      <Show when={props.isWorking() || props.hasPermissions() || props.hasError() || props.unseenCount() > 0}>
        <div
          class="shrink-0 size-6 flex items-center justify-center"
          style={{ color: props.tint() ?? "var(--icon-interactive-base)" }}
        >
          <Switch>
            <Match when={props.isWorking()}>
              <SidebarSessionActivitySpinner session={props.session} mobile={props.mobile} />
            </Match>
            <Match when={props.hasPermissions()}>
              <div class="size-1.5 rounded-full bg-surface-warning-strong" />
            </Match>
            <Match when={props.hasError()}>
              <div class="size-1.5 rounded-full bg-text-diff-delete-base" />
            </Match>
            <Match when={props.unseenCount() > 0}>
              <div class="size-1.5 rounded-full bg-text-interactive-base" />
            </Match>
          </Switch>
        </div>
      </Show>
      <span class="text-14-regular text-text-strong min-w-0 flex-1 truncate">{title()}</span>
    </A>
  )
}

export const SessionItem = (props: SessionItemProps): JSX.Element => {
  const params = useParams()
  const layout = useLayout()
  const language = useLanguage()
  const notification = useNotification()
  const permission = usePermission()
  const serverSDK = useServerSDK()
  const serverSync = useServerSync()
  const [menu, setMenu] = createStore({ open: false, pendingRename: false, renaming: false, title: "" })

  const reportError = (error: unknown) =>
    showToast({
      title: language.t("common.requestFailed"),
      description: errorMessage(error, language.t("common.requestFailed")),
    })

  const saveRename = () => {
    const next = menu.title.trim()
    setMenu("renaming", false)
    if (!next || next === props.session.title) return
    serverSDK()
      .client.session.update({ directory: props.session.directory, sessionID: props.session.id, title: next })
      .catch(reportError)
  }

  const togglePinned = () => {
    serverSDK()
      .client.session.update({
        directory: props.session.directory,
        sessionID: props.session.id,
        time: { pinned: props.session.time.pinned ? 0 : Date.now() },
      })
      .catch(reportError)
  }
  const unseenCount = createMemo(() => notification.session.unseenCount(props.session.id))
  const hasError = createMemo(() => notification.session.unseenHasError(props.session.id))
  const [sessionStore] = serverSync().child(props.session.directory)
  const hasPermissions = createMemo(() => {
    return !!sessionPermissionRequest(
      sessionStore.session,
      serverSync().session.data.permission,
      props.session.id,
      (item) => {
        return !permission.autoResponds(item, props.session.directory)
      },
    )
  })
  const isWorking = createMemo(() => {
    if (hasPermissions()) return false
    return serverSync().session.data.session_working(props.session.id)
  })

  const tint = createMemo(() =>
    messageAgentColor(serverSync().session.data.message[props.session.id], sessionStore.agent),
  )
  const tooltip = createMemo(() => props.showTooltip ?? (props.mobile || !props.sidebarExpanded()))
  const currentChild = createMemo(() => {
    if (!props.showChild) return
    return childSessionOnPath(sessionStore.session, props.session.id, params.id)
  })

  const warm = (span: number, priority: "high" | "low") => {
    const nav = props.navList?.()
    const list = nav?.some((item) => item.id === props.session.id && item.directory === props.session.directory)
      ? nav
      : props.list

    props.prefetchSession(props.session, priority)

    const idx = list.findIndex((item) => item.id === props.session.id && item.directory === props.session.directory)
    if (idx === -1) return

    for (let step = 1; step <= span; step++) {
      const next = list[idx + step]
      if (next) props.prefetchSession(next, step === 1 ? "high" : priority)

      const prev = list[idx - step]
      if (prev) props.prefetchSession(prev, step === 1 ? "high" : priority)
    }
  }

  const item = (
    <SessionRow
      session={props.session}
      slug={props.slug}
      mobile={props.mobile}
      dense={props.dense}
      tint={tint}
      isWorking={isWorking}
      hasPermissions={hasPermissions}
      hasError={hasError}
      unseenCount={unseenCount}
      clearHoverProjectSoon={props.clearHoverProjectSoon}
      sidebarOpened={layout.sidebar.opened}
      warmPress={() => warm(2, "high")}
      warmFocus={() => warm(2, "high")}
    />
  )

  return (
    <>
      <div
        data-session-id={props.session.id}
        class="group/session relative w-full min-w-0 rounded-md cursor-default pr-3 transition-colors hover:bg-surface-raised-base-hover [&:has(:focus-visible)]:bg-surface-raised-base-hover has-[[data-expanded]]:bg-surface-raised-base-hover has-[.active]:bg-surface-base-active"
        style={{ "padding-left": `${8 + (props.level ?? 0) * 16}px` }}
        onContextMenu={(event) => {
          if (props.level) return
          event.preventDefault()
          setMenu("open", true)
        }}
      >
        <div class="flex min-w-0 items-center gap-1">
          <div class="min-w-0 flex-1">
            <Show
              when={!menu.renaming}
              fallback={
                <InlineInput
                  ref={(el) =>
                    requestAnimationFrame(() => {
                      if (!el.isConnected) return
                      el.focus()
                      el.select()
                    })
                  }
                  value={menu.title}
                  class={`w-full text-14-regular text-text-strong ${props.dense ? "my-0.5" : "my-1"}`}
                  onInput={(event) => setMenu("title", event.currentTarget.value)}
                  onKeyDown={(event) => {
                    event.stopPropagation()
                    if (event.key === "Enter") {
                      event.preventDefault()
                      saveRename()
                    }
                    if (event.key !== "Escape") return
                    event.preventDefault()
                    setMenu("renaming", false)
                  }}
                  onBlur={() => setMenu("renaming", false)}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                />
              }
            >
              <Show
                when={!tooltip()}
                fallback={
                  <Tooltip
                    placement={props.mobile ? "bottom" : "right"}
                    value={sessionTitle(props.session.title)}
                    gutter={10}
                    class="min-w-0 w-full"
                  >
                    {item}
                  </Tooltip>
                }
              >
                {item}
              </Show>
            </Show>
          </div>

          <Show when={!props.level}>
            <div
              class="shrink-0 overflow-hidden transition-[width,opacity]"
              classList={{
                "w-6 opacity-100 pointer-events-auto": !!props.mobile || menu.open,
                "w-0 opacity-0 pointer-events-none": !props.mobile && !menu.open,
                "group-hover/session:w-6 group-hover/session:opacity-100 group-hover/session:pointer-events-auto": true,
                "group-focus-within/session:w-6 group-focus-within/session:opacity-100 group-focus-within/session:pointer-events-auto": true,
              }}
            >
              <DropdownMenu modal={false} open={menu.open} onOpenChange={(open) => setMenu("open", open)}>
                <Tooltip value={language.t("common.moreOptions")} placement="top">
                  <DropdownMenu.Trigger
                    as={IconButton}
                    icon="dot-grid"
                    variant="ghost"
                    class="size-6 rounded-md"
                    data-action="session-menu"
                    aria-label={language.t("common.moreOptions")}
                  />
                </Tooltip>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    onCloseAutoFocus={(event) => {
                      if (!menu.pendingRename) return
                      event.preventDefault()
                      setMenu({ pendingRename: false, renaming: true, title: props.session.title })
                    }}
                  >
                    <DropdownMenu.Item onSelect={() => setMenu({ pendingRename: true, open: false })}>
                      <DropdownMenu.ItemLabel>{language.t("common.rename")}</DropdownMenu.ItemLabel>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={togglePinned}>
                      <DropdownMenu.ItemLabel>
                        {props.session.time.pinned ? language.t("common.unpin") : language.t("common.pin")}
                      </DropdownMenu.ItemLabel>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => void props.archiveSession(props.session)}>
                      <DropdownMenu.ItemLabel>{language.t("common.archive")}</DropdownMenu.ItemLabel>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu>
            </div>
          </Show>
        </div>
      </div>
      <Show when={currentChild()} keyed>
        {(child) => (
          <div class="w-full">
            <SessionItem {...props} session={child} level={(props.level ?? 0) + 1} />
          </div>
        )}
      </Show>
    </>
  )
}

export const NewSessionItem = (props: {
  slug: string
  mobile?: boolean
  dense?: boolean
  sidebarExpanded: Accessor<boolean>
  clearHoverProjectSoon: () => void
}): JSX.Element => {
  const layout = useLayout()
  const language = useLanguage()
  const label = language.t("command.session.new")
  const tooltip = () => props.mobile || !props.sidebarExpanded()
  const item = (
    <A
      href={`/${props.slug}/session`}
      end
      class={`flex items-center gap-2 min-w-0 w-full text-left focus:outline-none ${props.dense ? "py-0.5" : "py-1"}`}
      onClick={() => {
        if (layout.sidebar.opened()) return
        props.clearHoverProjectSoon()
      }}
    >
      <div class="shrink-0 size-6 flex items-center justify-center">
        <IconV2 name="edit" size="small" class="text-icon-weak" />
      </div>
      <span class="text-14-regular text-text-strong min-w-0 flex-1 truncate">{label}</span>
    </A>
  )

  return (
    <div class="group/session relative w-full min-w-0 rounded-md cursor-default transition-colors pl-2 pr-3 hover:bg-surface-raised-base-hover [&:has(:focus-visible)]:bg-surface-raised-base-hover has-[.active]:bg-surface-base-active">
      <Show
        when={!tooltip()}
        fallback={
          <Tooltip placement={props.mobile ? "bottom" : "right"} value={label} gutter={10} class="min-w-0 w-full">
            {item}
          </Tooltip>
        }
      >
        {item}
      </Show>
    </div>
  )
}

export const SessionSkeleton = (props: { count?: number }): JSX.Element => {
  const items = Array.from({ length: props.count ?? 4 }, (_, index) => index)
  return (
    <div class="flex flex-col gap-1">
      <For each={items}>
        {() => <div class="h-8 w-full rounded-md bg-surface-raised-base opacity-60 animate-pulse" />}
      </For>
    </div>
  )
}
