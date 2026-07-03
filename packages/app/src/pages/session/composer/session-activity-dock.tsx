import { createMemo, Show, type Accessor } from "solid-js"
import type { SessionStatus } from "@opencode-ai/sdk/v2/client"
import { SessionStatusLine } from "@opencode-ai/session-ui/session-status-line"
import { useSync } from "@/context/sync"
import { deriveSessionActivity } from "@/pages/session/session-activity"

const idle: SessionStatus = { type: "idle" }

export function SessionActivityDock(props: { sessionID: Accessor<string | undefined> }) {
  const sync = useSync()
  const status = createMemo(() => {
    const id = props.sessionID()
    if (!id) return idle
    return sync().data.session_status[id] ?? idle
  })
  const activity = createMemo(() => {
    const id = props.sessionID()
    if (!id) return
    return deriveSessionActivity({
      status: status(),
      messages: sync().data.message[id] ?? [],
      parts: (messageID) => sync().data.part[messageID] ?? [],
    })
  })

  return (
    <Show when={activity()}>
      {(current) => (
        <div data-component="session-activity-dock" class="px-1 pb-2 text-14-regular">
          <SessionStatusLine activity={current()} status={status()} />
        </div>
      )}
    </Show>
  )
}
