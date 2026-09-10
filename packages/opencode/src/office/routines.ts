import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Context, Effect, Layer, Schema } from "effect"
import { execFile } from "child_process"
import fs from "fs/promises"
import os from "os"
import path from "path"
import type { Thread } from "./office"

/**
 * Scheduled work on this machine, for the app's "Scheduled" view.
 *
 * The source of truth is launchd: every user LaunchAgent with a schedule is a
 * routine, every KeepAlive/RunAtLoad one is a service. The box's plists run
 * their jobs through `cow-routine-run.sh`, which keeps a run ledger
 * (~/.coval/logs/routines/ledger.jsonl) and a marker while a job runs; an
 * optional registry (~/.config/opencode/routines.json) adds titles,
 * descriptions, log paths and the hour window a script enforces itself.
 *
 * The packaged sidecar runs under Node, so only Node APIs may be used here.
 */

export const RunStatus = Schema.Literals([
  "ok",
  "failed",
  "skipped",
  "locked",
  "running",
  "waiting",
  "canceled",
  "unknown",
]).annotate({
  identifier: "RoutineRunStatus",
})
export type RunStatus = typeof RunStatus.Type

export const Run = Schema.Struct({
  executionID: Schema.optional(Schema.String),
  correlation: Schema.optional(Schema.Literals(["exact", "heuristic", "unmatched"])),
  processStatus: Schema.optional(RunStatus),
  agentStatus: Schema.optional(Schema.String),
  outcome: Schema.optional(Schema.Literals(["unverified", "reported", "verified"])),
  startedAt: Schema.Finite,
  endedAt: Schema.optional(Schema.Finite),
  status: RunStatus,
  rc: Schema.optional(Schema.Finite),
  summary: Schema.optional(Schema.String),
  // The office thread the run produced, when the job is an agent run.
  sessionID: Schema.optional(Schema.String),
  directory: Schema.optional(Schema.String),
}).annotate({ identifier: "RoutineRun" })
export type Run = typeof Run.Type

export const Routine = Schema.Struct({
  name: Schema.String,
  label: Schema.String,
  title: Schema.String,
  description: Schema.optional(Schema.String),
  kind: Schema.Literals(["llm", "shell"]),
  model: Schema.optional(Schema.String),
  schedule: Schema.String,
  loaded: Schema.Boolean,
  nextRunAt: Schema.optional(Schema.Finite),
  running: Schema.optional(Run),
  last: Schema.optional(Run),
  runs: Schema.Array(Run),
  lastExitCode: Schema.optional(Schema.Finite),
  log: Schema.optional(Schema.String),
}).annotate({ identifier: "Routine" })
export type Routine = typeof Routine.Type

export const ServiceRow = Schema.Struct({
  name: Schema.String,
  label: Schema.String,
  title: Schema.String,
  running: Schema.Boolean,
  pid: Schema.optional(Schema.Finite),
  lastExitCode: Schema.optional(Schema.Finite),
}).annotate({ identifier: "RoutineService" })
export type ServiceRow = typeof ServiceRow.Type

export const Snapshot = Schema.Struct({
  available: Schema.Boolean,
  host: Schema.String,
  now: Schema.Finite,
  routines: Schema.Array(Routine),
  services: Schema.Array(ServiceRow),
}).annotate({ identifier: "RoutinesSnapshot" })
export type Snapshot = typeof Snapshot.Type

export const RunResult = Schema.Union([
  Schema.Struct({ ok: Schema.Literal(true) }),
  Schema.Struct({ error: Schema.String }),
])
export type RunResult = typeof RunResult.Type

export const LogResult = Schema.Struct({ path: Schema.optional(Schema.String), text: Schema.String }).annotate({
  identifier: "RoutineLog",
})
export type LogResult = typeof LogResult.Type

