import { quietTitle, redact, sessionId, trim } from "./desk.js"
import { namedCommand } from "./commands.js"
import { talk } from "./agent.js"

const uid = (value) => typeof value === "string" && /^[a-zA-Z0-9_-]{8,180}$/.test(value)
const briefQuestion =
  /^(?:(?:farmer|hey farmer)[, ]+)?(?:brief(?: me|ing)?|what(?:'s| is|s) (?:important|new|going on|happening)|what needs (?:me|my attention)|what do i need to know|catch me up)[.!? ]*$/i
const compact = (rows) =>
  rows.map(({ id, title, directory, running, scheduled, parentId, outcome }) => ({
    id,
    title,
    directory,
    running,
    scheduled,
    parentId,
    outcome,
  }))
export function createOffice({ desk, inventory, read, host }) {
  const inFlight = new Map()
  const { state, save, log } = desk
  const context = (input) => ({
    directory: trim(input.directory, 1000),
    projectIds: Object.fromEntries(
      Object.entries(input.projectIds || {}).filter(
        ([key, id]) => key.startsWith("/") && typeof id === "string" && id.length < 300,
      ),
    ),
    projects: Array.isArray(input.projects)
      ? input.projects.filter((p) => typeof p === "string" && p.startsWith("/")).slice(0, 120)
      : [],
    model: trim(input.model, 240),
    agent: trim(input.agent, 120),
  })
  const snapshot = () => ({
    history: state.history.slice(-65),
    attention: desk.attention(),
    proposals: state.proposals
      .filter((p) => Date.now() - p.at < 600000)
      .map(({ id, at, label }) => ({ id, at, label })),
    waits: Object.values(state.waits).map(({ sessionId, kind }) => ({ sessionId, kind })),
  })
  async function brief() {
    const { rows, activeCount } = await inventory.list()
    const items = desk
      .attention()
      .slice(0, 6)
      .map(({ sessionId, kind, title, detail }) => ({ id: sessionId, kind, title, detail }))
    const working = rows.filter((s) => s.running && !s.scheduled && !quietTitle(s.title)).map((s) => s.title)
    return {
      items,
      activeCount,
      working,
      workingCount: rows.filter((s) => s.running && !s.scheduled && !quietTitle(s.title)).length,
    }
  }
  function briefText(b) {
    const top = b.items
      .slice(0, 3)
      .map((item) => item.title + " — " + item.detail)
      .join("\n\n")
    if (top) return top
    if (b.working.length)
      return "Nothing needs your attention. Working now: " + b.working.slice(0, 4).join(", ") + "."
    return b.activeCount
      ? "Nothing needs your attention. Only background work is running."
      : "Nothing needs your attention. No threads are running right now."
  }
  async function detail(id) {
    const row = await inventory.one(id)
    const [status, reply] = await Promise.all([host.sessions.status(id), host.sessions.lastReply(id)])
    const waits = Object.values(state.waits).filter((w) => w.sessionId === id)
    return {
      row,
      status: status.status,
      reply: trim(redact(reply.reply), 5500),
      waits,
      followed: Boolean(state.followed[id]),
    }
  }
  async function actionFor(input, ctx) {
    const kind = input.kind
    if (kind === "dispatch") {
      const directory = trim(input.directory || ctx.directory, 1000)
      if (!directory || !(ctx.projects.includes(directory) || directory === ctx.directory))
        throw new Error("Select the project for the new thread.")
      const text = trim(input.text, 16000),
        title = trim(input.title || text, 100)
      if (!text) throw new Error("Give the new thread an objective.")
      const projectId = ctx.projectIds?.[directory]
      if (!projectId && read) {
        const projects = await read("/api/project")
        const known = projects.some((p) => p.canonical === directory || p.sandboxes?.includes(directory))
        if (!known) throw new Error("Choose a registered project in New thread.")
      }
      return {
        kind,
        directory,
        projectId,
        title,
        text,
        model: ctx.model || state.workerSelection?.model || undefined,
        agent: ctx.agent || state.workerSelection?.agent || undefined,
      }
    }
    if (!["steer", "stop"].includes(kind) || !sessionId(input.id)) throw new Error("Choose a thread and action.")
    const row = await inventory.one(input.id)
    if (kind === "steer" && !trim(input.text)) throw new Error("Write the instruction to send.")
    return { kind, id: row.id, title: row.title, text: kind === "steer" ? trim(input.text, 16000) : undefined }
  }
  const actionLabel = (a) =>
    a.kind === "dispatch"
      ? "Start “" + a.title + "” in " + a.directory + "?\n" + a.text
      : a.kind === "steer"
        ? "Send this to “" + a.title + "”?\n" + a.text
        : "Stop the current turn in “" + a.title + "”?"
  async function apply(action) {
    if (action.kind === "dispatch") {
      const result = await host.sessions.start({
        ...(action.projectId ? { projectId: action.projectId } : { directory: action.directory }),
        title: action.title,
        prompt: action.text,
        agent: action.agent,
        model: action.model,
      })
      if (!sessionId(result.sessionId)) throw new Error("OpenChamber did not return a thread ID.")
      state.followed[result.sessionId] = true
      save()
      inventory.invalidate()
      return { text: "Started “" + action.title + "”.", sessionId: result.sessionId }
    }
    const sid = action.id
    await inventory.one(sid)
    if (action.kind === "steer") {
      const status = await host.sessions.status(sid)
      if (
        status.status === "waiting" ||
        state.cards.some((c) => c.sessionId === sid && c.nativeProject) ||
        Object.values(state.waits).some((w) => w.sessionId === sid)
      )
        throw new Error("Answer the thread’s pending request first. Open its details in All work.")
      await host.sessions.send(sid, action.text)
      return { text: "Sent your instruction to “" + action.title + "”.", sessionId: sid }
    }
    if (action.kind === "stop") {
      const result = await host.sessions.stop(sid)
      return {
        text: result.stopped
          ? "Stopped the current turn in “" + action.title + "”."
          : "“" + action.title + "” had no running turn to stop.",
        sessionId: sid,
      }
    }
    throw new Error("Unknown action.")
  }
  // Persist the reservation before the host call. An unknown delivery is never auto-replayed.
  async function once(id, operation) {
    if (!uid(id)) throw new Error("This request needs a unique ID.")
    if (inFlight.has(id)) return inFlight.get(id)
    const prior = state.receipts[id]
    if (prior?.result) return prior.result
    if (prior) throw new Error(prior.error || "Delivery is unconfirmed. Check the thread before sending it again.")
    state.receipts[id] = { at: Date.now() }
    for (const [key, r] of Object.entries(state.receipts))
      if (Date.now() - r.at > 7 * 86400000) delete state.receipts[key]
    save()
    const task = Promise.resolve()
      .then(operation)
      .then(
        (result) => {
          state.receipts[id].result = result
          save()
          return result
        },
        (error) => {
          state.receipts[id].error = trim(error.message, 320)
          save()
          throw error
        },
      )
      .finally(() => inFlight.delete(id))
    inFlight.set(id, task)
    return task
  }
  async function confirm(id, channel) {
    return once("proposal-" + id, async () => {
      const p = state.proposals.find((p) => p.id === id && Date.now() - p.at < 600000)
      if (!p) throw new Error("That proposal is no longer pending.")
      state.proposals = state.proposals.filter((item) => item.id !== id)
      log("user", "Confirmed: " + p.label, channel)
      save()
      const result = await apply(p.action)
      log("farmer", result.text, channel)
      save()
      return result
    })
  }
  function toolFor(ctx, channel) {
    return async (name, args) => {
      if (name === "brief") return brief()
      if (name === "conversation")
        return state.history
          .filter((m) => !args.channel || m.channel === args.channel)
          .slice(-24)
          .map(({ role, channel, text }) => ({ role, channel, text: trim(text, 800) }))
      if (name === "work") {
        const { rows, activeCount, cursor } = await inventory.list(trim(args.query, 160))
        return {
          activeCount,
          threads: compact(rows.filter((s) => s.running)).concat(
            compact(rows.filter((s) => !s.running).slice(0, 32)),
          ),
          more: Boolean(cursor),
        }
      }
      if (name === "read_thread") return detail(args.id)
      if (name === "prepare") {
        const action = await actionFor(args, ctx)
        const p = desk.propose(action, actionLabel(action))
        return { proposal: { id: p.id, label: p.label }, channel }
      }
      throw new Error("Unknown office tool.")
    }
  }
  async function respond(text, ctx, channel) {
    const history = state.history
      .slice(-30)
      .map(({ role, channel, text }) => ({ role, channel, text: trim(text, 1000) }))
    const tools = toolFor(ctx, channel)
    let proposal
    async function tool(name, args) {
      const result = await tools(name, args)
      if (result.proposal) proposal = result.proposal
      return result
    }
    const command = await namedCommand(text, ctx, inventory, (args) => tool("prepare", args))
    const answer =
      command ||
      (briefQuestion.test(text) ? briefText(await brief()) : await talk(text, { ...ctx, history }, tool))
    return { text: answer.replace(/^\[(?:voice|chat)\]\s*/i, ""), ...(proposal ? { proposal } : {}) }
  }
  async function chat(input) {
    const text = trim(input.text, 12000)
    if (!text) throw new Error("Write a message for Farmer.")
    if (/^(?:yes|confirm|go ahead|do it|send it)[.! ]*$/i.test(text) && input.proposalId)
      return confirm(input.proposalId, "chat")
    return once(input.requestId, async () => {
      log("user", text)
      save()
      const result = await respond(text, context(input), "chat")
      log("farmer", result.text)
      save()
      return result
    })
  }
  async function direct(input) {
    return once(input.requestId, async () => {
      const action = await actionFor(input, context(input))
      log("user", actionLabel(action).replace("?\n", "\n"))
      save()
      const result = await apply(action)
      log("farmer", result.text)
      save()
      return result
    })
  }
  async function answer(input) {
    if (!["allow", "deny", "form", "page-reply"].includes(input.decision)) throw new Error("Choose how to answer.")
    const key = "answer-" + input.requestId
    const item = state.waits[input.requestId]
    if (!item || item.sessionId !== input.id) {
      if (state.receipts[key]?.result?.sessionId === input.id) return state.receipts[key].result
      throw new Error("That request has already closed.")
    }
    return once(key, async () => {
      if (item.kind === "permission" && ["allow", "deny"].includes(input.decision))
        await host.sessions.answerPermission(item.sessionId, item.requestId, { decision: input.decision })
      else if (item.ask?.kind === "form" && input.decision === "form")
        await host.sessions.answerForm(item.sessionId, item.requestId, input.values)
      else if (item.ask?.kind === "page" && input.decision === "page-reply") {
        const response = trim(input.values?.reply, 6000)
        const waits = Object.values(state.waits).filter((w) => w.sessionId === item.sessionId)
        if (!response || waits.length !== 1 || (await host.sessions.status(item.sessionId)).status !== "waiting")
          throw new Error("Open the thread to check its current request.")
        await host.sessions.send(item.sessionId, response)
      } else throw new Error("Open the original thread to answer this request.")
      state.cards = state.cards.filter((c) => c.requestId !== item.requestId)
      delete state.waits[item.requestId]
      const text = "Answered the request in “" + item.title + "”."
      log("farmer", text)
      save()
      return { text, sessionId: item.sessionId }
    })
  }
  function workerSelection(input) {
    const model = trim(input.model, 240),
      agent = trim(input.agent, 120)
    if (!model.includes("/") || !agent) throw new Error("Select an OpenChamber worker model and agent.")
    state.workerSelection = { model, agent }
    save()
    return { ok: true }
  }
  return {
    snapshot,
    brief,
    context,
    detail,
    chat,
    respond,
    confirm,
    direct,
    answer,
    toolFor,
    workerSelection,
    dismiss(id) {
      const card = state.cards.find((c) => c.id === id)
      if (card) card.dismissed = true
      save()
      return { ok: true }
    },
    cancel(id) {
      state.proposals = state.proposals.filter((p) => p.id !== id)
      save()
      return { ok: true }
    },
  }
}
