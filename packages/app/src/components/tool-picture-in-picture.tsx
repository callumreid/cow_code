import { Icon } from "@opencode-ai/ui/icon"
import { createEffect, createMemo, createSignal, on, Show, type Accessor } from "solid-js"
import { useServerSync } from "@/context/server-sync"
import { activeSurfacePreview, toolAction, type ToolSurface } from "./tool-picture-in-picture-model"

const SURFACE_LABEL: Record<ToolSurface, string> = {
  browser: "Browser",
  slack: "Slack",
  integration: "Integration",
}

const SURFACE_HINT: Record<ToolSurface, string> = {
  browser: "Working in the browser",
  slack: "Working with Slack",
  integration: "Working with a connected tool",
}

export function ToolPictureInPicture(props: {
  directory: Accessor<string>
  sessionID: Accessor<string | undefined>
  visible: Accessor<boolean>
}) {
  const sync = useServerSync()
  const [dismissed, setDismissed] = createSignal(false)
  const feed = createMemo(() => {
    const directory = props.directory()
    const sessionID = props.sessionID()
    if (!directory || !sessionID) return undefined
    const [store] = sync().child(directory, { bootstrap: false })
    return { sessionID, store }
  })
  const preview = createMemo(() => {
    const current = feed()
    if (!current) return undefined
    return activeSurfacePreview(
      current.store.message[current.sessionID] ?? [],
      (messageID) => current.store.part[messageID] ?? [],
    )
  })
  const working = () => {
    const current = feed()
    return current ? current.store.session_working(current.sessionID) : false
  }
  const status = () => {
    const value = preview()?.part.state.status
    if (value === "error") return "Failed"
    if (working() || value === "pending" || value === "running") return "Live"
    return "Done"
  }

  createEffect(
    on(
      () => preview()?.part.id,
      () => setDismissed(false),
      { defer: true },
    ),
  )

  return (
    <Show when={props.visible() && working() && preview() && !dismissed()}>
      <aside
        aria-label="Tool picture in picture"
        aria-live="polite"
        class="fixed bottom-5 end-5 z-[80] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border-base bg-surface-raised-stronger-non-alpha shadow-[var(--shadow-lg-border-base)]"
      >
        <div class="flex items-center gap-2 border-b border-border-weaker-base px-3 py-2">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-inset-base text-text-base">
            <Icon name="mcp" size="small" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="truncate text-13-medium text-text-strong">{SURFACE_LABEL[preview()!.surface]}</span>
              <span class="flex items-center gap-1 text-11-regular text-text-weak">
                <span
                  class="size-1.5 rounded-full"
                  classList={{
                    "animate-pulse bg-icon-info-base": status() === "Live",
                    "bg-icon-critical-base": status() === "Failed",
                    "bg-icon-success-base": status() === "Done",
                  }}
                />
                {status()}
              </span>
            </div>
            <div class="truncate text-11-regular text-text-weak">{toolAction(preview()!.part)}</div>
          </div>
          <button
            type="button"
            class="flex size-7 shrink-0 items-center justify-center rounded-md text-text-weak hover:bg-surface-base-hover hover:text-text-base"
            aria-label="Hide tool preview"
            title="Hide"
            onClick={() => setDismissed(true)}
          >
            <Icon name="close-small" size="small" />
          </button>
        </div>
        <Show
          when={preview()!.image}
          fallback={
            <div class="flex aspect-video flex-col items-center justify-center gap-2 bg-surface-inset-base px-6 text-center">
              <Icon name="mcp" class="size-8 text-text-weak" />
              <span class="text-13-regular text-text-base">{SURFACE_HINT[preview()!.surface]}</span>
            </div>
          }
        >
          {(image) => (
            <div class="aspect-video bg-surface-inset-base">
              <img src={image().url} alt="Latest tool screenshot" class="size-full object-contain" draggable={false} />
            </div>
          )}
        </Show>
      </aside>
    </Show>
  )
}