export interface Interface {
  readonly snapshot: () => Effect.Effect<Snapshot>
  readonly run: (name: string) => Effect.Effect<RunResult>
  readonly log: (name: string, lines?: number) => Effect.Effect<LogResult>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Routines") {}

type Calendar = { Minute?: number; Hour?: number; Day?: number; Weekday?: number; Month?: number }
type Plist = {
  Label?: string
  ProgramArguments?: string[]
  Program?: string
  StartCalendarInterval?: Calendar | Calendar[]
  StartInterval?: number
  KeepAlive?: unknown
  RunAtLoad?: boolean
  StandardOutPath?: string
}
/** The gate a script enforces itself: inclusive hour range, optional last start time (h, m), weekdays only. */
type Window = { hours?: [number, number]; until?: [number, number]; weekdays?: boolean }
type Meta = {
  title?: string
  description?: string
  kind?: "llm" | "shell"
  model?: string
  log?: string
  window?: Window
}
type Registry = { routines?: Record<string, Meta>; services?: Record<string, { title?: string }> }
type LaunchdState = { loaded: boolean; running: boolean; pid?: number; lastExitCode?: number }
type Marker = { name: string; startedAt: number; pid: number; executionID?: string }

const INCLUDE = /^dev\.(coval|bronson|cow)\./
const HISTORY = 20
const CACHE_MS = 5_000
const LOOKAHEAD_MIN = 8 * 24 * 60
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const home = os.homedir()
const agentsDir = path.join(home, "Library", "LaunchAgents")
const registryFile = path.join(home, ".config", "opencode", "routines.json")
const ledgerDir = path.join(home, ".coval", "logs", "routines")

function exec(cmd: string, args: string[], timeout = 8_000) {
  return new Promise<{ ok: boolean; out: string; err: string }>((resolve) => {
    execFile(cmd, args, { timeout, maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) =>
      resolve({ ok: !error, out: String(stdout ?? ""), err: String(stderr ?? "") }),
    )
  })
}

const pad = (n: number) => String(n).padStart(2, "0")
const expand = (p: string) => (p.startsWith("~/") ? path.join(home, p.slice(2)) : p)
const nameOf = (label: string) => label.replace(INCLUDE, "")
function titleOf(name: string) {
  const words = name.replace(/[-_.]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

async function readPlists() {
  const files = await fs.readdir(agentsDir).catch(() => [] as string[])
  const parsed = await Promise.all(
    files
      .filter((file) => file.endsWith(".plist"))
      .map(async (file) => {
        const { ok, out } = await exec("plutil", ["-convert", "json", "-o", "-", path.join(agentsDir, file)])
        if (!ok) return undefined
        try {
          const plist = JSON.parse(out) as Plist
          return plist.Label ? plist : undefined
        } catch {
          return undefined
        }
      }),
  )
  return parsed.filter((plist): plist is Plist => plist !== undefined)
}

async function launchd(uid: number, label: string): Promise<LaunchdState> {
  const { ok, out } = await exec("launchctl", ["print", `gui/${uid}/${label}`])
  if (!ok) return { loaded: false, running: false }
  // The job's own `state =` line comes first; deeper `state = active` lines belong to sub-sections.
  const state = out.match(/^\s*state = (.+)$/m)?.[1]?.trim()
  const pid = Number(out.match(/^\s*pid = (\d+)/m)?.[1])
  const exit = out.match(/^\s*last exit code = (-?\d+)/m)?.[1]
  return {
    loaded: true,
    running: state === "running",
    pid: Number.isFinite(pid) ? pid : undefined,
    lastExitCode: exit === undefined ? undefined : Number(exit),
  }
}

/** When a process started, from `ps` elapsed time ([[dd-]hh:]mm:ss). */
async function startedAtOf(pid: number, now: number) {
  const { ok, out } = await exec("ps", ["-o", "etime=", "-p", String(pid)])
  if (!ok) return undefined
  const match = out.trim().match(/^(?:(\d+)-)?(?:(\d+):)?(\d+):(\d+)$/)
  if (!match) return undefined
  const [, d, h, m, s] = match
  const seconds = Number(d ?? 0) * 86_400 + Number(h ?? 0) * 3_600 + Number(m) * 60 + Number(s)
  return now - seconds * 1000
}

/** A ledger summary is a captured stdout line: drop colour codes, and treat whitespace-only as none. */
function cleanSummary(value: unknown) {
  if (typeof value !== "string") return undefined
  const text = value.replace(/\[[0-9;]*[A-Za-z]/g, "").trim()
  return text ? text : undefined
}

async function readLedger() {
  const text = await fs.readFile(path.join(ledgerDir, "ledger.jsonl"), "utf8").catch(() => "")
  const lines = text.split("\n")
  const map = new Map<string, Run[]>()
  for (const line of lines.slice(Math.max(0, lines.length - 2000))) {
    if (!line.trim()) continue
    let entry: Record<string, unknown>
    try {
      entry = JSON.parse(line) as Record<string, unknown>
    } catch {
      continue
    }
    if (typeof entry.name !== "string" || typeof entry.startedAt !== "number") continue
    const status: RunStatus = ["ok", "failed", "skipped", "locked", "running", "waiting", "canceled"].includes(
      String(entry.status),
    )
      ? (entry.status as RunStatus)
      : "unknown"
    const run: Run = {
      startedAt: entry.startedAt,
      endedAt: typeof entry.endedAt === "number" ? entry.endedAt : undefined,
      status,
      processStatus: status,
      outcome: "unverified",
      executionID: typeof entry.executionID === "string" ? entry.executionID : undefined,
      sessionID: typeof entry.sessionID === "string" ? entry.sessionID : undefined,
      directory: typeof entry.directory === "string" ? entry.directory : undefined,
      rc: typeof entry.rc === "number" ? entry.rc : undefined,
      summary: cleanSummary(entry.summary),
    }
    const list = map.get(entry.name) ?? []
    list.push(run)
    map.set(entry.name, list)
  }
  for (const list of map.values()) list.sort((a, b) => b.startedAt - a.startedAt)
  return map
}

async function readMarker(name: string): Promise<Marker | undefined> {
  const text = await fs.readFile(path.join(ledgerDir, `${name}.running`), "utf8").catch(() => undefined)
  if (!text) return undefined
  try {
    const marker = JSON.parse(text) as Marker
    return typeof marker.startedAt === "number" && typeof marker.pid === "number" ? marker : undefined
  } catch {
    return undefined
  }
}

function alive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function matches(cal: Calendar, date: Date) {
  if (cal.Minute !== undefined && date.getMinutes() !== cal.Minute) return false
  if (cal.Hour !== undefined && date.getHours() !== cal.Hour) return false
  if (cal.Day !== undefined && date.getDate() !== cal.Day) return false
  if (cal.Month !== undefined && date.getMonth() + 1 !== cal.Month) return false
  if (cal.Weekday !== undefined && date.getDay() !== cal.Weekday % 7) return false
  return true
}

function inWindow(window: Window | undefined, date: Date) {
  if (!window) return true
  if (window.weekdays && (date.getDay() === 0 || date.getDay() === 6)) return false
  if (window.hours && (date.getHours() < window.hours[0] || date.getHours() > window.hours[1])) return false
  if (window.until && date.getHours() * 60 + date.getMinutes() > window.until[0] * 60 + window.until[1]) return false
  return true
}

/** The next minute launchd will fire one of `entries`, honouring the script's own window. */
export function nextCalendar(entries: Calendar[], now: number, window?: Window) {
  const start = new Date(now)
  start.setSeconds(0, 0)
  for (let i = 1; i <= LOOKAHEAD_MIN; i++) {
    const at = new Date(start.getTime() + i * 60_000)
    if (!inWindow(window, at)) continue
    if (entries.some((cal) => matches(cal, at))) return at.getTime()
  }
  return undefined
}

export function describeCalendar(entries: Calendar[]) {
  const parts = entries.map((cal) => {
    const time =
      cal.Hour !== undefined
        ? `${pad(cal.Hour)}:${pad(cal.Minute ?? 0)}`
        : cal.Minute !== undefined
          ? `:${pad(cal.Minute)}`
          : "every minute"
    const day = cal.Weekday !== undefined ? DAYS[cal.Weekday % 7] : cal.Day !== undefined ? `day ${cal.Day}` : undefined
    return day ? `${day} ${time}` : time
  })
  const unique = [...new Set(parts)]
  const hourly = entries.every((cal) => cal.Hour === undefined && cal.Weekday === undefined && cal.Day === undefined)
  if (hourly) return `hourly at ${unique.join(" and ")}`
  const daily = entries.every((cal) => cal.Weekday === undefined && cal.Day === undefined)
  return `${daily ? "daily at " : ""}${unique.join(", ")}`
}

function describeInterval(seconds: number) {
  if (seconds > 0 && seconds % 3_600 === 0) return `every ${seconds / 3_600}h`
  if (seconds > 0 && seconds % 60 === 0) return `every ${seconds / 60} min`
  return `every ${seconds}s`
}

function describeWindow(window?: Window) {
  if (!window) return ""
  const bits: string[] = []
  if (window.weekdays) bits.push("weekdays")
  const end = window.until
    ? `${pad(window.until[0])}:${pad(window.until[1])}`
    : window.hours
      ? `${pad(window.hours[1])}:59`
      : undefined
  if (window.hours || window.until) bits.push(`${pad(window.hours?.[0] ?? 0)}:00–${end}`)
  return bits.length ? ` · ${bits.join(" ")}` : ""
}

async function tail(file: string, lines: number) {
  const handle = await fs.open(file, "r").catch(() => undefined)
  if (!handle) return ""
  try {
    const { size } = await handle.stat()
    const bytes = Math.min(size, 96 * 1024)
    if (bytes === 0) return ""
    const buffer = Buffer.alloc(bytes)
    await handle.read(buffer, 0, bytes, size - bytes)
    const all = buffer
      .toString("utf8")
      .replace(/\[[0-9;]*m/g, "")
      .split("\n")
    const picked = all.slice(Math.max(0, all.length - lines)).join("\n")
    return picked.length > 24 * 1024 ? picked.slice(picked.length - 24 * 1024) : picked
  } finally {
    await handle.close()
  }
}

function orderRoutines(a: Routine, b: Routine) {
  if (!!a.running !== !!b.running) return a.running ? -1 : 1
  return (
    (a.nextRunAt ?? Number.MAX_SAFE_INTEGER) - (b.nextRunAt ?? Number.MAX_SAFE_INTEGER) ||
    a.title.localeCompare(b.title)
  )
}

async function build(): Promise<Snapshot> {
  const now = Date.now()
  const host = os.hostname()
  const empty: Snapshot = { available: false, host, now, routines: [], services: [] }
  if (process.platform !== "darwin") return empty
  const registry = await fs
    .readFile(registryFile, "utf8")
    .then((text) => JSON.parse(text) as Registry)
    .catch(() => ({}) as Registry)
  const plists = await readPlists()
  if (!plists.length) return empty
  const uid = process.getuid?.() ?? 501
  const ledger = await readLedger()
  const routines: Routine[] = []
  const services: ServiceRow[] = []
  await Promise.all(
    plists.map(async (plist) => {
      const label = plist.Label!
      const name = nameOf(label)
      const meta = registry.routines?.[label] ?? registry.routines?.[name]
      const service = registry.services?.[label] ?? registry.services?.[name]
      if (!INCLUDE.test(label) && !meta && !service) return
      const scheduled = plist.StartCalendarInterval !== undefined || plist.StartInterval !== undefined
      if (!scheduled && !(plist.KeepAlive || plist.RunAtLoad) && !service) return
      const state = await launchd(uid, label)
      if (!scheduled) {
        services.push({
          name,
          label,
          title: service?.title ?? titleOf(name),
          running: state.running,
          pid: state.pid,
          lastExitCode: state.lastExitCode,
        })
        return
      }
      const entries =
        plist.StartCalendarInterval === undefined
          ? []
          : Array.isArray(plist.StartCalendarInterval)
            ? plist.StartCalendarInterval
            : [plist.StartCalendarInterval]
      const schedule =
        (entries.length ? describeCalendar(entries) : describeInterval(plist.StartInterval ?? 0)) +
        describeWindow(meta?.window)
      const runs = (ledger.get(name) ?? []).slice(0, HISTORY)
      let running: Run | undefined
      if (state.running) {
        const marker = await readMarker(name)
        const startedAt =
          marker && alive(marker.pid) ? marker.startedAt : state.pid ? await startedAtOf(state.pid, now) : undefined
        running = {
          startedAt: startedAt ?? now,
          status: "running",
          processStatus: "running",
          executionID: marker?.executionID,
          outcome: "unverified",
        }
      }
      routines.push({
        name,
        label,
        title: meta?.title ?? titleOf(name),
        description: meta?.description,
        kind: meta?.kind ?? "shell",
        model: meta?.model,
        schedule,
        loaded: state.loaded,
        nextRunAt: entries.length ? nextCalendar(entries, now, meta?.window) : undefined,
        running,
        last: runs[0],
        runs,
        lastExitCode: state.lastExitCode,
        log: meta?.log ? expand(meta.log) : plist.StandardOutPath,
      })
    }),
  )
  routines.sort(orderRoutines)
  services.sort((a, b) => a.title.localeCompare(b.title))
  return { available: true, host, now, routines, services }
}

/**
 * Joins the launchd/ledger picture with the office's routine threads: a run
 * gets the session it produced (so the app can open it), the running job gets
 * the live thread's summary, and threads without a ledger entry still count
 * as runs, so history exists before the wrapper has recorded anything.
 */
export function withThreads(snapshot: Snapshot, threads: readonly Thread[], now: number): Snapshot {
  if (!snapshot.available) return snapshot
  const routines = snapshot.routines.map((routine) => {
    const mine = threads
      .filter((thread) => thread.routine === routine.name)
      .sort((a, b) => b.time.created - a.time.created)
    if (!mine.length) return routine
    const attach = (run: Run): Run => {
      const end = run.endedAt ?? now
      const candidates = mine.filter(
        (t) => t.time.created >= run.startedAt - 90_000 && t.time.created <= end + 1_000 && !t.executionID,
      )
      const thread = run.executionID
        ? mine.find((t) => t.executionID === run.executionID)
        : candidates.length === 1
          ? candidates[0]
          : undefined
      if (!thread) return { ...run, correlation: "unmatched", outcome: "unverified" }
      // The thread's own last words beat a captured stdout line while the office still has them.
      const phase = thread.lifecycle?.phase
      const status: RunStatus =
        phase === "waiting"
          ? "waiting"
          : phase === "canceled"
            ? "canceled"
            : phase === "failed"
              ? "failed"
              : phase === "running"
                ? "running"
                : run.status
      return {
        ...run,
        status,
        processStatus: run.processStatus ?? run.status,
        agentStatus: phase ?? "unknown",
        outcome: thread.lifecycle?.outcome ?? "unverified",
        executionID: run.executionID ?? thread.executionID,
        correlation: run.executionID ? "exact" : "heuristic",
        sessionID: thread.sessionID,
        directory: thread.directory,
        summary: thread.summary || run.summary,
      }
    }
    const running = routine.running ? attach(routine.running) : undefined
    const runs = routine.runs.map(attach)
    const covered = new Set([running?.sessionID, ...runs.map((run) => run.sessionID)].filter(Boolean))
    const extra = mine
      .filter((thread) => !covered.has(thread.sessionID))
      .map(
        (thread): Run => ({
          executionID: thread.executionID,
          correlation: thread.executionID ? "exact" : "heuristic",
          agentStatus: thread.lifecycle?.phase ?? "unknown",
          outcome: thread.lifecycle?.outcome ?? "unverified",
          startedAt: thread.time.created,
          endedAt: thread.bucket === "working" && running ? undefined : thread.time.updated,
          status:
            thread.lifecycle?.phase === "canceled"
              ? "canceled"
              : thread.bucket === "needs_you"
                ? "waiting"
                : thread.bucket === "failed"
                  ? "failed"
                  : thread.bucket === "working"
                    ? "running"
                    : "unknown",
          summary: thread.summary,
          sessionID: thread.sessionID,
          directory: thread.directory,
        }),
      )
    const all = [...runs, ...extra].sort((a, b) => b.startedAt - a.startedAt).slice(0, HISTORY)
    return { ...routine, running, runs: all, last: all.find((run) => run.status !== "running") ?? all[0] }
  })
  return { ...snapshot, routines: [...routines].sort(orderRoutines) }
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const uid = process.getuid?.() ?? 501
    let cache: { at: number; value: Promise<Snapshot> } | undefined
    const cached = () => {
      const now = Date.now()
      if (cache && now - cache.at < CACHE_MS) return cache.value
      const value = build().catch(
        (): Snapshot => ({ available: false, host: os.hostname(), now, routines: [], services: [] }),
      )
      cache = { at: now, value }
      return value
    }
    return Service.of({
      snapshot: () => Effect.promise(cached),
      run: (name) =>
        Effect.promise(async (): Promise<RunResult> => {
          const snapshot = await cached()
          const routine = snapshot.routines.find((item) => item.name === name)
          if (!routine) return { error: `No scheduled job named ${name}` }
          if (!routine.loaded) return { error: `${routine.label} is not loaded in launchd` }
          const { ok, out, err } = await exec("launchctl", ["kickstart", `gui/${uid}/${routine.label}`])
          cache = undefined
          return ok ? { ok: true } : { error: (err || out).trim() || "launchctl kickstart failed" }
        }),
      log: (name, lines = 80) =>
        Effect.promise(async (): Promise<LogResult> => {
          const snapshot = await cached()
          const routine = snapshot.routines.find((item) => item.name === name)
          if (!routine?.log) return { text: "" }
          const text = await tail(routine.log, Math.min(Math.max(Math.floor(lines), 10), 400))
          return { path: routine.log, text }
        }),
    })
  }),
)

export const node = LayerNode.make({
  service: Service,
  layer,
  deps: [],
})

export * as Routines from "./routines"
