import { PermissionV1 } from "@opencode-ai/core/v1/permission"
import { afterEach, describe, expect } from "bun:test"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { Cause, Effect, Exit, Layer } from "effect"
import path from "path"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { Agent } from "../../src/agent/agent"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Global } from "@opencode-ai/core/global"
import { Truncate } from "@/tool/truncate"
import { Tool } from "@/tool/tool"
import { MemoryTool } from "../../src/tool/memory"
import {
  disposeAllInstances,
  provideInstance,
  testInstanceStoreLayer,
  TestInstance,
  tmpdirScoped,
} from "../fixture/fixture"
import { testEffect } from "../lib/effect"

afterEach(async () => {
  await disposeAllInstances()
})

const memoryLayer = (global: Partial<Global.Interface> = {}) =>
  AppNodeBuilder.build(LayerNode.group([Agent.node, FSUtil.node, Truncate.node, Global.node]), [
    [Global.node, Global.layerWith(global)],
  ])

const withGlobal = (global?: Partial<Global.Interface>) =>
  testEffect(Layer.mergeAll(memoryLayer(global), testInstanceStoreLayer))

const it = withGlobal()

function makeCtx() {
  const requests: Array<Omit<PermissionV1.Request, "id" | "sessionID" | "tool">> = []
  const ctx: Tool.Context = {
    sessionID: "ses_test" as never,
    messageID: "msg_test" as never,
    callID: "",
    agent: "build",
    abort: AbortSignal.any([]),
    messages: [],
    metadata: () => Effect.void,
    ask: (req) => Effect.sync(() => void requests.push(req)),
  }
  return { requests, ctx }
}

const run = Effect.fn("MemoryToolTest.run")(function* (dir: string, args: Tool.InferParameters<typeof MemoryTool>, ctx: Tool.Context) {
  const info = yield* MemoryTool
  const tool = yield* info.init()
  return yield* provideInstance(dir)(tool.execute(args, ctx))
})

const fail = Effect.fn("MemoryToolTest.fail")(function* (dir: string, args: Tool.InferParameters<typeof MemoryTool>, ctx: Tool.Context) {
  const exit = yield* run(dir, args, ctx).pipe(Effect.exit)
  if (Exit.isFailure(exit)) {
    const err = Cause.squash(exit.cause)
    return err instanceof Error ? err : new Error(String(err))
  }
  throw new Error("expected memory op to fail")
})

const projectDir = (dir: string, rel: string) => path.join(dir, ".opencode", "memory", rel)

describe("memory tool path jail", () => {
  for (const bad of ["../escape.md", "../../etc/passwd.md", "/etc/passwd.md", "..", "foo/../../out.md"]) {
    it.instance(`rejects ${bad} without touching the filesystem`, () =>
      Effect.gen(function* () {
        const test = yield* TestInstance
        const { requests, ctx } = makeCtx()
        const err = yield* fail(test.directory, { op: "write", scope: "project", file: bad, content: "x" }, ctx)
        expect(err.message).toContain("invalid arguments")
        expect(requests.length).toBe(0)
      }),
    )
  }

  it.instance("rejects non-markdown files", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      const { ctx } = makeCtx()
      const err = yield* fail(test.directory, { op: "write", scope: "project", file: "notes.txt", content: "x" }, ctx)
      expect(err.message).toContain("only .md files are allowed")
    }),
    { git: true },
  )
})

describe("memory tool ops", () => {
  it.instance("write → read → list roundtrip in project scope", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      const { ctx } = makeCtx()

      const wrote = yield* run(test.directory, { op: "write", scope: "project", file: "deploy-process.md", content: "use ./deploy.sh" }, ctx)
      expect(wrote.output).toContain("Wrote deploy-process.md")
      expect(existsSync(projectDir(test.directory, "deploy-process.md"))).toBe(true)

      const readResult = yield* run(test.directory, { op: "read", scope: "project", file: "deploy-process.md" }, ctx)
      expect(readResult.output).toBe("use ./deploy.sh")

      const listResult = yield* run(test.directory, { op: "list", scope: "project" }, ctx)
      expect(listResult.output).toBe("deploy-process.md")
    }),
    { git: true },
  )

  it.instance("mutating ops prompt for permission, read/list do not", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      const { requests, ctx } = makeCtx()

      yield* run(test.directory, { op: "write", scope: "project", file: "a.md", content: "1" }, ctx)
      yield* run(test.directory, { op: "read", scope: "project", file: "a.md" }, ctx)
      yield* run(test.directory, { op: "list", scope: "project" }, ctx)
      yield* run(test.directory, { op: "update", scope: "project", file: "a.md", oldString: "1", newString: "2" }, ctx)
      yield* run(test.directory, { op: "delete", scope: "project", file: "a.md" }, ctx)

      expect(requests.map((r) => r.permission)).toEqual(["memory", "memory", "memory"])
      expect(requests.every((r) => r.patterns[0]?.startsWith("project/"))).toBe(true)
    }),
    { git: true },
  )

  it.instance("update replaces the first occurrence; missing oldString does not modify", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      const { ctx } = makeCtx()

      yield* run(test.directory, { op: "write", scope: "project", file: "f.md", content: "x x x" }, ctx)
      yield* run(test.directory, { op: "update", scope: "project", file: "f.md", oldString: "x", newString: "y" }, ctx)
      expect(readFileSync(projectDir(test.directory, "f.md"), "utf8")).toBe("y x x")

      const miss = yield* run(test.directory, { op: "update", scope: "project", file: "f.md", oldString: "zzz", newString: "q" }, ctx)
      expect(miss.output).toContain("not found in f.md")
      expect(readFileSync(projectDir(test.directory, "f.md"), "utf8")).toBe("y x x")
    }),
    { git: true },
  )

  it.instance("read and delete of a missing file are clean, not defects", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      const { ctx } = makeCtx()
      const readResult = yield* run(test.directory, { op: "read", scope: "project", file: "nope.md" }, ctx)
      expect(readResult.output).toContain("Memory file not found")
      const del = yield* run(test.directory, { op: "delete", scope: "project", file: "nope.md" }, ctx)
      expect(del.output).toContain("Memory file not found")
    }),
    { git: true },
  )
})

const configRoot = mkdtempSync(path.join(tmpdir(), "oc-mem-config-"))
const itGlobal = withGlobal({ config: configRoot })

describe("memory tool scopes", () => {
  itGlobal.instance("global scope writes under the config dir, not the worktree", () =>
    Effect.gen(function* () {
      const test = yield* TestInstance
      const { ctx } = makeCtx()
      yield* run(test.directory, { op: "write", scope: "global", file: "user-pref.md", content: "prefers dark mode" }, ctx)
      expect(existsSync(path.join(configRoot, "memory", "user-pref.md"))).toBe(true)
      expect(existsSync(projectDir(test.directory, "user-pref.md"))).toBe(false)
    }),
    { git: true },
  )
})
