import { EffectFlock } from "@opencode-ai/core/util/effect-flock"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { Context, Effect, Layer, Schema, Semaphore } from "effect"
import { OfficeLedger } from "@/office/ledger"
import { SessionID } from "./schema"

/** Recovery is local to this server/database, never a distributed ownership lease. */
export const MAX_RECOVERY_AGE = 24 * 60 * 60 * 1000
export type Checkpoint = {
  sessionID: SessionID
  ownerPID: number
  directory: string
  startedAt: number
  deadline: number
  lastProgressAt: number
  attempt?: number
  next?: number
  reason?: string
}
export type State = "running" | "retrying" | "blocked" | "completed" | "canceled"
export const Snapshot = Schema.NullOr(
  Schema.Struct({
    state: Schema.Literals(["running", "retrying", "blocked", "completed", "canceled"]),
    lastProgressAt: Schema.Finite,
    deadline: Schema.Finite,
    attempt: Schema.optional(Schema.Finite),
    next: Schema.optional(Schema.Finite),
    reason: Schema.optional(Schema.String),
  }),
)

/** A second local server must never mistake another live process for a crashed owner. */
export function ownerAlive(checkpoint: Pick<Checkpoint, "ownerPID">) {
  if (!Number.isSafeInteger(checkpoint.ownerPID) || checkpoint.ownerPID <= 0) return true
  try {
    process.kill(checkpoint.ownerPID, 0)
    return true
  } catch (error) {
    return !(error && typeof error === "object" && "code" in error && error.code === "ESRCH")
  }
}

export function reason(result: SessionV1.WithParts) {
  const error = result.info.role === "assistant" ? result.info.error : undefined
  return error && "message" in error.data ? error.data.message : undefined
}

export function reconcile(messages: readonly SessionV1.WithParts[], startedAt: number, deadline: number, now: number) {
  // Any uncertain side effect must be inspected, including a call from an earlier
  // provider turn. Completed results remain in history and are never executed again.
  const uncertain = messages
    .filter((message) => message.info.time.created >= startedAt)
    .flatMap((message) => message.parts)
    .find(
      (part) =>
        part.type === "tool" &&
        (part.state.status === "pending" ||
          part.state.status === "running" ||
          (part.state.status === "error" && part.state.metadata?.interrupted === true)),
    )
  if (uncertain)
    return {
      state: "blocked" as const,
      reason: "A tool was interrupted. Inspect its result before resuming; it has not been repeated.",
    }
  const last = messages.findLast((message) => message.info.role === "assistant")
  const user = messages.findLast((message) => message.info.role === "user")
  if (!user || user.info.time.created < startedAt - 1000)
    return {
      state: "blocked" as const,
      reason: "The saved task no longer matches its conversation. Inspect the thread before resuming.",
    }
  if (
    last?.info.role === "assistant" &&
    last.info.parentID === user.info.id &&
    last.info.finish &&
    !["tool-calls", "unknown", "error"].includes(last.info.finish) &&
    !last.info.error &&
    !last.parts.some((part) => part.type === "tool" && !part.metadata?.providerExecuted)
  )
    return { state: "completed" as const }
  if (now >= deadline)
    return {
      state: "blocked" as const,
      reason: "The 24-hour recovery window expired. Resume explicitly to start a new window.",
    }
  return { state: "running" as const }
}

export interface Interface {
  readonly start: (sessionID: SessionID, directory: string, startedAt: number) => Effect.Effect<Checkpoint>
  readonly startAutomatic: (
    sessionID: SessionID,
    directory: string,
    startedAt: number,
  ) => Effect.Effect<Checkpoint | undefined>
  readonly get: (sessionID: SessionID) => Effect.Effect<OfficeLedger.Record<Checkpoint> | undefined>
  readonly update: (sessionID: SessionID, state: State, update?: Partial<Checkpoint>) => Effect.Effect<void>
  readonly claim: (sessionID: SessionID) => Effect.Effect<Checkpoint | undefined>
  readonly pending: () => Effect.Effect<OfficeLedger.Record<Checkpoint>[]>
}
export class Service extends Context.Service<Service, Interface>()("@opencode/SessionRecovery") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const ledger = yield* OfficeLedger.Service
    const flock = yield* EffectFlock.Service
    const journal = Semaphore.makeUnsafe(1)
    const update: Interface["update"] = Effect.fn("SessionRecovery.update")(function* (sessionID, state, update) {
      const saved = yield* ledger.get<Checkpoint>("recovery:" + sessionID)
      if (!saved || (saved.state === "canceled" && state !== "canceled")) return
      yield* ledger.put({ ...saved, state, value: { ...saved.value, ...update } })
    }, journal.withPermit)
    const begin = Effect.fn("SessionRecovery.start")(function* (
      sessionID: SessionID,
      directory: string,
      startedAt: number,
      automatic: boolean,
    ) {
      const saved = yield* ledger.get<Checkpoint>("recovery:" + sessionID)
      if (automatic && saved && ["canceled", "blocked"].includes(saved.state)) return
      const active = saved && ["running", "retrying"].includes(saved.state)
      const value: Checkpoint = active
        ? { ...saved.value, ownerPID: process.pid, lastProgressAt: Date.now(), next: undefined }
        : {
            sessionID,
            ownerPID: process.pid,
            directory,
            startedAt,
            deadline: Date.now() + MAX_RECOVERY_AGE,
            lastProgressAt: Date.now(),
          }
      yield* ledger.put({ id: "recovery:" + sessionID, kind: "recovery", state: "running", sessionID, value })
      return value
    }, journal.withPermit)
    return Service.of({
      update,
      get: (sessionID) => ledger.get<Checkpoint>("recovery:" + sessionID),
      start: (sessionID, directory, startedAt) =>
        begin(sessionID, directory, startedAt, false).pipe(Effect.map((value) => value!)),
      startAutomatic: (sessionID, directory, startedAt) => begin(sessionID, directory, startedAt, true),
      claim: (sessionID) =>
        Effect.gen(function* () {
          const saved = yield* ledger.get<Checkpoint>("recovery:" + sessionID)
          if (!saved || !["running", "retrying"].includes(saved.state) || ownerAlive(saved.value)) return
          const value = { ...saved.value, ownerPID: process.pid }
          yield* ledger.put({ ...saved, value })
          return value
        }).pipe(flock.withLock("session-recovery:" + sessionID), Effect.orDie),
      pending: () =>
        ledger
          .list<Checkpoint>("recovery")
          .pipe(Effect.map((rows) => rows.filter((row) => row.state === "running" || row.state === "retrying"))),
    })
  }),
)
export const node = LayerNode.make({ service: Service, layer, deps: [OfficeLedger.node, EffectFlock.node] })
export * as SessionRecovery from "./recovery"
