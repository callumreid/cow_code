import { createEffect, createMemo, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { TooltipV2 } from "@opencode-ai/ui/v2/tooltip-v2"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { generationRate } from "@/context/server-generation"

export function SessionGenerationSpeed(props: { sessionID: string }) {
  const sync = useServerSync()
  const language = useLanguage()
  const [clock, setClock] = createStore({ now: performance.now() })
  const sample = createMemo(() => sync().generation.samples[props.sessionID])
  createEffect(() => {
    if (!sample()?.active) return
    setClock("now", performance.now())
    const timer = setInterval(() => setClock("now", performance.now()), 250)
    onCleanup(() => clearInterval(timer))
  })
  const rate = createMemo(() => generationRate(sample(), clock.now))
  const label = createMemo(() => {
    const current = rate()
    if (!current) return language.t("model.speed.waiting")
    return language.t(current.estimated ? "model.speed.estimated" : "model.speed.measured", {
      rate: current.value.toLocaleString(language.intl(), { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
    })
  })
  return (
    <TooltipV2
      value={language.t(rate()?.estimated === false ? "model.speed.measuredHelp" : "model.speed.estimatedHelp")}
      placement="bottom"
    >
      <span
        data-component="session-generation-speed"
        class="shrink-0 tabular-nums text-12-regular text-text-weak"
        aria-label={label()}
      >
        <Show when={rate()?.active}>● </Show>
        {label()}
      </span>
    </TooltipV2>
  )
}
