import { describe, expect } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { Cause, Effect, Exit, Fiber, Layer } from "effect"
import { TestClock } from "effect/testing"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { Ripgrep } from "@opencode-ai/core/ripgrep"
import { RipgrepBinary } from "@opencode-ai/core/ripgrep/binary"
import { tmpdir } from "./fixture/tmpdir"
import { it } from "./lib/effect"

const waitForFile = (file: string) =>
  Effect.promise(async () => {
    const deadline = Date.now() + 2_000
    while (Date.now() < deadline) {
      if (await Bun.file(file).exists()) return await Bun.file(file).text()
      await Bun.sleep(10)
    }
    throw new Error(`Fixture did not write ${path.basename(file)}`)
  })

const stalledSearch = Effect.acquireRelease(
  Effect.promise(async () => {
    const tmp = await tmpdir()
    const executable = path.join(tmp.path, "stalled-rg")
    const ready = path.join(tmp.path, "ready")
    const terminated = path.join(tmp.path, "terminated")
    await fs.writeFile(
      executable,
      `#!${process.execPath}\nimport fs from "node:fs";
process.on("SIGTERM", () => fs.writeFileSync("terminated", "TERM received"));
fs.writeFileSync("ready", String(process.pid));
console.log("partial.ts");
setInterval(() => {}, 60000);
`,
    )
    await fs.chmod(executable, 0o755)
    const guard = { fired: false }
    // A regression must fail without leaking the intentionally stuck fixture.
    const watchdog = setTimeout(async () => {
      if (!(await Bun.file(ready).exists())) return
      guard.fired = true
      try {
        process.kill(Number(await Bun.file(ready).text()), "SIGKILL")
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error
      }
    }, 5_000)
    return {
      tmp,
      ready,
      terminated,
      watchdog,
      guard,
      layer: LayerNode.compile(Ripgrep.node, [
        [RipgrepBinary.node, Layer.succeed(RipgrepBinary.Service, { filepath: Effect.succeed(executable) })],
      ]),
    }
  }),
  (fixture) =>
    Effect.promise(async () => {
      clearTimeout(fixture.watchdog)
      if (await Bun.file(fixture.ready).exists()) {
        try {
          process.kill(Number(await Bun.file(fixture.ready).text()), "SIGKILL")
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error
        }
      }
      await fixture.tmp[Symbol.asyncDispose]()
    }),
)

describe.skipIf(process.platform === "win32")("Ripgrep glob lifetime", () => {
  it.effect(
    "times out at one minute and reaps a child that ignores TERM",
    () =>
      Effect.gen(function* () {
        const fixture = yield* stalledSearch
        const fiber = yield* Effect.gen(function* () {
          const ripgrep = yield* Ripgrep.Service
          return yield* ripgrep.glob({ cwd: fixture.tmp.path, pattern: "*", limit: 10 })
        }).pipe(Effect.provide(fixture.layer), Effect.forkChild)
        const pid = Number(yield* waitForFile(fixture.ready))
        yield* TestClock.adjust("59 seconds")
        expect(fiber.pollUnsafe()).toBeUndefined()
        yield* TestClock.adjust("1 second")
        expect(yield* waitForFile(fixture.terminated)).toBe("TERM received")
        yield* TestClock.adjust("2 seconds")
        const exit = yield* Fiber.await(fiber)
        expect(Exit.isFailure(exit)).toBe(true)
        if (Exit.isFailure(exit)) {
          expect(Cause.squash(exit.cause)).toBeInstanceOf(Ripgrep.Error)
          expect(Cause.pretty(exit.cause)).toContain("File search timed out after 60 seconds")
          expect(Cause.pretty(exit.cause)).toContain("Narrow the search directory or glob pattern")
        }
        expect(() => process.kill(pid, 0)).toThrow()
        expect(fixture.guard.fired).toBe(false)
      }),
    10_000,
  )

  it.effect(
    "abort reaps a stuck child without waiting for the search deadline",
    () =>
      Effect.gen(function* () {
        const fixture = yield* stalledSearch
        const controller = new AbortController()
        const fiber = yield* Effect.gen(function* () {
          const ripgrep = yield* Ripgrep.Service
          return yield* ripgrep.glob({ cwd: fixture.tmp.path, pattern: "*", limit: 10, signal: controller.signal })
        }).pipe(Effect.provide(fixture.layer), Effect.forkChild)
        const pid = Number(yield* waitForFile(fixture.ready))
        controller.abort(new Error("Search canceled"))
        expect(yield* waitForFile(fixture.terminated)).toBe("TERM received")
        yield* TestClock.adjust("2 seconds")
        const exit = yield* Fiber.await(fiber)
        expect(Exit.isFailure(exit)).toBe(true)
        if (Exit.isFailure(exit)) expect(Cause.pretty(exit.cause)).not.toContain("timed out")
        expect(() => process.kill(pid, 0)).toThrow()
        expect(fixture.guard.fired).toBe(false)
      }),
    10_000,
  )
})
