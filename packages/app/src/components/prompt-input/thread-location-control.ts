import { useNavigate, useSearchParams } from "@solidjs/router"
import { type Accessor, createEffect, createMemo, createSignal, on } from "solid-js"
import { useGlobal } from "@/context/global"
import { usePlatform } from "@/context/platform"
import type { usePrompt } from "@/context/prompt"
import { useSDK } from "@/context/sdk"
import { ServerConnection, useServer } from "@/context/server"
import { useServerSDK } from "@/context/server-sdk"
import { useSettings } from "@/context/settings"
import { useTabs } from "@/context/tabs"
import { legacySessionHref } from "@/utils/session-route"
import { showToast } from "@/utils/toast"
import { carryPrompt, locationID, moveThread, takeCarriedPrompt, threadLocations } from "@/utils/thread-location"
import { promptLength } from "./history"

/**
 * The composer's "where does this thread run" picker: this MacBook or the Mac mini.
 *
 * A new thread just runs wherever is picked. An existing thread is moved: its messages and
 * uncommitted edits go to the other machine and the old copy is archived. The classic layout
 * scopes the whole window (and the new-thread prompt draft) to one server, so there a switch
 * changes that server and carries the typed text along; the tabbed layout retargets one tab.
 */
export function createThreadLocationControl(input: {
  prompt: ReturnType<typeof usePrompt>
  sessionID: Accessor<string | undefined>
  working: Accessor<boolean>
}) {
  const global = useGlobal()
  const serverSdk = useServerSDK()
  const activeServer = useServer()
  const settings = useSettings()
  const threadTabs = useTabs()
  const sdk = useSDK()
  const platform = usePlatform()
  const navigate = useNavigate()
  const [search] = useSearchParams<{ draftId?: string }>()
  const [moving, setMoving] = createSignal(false)
  const here = () => serverSdk().server

  // Restore text carried across a switch once this server's own draft has loaded (the composer
  // may remount, or keep running with its prompt context swapped underneath it).
  createEffect(
    on(
      () => ServerConnection.key(here()),
      () => {
        if (input.sessionID()) return
        const carried = takeCarriedPrompt(sdk().directory)
        if (!carried) return
        void Promise.resolve(input.prompt.ready.promise).then(() => input.prompt.set(carried, promptLength(carried)))
      },
    ),
  )

  const locations = createMemo(() =>
    threadLocations({
      servers: global.servers.list(),
      health: global.servers.health,
      current: ServerConnection.key(here()),
    }),
  )
  const labelOf = (conn: ServerConnection.Any) =>
    locations().find((item) => item.id === locationID(conn))?.label ?? ServerConnection.key(conn)

  const select = async (id: string) => {
    const target = locations().find((item) => item.id === id)
    if (!target || target.id === locationID(here())) return
    const classic = !settings.general.newLayoutDesigns()
    const sessionID = input.sessionID()
    if (!sessionID) {
      if (!classic) {
        if (search.draftId) threadTabs.updateDraft(search.draftId, { server: target.key })
        return
      }
      carryPrompt(sdk().directory, input.prompt.current())
      activeServer.setActive(target.key)
      return
    }
    if (input.working()) {
      showToast({ title: "Stop the thread first", description: `It is still running on ${labelOf(here())}.` })
      return
    }
    if (moving()) return
    setMoving(true)
    const from = here()
    try {
      const result = await moveThread({
        sessionID,
        directory: sdk().directory,
        from,
        to: target.server,
        fetch: platform.fetch,
      })
      if (classic) {
        activeServer.setActive(target.key)
        navigate(legacySessionHref(result.directory, sessionID))
      } else {
        threadTabs.retargetSession(
          { server: ServerConnection.key(from), sessionId: sessionID },
          { server: target.key, sessionId: sessionID },
        )
      }
      showToast({
        title: `Moved to ${target.label}`,
        description:
          result.changes === "failed"
            ? `Your uncommitted edits stayed on ${labelOf(from)}: ${result.error ?? "they did not apply cleanly"}.`
            : result.changes === "applied"
              ? `Uncommitted edits came along${result.branch ? ` (branch ${result.branch})` : ""}.`
              : undefined,
      })
    } catch (error) {
      showToast({
        variant: "error",
        title: `Could not move to ${target.label}`,
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setMoving(false)
    }
  }

  return {
    /** Fewer than two places to run (no Mac mini configured, or no built-in server): no picker. */
    available: () => locations().length > 1,
    options: () => locations().map((item) => ({ id: item.id, label: item.label })),
    current: () => locationID(here()),
    label: () => labelOf(here()),
    select: (id: string) => void select(id),
    moving,
  }
}
