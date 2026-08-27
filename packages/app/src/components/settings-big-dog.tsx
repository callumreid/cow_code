import { Show, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useServerSDK } from "@/context/server-sdk"
import { runBigDogCensus, type BigDogCensus } from "@/utils/big-dog-census"

const STORAGE_KEY = "cowcode-big-dog-census"

function loadCached(): BigDogCensus | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return undefined
    if (!("userBigDogs" in parsed) || typeof parsed.userBigDogs !== "number") return undefined
    if (!("agentBigDogModes" in parsed) || typeof parsed.agentBigDogModes !== "number") return undefined
    if (!("sessionsScanned" in parsed) || typeof parsed.sessionsScanned !== "number") return undefined
    if (!("messagesScanned" in parsed) || typeof parsed.messagesScanned !== "number") return undefined
    if (!("countedAt" in parsed) || typeof parsed.countedAt !== "number") return undefined
    return {
      userBigDogs: parsed.userBigDogs,
      agentBigDogModes: parsed.agentBigDogModes,
      sessionsScanned: parsed.sessionsScanned,
      messagesScanned: parsed.messagesScanned,
      countedAt: parsed.countedAt,
    }
  } catch {
    return undefined
  }
}

export function SettingsBigDog() {
  const serverSdk = useServerSDK()
  const [census, setCensus] = createSignal(loadCached())
  const [progress, setProgress] = createSignal<{ scanned: number; total: number } | undefined>()
  const [error, setError] = createSignal<string | undefined>()

  const counting = () => progress() !== undefined

  const count = async () => {
    setError(undefined)
    setProgress({ scanned: 0, total: 0 })
    try {
      const result = await runBigDogCensus(serverSdk().client, (scanned, total) => setProgress({ scanned, total }))
      setCensus(result)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
      } catch {
        // a census that cannot be remembered is still a census that happened
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setProgress(undefined)
    }
  }

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "16px", padding: "8px 4px", "max-width": "560px" }}>
      <div>
        <div style={{ "font-size": "15px", "font-weight": "600" }}>big dogging your agent</div>
        <div style={{ "font-size": "13px", opacity: "0.75", "margin-top": "4px", "line-height": "1.5" }}>
          a full census of the sacred exchange: every time you have called your agent some version of "big dog", and
          every time your agent announced some version of going into big dog mode. counted across every session on this
          server. spelled mooo. unrelated, but it needed saying.
        </div>
      </div>

      <div>
        <Button onClick={() => void count()} disabled={counting()}>
          {counting() ? "counting the big dogs…" : census() ? "recount the big dogs" : "count the big dogs"}
        </Button>
      </div>

      <Show when={progress()}>
        {(p) => (
          <div style={{ "font-size": "13px", opacity: "0.7" }}>
            sniffing session {p().scanned}
            {p().total ? ` of ${p().total}` : ""}…
          </div>
        )}
      </Show>

      <Show when={error()}>
        {(message) => <div style={{ "font-size": "13px", color: "var(--text-error, #d1383d)" }}>{message()}</div>}
      </Show>

      <Show when={census()}>
        {(result) => (
          <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "24px", "flex-wrap": "wrap" }}>
              <div>
                <div style={{ "font-size": "34px", "font-weight": "700", "line-height": "1.1" }}>
                  {result().userBigDogs.toLocaleString()}
                </div>
                <div style={{ "font-size": "12px", opacity: "0.7" }}>times you big dogged your agent</div>
              </div>
              <div>
                <div style={{ "font-size": "34px", "font-weight": "700", "line-height": "1.1" }}>
                  {result().agentBigDogModes.toLocaleString()}
                </div>
                <div style={{ "font-size": "12px", opacity: "0.7" }}>times your agent went big dog mode</div>
              </div>
            </div>
            <div style={{ "font-size": "12px", opacity: "0.55" }}>
              {result().sessionsScanned.toLocaleString()} sessions · {result().messagesScanned.toLocaleString()}{" "}
              messages · counted {new Date(result().countedAt).toLocaleString()}
            </div>
            <div style={{ "font-size": "12px", opacity: "0.55", "font-style": "italic" }}>
              {result().userBigDogs === 0
                ? "you have never big dogged your agent. it is waiting."
                : result().agentBigDogModes >= result().userBigDogs
                  ? "your agent big dogs harder than you. reflect."
                  : "the herd is in balance. you got this, big dog."}
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
