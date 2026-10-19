import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Context, Effect, Layer, Schema } from "effect"
import fs from "fs/promises"
import os from "os"
import path from "path"

/**
 * The barn door: the box's public phone link, for the desktop's Connect phone
 * dialog. cloudflared's quick tunnel prints its random hostname only into
 * ~/Library/Logs/cow-public.log and the gate key lives in
 * ~/.config/opencode/gate-token; this joins the two. Off the box (laptops, CI)
 * both are absent and every field is null.
 *
 * The packaged sidecar runs under Node, so only Node APIs may be used here.
 */

export const State = Schema.Struct({
  url: Schema.NullOr(Schema.String),
  origin: Schema.NullOr(Schema.String),
  since: Schema.NullOr(Schema.Finite),
  address: Schema.optional(Schema.Literals(["stable", "temporary"])),
  health: Schema.optional(
    Schema.Struct({
      checkedAt: Schema.Finite,
      gate: Schema.Boolean,
      public: Schema.Boolean,
      server: Schema.NullOr(Schema.Boolean),
    }),
  ),
}).annotate({ identifier: "PhoneDoor" })
export type State = typeof State.Type

export interface Interface {
  readonly state: () => Effect.Effect<State>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/PhoneDoor") {}

const EMPTY: State = { url: null, origin: null, since: null }
const MIN_TOKEN = 32
const TAIL_BYTES = 512 * 1024
const ORIGIN = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/

const home = os.homedir()
export const files = {
  log: path.join(home, "Library", "Logs", "cow-public.log"),
  token: path.join(home, ".config", "opencode", "gate-token"),
  origin: path.join(home, ".config", "cow", "phone-origin"),
}

/** A stable origin is operator configuration, never a link scraped from a failed request. */
export function stableOrigin(text: string) {
  try {
    const value = new URL(text.trim())
    if (
      value.protocol !== "https:" ||
      value.username ||
      value.password ||
      value.search ||
      value.hash ||
      value.pathname !== "/"
    )
      return undefined
    return value.origin
  } catch {
    return undefined
  }
}

/**
 * The current quick-tunnel origin and when cloudflared minted it. A failed
 * request line also names the origin (`dest=https://…/path`), so the last
 * mention is the current origin and the first mention of that origin is the
 * banner cloudflared printed when it came up.
 */
export function parseLog(text: string) {
  const lines = text.split("\n")
  const origins = lines.map((line) => line.match(ORIGIN)?.[0])
  const origin = origins.findLast((found) => found !== undefined)
  if (!origin) return undefined
  const stamp = Date.parse(lines[origins.indexOf(origin)].match(/^(\S+)/)?.[1] ?? "")
  return { origin, since: Number.isFinite(stamp) ? stamp : null }
}

/** Reads the door from the given files; never rejects, nulls when either side is missing. */
export async function read(input: {
  log: string
  token: string
  origin?: string
  probe?: boolean
  gateUrl?: string
}): Promise<State> {
  const token = await fs.readFile(input.token, "utf8").then(
    (text) => text.trim(),
    () => "",
  )
  if (token.length < MIN_TOKEN) return EMPTY
  const configured = input.origin ? await fs.readFile(input.origin, "utf8").catch(() => undefined) : undefined
  const stable = configured === undefined ? undefined : stableOrigin(configured)
  // Invalid explicit configuration must not silently advertise a different address.
  if (configured !== undefined && !stable) return EMPTY
  const found = stable ? { origin: stable, since: null } : parseLog(await tail(input.log))
  if (!found) return EMPTY
  const health = input.probe ? await probeDoor(found.origin, token, input.gateUrl) : undefined
  return {
    url: `${found.origin}/?_cowcode_gate=${encodeURIComponent(token)}`,
    origin: found.origin,
    since: found.since,
    ...(input.origin ? { address: stable ? ("stable" as const) : ("temporary" as const) } : {}),
    ...(health ? { health } : {}),
  }
}

export async function probeDoor(origin: string, token: string, gateUrl = "http://127.0.0.1:4098") {
  const ping = (base: string) =>
    fetch(`${base}/_cow/ping`, {
      headers: { cookie: `cowcode_gate=${token}` },
      signal: AbortSignal.timeout(4_000),
      redirect: "error",
    })
      .then(async (response) => {
        if (!response.ok) return undefined
        const body: unknown = await response.json()
        if (!body || typeof body !== "object" || !("ok" in body) || body.ok !== true) return undefined
        return { server: "server" in body && typeof body.server === "boolean" ? body.server : null }
      })
      .catch(() => undefined)
  const [local, remote] = await Promise.all([ping(gateUrl), ping(origin)])
  return { checkedAt: Date.now(), gate: !!local, public: !!remote, server: local?.server ?? remote?.server ?? null }
}

async function tail(file: string) {
  const handle = await fs.open(file, "r").catch(() => undefined)
  if (!handle) return ""
  try {
    const { size } = await handle.stat()
    const bytes = Math.min(size, TAIL_BYTES)
    if (bytes === 0) return ""
    const buffer = Buffer.alloc(bytes)
    await handle.read(buffer, 0, bytes, size - bytes)
    return buffer.toString("utf8")
  } finally {
    await handle.close()
  }
}

const layer = Layer.succeed(Service, Service.of({ state: () => Effect.promise(() => read({ ...files, probe: true })) }))

export const node = LayerNode.make({
  service: Service,
  layer,
  deps: [],
})

export * as PhoneDoor from "./phone"
