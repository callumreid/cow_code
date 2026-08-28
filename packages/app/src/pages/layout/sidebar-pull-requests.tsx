import { createMemo, createSignal, For, Show, type JSX } from "solid-js"
import { Icon } from "@opencode-ai/ui/v2/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { usePlatform } from "@/context/platform"
import { createPrDashboardStore } from "@/pr-dashboard/store"
import type { MergedPullRequest, OpenPullRequest, PrState } from "@/pr-dashboard/types"

type Tone = "ready" | "blocked" | "muted" | "attention"

const STATE_META: Record<PrState, { label: string; icon: string; tone: Tone }> = {
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

function shortRepo(repo: string) {
  const slash = repo.indexOf("/")
  return slash === -1 ? repo : repo.slice(slash + 1)
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

const SectionHeader = (props: {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  action?: JSX.Element
}) => (
  <div class="flex items-center gap-1 pl-2 pr-1 py-1">
    <button
      type="button"
      onClick={props.onToggle}
      class="group/sec flex items-center gap-1 min-w-0 flex-1 text-left"
      aria-expanded={props.open}
    >
      <Icon name={props.open ? "chevron-down" : "chevron-right"} class="size-3 shrink-0 text-text-base" />
      <span class="text-12-regular text-text-base truncate uppercase tracking-wide">{props.label}</span>
      <Show when={props.count !== undefined}>
        <span class="text-12-regular text-text-base shrink-0">{props.count}</span>
      </Show>
    </button>
    {props.action}
  </div>
)

const OpenRow = (props: { pr: OpenPullRequest; now: number; onOpen: (url: string) => void }) => {
  const meta = createMemo(() => STATE_META[props.pr.state])
  const sub = createMemo(() => detail(props.pr))
  return (
    <Tooltip placement="right" gutter={6} value={`${meta().label} · opened ${relativeTime(props.pr.createdAt, props.now)} ago`}>
      <button
        type="button"
        onClick={() => props.onOpen(props.pr.url)}
        class="w-full flex items-start gap-2 rounded px-2 py-1 text-left hover:bg-background-stronger"
      >
        <Icon name={meta().icon} class={`size-3.5 shrink-0 mt-0.5 ${TONE_CLASS[meta().tone]}`} />
        <span class="flex flex-col min-w-0 flex-1">
          <span class="flex items-baseline gap-1.5 min-w-0">
            <span class="text-12-regular text-text-base shrink-0">#{props.pr.number}</span>
            <span class="text-14-regular text-text-strong truncate">{props.pr.title}</span>
          </span>
          <Show when={sub()}>
            <span class="text-12-regular text-text-base truncate">{sub()}</span>
          </Show>
        </span>
        <span class="text-12-regular text-text-base shrink-0 mt-0.5">{relativeTime(props.pr.createdAt, props.now)}</span>
      </button>
    </Tooltip>
  )
}

const MergedRow = (props: { pr: MergedPullRequest; now: number; onOpen: (url: string) => void }) => (
  <button
    type="button"
    onClick={() => props.onOpen(props.pr.url)}
    class="w-full flex items-center gap-2 rounded px-2 py-1 text-left hover:bg-background-stronger"
  >
    <Icon name="fork" class="size-3.5 shrink-0 text-text-base" />
    <span class="text-12-regular text-text-base shrink-0">{shortRepo(props.pr.repo)}</span>
    <span class="text-14-regular text-text-base truncate flex-1">{props.pr.title}</span>
    <span class="text-12-regular text-text-base shrink-0">{relativeTime(props.pr.mergedAt, props.now)}</span>
  </button>
)

/**
 * Sidebar dashboard of the signed-in user's pull requests.
 *
 * Open PRs are grouped by repo, oldest-first so the stalest work surfaces at
 * the top. Merged PRs from the trailing 30 days follow, newest merge first.
 * Renders nothing when the host has no `prDashboard` capability (i.e. the web
 * build, where there is no `gh` to shell out to).
 */
export const SidebarPullRequests = (): JSX.Element => {
  const platform = usePlatform()
  const store = createPrDashboardStore(() => platform.prDashboard)
  const [openSection, setOpenSection] = createSignal(true)
  const [mergedSection, setMergedSection] = createSignal(false)
  const [now, setNow] = createSignal(Date.now())

  const data = store.data
  const openExternal = (url: string) => {
    setNow(Date.now())
    platform.openExternal(url)
  }

  return (
    <Show when={platform.prDashboard}>
      <div class="shrink-0 border-t border-border-weaker-base pt-1 pb-2">
        <SectionHeader
          label="Pull requests"
          count={data()?.openCount}
          open={openSection()}
          onToggle={() => setOpenSection((v) => !v)}
          action={
            <Tooltip placement="bottom" gutter={2} value="Refresh pull requests">
              <IconButton
                icon="reset"
                size="small"
                aria-label="Refresh pull requests"
                disabled={store.loading()}
                onClick={() => {
                  setNow(Date.now())
                  store.refresh(true)
                }}
              />
            </Tooltip>
          }
        />

        <Show when={openSection()}>
          <Show when={data()?.error}>
            <div class="px-2 py-1 text-12-regular text-icon-critical-base">{data()!.error}</div>
          </Show>

          <Show
            when={(data()?.groups.length ?? 0) > 0}
            fallback={
              <Show when={data()} fallback={<div class="px-2 py-1 text-12-regular text-text-base">Loading…</div>}>
                <div class="px-2 py-1 text-12-regular text-text-base">No open pull requests</div>
              </Show>
            }
          >
            <div class="flex flex-col gap-2 max-h-80 overflow-y-auto">
              <For each={data()!.groups}>
                {(group) => (
                  <div class="flex flex-col">
                    <div class="px-2 pt-1 pb-0.5 text-12-regular text-text-base truncate">{group.repo}</div>
                    <For each={group.items}>
                      {(pr) => <OpenRow pr={pr} now={now()} onOpen={openExternal} />}
                    </For>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>

        <SectionHeader
          label="Recently merged"
          count={store.merged()?.items.length}
          open={mergedSection()}
          onToggle={() => {
            const next = !mergedSection()
            setMergedSection(next)
            // Paged over the whole 30-day window, so it is only paid for on open.
            if (next) store.loadMerged()
          }}
        />
        <Show when={mergedSection()}>
          <Show
            when={store.merged()}
            fallback={<div class="px-2 py-1 text-12-regular text-text-base">Loading merged history…</div>}
          >
            <Show when={store.merged()!.error}>
              <div class="px-2 py-1 text-12-regular text-icon-critical-base">{store.merged()!.error}</div>
            </Show>
            <div class="flex flex-col max-h-64 overflow-y-auto">
              <For each={store.merged()!.items}>{(pr) => <MergedRow pr={pr} now={now()} onOpen={openExternal} />}</For>
              <Show when={store.merged()!.truncated}>
                <div class="px-2 py-1 text-12-regular text-text-base">
                  Showing the {store.merged()!.truncated} most recent merges
                </div>
              </Show>
              <Show when={store.merged()!.items.length === 0 && !store.merged()!.error}>
                <div class="px-2 py-1 text-12-regular text-text-base">Nothing merged in the last 30 days</div>
              </Show>
            </div>
          </Show>
        </Show>
      </div>
    </Show>
  )
}
