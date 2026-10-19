import { createEffect, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Button } from "@opencode-ai/ui/button"
import { useQueryClient } from "@tanstack/solid-query"
import { useServerSync } from "@/context/server-sync"
import { directoryKey } from "@/context/global-sync/utils"
import { useLanguage } from "@/context/language"
import { useSDK } from "@/context/sdk"
import { usePlatform } from "@/context/platform"
import { useServerProtocol, useServerSDK } from "@/context/server-sdk"
import { officeFetch } from "@/office/api"

type Health = {
  status: string
  checkedAt: number
  reachable: boolean
  latencyMs?: number
  toolCount?: number
  capabilities: string[]
  lastSuccess?: { at: number; tool: string }
  error?: string
}

/** A test observes an existing connection; reconnect is an explicit separate action. */
export function IntegrationHealth(props: { name: string; status: string; error?: string }) {
  const language = useLanguage()
  const sync = useServerSync()
  const queries = useQueryClient()
  const sdk = useSDK()
  const server = useServerSDK()
  const platform = usePlatform()
  const protocol = useServerProtocol()
  const [state, setState] = createStore({ pending: false, health: undefined as Health | undefined, error: "" })
  let generation = 0
  createEffect(() => {
    server()
    sdk().directory
    generation++
    setState({ pending: false, health: undefined, error: "" })
  })
  onCleanup(() => generation++)
  const status = () => props.status
  const check = async (reconnect = false) => {
    const run = ++generation
    const current = server()
    const directory = sdk().directory
    const route = `/mcp/${encodeURIComponent(props.name)}`
    const query = `?directory=${encodeURIComponent(directory)}`
    const init = { method: "POST", fetch: platform.fetch, signal: AbortSignal.timeout(15_000) }
    setState({ pending: true, error: "" })
    try {
      if (reconnect) {
        await officeFetch(current, route + "/connect" + query, init)
        if (run !== generation) return
        await queries.refetchQueries(sync().queryOptions.mcp(directoryKey(directory)))
      }
      const response = await officeFetch(current, route + "/health" + query, init)
      const health = (await response.json()) as Health
      if (run === generation) setState("health", health)
    } catch (error) {
      if (run === generation) setState("error", error instanceof Error ? error.message : String(error))
    } finally {
      if (run === generation) setState("pending", false)
    }
  }
  return (
    <div class="px-3 pb-3 flex flex-col gap-1 text-11-regular text-text-weak">
      <span>{language.t("integration.status." + status())}</span>
      <Show when={!state.health && props.error}>
        <span class="text-icon-critical-base break-words">{props.error}</span>
      </Show>
      <Show when={state.health} fallback={<span>{language.t("integration.notTested")}</span>}>
        {(health) => (
          <>
            <span
              classList={{
                "text-icon-success-base": health().reachable,
                "text-icon-critical-base": !health().reachable,
              }}
            >
              {health().reachable
                ? language.t("integration.testPassed", { count: health().toolCount ?? 0, ms: health().latencyMs ?? 0 })
                : language.t("integration.testFailed")}
            </span>
            <span>
              {language.t("integration.checkedAt", { time: new Date(health().checkedAt).toLocaleTimeString() })}
            </span>
            <Show when={health().error}>
              <span class="text-icon-critical-base break-words">{health().error}</span>
            </Show>
            <span>
              {health().lastSuccess
                ? language.t("integration.lastSuccess", {
                    tool: health().lastSuccess!.tool,
                    time: new Date(health().lastSuccess!.at).toLocaleString(),
                  })
                : language.t("integration.noSuccess")}
            </span>
          </>
        )}
      </Show>
      <Show when={state.error}>
        <span class="text-icon-critical-base break-words">{state.error}</span>
      </Show>
      <Show when={protocol() === "v1"} fallback={<span>{language.t("integration.testUnavailable")}</span>}>
        <div class="flex gap-2 mt-1">
          <Button
            size="small"
            variant="secondary"
            disabled={state.pending || status() !== "connected"}
            onClick={() => void check()}
          >
            {language.t(state.pending ? "integration.testing" : "integration.test")}
          </Button>
          <Show when={status() === "connected" || status() === "failed"}>
            <Button size="small" variant="ghost" disabled={state.pending} onClick={() => void check(true)}>
              {language.t("integration.reconnect")}
            </Button>
          </Show>
        </div>
      </Show>
    </div>
  )
}
