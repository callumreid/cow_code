import type { Session, SessionStatus } from "@opencode-ai/sdk/v2/client"
import { Spinner } from "@opencode-ai/ui/spinner"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { createMemo, Show, type JSX } from "solid-js"
import { createSessionActivityText } from "@opencode-ai/session-ui/session-status-line"
import { useServerSync } from "@/context/server-sync"
import { deriveSessionActivity } from "@/pages/session/session-activity"

const idle: SessionStatus = { type: "idle" }

// Sidebar spinner for a working session, with a phase + elapsed tooltip ("Running bash… 34s").
// Mounted only while the session is working so the shared 1s ticker stays idle otherwise.
export function SidebarSessionActivitySpinner(props: { session: Session; mobile?: boolean }): JSX.Element {
  const serverSync = useServerSync()
  const status = createMemo(() => serverSync().session.data.session_status[props.session.id] ?? idle)
  const activity = createMemo(() =>
    deriveSessionActivity({
      status: status(),
      messages: serverSync().session.data.message[props.session.id] ?? [],
      parts: (messageID) => serverSync().session.data.part[messageID] ?? [],
    }),
  )
  const text = createSessionActivityText({ activity, status })
  const spinner = () => <Spinner class="size-[15px]" />

  return (
    <Show when={text.full()} fallback={spinner()}>
      {(value) => (
        <Tooltip value={value()} placement={props.mobile ? "bottom" : "right"} gutter={10}>
          {spinner()}
        </Tooltip>
      )}
    </Show>
  )
}
