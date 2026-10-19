import { createEffect, For, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Popover } from "@kobalte/core/popover"
import { Button } from "@opencode-ai/ui/button"
import { useLanguage } from "@/context/language"
import { useServerSDK } from "@/context/server-sdk"
import { useSDK } from "@/context/sdk"
import { usePlatform } from "@/context/platform"
import { officeFetch } from "@/office/api"

type Total = { amount: number; reported: number; estimated: number; unknown: number; turns: number }
type Spend = {
  sessionID: string
  children: number
  budget?: number
  task: Total
  day: Total
  providers: (Total & { provider: string })[]
  updated: number
}

export function SessionSpend(props: { sessionID: string }) {
  const language = useLanguage()
  const server = useServerSDK()
  const sdk = useSDK()
  const platform = usePlatform()
  const [store, setStore] = createStore({
    open: false,
    error: false,
    budget: "",
    dirty: false,
    saving: false,
    saveError: false,
    record: undefined as (Spend & { scope: string }) | undefined,
  })
  const money = (amount: number) =>
    new Intl.NumberFormat(language.intl(), {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount > 0 && amount < 0.01 ? 4 : 2,
    }).format(amount)
  // This status read must never suspend the conversation or tab navigation.
  let refetch = async () => {}
  let budgetRevision = 0
  createEffect(() => {
    const target = { id: props.sessionID, server: server() }
    const controller = new AbortController()
    let inflight = false
    let queued = false
    setStore({ record: undefined, error: false })
    const update = async () => {
      if (controller.signal.aborted) return
      if (inflight) {
        queued = true
        return
      }
      inflight = true
      const revision = budgetRevision
      try {
        if ((await target.server.protocol) !== "v1") {
          if (!controller.signal.aborted) setStore("error", true)
          return
        }
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        const response = await officeFetch(target.server, "/global/office/spend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionID: target.id, start: start.getTime(), end: end.getTime() }),
          fetch: platform.fetch,
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
        })
        const result = (await response.json()) as Spend
        if (!controller.signal.aborted)
          setStore({
            record: {
              ...result,
              budget: revision === budgetRevision ? result.budget : store.record?.budget,
              scope: target.server.scope,
            },
            error: false,
          })
      } catch {
        if (!controller.signal.aborted) setStore("error", true)
      } finally {
        inflight = false
        if (queued && !controller.signal.aborted) {
          queued = false
          void update()
        }
      }
    }
    refetch = update
    void update()
    onCleanup(() => controller.abort())
  })
  const spend = () => {
    const current = store.record
    return current?.sessionID === props.sessionID && current.scope === server().scope ? current : undefined
  }
  createEffect(() => {
    props.sessionID
    server().scope
    setStore({ dirty: false, budget: "", saveError: false, saving: false })
  })
  createEffect(() => {
    const current = spend()
    if (!store.dirty && current?.sessionID === props.sessionID) setStore("budget", current.budget?.toString() ?? "")
  })
  const timer = setInterval(() => {
    if (document.visibilityState === "visible") void refetch()
  }, 30_000)
  onCleanup(() => clearInterval(timer))

  const save = async () => {
    const limit = store.budget.trim() === "" ? undefined : Number(store.budget)
    if (limit !== undefined && (!Number.isFinite(limit) || limit < 0)) {
      setStore("saveError", true)
      return
    }
    const target = { id: props.sessionID, client: sdk().client, scope: server().scope }
    setStore({ saving: true, saveError: false })
    const signal = AbortSignal.timeout(15_000)
    const saved = await target.client.session
      .get({ sessionID: target.id }, { throwOnError: true, signal })
      .then(async (result) => {
        if (!result.data) return false
        const metadata = { ...result.data?.metadata }
        if (limit === undefined) delete metadata.costBudgetUsd
        else metadata.costBudgetUsd = limit
        await target.client.session.update({ sessionID: target.id, metadata }, { throwOnError: true, signal })
        return true
      })
      .catch(() => false)
    if (target.id !== props.sessionID || target.scope !== server().scope) return
    if (saved) {
      budgetRevision++
      if (store.record) setStore("record", "budget", limit)
    }
    setStore({ saving: false, saveError: !saved, dirty: !saved })
    if (saved) void refetch()
  }

  return (
    <Popover
      open={store.open}
      onOpenChange={(open) => {
        setStore("open", open)
        if (open) void refetch()
      }}
      placement="bottom-end"
    >
      <Popover.Trigger
        class="rounded-md px-2 py-1 text-12-regular text-text-weak hover:bg-surface-raised-base-hover"
        aria-label={language.t("spend.open")}
      >
        {spend() && !store.error
          ? language.t("spend.header", {
              amount: `${spend()!.task.unknown ? "≥" : spend()!.task.estimated ? "≈" : ""}${money(spend()!.task.amount)}`,
            })
          : language.t("spend.unknown")}
        <Show when={spend()?.task.unknown}> *</Show>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class="z-50 w-80 rounded-xl border border-border-base bg-surface-raised-stronger-non-alpha p-4 shadow-lg text-12-regular text-text-base">
          <Popover.Title class="mb-3 text-14-medium">{language.t("spend.open")}</Popover.Title>
          <Show when={spend() && !store.error} fallback={<p>{language.t("spend.unavailable")}</p>}>
            <div class="flex justify-between gap-3">
              <span>{language.t("spend.task")}</span>
              <strong>{money(spend()?.task.amount ?? 0)}</strong>
            </div>
            <div class="mt-2 flex justify-between gap-3">
              <span>{language.t("spend.today")}</span>
              <strong>{money(spend()?.day.amount ?? 0)}</strong>
            </div>
            <For each={spend()?.providers}>
              {(provider) => (
                <div class="mt-1 flex justify-between gap-3 text-text-weak">
                  <span>{provider.provider}</span>
                  <span>
                    {money(provider.amount)}
                    {provider.unknown ? " *" : ""}
                  </span>
                </div>
              )}
            </For>
            <p class="mt-3 text-text-weak">
              {language.t("spend.accounting", {
                reported: money(spend()?.day.reported ?? 0),
                estimated: money(spend()?.day.estimated ?? 0),
                count: spend()?.day.unknown ?? 0,
              })}
            </p>
            <p class="mt-2 text-text-weak">{language.t("spend.scope")}</p>
            <label class="mt-4 block" for={`budget-${props.sessionID}`}>
              {language.t("spend.budget")}
            </label>
            <div class="mt-1 flex gap-2">
              <input
                id={`budget-${props.sessionID}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={store.budget}
                placeholder={language.t("spend.unlimited")}
                onInput={(event) => setStore({ budget: event.currentTarget.value, dirty: true })}
                class="min-w-0 flex-1 rounded-md border border-border-base bg-surface-base px-2 py-1"
              />
              <Button size="small" disabled={store.saving} onClick={() => void save()}>
                {language.t("common.save")}
              </Button>
            </div>
            <p class="mt-2 text-text-weak">{language.t("spend.budgetHelp")}</p>
            <Show when={store.saveError}>
              <p role="alert" class="mt-2 text-text-danger">
                {language.t("spend.saveError")}
              </p>
            </Show>
          </Show>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  )
}
