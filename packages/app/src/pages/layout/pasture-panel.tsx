import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show, type JSX } from "solid-js"
import { makeEventListener } from "@solid-primitives/event-listener"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import cowSide from "@/assets/cow/cow-side.png"
import { usePlatform } from "@/context/platform"
import { cowID } from "@/pasture/breeds"
import { advanceLimbo, buildMembers, openDetail, penCounts, type Limbo, type PastureMember } from "@/pasture/members"
import { moo } from "@/pasture/moo"
import { createPastureScene, type PastureScene } from "@/pasture/scene"
import type { PastureStore } from "@/pasture/store"
import { PASTURE_TIMEFRAMES } from "@/pasture/types"
import type { OpenPullRequest } from "@/pr-dashboard/types"
import type { PrDashboardStore } from "@/pr-dashboard/store"

const HERD_CAP = 150
/** While the field is open, the open-PR list is re-read this often so stage changes get their hand-of-god moment. */
const OPEN_REFRESH_MS = 60_000

function relative(iso: string, now: number) {
  const diff = Math.max(0, now - Date.parse(iso))
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function absolute(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function timeframeLabel(days: number) {
  const known = PASTURE_TIMEFRAMES.find((item) => item.days === days)
  if (known) return known.label.toLowerCase()
  return `the last ${days} day${days === 1 ? "" : "s"}`
}

const SegmentButton = (props: { on: boolean; onClick: () => void; children: JSX.Element }) => (
  <button
    type="button"
    aria-pressed={props.on}
    onClick={() => props.onClick()}
    class="rounded-md px-2 py-1 text-12-medium transition-colors motion-reduce:transition-none"
    classList={{
      "bg-surface-base-active text-text-strong": props.on,
      "text-text-base hover:bg-surface-base-hover": !props.on,
    }}
  >
    {props.children}
  </button>
)

/**
 * A green field with a pen for every stage of a pull request's life: drafts,
 * awaiting review, changes requested and ready to merge across the front,
 * the merged herd out back. Every one of your PRs is a cow. Hover one for its
 * PR, click to lift it (legs dangling) and read the details, double-click to
 * open it on GitHub. When a PR moves stage, the hand of god carries its cow
 * to the right pen. The timeframe applies to the merged herd only.
 */
export const PasturePanel = (props: { store: PastureStore; pullRequests: PrDashboardStore; onClose: () => void }): JSX.Element => {
  const platform = usePlatform()
  let canvas!: HTMLCanvasElement
  let host!: HTMLDivElement
  let scene: PastureScene | undefined
  const [hover, setHover] = createSignal<{ id: string; x: number; y: number }>()
  const [selected, setSelected] = createSignal<string>()
  const [mooing, setMooing] = createSignal(false)
  const [customDays, setCustomDays] = createSignal("")
  const [now, setNow] = createSignal(Date.now())
  const [limbo, setLimbo] = createSignal<Limbo>(new Map())
  const tick = setInterval(() => setNow(Date.now()), 30_000)
  onCleanup(() => clearInterval(tick))

  const openItems = createMemo<OpenPullRequest[]>(() => props.pullRequests.data()?.groups.flatMap((group) => group.items) ?? [])
  const mergedItems = createMemo(() => props.store.herd()?.items ?? [])
  const mergedIds = createMemo(() => new Set(mergedItems().map(cowID)))

  // Open PRs that just vanished are held in place until the merged search
  // catches up, so a merge reads as "carried to the merged pen", not "poof".
  let previousOpen: OpenPullRequest[] | undefined
  createEffect(
    on([openItems, mergedIds, now], ([open, merged, at]) => {
      if (!props.pullRequests.data()) return
      const before = previousOpen ?? open
      previousOpen = open
      const next = advanceLimbo(limbo(), before, open, merged, at)
      const vanished = before.some((pr) => !open.some((item) => cowID(item) === cowID(pr)))
      setLimbo(next)
      if (vanished) void props.store.refresh(true)
    }),
  )

  // Past this many the field turns into a stampede and the frame rate goes with it.
  const members = createMemo(() => buildMembers(openItems(), mergedItems(), limbo(), HERD_CAP))
  const byId = createMemo(() => new Map(members().map((member) => [member.id, member])))
  const current = createMemo(() => (selected() ? byId().get(selected()!) : undefined))
  const hovered = createMemo(() => (hover() ? byId().get(hover()!.id) : undefined))
  const counts = createMemo(() => penCounts(members()))

  const local = (x: number, y: number) => {
    const rect = host.getBoundingClientRect()
    return { x: x - rect.left, y: y - rect.top }
  }

  onMount(() => {
    scene = createPastureScene(canvas, {
      onHover: (id, x, y) => setHover(id ? { id, ...local(x, y) } : undefined),
      onSelect: (id) => setSelected(id),
      onOpen: (id) => {
        const member = byId().get(id)
        if (member) platform.openExternal(member.pr.url)
      },
    })
    onCleanup(() => {
      scene?.dispose()
      scene = undefined
    })
    // A fresh read on open, then a steady trickle while the field is showing.
    props.pullRequests.refresh(true)
    const timer = setInterval(() => props.pullRequests.refresh(true), OPEN_REFRESH_MS)
    onCleanup(() => clearInterval(timer))
  })

  // Changing the timeframe swaps most of the merged herd; that is a new field, not a migration.
  let shownDays = props.store.days()
  const loaded = () => !!props.store.herd() && !!props.pullRequests.data()
  createEffect(() => {
    const list = members()
    const days = props.store.days()
    const animate = loaded() && days === shownDays
    shownDays = days
    scene?.setCows(
      list.map((member) => ({ id: member.id, breed: member.breed, seed: member.seed, pen: member.pen })),
      animate,
    )
    if (selected() && !list.some((member) => member.id === selected())) setSelected(undefined)
  })
  createEffect(on(selected, (id) => scene?.select(id)))
  createEffect(() => scene?.setSign("merged", `Merged ${timeframeLabel(props.store.days())}`))

  makeEventListener(document, "keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    if (selected()) return setSelected(undefined)
    props.onClose()
  })

  const speak = async (member: PastureMember) => {
    if (mooing()) return
    setMooing(true)
    await moo(member.breed.size).catch(() => undefined)
    setMooing(false)
  }

  const applyCustomDays = () => {
    const days = Math.floor(Number(customDays()))
    if (Number.isFinite(days) && days >= 1 && days <= 366) props.store.setDays(days)
  }

  const summary = () => {
    const data = props.store.herd()
    const dashboard = props.pullRequests.data()
    if (!data && !dashboard) return "Rounding up the herd…"
    const parts: string[] = []
    if (data) {
      const count = Math.min(data.items.length, HERD_CAP)
      const total = data.truncated ?? data.items.length
      const cap = total > count ? ` (newest ${count} of ${total}${data.truncated ? "+" : ""})` : ""
      parts.push(`${count} merged ${timeframeLabel(data.days)}${cap}`)
    }
    if (dashboard && !dashboard.unavailable) {
      const c = counts()
      const open = c.draft + c.awaiting + c.changes + c.ready
      const stages = [
        c.draft ? `${c.draft} draft${c.draft === 1 ? "" : "s"}` : "",
        c.awaiting ? `${c.awaiting} awaiting review` : "",
        c.changes ? `${c.changes} changes requested` : "",
        c.ready ? `${c.ready} ready` : "",
      ].filter(Boolean)
      parts.push(`${open} open${stages.length ? `: ${stages.join(" · ")}` : ""}`)
    }
    return `${parts.join(" · ")} · your PRs only`
  }

  const repoShort = (repo: string) => repo.replace("coval-ai/", "")

  return (
    <div class="flex flex-col size-full bg-background-base">
      <div class="shrink-0 border-b border-border-weak-base">
        <div class="flex items-center gap-3 px-6 py-3">
          <img src={cowSide} alt="" class="size-6 object-contain" />
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-16-medium text-text-strong">Pasture</span>
            <span class="text-12-regular text-text-base truncate">{summary()}</span>
          </div>
          <div class="flex items-center gap-1 rounded-lg border border-border-weaker-base p-0.5" title="Merged herd timeframe">
            <For each={PASTURE_TIMEFRAMES}>
              {(frame) => (
                <SegmentButton on={props.store.days() === frame.days} onClick={() => props.store.setDays(frame.days)}>
                  {frame.label}
                </SegmentButton>
              )}
            </For>
            <input
              type="number"
              min="1"
              max="366"
              placeholder="days"
              value={customDays()}
              onInput={(event) => setCustomDays(event.currentTarget.value)}
              onChange={applyCustomDays}
              onKeyDown={(event) => event.key === "Enter" && applyCustomDays()}
              class="w-16 rounded-md bg-surface-inset-base px-2 py-1 text-12-regular text-text-strong outline-none"
              aria-label="Custom number of days for the merged herd"
            />
          </div>
          <Tooltip placement="bottom" gutter={2} value="Refresh">
            <IconButton
              icon="reset"
              variant="ghost"
              aria-label="Refresh the pasture"
              disabled={props.store.loading()}
              onClick={() => {
                props.pullRequests.refresh(true)
                void props.store.refresh(true)
              }}
            />
          </Tooltip>
          <Tooltip placement="bottom" gutter={2} value="Close">
            <IconButton icon="close" variant="ghost" aria-label="Close the pasture" onClick={() => props.onClose()} />
          </Tooltip>
        </div>
      </div>

      <div ref={host} class="relative flex-1 min-h-0 overflow-hidden select-none">
        <canvas ref={canvas} class="block size-full" />

        <Show when={props.store.loading() && !props.store.herd()}>
          <div class="absolute inset-0 flex items-center justify-center bg-background-base/40 text-14-regular text-text-strong">
            Rounding up the herd…
          </div>
        </Show>
        <Show when={props.store.herd()?.error || props.pullRequests.data()?.error}>
          <div class="absolute left-4 top-4 max-w-96 rounded-md bg-surface-base px-3 py-2 text-12-regular text-icon-critical-base shadow">
            {props.store.herd()?.error ?? props.pullRequests.data()?.error}
          </div>
        </Show>
        <Show when={props.store.herd() && props.pullRequests.data() && !props.store.herd()!.error && members().length === 0}>
          <div class="absolute inset-x-0 top-6 flex justify-center">
            <span class="rounded-full bg-surface-base px-4 py-1.5 text-12-regular text-text-base shadow">
              No open pull requests and nothing merged {timeframeLabel(props.store.days())}. An empty field is still a nice field.
            </span>
          </div>
        </Show>

        <Show when={hovered() && hovered()!.id !== selected()}>
          {(_) => {
            const member = hovered()!
            return (
              <div
                class="pointer-events-none absolute z-10 max-w-72 rounded-lg bg-surface-base px-3 py-2 shadow-lg border border-border-weaker-base"
                style={{ left: `${hover()!.x + 14}px`, top: `${hover()!.y + 14}px` }}
              >
                <div class="text-12-medium text-text-weak">{member.breed.name}</div>
                <div class="text-14-medium text-text-strong truncate">{member.pr.title}</div>
                <div class="text-12-regular text-text-base truncate">
                  {repoShort(member.pr.repo)}#{member.pr.number} ·{" "}
                  {member.kind === "merged"
                    ? `merged ${relative(member.pr.mergedAt, now())}`
                    : `${openDetail(member.pr)} · updated ${relative(member.pr.updatedAt, now())}`}
                </div>
              </div>
            )
          }}
        </Show>

        <Show when={current()}>
          {(member) => (
            <div class="absolute bottom-4 left-4 z-10 w-[380px] max-w-[calc(100%-2rem)] rounded-xl border border-border-weaker-base bg-surface-base p-4 shadow-xl flex flex-col gap-3">
              <div class="flex items-start gap-3">
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-12-medium text-text-weak">{member().breed.name}</span>
                  <button
                    type="button"
                    class="text-left text-14-medium text-text-strong hover:underline"
                    onClick={() => platform.openExternal(member().pr.url)}
                  >
                    {member().pr.title}
                  </button>
                  <span class="text-12-regular text-text-base">
                    {member().pr.repo} #{member().pr.number}
                    <Show when={member().kind === "merged"}> → {(member() as Extract<PastureMember, { kind: "merged" }>).pr.base}</Show>
                  </span>
                </div>
                <IconButton icon="close" variant="ghost" aria-label="Put the cow down" onClick={() => setSelected(undefined)} />
              </div>

              <Show when={member().kind === "merged"}>
                {(_) => {
                  const pr = () => (member() as Extract<PastureMember, { kind: "merged" }>).pr
                  return (
                    <>
                      <div class="flex items-center gap-2 text-12-regular text-text-base">
                        <Show when={pr().authorAvatar}>
                          <img src={pr().authorAvatar!} alt="" class="size-5 rounded-full" />
                        </Show>
                        <span class="text-text-strong">{pr().author}</span>
                        <span>· merged {absolute(pr().mergedAt)}</span>
                        <span>({relative(pr().mergedAt, now())})</span>
                        <Show when={pr().mergedBy && pr().mergedBy !== pr().author}>
                          <span>by {pr().mergedBy}</span>
                        </Show>
                      </div>
                      <div class="flex flex-wrap items-center gap-2 text-12-regular">
                        <span class="text-icon-success-base">+{pr().additions}</span>
                        <span class="text-icon-critical-base">−{pr().deletions}</span>
                        <span class="text-text-base">
                          · {pr().changedFiles} file{pr().changedFiles === 1 ? "" : "s"}
                        </span>
                        <For each={pr().labels}>
                          {(label) => <span class="rounded-full bg-surface-inset-base px-2 py-0.5 text-text-base">{label}</span>}
                        </For>
                      </div>
                    </>
                  )
                }}
              </Show>

              <Show when={member().kind === "open"}>
                {(_) => {
                  const item = () => member() as Extract<PastureMember, { kind: "open" }>
                  return (
                    <>
                      <div class="text-12-medium text-text-strong">{openDetail(item().pr)}</div>
                      <div class="flex flex-wrap items-center gap-x-2 text-12-regular text-text-base">
                        <span>opened {absolute(item().pr.createdAt)}</span>
                        <span>· updated {relative(item().pr.updatedAt, now())}</span>
                        <Show when={item().held}>
                          <span class="text-text-weak">· just left the open list, waiting to see it merge</span>
                        </Show>
                      </div>
                      <div class="flex flex-wrap items-center gap-2 text-12-regular text-text-base">
                        <Show when={item().pr.automation.keepUpdated}>
                          <span class="rounded-full bg-surface-inset-base px-2 py-0.5">kept updated</span>
                        </Show>
                        <Show when={item().pr.automation.autoFix}>
                          <span class="rounded-full bg-surface-inset-base px-2 py-0.5">auto-fixes comments</span>
                        </Show>
                        <Show when={item().pr.automation.merge}>
                          <span class="rounded-full bg-surface-inset-base px-2 py-0.5">merge when ready</span>
                        </Show>
                      </div>
                    </>
                  )
                }}
              </Show>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  disabled={mooing()}
                  onClick={() => void speak(member())}
                  class="rounded-md bg-surface-base-active px-3 py-1.5 text-12-medium text-text-strong hover:bg-surface-base-hover disabled:opacity-50"
                >
                  {mooing() ? "Moooo…" : "Moo"}
                </button>
                <button
                  type="button"
                  onClick={() => platform.openExternal(member().pr.url)}
                  class="flex items-center gap-1 rounded-md border border-border-weak-base px-3 py-1.5 text-12-medium text-text-strong hover:bg-surface-base-hover"
                >
                  Open PR <Icon name="square-arrow-top-right" size="small" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(undefined)}
                  class="rounded-md px-3 py-1.5 text-12-regular text-text-base hover:bg-surface-base-hover"
                >
                  Put it down
                </button>
              </div>
            </div>
          )}
        </Show>

        <div class="pointer-events-none absolute bottom-3 right-4 rounded-full bg-surface-base/80 px-3 py-1 text-12-regular text-text-base">
          hover a cow for its PR · click to lift · double-click to open · drag to look around · cows change pens as PRs advance
        </div>
      </div>
    </div>
  )
}
