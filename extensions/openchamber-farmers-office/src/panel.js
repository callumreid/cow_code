import { connectHost } from "@openchamber/sdk"
import { applyHostReady } from "@openchamber/sdk/ui"
import { voiceDevice } from "./device-voice.js"

import { watchWaiting } from "./workspace.js"
const host = connectHost()
watchWaiting(host)
const $ = (id) => document.getElementById(id)
const el = (tag, text = "", classes = "") => {
  const node = document.createElement(tag)
  node.textContent = text
  if (classes) node.className = classes
  return node
}
async function request(path, body = {}) {
  const result = await host.serviceRequest({ method: "POST", path, body: JSON.stringify(body) })
  const data = JSON.parse(result.body)
  if (result.status >= 400) throw new Error(data.error || "OpenChamber could not complete the request.")
  return data
}
const notice = (text) => {
  $("notice").textContent = text || ""
  $("notice").hidden = !text
}
const run = async (fn) => {
  try {
    notice("")
    await fn()
  } catch (error) {
    notice(error.message)
  }
}
const btn = (text, fn, classes = "") => {
  const b = el("button", text, classes)
  b.type = "button"
  b.onclick = () => {
    b.disabled = true
    run(fn).finally(() => {
      b.disabled = false
    })
  }
  return b
}
const field = (name, input) => {
  const label = el("label", name)
  label.append(input)
  return label
}
const shortPath = (path) => path?.split("/").filter(Boolean).slice(-2).join("/") || ""
const when = (at) =>
  new Date(at).toLocaleString(undefined, {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
let selectedProject = "",
  projects = [],
  ctx = {},
  latest = {},
  rows = [],
  cursor = "",
  isWork = false,
  loaded = false,
  stateVersion = 0,
  workVersion = 0,
  searchTimer,
  selectedDetail = "",
  detailVersion = 0,
  chatting = false
const device = voiceDevice(
  host,
  request,
  (live) => {
    $("talk").textContent = live ? "■  End call" : "◉  Talk"
    $("talk").classList.toggle("live", live)
    $("talk").setAttribute("aria-label", live ? "End voice conversation" : "Start voice conversation")
  },
  (text) => {
    $("caption").textContent = text
    $("caption").hidden = !text
  },
  notice,
)
const context = () => ({
  directory: selectedProject || ctx.directory || projects[0]?.directory || "",
  projects: projects.map((p) => p.directory),
  projectIds: Object.fromEntries(projects.map((p) => [p.directory, p.id])),
  model: ctx.session?.model,
  agent: ctx.session?.agent,
  proposalId: latest.proposals?.length === 1 ? latest.proposals[0].id : null,
})
function renderState(data) {
  latest = data
  host.setBadge(data.attention.length || null).catch(() => {})
  const box = $("inbox")
  box.replaceChildren()
  $("attentionCount").textContent = data.attention.length || ""
  if (!data.attention.length) box.append(el("p", "Nothing needs your attention.", "empty"))
  for (const c of data.attention) {
    const card = el("article", "", "card")
    card.append(
      el(
        "div",
        {
          permission: "Permission requested",
          question: "Decision needed",
          blocked: "Blocker",
          milestone: "Milestone",
        }[c.kind] +
          " · " +
          when(c.at),
        "meta",
      ),
      el("h3", c.title),
      el("p", c.detail, "copy"),
    )
    const actions = el("div", "", "buttons")
    actions.append(
      btn("View thread", () => showDetail(c.sessionId)),
      btn(
        "Dismiss",
        async () => {
          await request("/dismiss", { id: c.id })
          await refreshState()
        },
        "link",
      ),
    )
    card.append(actions)
    box.append(card)
  }
  const history = $("conversation")
  const atEnd = history.scrollHeight - history.scrollTop - history.clientHeight < 40 || !history.firstChild
  history.replaceChildren()
  if (!data.history.length)
    history.append(el("p", "Ask for a briefing, start a thread, or steer work already underway.", "empty"))
  for (const m of data.history) {
    const item = el("article", "", "bubble " + m.role)
    item.append(
      el("span", (m.role === "farmer" ? "Farmer" : "You") + (m.channel === "voice" ? " · voice" : ""), "speaker"),
      el("p", m.text, "copy"),
    )
    history.append(item)
  }
  if (atEnd) history.scrollTop = history.scrollHeight
  const proposals = $("proposals")
  proposals.replaceChildren()
  for (const p of data.proposals) {
    const item = el("article", "", "proposal")
    item.append(el("p", p.label, "copy"))
    const actions = el("div", "", "buttons")
    actions.append(
      btn(
        "Confirm",
        async () => {
          await request("/confirm", { proposalId: p.id })
          await refreshState()
        },
        "primary",
      ),
      btn("Cancel", async () => {
        await request("/cancel", { proposalId: p.id })
        await refreshState()
      }),
    )
    item.append(actions)
    proposals.append(item)
  }
  if (isWork) renderWork()
}
async function refreshState() {
  const n = ++stateVersion
  const data = await request("/state")
  if (n === stateVersion) renderState(data)
}
function renderWork() {
  const box = $("threads")
  box.replaceChildren()
  for (const s of rows) {
    const pending = latest.waits?.some((w) => w.sessionId === s.id)
    const status = pending ? "Needs input" : s.running ? "Working" : s.outcome || "Idle"
    const b = btn("", () => showDetail(s.id), "thread")
    b.append(
      el("strong", s.title),
      el(
        "small",
        [status, s.scheduled ? "Scheduled" : s.parentId ? "Subagent" : "", shortPath(s.directory)]
          .filter(Boolean)
          .join(" · "),
        "meta",
      ),
    )
    box.append(b)
  }
  if (!rows.length) box.append(el("p", "No matching threads.", "empty"))
  $("more").hidden = !cursor
}
async function fetchWork(more = false) {
  const n = ++workVersion,
    query = $("search").value.trim()
  const data = await request("/work", { query, cursor: more ? cursor : "" })
  if (n !== workVersion) return
  const seen = new Set()
  rows = (more ? [...rows, ...data.rows] : data.rows)
    .filter((s) => !seen.has(s.id) && seen.add(s.id))
    .sort((a, b) => Number(b.running) - Number(a.running) || b.updated - a.updated)
  cursor = data.cursor
  renderWork()
  $("connection").textContent =
    "Connected · " + data.activeCount + " " + (data.activeCount === 1 ? "thread" : "threads") + " working"
}
function tab(work) {
  isWork = work
  $("deskView").hidden = work
  $("workView").hidden = !work
  $("composer").hidden = work
  $("deskTab").setAttribute("aria-selected", String(!work))
  $("workTab").setAttribute("aria-selected", String(work))
  closeDetail()
  if (work) run(() => fetchWork())
}
function closeDetail() {
  selectedDetail = ""
  detailVersion++
  $("details").hidden = true
  $("details").replaceChildren()
}
function heading(box, title) {
  const top = el("div", "", "sectionHead")
  top.append(el("h2", title), btn("Close", closeDetail, "link"))
  box.append(top)
}
async function direct(input) {
  const result = await request("/action", { ...context(), ...input, requestId: crypto.randomUUID() })
  await refreshState()
  run(() => fetchWork())
  return result
}
function drawRequest(box, item, row) {
  const wrap = el("div", "", "card")
  wrap.append(
    el("h3", item.kind === "permission" ? "Permission requested" : "Input requested"),
    el("p", item.detail, "copy"),
  )
  const actions = el("div", "", "buttons")
  const respond = async (decision, values) => {
    await request("/answer", { requestId: item.requestId, id: row.id, decision, values })
    await refreshState()
    await showDetail(row.id)
  }
  if (item.kind === "permission")
    actions.append(
      btn("Allow once", () => respond("allow")),
      btn("Deny", () => respond("deny")),
    )
  if (item.ask?.kind === "form" && item.ask.fields.every((f) => !f.when?.length && f.type !== "external")) {
    const form = el("form")
    const controls = []
    for (const f of item.ask.fields) {
      let input
      if (f.options?.length && !f.custom) {
        input = el("select")
        input.multiple = f.type === "multiselect"
        if (!input.multiple) input.append(new Option("Select…", ""))
        for (const opt of f.options) input.append(new Option(opt.label, opt.value))
      } else if (f.type === "boolean") {
        input = el("select")
        input.append(new Option("Select…", ""), new Option("Yes", "true"), new Option("No", "false"))
      } else {
        input = el("input")
        input.type = ["number", "integer"].includes(f.type) ? "number" : "text"
        if (f.type === "number") input.step = "any"
      }
      input.required = Boolean(f.required)
      form.append(field(f.title + (f.custom && f.type === "multiselect" ? " (comma separated)" : ""), input))
      controls.push([f, input])
    }
    const submit = el("button", "Send answer")
    submit.type = "button"
    form.append(submit)
    submit.onclick = () => {
      if (!form.reportValidity()) return
      submit.disabled = true
      run(async () => {
        const values = {}
        for (const [f, input] of controls) {
          if (input.multiple) {
            values[f.key] = [...input.selectedOptions].map((o) => o.value)
            continue
          }
          if (!input.value) continue
          values[f.key] =
            f.type === "boolean"
              ? input.value === "true"
              : ["number", "integer"].includes(f.type)
                ? Number(input.value)
                : f.type === "multiselect"
                  ? input.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                  : input.value
        }
        await respond("form", values)
      }).finally(() => {
        submit.disabled = false
      })
    }
    wrap.append(form)
  } else if (item.ask?.kind === "page") {
    const input = el("textarea")
    input.rows = 2
    input.placeholder = "Your answer for this thread"
    wrap.append(field("Reply in text and close the waiting page", input))
    actions.append(
      btn(
        "Send reply",
        () => (input.value.trim() ? respond("page-reply", { reply: input.value }) : input.focus()),
        "primary",
      ),
      btn("Open page", () => host.openSession(row.id)),
    )
  } else if (item.kind === "question") actions.append(btn("Answer in OpenChamber", () => host.openSession(row.id)))
  wrap.append(actions)
  box.append(wrap)
}
async function showDetail(id) {
  const n = ++detailVersion
  selectedDetail = id
  const data = await request("/detail", { id })
  if (n !== detailVersion) return
  const box = $("details")
  box.hidden = false
  box.replaceChildren()
  heading(box, data.row.title)
  box.append(
    el("div", data.status + " · " + (data.row.directory || ""), "meta"),
    el("pre", data.reply || "The thread has not posted a reply yet."),
  )
  for (const wait of data.waits) drawRequest(box, wait, data.row)
  const controls = el("div", "", "buttons")
  controls.append(btn("Open thread", () => host.openSession(id)))
  controls.append(
    btn(data.followed ? "Unfollow result" : "Follow next result", async () => {
      await request("/follow", { id, follow: !data.followed })
      await showDetail(id)
    }),
  )
  if (data.status === "busy" || data.status === "running")
    controls.append(
      btn("Stop turn", async () => {
        await direct({ kind: "stop", id })
        await showDetail(id)
      }),
    )
  box.append(controls)
  if (!data.waits.length && data.status !== "waiting") {
    const input = el("textarea")
    input.placeholder = "Instruction for this thread"
    input.rows = 2
    box.append(
      field("Steer thread", input),
      btn(
        "Send instruction",
        async () => {
          if (!input.value.trim()) return input.focus()
          await direct({ kind: "steer", id, text: input.value })
          input.value = ""
          await showDetail(id)
        },
        "primary",
      ),
    )
  }
  box.scrollIntoView({ block: "nearest" })
}
function createThread() {
  closeDetail()
  const box = $("details")
  box.hidden = false
  heading(box, "New thread")
  const form = el("form"),
    select = el("select")
  const choices = new Set(projects.map((p) => p.directory))
  if (ctx.directory) choices.add(ctx.directory)
  for (const dir of choices) select.append(new Option(dir, dir))
  if (context().directory) select.value = context().directory
  select.required = true
  const title = el("input")
  title.placeholder = "Thread title"
  title.required = true
  title.maxLength = 100
  const task = el("textarea")
  task.rows = 3
  task.placeholder = "What should this agent do?"
  task.required = true
  const submit = el("button", "Start thread", "primary")
  submit.type = "button"
  form.append(field("Project", select), field("Title", title), field("Objective", task), submit)
  box.append(form)
  submit.onclick = () => {
    if (!form.reportValidity()) return
    submit.disabled = true
    run(async () => {
      selectedProject = select.value
      const result = await direct({
        kind: "dispatch",
        directory: select.value,
        title: title.value,
        text: task.value,
      })
      await showDetail(result.sessionId)
    }).finally(() => {
      submit.disabled = false
    })
  }
  box.scrollIntoView({ block: "nearest" })
  title.focus()
}
// Extension frames allow scripts but block native form submissions.
$("send").onclick = () => {
  const text = $("message").value.trim()
  if (!text || chatting) return
  if (device.active()) {
    run(async () => {
      await device.text(text)
      $("message").value = ""
    })
    return
  }
  chatting = true
  $("send").disabled = true
  $("send").textContent = "…"
  run(async () => {
    const requestId = crypto.randomUUID(),
      c = context()
    if (/^(?:yes|confirm|go ahead|do it|send it)[.! ]*$/i.test(text) && c.proposalId)
      await request("/confirm", { proposalId: c.proposalId })
    else {
      await request("/chat", { ...c, text, requestId })
      $("message").value = ""
      for (let i = 0; i < 135; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const r = await request("/chat-status", { requestId })
        if (!r.pending) {
          if (r.error) throw new Error(r.error)
          break
        }
      }
    }
    $("message").value = ""
    await refreshState()
  }).finally(() => {
    chatting = false
    $("send").disabled = false
    $("send").textContent = "Send"
  })
}
$("message").onkeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    $("send").click()
  }
}
$("deskTab").onclick = () => tab(false)
$("workTab").onclick = () => tab(true)
$("startThread").onclick = createThread
$("talk").onclick = () => run(() => device.start(context()))
$("more").onclick = () => run(() => fetchWork(true))
$("refresh").onclick = () => run(() => fetchWork())
$("search").oninput = () => {
  clearTimeout(searchTimer)
  workVersion++
  searchTimer = setTimeout(() => run(() => fetchWork()), 230)
}
host.onReady((value) => {
  ctx = value
  applyHostReady(value, document.documentElement)
  document.documentElement.style.colorScheme = value.theme.mode
  $("talk").disabled = !value.features?.microphone
  $("talk").title = $("talk").disabled ? "This OpenChamber client does not expose a microphone." : "Talk to Farmer"
  if (!loaded) {
    loaded = true
    run(async () => {
      const [result] = await Promise.all([host.listProjects(), refreshState(), fetchWork()])
      projects = result.projects
    })
  }
})
host
  .onProjects?.((value) => {
    projects = value.projects
  })
  .catch(() => {})
host.onServiceEvent((e) => {
  if (e.topic === "changed") run(() => refreshState())
})
setInterval(() => {
  if (!document.hidden && loaded && !$("search").value && !cursorPaging()) run(() => fetchWork())
}, 18000)
function cursorPaging() {
  return isWork && rows.length > 60
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && loaded) run(() => Promise.all([refreshState(), fetchWork()]))
})
