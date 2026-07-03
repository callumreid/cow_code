// First-class turn/step/tool span export from the v1 engine, gated behind
// config experimental.traceExport (default off). Subscribes to the event bus
// (the same seam plugins use) instead of instrumenting call sites, and ships
// OTLP/HTTP JSON to OTEL_EXPORTER_OTLP_ENDPOINT (default http://localhost:4318).
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Flag } from "@opencode-ai/core/flag/flag"
import { Otlp } from "@opencode-ai/core/observability/otlp"
import { Config } from "@/config/config"
import { EventV2Bridge } from "@/event-v2-bridge"
import { InstanceState } from "@/effect/instance-state"
import { SpanMapper } from "./span-mapper"
import { TurnTiming } from "./turn-timing"
import { Context, Effect, Layer } from "effect"

export interface Interface {
  readonly init: () => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/TraceExport") {}

const EXPORT_TIMEOUT_MS = 1500

const parseHeaders = (value: string | undefined) =>
  value
    ? Object.fromEntries(
        value
          .split(",")
          .map((entry) => entry.split("="))
          .filter((parts) => parts[0])
          .map((parts) => [parts[0], parts.slice(1).join("=")]),
      )
    : undefined

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const config = yield* Config.Service
    const events = yield* EventV2Bridge.Service

    const state = yield* InstanceState.make(
      Effect.fn("TraceExport.state")(function* (ctx) {
        const cfg = yield* config.get()
        if (cfg.experimental?.traceExport !== true) return { enabled: false }

        const endpoint = `${Flag.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318"}/v1/traces`
        const headers = parseHeaders(Flag.OTEL_EXPORTER_OTLP_HEADERS)
        const resource = Otlp.resource()
        const mapperState = SpanMapper.emptyState()

        const send = (spans: SpanMapper.Span[]) => {
          if (!spans.length) return
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS)
          void fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json", ...headers },
            body: JSON.stringify(SpanMapper.tracePayload(resource, spans)),
            signal: controller.signal,
          })
            .catch(() => undefined)
            .finally(() => clearTimeout(timeout))
        }

        const unsubscribe = yield* events.listen((event) =>
          event.location?.directory !== ctx.directory
            ? Effect.void
            : Effect.sync(() =>
                send(SpanMapper.mapEvent(mapperState, { type: event.type, data: event.data }, TurnTiming.take)),
              ),
        )
        yield* Effect.addFinalizer(() => unsubscribe)
        yield* Effect.logInfo("trace export enabled", { endpoint })
        return { enabled: true }
      }),
    )

    const init = Effect.fn("TraceExport.init")(function* () {
      yield* InstanceState.get(state)
    })

    return Service.of({ init })
  }),
)

export const node = LayerNode.make({
  service: Service,
  layer: layer,
  deps: [Config.node, EventV2Bridge.node],
})

export * as TraceExport from "./trace-export"
