import { expect } from "bun:test"
import path from "path"
import { Effect, Layer } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Npm } from "@opencode-ai/core/npm"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Config } from "@/config/config"
import { TuiConfig } from "@/config/tui"
import { CurrentWorkingDirectory } from "@/config/tui-cwd"
import { Auth } from "@/auth"
import { Account } from "@/account/account"
import { AuthTest } from "../fake/auth"
import { AccountTest } from "../fake/account"
import { TestInstance } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
import pkg from "../../../plugin/package.json"

const calls: Parameters<Npm.Interface["install"]>[] = []
const npm = Layer.mock(Npm.Service)({
  install: (...args) => Effect.sync(() => void calls.push(args)),
})
const it = testEffect(
  LayerNode.compile(LayerNode.group([Config.node, FSUtil.node]), [
    [Npm.node, npm],
    [Auth.node, AuthTest.empty],
    [Account.node, AccountTest.empty],
  ]),
)

it.instance("server and TUI install the matching SDK package instead of the binary release label", () =>
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const config = yield* Config.Service
    const test = yield* TestInstance
    const dir = path.join(test.directory, ".opencode")
    yield* fs.makeDirectory(dir, { recursive: true })
    yield* fs.writeFileString(path.join(dir, "plugin.ts"), "export default async () => ({})")
    yield* fs.writeJson(path.join(dir, "tui.json"), { plugin: ["./plugin.ts"] })
    calls.length = 0
    yield* config.get()
    yield* config.waitForDependencies()
    expect(calls.length).toBeGreaterThan(0)
    expect(calls.every(([, input]) => input?.add[0]?.version === pkg.version)).toBe(true)

    calls.length = 0
    yield* TuiConfig.Service.use((tui) => tui.waitForDependencies()).pipe(
      Effect.provide(
        LayerNode.compile(TuiConfig.node, [[Npm.node, npm]]).pipe(
          Layer.provide(Layer.succeed(CurrentWorkingDirectory, test.directory)),
        ),
      ),
    )
    expect(calls.length).toBeGreaterThan(0)
    expect(calls.every(([, input]) => input?.add[0]?.version === pkg.version)).toBe(true)
    expect(calls.every(([, input]) => input?.add[0]?.name === "@opencode-ai/plugin")).toBe(true)
  }),
)
