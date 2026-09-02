import { createMemo, createSignal, For, Show, type JSX } from "solid-js"
import { makeEventListener } from "@solid-primitives/event-listener"
import { Icon, type IconProps } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { usePlatform } from "@/context/platform"
import type { PrDashboardStore } from "@/pr-dashboard/store"
import type { MergedPullRequest, OpenPullRequest, PrState } from "@/pr-dashboard/types"

type Tone = "ready" | "blocked" | "muted" | "attention"

const STATE_META: Record<PrState, { label: string; icon: IconProps["name"]; tone: Tone }> = {
  ready: { label: "Ready to merge", icon: "circle-check", tone: "ready" },
  draft: { label: "Draft", icon: "pencil-line", tone: "muted" },
  "changes-requested": { label: "Changes requested", icon: "warning", tone: "blocked" },
  "checks-failing": { label: "Checks not green", icon: "warning", tone: "blocked" },
  unresolved: { label: "Unresolved comments", icon: "comment", tone: "attention" },
  "awaiting-review": { label: "Awaiting review", icon: "review", tone: "attention" },
}

const TONE_CLASS: Record<Tone, string> = {
  ready: "text-icon-success-base",
  blocked: "text-icon-critical-base",
  attention: "text-surface-warning-strong",
  muted: "text-text-base",
}

