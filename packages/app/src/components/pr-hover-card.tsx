import { createSignal, onCleanup, onMount, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { parsePullRequestUrl } from "@opencode-ai/session-ui/pr-status"
import { useLanguage } from "@/context/language"
import { usePlatform, type PrDetails } from "@/context/platform"
import { getRelativeTime } from "@/utils/time"
import "./pr-hover-card.css"

const OPEN_DELAY = 200
// Grace to cross the gap from the link into the card.
const CLOSE_DELAY = 220
const CARD_WIDTH = 320
const GUTTER = 6

type Shown = { url: string; details: PrDetails }
type Point = { left: number; top: number }

type PublicPr = {
  title?: string
  state?: string
  draft?: boolean
  merged_at?: string | null
  updated_at?: string | null
  additions?: number
  deletions?: number
  changed_files?: number
  user?: { login?: string; avatar_url?: string } | null
}

/**
 * Fallback for clients without the desktop bridge (web, phone). Public repos
 * only and rate limited, the same trade the inline status badge already makes.
 */
async function fetchPublicDetails(url: string): Promise<PrDetails | undefined> {
  const parsed = parsePullRequestUrl(url)
  if (!parsed) return undefined
  const response = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`,
    { headers: { accept: "application/vnd.github+json" } },
  ).catch(() => undefined)
  if (!response?.ok) return undefined
  const parsed_: unknown = await response.json().catch(() => undefined)
  const data = parsed_ as PublicPr | undefined
  if (!data?.title) return undefined
  const at = Date.parse(data.merged_at ?? data.updated_at ?? "")
  return {
    owner: parsed.owner,
    repo: parsed.repo,
    number: parsed.number,
    title: data.title,
    state: data.merged_at ? "merged" : data.state === "closed" ? "closed" : data.draft ? "draft" : "open",
    author: data.user?.login ?? null,
    avatarUrl: data.user?.avatar_url ?? null,
    additions: data.additions ?? 0,
    deletions: data.deletions ?? 0,
    changedFiles: data.changed_files ?? 0,
    timestamp: Number.isNaN(at) ? null : at,
  }
}

function position(anchor: Element, height: number) {
  const rect = anchor.getBoundingClientRect()
  const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - CARD_WIDTH - 8))
  const below = rect.bottom + GUTTER
  const fitsBelow = below + height <= window.innerHeight - 8
  const top = fitsBelow ? below : Math.max(8, rect.top - GUTTER - height)
  return { left, top }
}

/**
 * Rich preview for GitHub pull request links in the timeline. The links are
 * decorated imperatively by the markdown renderer rather than rendered as
 * components, so this attaches by delegation instead of wrapping a trigger.
 */
export function PrHoverCard() {
  const platform = usePlatform()
  const language = useLanguage()
  const [shown, setShown] = createSignal<Shown | undefined>()
  // Kept apart from the content so repositioning restyles the card in place
  // rather than remounting it, which would restart the animation and blink.
  const [point, setPoint] = createSignal({ left: 0, top: 0 } satisfies Point)
  let card: HTMLDivElement | undefined
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let anchor: Element | undefined

  const clearTimers = () => {
    if (openTimer) clearTimeout(openTimer)
    if (closeTimer) clearTimeout(closeTimer)
    openTimer = undefined
    closeTimer = undefined
  }

  const hide = () => {
    clearTimers()
    anchor = undefined
    setShown(undefined)
  }

  const scheduleHide = () => {
    if (closeTimer) clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      // :hover is asked rather than tracked with a flag. A flag set on enter
      // strands itself true whenever the card is removed from under the
      // pointer, and then nothing ever closes again.
      if (card?.matches(":hover") || anchor?.matches(":hover")) return
      hide()
    }, CLOSE_DELAY)
  }

  const show = async (link: HTMLAnchorElement, url: string) => {
    const details = platform.prDetails
      ? await platform.prDetails(url).catch(() => undefined)
      : await fetchPublicDetails(url).catch(() => undefined)
    // The pointer may have moved on while gh was running.
    if (!details || anchor !== link) return
    setPoint(position(link, 120))
    setShown({ url, details })
    // Re-measure once rendered so a tall title still flips above correctly.
    requestAnimationFrame(() => {
      if (!card || anchor !== link) return
      setPoint(position(link, card.getBoundingClientRect().height))
    })
  }

  onMount(() => {
    const over = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (card && card.contains(target)) return
      const link = target.closest("a[href]")
      if (!(link instanceof HTMLAnchorElement)) return
      const url = link.href
      if (!parsePullRequestUrl(url)) return
      if (anchor === link) {
        if (closeTimer) clearTimeout(closeTimer)
        closeTimer = undefined
        return
      }
      clearTimers()
      anchor = link
      openTimer = setTimeout(() => {
        // Cleared here as well as on cancel: a spent timer left in the handle
        // makes the next pointerout take the cancel branch and never schedule
        // the hide, so the card sticks open until you leave a second time.
        openTimer = undefined
        void show(link, url)
      }, OPEN_DELAY)
    }

    const out = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (card && card.contains(target)) return
      if (!anchor || !target.closest("a[href]")) return
      if (openTimer) {
        clearTimeout(openTimer)
        openTimer = undefined
        if (!shown()) anchor = undefined
        return
      }
      scheduleHide()
    }

    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide()
    }

    document.addEventListener("pointerover", over)
    document.addEventListener("pointerout", out)
    document.addEventListener("keydown", key)
    window.addEventListener("scroll", hide, true)
    window.addEventListener("resize", hide)
    onCleanup(() => {
      clearTimers()
      document.removeEventListener("pointerover", over)
      document.removeEventListener("pointerout", out)
      document.removeEventListener("keydown", key)
      window.removeEventListener("scroll", hide, true)
      window.removeEventListener("resize", hide)
    })
  })

  const stateLabel = (state: PrDetails["state"]) => {
    if (state === "merged") return language.t("pr.hover.state.merged")
    if (state === "closed") return language.t("pr.hover.state.closed")
    if (state === "draft") return language.t("pr.hover.state.draft")
    return language.t("pr.hover.state.open")
  }

  return (
    <Show when={shown()}>
      {(item) => (
        <Portal>
          <div
            ref={card}
            class="pr-hover-card"
            style={{ left: `${point().left}px`, top: `${point().top}px` }}
            onPointerEnter={() => {
              if (closeTimer) clearTimeout(closeTimer)
              closeTimer = undefined
            }}
            onPointerLeave={scheduleHide}
          >
            <div class="pr-hover-card-head">
              <span class="pr-hover-card-state" data-pr-state={item().details.state}>
                {stateLabel(item().details.state)}
              </span>
              <span class="pr-hover-card-repo">
                {item().details.owner}/{item().details.repo} #{item().details.number}
              </span>
              <Show when={item().details.timestamp}>
                {(at) => (
                  <span class="pr-hover-card-age">
                    {getRelativeTime(new Date(at()).toISOString(), (key, params) => language.t(key, params))}
                  </span>
                )}
              </Show>
            </div>
            <div class="pr-hover-card-title">{item().details.title}</div>
            <div class="pr-hover-card-foot">
              <Show when={item().details.avatarUrl}>
                {(src) => <img class="pr-hover-card-avatar" src={src()} alt="" draggable={false} />}
              </Show>
              <span class="pr-hover-card-author">{item().details.author}</span>
              <span class="pr-hover-card-diff">
                <span class="pr-hover-card-added">+{item().details.additions}</span>{" "}
                <span class="pr-hover-card-removed">−{item().details.deletions}</span>
              </span>
              <span class="pr-hover-card-files">
                {language.plural("pr.hover.files", item().details.changedFiles, { count: item().details.changedFiles })}
              </span>
            </div>
          </div>
        </Portal>
      )}
    </Show>
  )
}
