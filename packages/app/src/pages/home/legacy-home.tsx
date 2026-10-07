import { DialogSelectServer } from "@/components/dialog-select-server"
import { useDirectoryPicker } from "@/components/directory-picker"
import { useGlobal } from "@/context/global"
import { useLanguage } from "@/context/language"
import { type ServerConnection, useServer } from "@/context/server"
import { useServerSync } from "@/context/server-sync"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { getFilename } from "@opencode-ai/core/util/path"
import { Button } from "@opencode-ai/ui/button"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Icon } from "@opencode-ai/ui/icon"
import { Logo } from "@opencode-ai/ui/logo"
import { useNavigate } from "@solidjs/router"
import { DateTime } from "luxon"
import { createMemo, For, Match, Switch } from "solid-js"
import "./legacy-home.css"

export function LegacyHome() {
  const sync = useServerSync()
  const pickDirectory = useDirectoryPicker()
  const dialog = useDialog()
  const navigate = useNavigate()
  const global = useGlobal()
  const server = useServer()
  const language = useLanguage()
  const homedir = createMemo(() => sync().data.path.home)
  const serverUnreachable = createMemo(() => global.servers.health[server.key]?.healthy === false)
  const recent = createMemo(() => {
    return sync()
      .data.project.slice()
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))
      .slice(0, 5)
  })

  const serverDotClass = createMemo(() => {
    const healthy = global.servers.health[server.key]?.healthy
    if (healthy === true) return "bg-icon-success-base"
    if (healthy === false) return "bg-icon-critical-base"
    return "bg-border-weak-base"
  })

  function openProject(conn: ServerConnection.Any, directory: string) {
    const serverCtx = global.ensureServerCtx(conn)
    serverCtx.projects.open(directory)
    serverCtx.projects.touch(directory)
    navigate(`/${base64Encode(directory)}`)
  }

  function chooseProject() {
    if (serverUnreachable()) return
    const conn = server.current
    if (!conn) return

    const resolve = (result: string | string[] | null) => {
      if (Array.isArray(result)) {
        result.forEach((directory) => openProject(conn, directory))
        return
      }
      if (result) openProject(conn, result)
    }

    pickDirectory({
      server: conn,
      title: language.t("command.project.open"),
      multiple: true,
      onSelect: resolve,
    })
  }

  return (
    <div data-component="legacy-home" class="mx-auto w-full px-6">
      <div data-component="cow-brand" class="mx-auto w-64 max-w-full">
        <Logo class="w-full" />
      </div>
      <Button
        size="large"
        variant="ghost"
        class="mt-4 mx-auto text-14-regular text-text-weak"
        onClick={() => dialog.show(() => <DialogSelectServer />)}
      >
        <div
          classList={{
            "size-2 rounded-full": true,
            [serverDotClass()]: true,
          }}
        />
        {server.name}
      </Button>
      <Switch>
        <Match when={sync().data.project.length > 0}>
          <div class="mt-10 w-full flex flex-col gap-3">
            <div class="flex flex-wrap gap-3 items-center justify-between px-1">
              <div class="text-14-medium text-text-strong">{language.t("home.recentProjects")}</div>
              <Button
                icon="folder-add-left"
                size="normal"
                class="pl-2 pr-3"
                disabled={serverUnreachable()}
                onClick={chooseProject}
              >
                {language.t("command.project.open")}
              </Button>
            </div>
            <ul class="flex flex-col gap-1">
              <For each={recent()}>
                {(project) => (
                  <li>
                    <Button
                      size="large"
                      variant="ghost"
                      class="home-project-row w-full text-left px-3"
                      onClick={() => openProject(server.current!, project.worktree)}
                    >
                      <Icon name="folder" size="normal" class="shrink-0 text-icon-weak" />
                      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span class="text-14-medium text-text-strong truncate">
                          {project.name || getFilename(project.worktree)}
                        </span>
                        <span class="text-12-regular text-text-weak truncate" title={project.worktree}>
                          {project.worktree.replace(homedir(), "~")}
                        </span>
                      </span>
                      <span class="text-12-regular text-text-weak shrink-0">
                        {DateTime.fromMillis(project.time.updated ?? project.time.created).toRelative()}
                      </span>
                    </Button>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Match>
        <Match when={!sync().ready}>
          <div class="mt-10 mx-auto flex flex-col items-center gap-3" role="status">
            <div class="text-12-regular text-text-weak">{language.t("common.loading")}</div>
            <Button class="px-3" disabled={serverUnreachable()} onClick={chooseProject}>
              {language.t("command.project.open")}
            </Button>
          </div>
        </Match>
        <Match when={true}>
          <div class="mt-10 mx-auto flex flex-col items-center gap-3">
            <Icon name="folder-add-left" size="large" />
            <div class="flex flex-col gap-1 items-center justify-center">
              <div class="text-14-medium text-text-strong">{language.t("home.empty.title")}</div>
              <div class="text-12-regular text-text-weak">{language.t("home.empty.description")}</div>
            </div>
            <Button class="px-3 mt-1" disabled={serverUnreachable()} onClick={chooseProject}>
              {language.t("command.project.open")}
            </Button>
          </div>
        </Match>
      </Switch>
    </div>
  )
}
