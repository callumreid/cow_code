import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show, type JSX } from "solid-js"
import { makeEventListener } from "@solid-primitives/event-listener"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import cowSide from "@/assets/cow/cow-side.png"
import { usePlatform } from "@/context/platform"
import { assignCollars, collarIndex } from "@/pasture/collars"
import { FARMER_ID, critterByID } from "@/pasture/critters"
import { advanceLimbo, buildMembers, openDetail, penCounts, type Limbo, type PastureMember } from "@/pasture/members"
import { moo } from "@/pasture/moo"
import { createPastureScene, type CowSpec, type PastureScene, type PickTarget, type UpsidedownStage } from "@/pasture/scene"
import { SAN_FRANCISCO, describeWeather, localClock, sunPosition, type Weather } from "@/pasture/sky"
import type { PastureStore } from "@/pasture/store"
import { PASTURE_TIMEFRAMES, cowID, type PastureAlert } from "@/pasture/types"
import { fetchWeather } from "@/pasture/weather"
import { isWolf, wolfID } from "@/pasture/wolves"
import type { OpenPullRequest } from "@/pr-dashboard/types"
import type { PrDashboardStore } from "@/pr-dashboard/store"
import "@/pasture/pasture.css"

const HERD_CAP = 150
/** While the field is open, the open-PR list is re-read this often so stage changes get their hand-of-god moment. */
const OPEN_REFRESH_MS = 60_000
const WEATHER_REFRESH_MS = 10 * 60_000

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

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`

const SegmentButton = (props: { on: boolean; onClick: () => void; title?: string; children: JSX.Element }) => (
  <button
    type="button"
    aria-pressed={props.on}
    title={props.title}
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

const Chip = (props: { onClick?: () => void; title?: string; class?: string; children: JSX.Element }) => (
  <button
    type="button"
    title={props.title}
    onClick={() => props.onClick?.()}
    class={`pointer-events-auto rounded-full border border-border-weaker-base bg-surface-base/90 px-3 py-1 text-12-medium text-text-strong shadow ${props.class ?? ""}`}
    classList={{ "cursor-default": !props.onClick, "hover:bg-surface-base": !!props.onClick }}
  >
    {props.children}
  </button>
)

/**
 * A green field with a pen for every stage of a pull request's life: drafts,
 * awaiting review, changes requested and ready to merge across the front,
 * the merged herd out back. Every one of your PRs is a cow. Hover one for its
 * PR, click to lift it (legs dangling) and read the details, double-click to
 * open it on GitHub. When a PR moves stage, the hand of god (or, one time in
 * ten, a flying saucer) carries its cow to the right pen. Closed PRs burn.
 * The sky is San Francisco's, Kobi and the office pets run the fences, wolves
 * come out when alerts fire, the barn throws a party during team events, and
 * every fifteen minutes of the tour it is upsidedown time.
 */
export const PasturePanel = (props: { store: PastureStore; pullRequests: PrDashboardStore; onClose: () => void }): JSX.Element => {
  const platform = usePlatform()
  let canvas!: HTMLCanvasElement
  let host!: HTMLDivElement
  let scene: PastureScene | undefined
  const [hover, setHover] = createSignal<{ target: PickTarget; x: number; y: number }>()
  const [selected, setSelected] = createSignal<string>()
  const [bubble, setBubble] = createSignal<{ id: string; text: string; x: number; y: number }>()
  const [upsidedown, setUpsidedown] = createSignal<UpsidedownStage>()
  const [weather, setWeather] = createSignal<Weather | null>(null)
  const [mooing, setMooing] = createSignal(false)
  const [customDays, setCustomDays] = createSignal("")
  const [now, setNow] = createSignal(Date.now())
  const [limbo, setLimbo] = createSignal<Limbo>(new Map())
  const tick = setInterval(() => setNow(Date.now()), 30_000)
  onCleanup(() => clearInterval(tick))

  const settings = () => props.store.settings()
  const extras = () => props.store.extras()
  const openItems = createMemo<OpenPullRequest[]>(() => props.pullRequests.data()?.groups.flatMap((group) => group.items) ?? [])
  const mergedItems = createMemo(() => props.store.herd()?.items ?? [])
  const mergedIds = createMemo(() => new Set(mergedItems().map(cowID)))
  const closedIds = createMemo(() => new Set((extras()?.closed ?? []).map(cowID)))
  const alerts = createMemo<PastureAlert[]>(() => extras()?.alerts ?? [])
  const alertsById = createMemo(() => new Map(alerts().map((alert) => [wolfID(alert), alert])))
  const party = () => extras()?.party ?? null
  const login = createMemo(() => extras()?.login || mergedItems().find((pr) => pr.author)?.author || "you")

  // Open PRs that just vanished are held in place until the merged search
  // catches up, so a merge reads as "carried to the merged pen", not "poof".
  // A closed PR is never held: its cow burns where it stands.
  let previousOpen: OpenPullRequest[] | undefined
  createEffect(
    on([openItems, mergedIds, closedIds, now], ([open, merged, closed, at]) => {
      if (!props.pullRequests.data()) return
      const before = previousOpen ?? open
      previousOpen = open
      const next = advanceLimbo(limbo(), before, open, merged, at, closed)
      const vanished = before.some((pr) => !open.some((item) => cowID(item) === cowID(pr)))
      setLimbo(next)
      if (vanished) {
        void props.store.refresh(true)
        void props.store.refreshExtras(true)
      }
    }),
  )

  // Past this many the field turns into a stampede and the frame rate goes with it.
  const members = createMemo(() => buildMembers(openItems(), mergedItems(), limbo(), HERD_CAP, login()))
  const byId = createMemo(() => new Map(members().map((member) => [member.id, member])))
  const collars = createMemo(() => assignCollars(members().map((member) => member.author)))
  const specs = createMemo<CowSpec[]>(() =>
    members().map((member) => ({
      id: member.id,
      breed: member.breed,
      seed: member.seed,
      pen: member.pen,
      author: member.author,
      collar: collarIndex(collars().get(member.author) ?? ""),
      queued: member.kind === "open" && member.pr.state === "merge-queue",
    })),
  )
  const current = createMemo(() => (selected() ? byId().get(selected()!) : undefined))
  const hoveredCow = createMemo(() => {
    const h = hover()
    return h?.target.kind === "cow" ? byId().get(h.target.id) : undefined
  })
  const hoveredCritter = createMemo(() => {
    const h = hover()
    return h?.target.kind === "critter" && !isWolf(h.target.id) ? critterByID(h.target.id) : undefined
  })
  const hoveredWolf = createMemo(() => {
    const h = hover()
    return h?.target.kind === "critter" && isWolf(h.target.id) ? alertsById().get(h.target.id) : undefined
  })
  const counts = createMemo(() => penCounts(members()))

  const local = (x: number, y: number) => {
    const rect = host.getBoundingClientRect()
    return { x: x - rect.left, y: y - rect.top }
  }

  onMount(() => {
    scene = createPastureScene(canvas, {
      onHover: (target, x, y) => setHover(target ? { target, ...local(x, y) } : undefined),
      onSelect: (target) => {
        if (!target || target.kind === "cow") {
          setSelected(target?.id)
          return
        }
        const alert = alertsById().get(target.id)
        if (alert) {
          platform.openExternal(alert.url)
          return
        }
        const line = scene?.poke(target.id)
        if (line) {
          const at = scene?.screenPosition(target.id)
          setBubble({ id: target.id, text: line, x: at?.x ?? 0, y: at?.y ?? 0 })
        }
      },
      onOpen: (id) => {
        const member = byId().get(id)
        if (member) platform.openExternal(member.pr.url)
      },
      onCarry: (id) => {
        if (!settings().mooOnMove) return
        void moo(byId().get(id)?.breed.size ?? 1).catch(() => undefined)
      },
      onBurn: (id) => {
        if (!settings().mooOnMove) return
        void moo((byId().get(id)?.breed.size ?? 1) * 0.8).catch(() => undefined)
      },
      onUpsidedown: (stage) => setUpsidedown(stage),
    })
    const sun = sunPosition(new Date())
    scene.setSky({ altitude: sun.altitude, azimuth: sun.azimuth, weather: null })
    onCleanup(() => {
      scene?.dispose()
      scene = undefined
    })
    // A fresh read on open, then a steady trickle while the field is showing.
    props.pullRequests.refresh(true)
    const timer = setInterval(() => props.pullRequests.refresh(true), OPEN_REFRESH_MS)
    onCleanup(() => clearInterval(timer))
    // The sky over the field is San Francisco's: the weather as it is.
    const readWeather = () =>
      fetchWeather()
        .then((w) => {
          if (w) setWeather(w)
        })
        .catch(() => undefined)
    void readWeather()
    const sky = setInterval(() => void readWeather(), WEATHER_REFRESH_MS)
    onCleanup(() => clearInterval(sky))
  })

  // Changing the timeframe swaps most of the merged herd; that is a new field, not a migration.
  let shownDays = props.store.days()
  const loaded = () => !!props.store.herd() && !!props.pullRequests.data()
  createEffect(() => {
    const list = specs()
    const closed = closedIds()
    const days = props.store.days()
    const animate = loaded() && days === shownDays
    shownDays = days
    // Closed pull requests burn where they stand; the hand of god is not called.
    if (animate) for (const id of closed) scene?.burn(id)
    scene?.setCows(list, animate)
    if (selected() && !list.some((spec) => spec.id === selected())) setSelected(undefined)
  })
  createEffect(on(selected, (id) => scene?.select(id)))
  createEffect(() => scene?.setSign("merged", `Merged ${timeframeLabel(props.store.days())}`))
  createEffect(() => scene?.setTour(settings().tour))
  createEffect(() => scene?.setWolves(alerts()))
  createEffect(() => scene?.setParty(!!party()))
  // The sun where it really is, re-derived every half minute.
  createEffect(() => {
    const sun = sunPosition(new Date(now()))
    scene?.setSky({ altitude: sun.altitude, azimuth: sun.azimuth, weather: weather() })
  })
  // The farmer's line follows him for a few seconds.
  createEffect(
    on(bubble, (current) => {
      if (!current) return
      let raf = 0
      const follow = () => {
        const at = scene?.screenPosition(current.id)
        if (at) setBubble((b) => (b && b.id === current.id && b.text === current.text ? { ...b, x: at.x, y: at.y } : b))
        raf = requestAnimationFrame(follow)
      }
      raf = requestAnimationFrame(follow)
      const timer = setTimeout(() => setBubble(undefined), 4200)
      onCleanup(() => {
        cancelAnimationFrame(raf)
        clearTimeout(timer)
      })
    }),
  )

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
        c.draft ? plural(c.draft, "draft") : "",
        c.awaiting ? `${c.awaiting} awaiting review` : "",
        c.changes ? `${c.changes} changes requested` : "",
        c.ready ? `${c.ready} ready` : "",
      ].filter(Boolean)
      parts.push(`${open} open${stages.length ? `: ${stages.join(" · ")}` : ""}`)
    }
    return `${parts.join(" · ")} · your PRs only`
  }

  const repoShort = (repo: string) => repo.replace("coval-ai/", "")
  const datadogHome = () => `https://app.${extras()?.datadogSite || "us5.datadoghq.com"}/monitors/manage?q=status%3Aalert`

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
          <div class="flex items-center gap-1 rounded-lg border border-border-weaker-base p-0.5">
            <SegmentButton
              on={settings().mooOnMove}
              title={settings().mooOnMove ? "Cows moo when the hand of god picks them up. Click to hush them." : "Silent. Click and every cow moos when it is picked up."}
              onClick={() => props.store.update({ mooOnMove: !settings().mooOnMove })}
            >
              {settings().mooOnMove ? "🔔 Moo on move" : "🔕 Moo on move"}
            </SegmentButton>
            <SegmentButton
              on={settings().tour}
              title={settings().tour ? "The camera drifts around the farm on its own. Click to hold still." : "Click and the camera tours the farm like a screensaver."}
              onClick={() => props.store.update({ tour: !settings().tour })}
            >
              🎥 Tour
            </SegmentButton>
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
                void props.store.refreshExtras(true)
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

        <div class="pointer-events-none absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
          <Show when={alerts().length > 0}>
            <Chip onClick={() => platform.openExternal(datadogHome())} title="Wolves on the field: Datadog monitors in alert. Click to see them all.">
              🐺 {plural(alerts().length, "alert")} firing
            </Chip>
          </Show>
          <Show when={party()}>
            {(event) => (
              <Chip
                onClick={event().url ? () => platform.openExternal(event().url!) : undefined}
                title="There is an event on: the barn doors are open and the disco ball is up."
                class="border-[rgba(255,79,216,0.55)]"
              >
                🪩 {event().name} · until {localClock(new Date(event().end))}
              </Chip>
            )}
          </Show>
        </div>

        <Show when={hoveredCow() && hoveredCow()!.id !== selected()}>
          {(_) => {
            const member = hoveredCow()!
            return (
              <div
                class="pointer-events-none absolute z-10 max-w-72 rounded-lg bg-surface-base px-3 py-2 shadow-lg border border-border-weaker-base"
                style={{ left: `${hover()!.x + 14}px`, top: `${hover()!.y + 14}px` }}
              >
                <div class="flex items-center gap-1.5 text-12-medium text-text-weak">
                  <span class="inline-block size-2.5 rounded-full" style={{ background: collars().get(member.author) ?? "#ccc" }} />
                  {member.author} · {member.breed.name}
                </div>
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
        <Show when={hoveredCritter()}>
          {(critter) => (
            <div
              class="pointer-events-none absolute z-10 max-w-72 rounded-lg bg-surface-base px-3 py-2 shadow-lg border border-border-weaker-base"
              style={{ left: `${hover()!.x + 14}px`, top: `${hover()!.y + 14}px` }}
            >
              <div class="text-14-medium text-text-strong">
                {critter().name}
                {critter().id === FARMER_ID ? " · the farmer" : critter().kind === "dog" ? " · dog" : critter().kind === "pig" ? " · in the loft" : " · cat"}
              </div>
              <div class="text-12-regular text-text-base">{critter().blurb}</div>
            </div>
          )}
        </Show>
        <Show when={hoveredWolf()}>
          {(alert) => (
            <div
              class="pointer-events-none absolute z-10 max-w-72 rounded-lg bg-surface-base px-3 py-2 shadow-lg border border-border-weaker-base"
              style={{ left: `${hover()!.x + 14}px`, top: `${hover()!.y + 14}px` }}
            >
              <div class="text-14-medium text-text-strong">🐺 {alert().name}</div>
              <div class="text-12-regular text-text-base">
                alert firing{alert().since ? ` since ${relative(alert().since!, now())}` : ""} · click to open in Datadog
              </div>
            </div>
          )}
        </Show>
        <Show when={bubble()}>
          {(b) => (
            <div class="pasture-bubble" style={{ left: `${b().x}px`, top: `${b().y}px` }} role="status">
              {b().text}
            </div>
          )}
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
                        <Show when={item().pr.state === "merge-queue"}>
                          <span class="text-text-weak">· hovering in the merge queue</span>
                        </Show>
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

        <div class="pointer-events-none absolute bottom-3 right-4 z-10 flex flex-col items-end gap-2">
          <div class="rounded-full bg-surface-base/80 px-3 py-1 text-12-medium text-text-strong" title="The sky over the field is San Francisco's, sun and weather included">
            {SAN_FRANCISCO.name} · {localClock(new Date(now()))}
            {weather() ? ` · ${describeWeather(weather()!.code)}${weather()!.temperatureF !== null ? ` ${Math.round(weather()!.temperatureF!)}°F` : ""}` : ""}
          </div>
        </div>
        <div class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-surface-base/80 px-3 py-1 text-12-regular text-text-base whitespace-nowrap">
          hover a cow for its PR · click to lift · double-click to open · drag to look around · cows change pens as PRs advance
        </div>

        <Show when={upsidedown() === "title"}>
          <div class="pasture-upsidedown" role="status">
            UPSIDEDOWN TIME!
          </div>
        </Show>
        <div class="pasture-blackout" classList={{ on: upsidedown() === "fade" || upsidedown() === "restore" }} aria-hidden="true" />
      </div>
    </div>
  )
}