function relativeTime(iso: string, now: number) {
  const diff = now - Date.parse(iso)
  if (!Number.isFinite(diff)) return ""
  const day = 86_400_000
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < day) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / day)}d`
}

/** The one-line reason a PR is not mergeable, or nothing when it is. */
function detail(pr: OpenPullRequest) {
  const parts: string[] = []
  if (pr.unresolvedCount > 0) parts.push(`${pr.unresolvedCount} unresolved`)
  if (pr.checks === "failure") parts.push("CI failing")
  else if (pr.checks === "pending") parts.push("CI running")
  if (pr.review === "review-required") parts.push("needs approval")
  else if (pr.review === "changes-requested") parts.push("changes requested")
  return parts.join(" · ")
}

const OpenRow = (props: { pr: OpenPullRequest; now: number; onOpen: (url: string) => void }) => {
  const meta = createMemo(() => STATE_META[props.pr.state])
  const sub = createMemo(() => detail(props.pr))
  return (
    <button
      type="button"
      onClick={() => props.onOpen(props.pr.url)}
      class="group/pr w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-base-hover"
    >
      <span class="flex items-center gap-2 w-44 shrink-0">
        <Icon name={meta().icon} size="small" class={TONE_CLASS[meta().tone]} />
        <span class={`text-12-regular truncate ${TONE_CLASS[meta().tone]}`}>{meta().label}</span>
      </span>
      <span class="text-12-regular text-text-base shrink-0">#{props.pr.number}</span>
      <span class="text-14-medium text-text-strong truncate flex-1 min-w-0">{props.pr.title}</span>
      <Show when={sub()}>
        <span class="text-12-regular text-text-base shrink-0 truncate max-w-64">{sub()}</span>
      </Show>
      <Tooltip placement="top" gutter={2} value={`Opened ${relativeTime(props.pr.createdAt, props.now)} ago`}>
        <span class="text-12-regular text-text-base shrink-0 w-10 text-end">
          {relativeTime(props.pr.createdAt, props.now)}
        </span>
      </Tooltip>
      <Icon
        name="chevron-right"
        size="small"
        class="text-text-base opacity-0 group-hover/pr:opacity-100 transition-opacity motion-reduce:transition-none"
      />
    </button>
  )
}

const MergedRow = (props: { pr: MergedPullRequest; now: number; onOpen: (url: string) => void }) => (
  <button
    type="button"
    onClick={() => props.onOpen(props.pr.url)}
    class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-base-hover"
  >
    <span class="flex items-center gap-2 w-44 shrink-0">
      <Icon name="fork" size="small" class="text-text-base" />
      <span class="text-12-regular text-text-base truncate">{props.pr.repo}</span>
    </span>
    <span class="text-12-regular text-text-base shrink-0">#{props.pr.number}</span>
    <span class="text-14-regular text-text-base truncate flex-1 min-w-0">{props.pr.title}</span>
    <span class="text-12-regular text-text-base shrink-0 w-10 text-end">
      {relativeTime(props.pr.mergedAt, props.now)}
    </span>
  </button>
)

/**
 * Full-width pull-request dashboard, rendered over the session area.
 *
 * The sidebar only carries the launcher row, so this is where every PR is
 * listed: open ones grouped by repo, oldest-first so the stalest work is at the
 * top, then the trailing 30 days of merges once that section is opened.
 */
export const PullRequestsPanel = (props: { store: PrDashboardStore; onClose: () => void }): JSX.Element => {
  const platform = usePlatform()
  const [mergedSection, setMergedSection] = createSignal(false)
  const [now, setNow] = createSignal(Date.now())

  const data = props.store.data
  const openExternal = (url: string) => {
    setNow(Date.now())
    platform.openExternal(url)
  }

  makeEventListener(document, "keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    props.onClose()
  })

  return (
    <div class="flex flex-col size-full bg-background-base">
      <div class="shrink-0 border-b border-border-weak-base">
        <div class="mx-auto w-full max-w-[960px] px-6">
          <div class="flex items-center gap-3 px-3 py-4">
            <Icon name="fork" class="text-text-base" />
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-16-medium text-text-strong">Pull requests</span>
              <Show when={data()} fallback={<span class="text-12-regular text-text-base">Loading…</span>}>
                <span class="text-12-regular text-text-base">
                  {data()!.openCount} open
                  <Show when={data()!.readyCount > 0}>
                    <span class="text-icon-success-base"> · {data()!.readyCount} ready to merge</span>
                  </Show>
                </span>
              </Show>
            </div>
            <Tooltip placement="bottom" gutter={2} value="Refresh pull requests">
              <IconButton
                icon="reset"
                variant="ghost"
                aria-label="Refresh pull requests"
                disabled={props.store.loading()}
                onClick={() => {
                  setNow(Date.now())
                  props.store.refresh(true)
                  if (mergedSection()) props.store.loadMerged(true)
                }}
              />
            </Tooltip>
            <Tooltip placement="bottom" gutter={2} value="Close">
              <IconButton
                icon="close"
                variant="ghost"
                aria-label="Close pull requests"
                onClick={() => props.onClose()}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="mx-auto w-full max-w-[960px] px-6 py-4 flex flex-col gap-6">
          <Show when={data()?.error}>
            <div class="text-12-regular text-icon-critical-base">{data()!.error}</div>
          </Show>

          <Show
            when={(data()?.groups.length ?? 0) > 0}
            fallback={
              <Show when={data()} fallback={<div class="text-14-regular text-text-base">Loading…</div>}>
                <div class="text-14-regular text-text-base">No open pull requests</div>
              </Show>
            }
          >
            <For each={data()!.groups}>
              {(group) => (
                <div class="flex flex-col gap-1">
                  <div class="flex items-baseline gap-2 px-3">
                    <span class="text-12-medium text-text-strong truncate">{group.repo}</span>
                    <span class="text-12-regular text-text-base">{group.items.length}</span>
                  </div>
                  <For each={group.items}>{(pr) => <OpenRow pr={pr} now={now()} onOpen={openExternal} />}</For>
                </div>
              )}
            </For>
          </Show>

          <div class="flex flex-col gap-1 border-t border-border-weaker-base pt-4">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1 text-left"
              aria-expanded={mergedSection()}
              onClick={() => {
                const next = !mergedSection()
                setMergedSection(next)
                // Paged over the whole 30-day window, so it is only paid for on open.
                if (next) props.store.loadMerged()
              }}
            >
              <Icon name={mergedSection() ? "chevron-down" : "chevron-right"} size="small" class="text-text-base" />
              <span class="text-12-medium text-text-strong">Recently merged</span>
              <Show when={props.store.merged()}>
                <span class="text-12-regular text-text-base">{props.store.merged()!.items.length}</span>
              </Show>
            </button>

            <Show when={mergedSection()}>
              <Show
                when={props.store.merged()}
                fallback={<div class="px-3 py-1 text-12-regular text-text-base">Loading merged history…</div>}
              >
                <Show when={props.store.merged()!.error}>
                  <div class="px-3 py-1 text-12-regular text-icon-critical-base">{props.store.merged()!.error}</div>
                </Show>
                <For each={props.store.merged()!.items}>
                  {(pr) => <MergedRow pr={pr} now={now()} onOpen={openExternal} />}
                </For>
                <Show when={props.store.merged()!.truncated}>
                  <div class="px-3 py-1 text-12-regular text-text-base">
                    Showing the {props.store.merged()!.truncated} most recent merges
                  </div>
                </Show>
                <Show when={props.store.merged()!.items.length === 0 && !props.store.merged()!.error}>
                  <div class="px-3 py-1 text-12-regular text-text-base">Nothing merged in the last 30 days</div>
                </Show>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
