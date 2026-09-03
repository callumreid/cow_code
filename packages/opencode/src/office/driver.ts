// Drives the farmer: owns the overseer session, turns reports into farmer turns
// under the attention policy, and carries Callum's words to threads.
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { EffectBridge } from "@/effect/bridge"
import { InstanceStore } from "@/project/instance-store"
import { SessionPrompt } from "@/session/prompt"
import { Session } from "@/session/session"
import { SessionID } from "@/session/schema"
import { Context, Effect, Layer, Scope, Semaphore } from "effect"
import { Office } from "./office"

export interface Interface {
  readonly ensureOverseer: () => Effect.Effect<Office.OverseerRef>
  readonly ask: (input: { text: string; source?: "text" | "voice" }) => Effect.Effect<{ text: string; sessionID: string }>
  readonly brief: (input: { since: number }) => Effect.Effect<{ text: string; sessionID: string; skipped: boolean }>
  readonly promptThread: (input: {
    sessionID: string
    text: string
    mode: "steer" | "context"
  }) => Effect.Effect<void, Office.OfficeError>
  readonly dispatch: (input: {
    directory: string
    title: string
    prompt: string
    agent?: string
  }) => Effect.Effect<{ sessionID: string }>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/OfficeDriver") {}

// Silence by default: a plain finish is a card and nothing more. Review-ready
// threads batch into one digest per DIGEST_MS; anything that needs a decision
// or is broken wakes the farmer at once.
const DIGEST_MS = 10 * 60_000
const URGENT = new Set<Office.ReportKind>(["permission", "question", "error", "stalled"])
const QUIET = new Set<Office.ReportKind>(["finished", "auto_allowed"])

function renderReports(reports: Office.Report[]) {
  const lines = reports.map((report) => `- ${report.kind} · "${report.title}": ${report.summary}`)
  const urgent = reports.some((report) => URGENT.has(report.kind))
  const instruction = urgent
    ? "Handle what is yours to handle first (tier farmer permissions, questions whose answer is in the thread, a stalled thread you can nudge), then brief Callum only on what needs him. Decisions get at most three options and a recommended default. One or two sentences per item; skip items that need nothing."
    : "These threads are ready for review. One sentence each, exact facts from the summary, nothing else. If a thread named an obvious next step, send it with office_prompt and say so in the same sentence."
  return ["<office_reports>", ...lines, "</office_reports>", instruction].join("\n")
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const office = yield* Office.Service
    const sessions = yield* Session.Service
    const prompt = yield* SessionPrompt.Service
    const instances = yield* InstanceStore.Service
    const scope = yield* Scope.Scope
    const bridge = yield* EffectBridge.make()
    const semaphore = Semaphore.makeUnsafe(1)

    const pending: Office.Report[] = []
    const clock = { first: 0, urgent: false }

    const ensureOverseer = Effect.fn("OfficeDriver.ensureOverseer")(function* () {
      const known = yield* office.overseer()
      if (known) {
        const alive = yield* sessions.get(SessionID.make(known.sessionID)).pipe(Effect.orElseSucceed(() => undefined))
        if (alive && !alive.time.archived) return known
      }
      const list = yield* sessions.listGlobal({ directory: office.directory, limit: 20 })
      const found = list.find((session) => session.metadata?.office === "overseer" && !session.time.archived)
      if (found) {
        const ref = { sessionID: found.id, directory: office.directory }
        yield* office.setOverseer(ref)
        return ref
      }
      const created = yield* instances.provide(
        { directory: office.directory },
        sessions.create({ title: "Farmer's Office", agent: "farmer", metadata: { office: "overseer" } }),
      )
      const ref = { sessionID: created.id, directory: office.directory }
      yield* office.setOverseer(ref)
      return ref
    })

    // One farmer turn at a time; reports that land mid-turn wait for the next one.
    const turn = (input: { text: string; synthetic: boolean }) =>
      semaphore.withPermits(1)(
        Effect.gen(function* () {
          const ref = yield* ensureOverseer()
          const block = yield* office.render()
          const result = yield* instances.provide(
            { directory: office.directory },
            prompt.prompt({
              sessionID: SessionID.make(ref.sessionID),
              agent: "farmer",
              system: block,
              parts: [{ type: "text", text: input.text, synthetic: input.synthetic }],
            }),
          )
          const text = result.parts.findLast((part) => part.type === "text")
          return { text: text && text.type === "text" ? text.text : "", sessionID: ref.sessionID }
        }),
      )

    const flush = Effect.gen(function* () {
      if (pending.length === 0) return
      const batch = pending.splice(0, pending.length)
      clock.first = 0
      clock.urgent = false
      yield* turn({ text: renderReports(batch), synthetic: true }).pipe(
        Effect.catchCause((cause) => Effect.logError("farmer turn failed", { cause })),
      )
    })

    const handleReport = (report: Office.Report) =>
      Effect.gen(function* () {
        if (QUIET.has(report.kind)) return
        if (report.kind === "permission") {
          const thread = yield* office.thread(report.sessionID)
          const waiting = thread?.waiting
          if (waiting?.kind === "permission" && waiting.tier === "auto") {
            yield* office.answer({ sessionID: report.sessionID, permission: { id: waiting.id, reply: "once" } }).pipe(
              Effect.catchCause((cause) => Effect.logWarning("auto allow failed", { cause })),
            )
            yield* office.note({
              kind: "auto_allowed",
              sessionID: report.sessionID,
              directory: report.directory,
              title: report.title,
              summary: `allowed automatically (read-only): ${report.summary}`,
            })
            return
          }
        }
        if (pending.length === 0) clock.first = Date.now()
        if (URGENT.has(report.kind)) clock.urgent = true
        pending.push(report)
      })

    const unsubscribe = office.onReport((report) => {
      bridge.fork(handleReport(report).pipe(Effect.catchCause((cause) => Effect.logWarning("report failed", { cause }))))
    })
    yield* Effect.addFinalizer(() => Effect.sync(unsubscribe))

    const tick = Effect.gen(function* () {
      if (pending.length === 0) return
      if (!clock.urgent && Date.now() - clock.first < DIGEST_MS) return
      yield* flush
    })
    yield* Effect.forever(Effect.sleep("2 seconds").pipe(Effect.andThen(tick))).pipe(
      Effect.forkIn(scope, { startImmediately: true }),
    )

    const reminders = Effect.gen(function* () {
      const due = yield* office.dueReminders()
      if (due.length === 0) return
      const lines = due.map((reminder) => `- ${reminder.note}${reminder.sessionID ? ` (thread ${reminder.sessionID})` : ""}`)
      yield* turn({
        text: ["<office_reminders>", ...lines, "</office_reminders>", "These reminders are due. Check the threads they name with office_read and act or brief Callum."].join("\n"),
        synthetic: true,
      }).pipe(Effect.catchCause((cause) => Effect.logError("reminder turn failed", { cause })))
    })
    yield* Effect.forever(Effect.sleep("30 seconds").pipe(Effect.andThen(reminders))).pipe(
      Effect.forkIn(scope, { startImmediately: true }),
    )

    const ask = Effect.fn("OfficeDriver.ask")(function* (input: { text: string; source?: "text" | "voice" }) {
      const text = input.source === "voice" ? `(spoken, from voice — keep the reply under forty words)\n${input.text}` : input.text
      return yield* turn({ text, synthetic: false }).pipe(Effect.orDie)
    })

    // "Since you last looked": one short brief when Callum opens the office, and
    // no model call at all when nothing happened.
    const brief = Effect.fn("OfficeDriver.brief")(function* (input: { since: number }) {
      const state = yield* office.state()
      const since = state.reports.filter((report) => report.time > input.since && report.kind !== "auto_allowed")
      const needs = state.threads.filter((thread) => thread.bucket === "needs_you" || thread.bucket === "failed")
      if (since.length === 0 && needs.length === 0) {
        const ref = yield* ensureOverseer()
        return { text: "", sessionID: ref.sessionID, skipped: true }
      }
      const lines = since.map((report) => `- ${report.kind} · "${report.title}": ${report.summary}`)
      const text = [
        "<office_since_last_look>",
        ...(lines.length ? lines : ["- nothing new was reported"]),
        "</office_since_last_look>",
        `Callum just opened the office. In at most three sentences, tell him what changed since he last looked and what needs him now (${needs.length} thread${needs.length === 1 ? "" : "s"} need a decision or failed). Lead with what needs him. Do not repeat anything you already told him unless it still needs him.`,
      ].join("\n")
      const result = yield* turn({ text, synthetic: true }).pipe(Effect.orDie)
      return { ...result, skipped: false }
    })

    const directoryOf = Effect.fn("OfficeDriver.directoryOf")(function* (sessionID: string) {
      const thread = yield* office.thread(sessionID)
      if (thread) return thread.directory
      const info = yield* sessions.get(SessionID.make(sessionID)).pipe(Effect.orElseSucceed(() => undefined))
      if (!info) return yield* new Office.OfficeError({ message: `unknown thread ${sessionID}` })
      return info.directory
    })

    const promptThread = Effect.fn("OfficeDriver.promptThread")(function* (input: {
      sessionID: string
      text: string
      mode: "steer" | "context"
    }) {
      const directory = yield* directoryOf(input.sessionID)
      yield* instances
        .provide(
          { directory },
          prompt.prompt({
            sessionID: SessionID.make(input.sessionID),
            noReply: input.mode === "context",
            parts: [{ type: "text", text: input.text }],
          }),
        )
        .pipe(
          Effect.catchCause((cause) => Effect.logError("thread prompt failed", { sessionID: input.sessionID, cause })),
          Effect.forkIn(scope, { startImmediately: true }),
        )
    })

    const dispatch = Effect.fn("OfficeDriver.dispatch")(function* (input: {
      directory: string
      title: string
      prompt: string
      agent?: string
    }) {
      const created = yield* instances.provide(
        { directory: input.directory },
        sessions.create({ title: input.title, agent: input.agent }),
      )
      yield* promptThread({ sessionID: created.id, text: input.prompt, mode: "steer" }).pipe(Effect.orDie)
      return { sessionID: created.id }
    })

    return Service.of({ ensureOverseer, ask, brief, promptThread, dispatch })
  }),
)

export const node = LayerNode.make({
  service: Service,
  layer,
  deps: [Office.node, Session.node, SessionPrompt.node, InstanceStore.node],
})

export * as OfficeDriver from "./driver"
