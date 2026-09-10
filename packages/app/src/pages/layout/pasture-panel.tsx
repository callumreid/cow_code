import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show, type JSX } from "solid-js"
import { makeEventListener } from "@solid-primitives/event-listener"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import cowSide from "@/assets/cow/cow-side.png"
import { usePlatform } from "@/context/platform"
import { herd, type HerdMember } from "@/pasture/breeds"
import { moo } from "@/pasture/moo"
import { createPastureScene, type PastureScene } from "@/pasture/scene"
import type { PastureStore } from "@/pasture/store"
import { PASTURE_TIMEFRAMES } from "@/pasture/types"

const HERD_CAP = 150

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
 * A green field where every merged pull request is a cow. Hover one for its
 * PR, click to lift it (legs dangling) and read the details, double-click to
 * open the PR on GitHub. Only your own merges; the timeframe lives in the header.
 */
export const PasturePanel = (props: { store: PastureStore; onClose: () => void }): JSX.Element => {
  const platform = usePlatform()
  let canvas!: HTMLCanvasElement
  let host!: HTMLDivElement
  let scene: PastureScene | undefined
  const [hover, setHover] = createSignal<{ id: string; x: number; y: number }>()
  const [selected, setSelected] = createSignal<string>()
  const [mooing, setMooing] = createSignal(false)
  const [customDays, setCustomDays] = createSignal("")
  const [now, setNow] = createSignal(Date.now())
  const tick = setInterval(() => setNow(Date.now()), 30_000)
  onCleanup(() => clearInterval(tick))

  // Past this many the field turns into a stampede and the frame rate goes with it.
  const members = createMemo(() => herd((props.store.herd()?.items ?? []).slice(0, HERD_CAP)))
  const byId = createMemo(() => new Map(members().map((member) => [member.id, member])))
  const current = createMemo(() => (selected() ? byId().get(selected()!) : undefined))
  const hovered = createMemo(() => (hover() ? byId().get(hover()!.id) : undefined))

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
  })

  createEffect(() => {
    const list = members()
    scene?.setCows(list.map((member) => ({ id: member.id, breed: member.breed, seed: member.seed })))
    if (selected() && !list.some((member) => member.id === selected())) setSelected(undefined)
  })
  createEffect(on(selected, (id) => scene?.select(id)))

  makeEventListener(document, "keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    if (selected()) return setSelected(undefined)
    props.onClose()
  })

  const speak = async (member: HerdMember) => {
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
    if (!data) return "Rounding up the herd…"
    const count = Math.min(data.items.length, HERD_CAP)
    const cows = `${count} cow${count === 1 ? "" : "s"}`
    const total = data.truncated ?? data.items.length
    const cap = total > count ? ` (the newest ${count} of ${total}${data.truncated ? "+" : ""})` : ""
    return `${cows} · your PRs merged ${timeframeLabel(data.days)}${cap}`
  }

  return (
    <div class="flex flex-col size-full bg-background-base">
      <div class="shrink-0 border-b border-border-weak-base">
        <div class="flex items-center gap-3 px-6 py-3">
          <img src={cowSide} alt="" class="size-6 object-contain" />
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-16-medium text-text-strong">Pasture</span>
            <span class="text-12-regular text-text-base truncate">{summary()}</span>
          </div>
          <div class="flex items-center gap-1 rounded-lg border border-border-weaker-base p-0.5">
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
              aria-label="Custom number of days"
            />
          </div>
          <Tooltip placement="bottom" gutter={2} value="Refresh">
            <IconButton
              icon="reset"
              variant="ghost"
              aria-label="Refresh the pasture"
              disabled={props.store.loading()}
              onClick={() => void props.store.refresh(true)}
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
        <Show when={props.store.herd()?.error}>
          <div class="absolute left-4 top-4 rounded-md bg-surface-base px-3 py-2 text-12-regular text-icon-critical-base shadow">
            {props.store.herd()!.error}
          </div>
        </Show>
        <Show when={props.store.herd() && !props.store.herd()!.error && members().length === 0}>
          <div class="absolute inset-x-0 top-6 flex justify-center">
            <span class="rounded-full bg-surface-base px-4 py-1.5 text-12-regular text-text-base shadow">
              No pull requests merged {timeframeLabel(props.store.days())}. An empty field is still a nice field.
            </span>
          </div>
        </Show>

        <Show when={hovered() && hovered()!.id !== selected()}>
          {(_) => (
            <div
              class="pointer-events-none absolute z-10 max-w-72 rounded-lg bg-surface-base px-3 py-2 shadow-lg border border-border-weaker-base"
              style={{ left: `${hover()!.x + 14}px`, top: `${hover()!.y + 14}px` }}
            >
              <div class="text-12-medium text-text-weak">{hovered()!.breed.name}</div>
              <div class="text-14-medium text-text-strong truncate">{hovered()!.pr.title}</div>
              <div class="text-12-regular text-text-base truncate">
                {hovered()!.pr.repo.replace("coval-ai/", "")}#{hovered()!.pr.number} · {hovered()!.pr.author} ·{" "}
                {relative(hovered()!.pr.mergedAt, now())}
              </div>
            </div>
          )}
        </Show>

        <Show when={current()}>
          {(member) => (
            <div class="absolute bottom-4 left-4 z-10 w-[360px] max-w-[calc(100%-2rem)] rounded-xl border border-border-weaker-base bg-surface-base p-4 shadow-xl flex flex-col gap-3">
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
                    {member().pr.repo} #{member().pr.number} → {member().pr.base}
                  </span>
                </div>
                <IconButton icon="close" variant="ghost" aria-label="Put the cow down" onClick={() => setSelected(undefined)} />
              </div>
              <div class="flex items-center gap-2 text-12-regular text-text-base">
                <Show when={member().pr.authorAvatar}>
                  <img src={member().pr.authorAvatar!} alt="" class="size-5 rounded-full" />
                </Show>
                <span class="text-text-strong">{member().pr.author}</span>
                <span>· merged {absolute(member().pr.mergedAt)}</span>
                <span>({relative(member().pr.mergedAt, now())})</span>
                <Show when={member().pr.mergedBy && member().pr.mergedBy !== member().pr.author}>
                  <span>by {member().pr.mergedBy}</span>
                </Show>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-12-regular">
                <span class="text-icon-success-base">+{member().pr.additions}</span>
                <span class="text-icon-critical-base">−{member().pr.deletions}</span>
                <span class="text-text-base">
                  · {member().pr.changedFiles} file{member().pr.changedFiles === 1 ? "" : "s"}
                </span>
                <For each={member().pr.labels}>
                  {(label) => <span class="rounded-full bg-surface-inset-base px-2 py-0.5 text-text-base">{label}</span>}
                </For>
              </div>
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
          hover a cow for its PR · click to lift · double-click to open · drag to look around
        </div>
      </div>
    </div>
  )
}
