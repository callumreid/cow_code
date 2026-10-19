import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { z } from "zod"
import { CodexAppServer } from "../src/experimental/codex-app-server"

if (!process.argv.includes("--run")) {
  console.log(
    "Opt-in native Codex experiment. Run with --run to use the existing Codex account for two small turns in a new temporary workspace. No CowCode runtime settings change.",
  )
  process.exit(0)
}

const version = Bun.spawn(["codex", "--version"], { stdout: "pipe", stderr: "ignore" })
const cliVersion = (await new Response(version.stdout).text()).trim()
if (await version.exited) throw new Error("Could not read the installed Codex version")
const cwd = await mkdtemp(path.join(tmpdir(), "cowcode-native-"))
await Bun.write(path.join(cwd, "fixture.json"), JSON.stringify({ values: [17, 25], marker: "cowcode-native-fixture" }))
const Completion = z.object({
  threadId: z.string(),
  turn: z.object({ id: z.string(), status: z.string(), error: z.unknown().optional() }),
})
const StartedItem = z.object({ threadId: z.string(), item: z.object({ type: z.string() }) })
const report = {
  cliVersion,
  protocolVersion: "0.144.6",
  workspace: cwd,
  threadId: "",
  model: "",
  streamed: false,
  first: "",
  resumedTurns: 0,
  steered: false,
  interrupted: "",
  archived: false,
}
let client: Awaited<ReturnType<typeof CodexAppServer.connect>> | undefined
let activeTurn: string | undefined
try {
  client = await CodexAppServer.connect({ cwd, timeoutMs: 30_000 })
  const models = await client.models()
  const model = models.find((item) => item.isDefault) ?? models[0]
  if (!model) throw new Error("Native Codex returned no models")
  const thread = await client.start(model.model)
  report.threadId = thread.thread.id
  report.model = thread.model
  const text: string[] = []
  client.subscribe((event) => {
    if (event.method !== "item/agentMessage/delta") return
    const parsed = z.object({ delta: z.string() }).safeParse(event.params)
    if (parsed.success) {
      report.streamed = true
      text.push(parsed.data.delta)
    }
  })
  const first = client.waitFor(
    (event) =>
      event.method === "turn/completed" && Completion.safeParse(event.params).data?.threadId === report.threadId,
    120_000,
  )
  void first.catch(() => {})
  activeTurn = (
    await client.turn(
      report.threadId,
      "Read fixture.json in the current directory with a shell command. Reply with its marker and the sum of values. Do not modify any files.",
    )
  ).turn.id
  report.first = Completion.parse((await first).params).turn.status
  activeTurn = undefined
  if (
    report.first !== "completed" ||
    !text.join("").includes("42") ||
    !text.join("").includes("cowcode-native-fixture")
  ) {
    throw new Error("Native first turn did not complete with the fixture result")
  }
  await client.close()
  client = await CodexAppServer.connect({ cwd, timeoutMs: 30_000 })
  const resumed = await client.resume(report.threadId)
  report.resumedTurns = resumed.thread.turns?.length ?? 0
  if (!report.resumedTurns) throw new Error("Native thread did not survive the process restart")
  const completed = client.waitFor(
    (event) =>
      event.method === "turn/completed" && Completion.safeParse(event.params).data?.threadId === report.threadId,
    60_000,
  )
  const command = client.waitFor(
    (event) =>
      event.method === "item/started" && StartedItem.safeParse(event.params).data?.item.type === "commandExecution",
    30_000,
  )
  void completed.catch(() => {})
  void command.catch(() => {})
  activeTurn = (
    await client.turn(
      report.threadId,
      "Run the harmless local shell command sleep 45. Wait for it to finish before replying. Do not read or change any other files.",
    )
  ).turn.id
  await command
  await client.steer(
    report.threadId,
    activeTurn,
    "After that command finishes, include the word native-steer in your reply.",
  )
  report.steered = true
  await client.interrupt(report.threadId, activeTurn)
  report.interrupted = Completion.parse((await completed).params).turn.status
  activeTurn = undefined
  if (report.interrupted !== "interrupted") throw new Error("Native turn did not report interruption")
  await client.archive(report.threadId)
  report.archived = true
} finally {
  if (client && activeTurn) await client.interrupt(report.threadId, activeTurn).catch(() => {})
  if (client && report.threadId && !report.archived) {
    await client.archive(report.threadId).then(
      () => {
        report.archived = true
      },
      () => {},
    )
  }
  await client?.close()
  await rm(cwd, { recursive: true, force: true })
  console.log(JSON.stringify(report, null, 2))
}
