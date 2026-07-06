import { rm } from "node:fs/promises"
import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./memory.txt"
import { Memory } from "@/memory"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Global } from "@opencode-ai/core/global"
import { InstanceState } from "@/effect/instance-state"

export const Parameters = Schema.Struct({
  op: Schema.Literals(["list", "read", "write", "update", "delete"]).annotate({
    description: "The memory operation to perform",
  }),
  scope: Schema.Literals(["global", "project"]).annotate({
    description: "global = user-level memory, project = this workspace's memory",
  }),
  file: Schema.optional(Schema.String).annotate({
    description: "Path relative to the memory root, e.g. MEMORY.md or deploy-process.md. Required for read/write/update/delete",
  }),
  content: Schema.optional(Schema.String).annotate({ description: "Full file content, for write" }),
  oldString: Schema.optional(Schema.String).annotate({ description: "Exact existing text to replace, for update" }),
  newString: Schema.optional(Schema.String).annotate({ description: "Replacement text, for update" }),
})

type MemoryMetadata = { scope: "global" | "project"; op: string; filepath?: string; files?: string[] }

const REMIND = "\n\nIf this changed which facts exist, update the scope's MEMORY.md index now."

export const MemoryTool = Tool.define(
  "memory",
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const global = yield* Global.Service

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          const instance = yield* InstanceState.context
          const rootDir = Memory.root(params.scope, { config: global.config, worktree: instance.worktree })

          if (params.op === "list") {
            const files = yield* fs
              .glob("**/*.md", { cwd: rootDir, include: "file" })
              .pipe(Effect.catch(() => Effect.succeed([] as string[])))
            const sorted = files.toSorted((a, b) => a.localeCompare(b))
            const meta: MemoryMetadata = { scope: params.scope, op: params.op, files: sorted }
            return {
              title: `memory list ${params.scope}`,
              output: sorted.length ? sorted.join("\n") : `No memory files in ${params.scope} scope yet.`,
              metadata: meta,
            }
          }

          if (!params.file)
            return yield* new Tool.InvalidArgumentsError({ tool: "memory", detail: `op "${params.op}" requires "file"` })

          const { target, rel } = yield* Memory.resolve(rootDir, params.file).pipe(
            Effect.mapError((error) => new Tool.InvalidArgumentsError({ tool: "memory", detail: error.message })),
          )
          const label = `${params.scope}/${rel}`

          if (params.op !== "read")
            yield* ctx.ask({
              permission: "memory",
              patterns: [label],
              always: ["*"],
              metadata: { scope: params.scope, filepath: target, op: params.op },
            })

          const meta: MemoryMetadata = { scope: params.scope, op: params.op, filepath: target }

          if (params.op === "read") {
            const body = yield* fs.readFileStringSafe(target).pipe(Effect.catch(() => Effect.succeed(undefined)))
            return {
              title: `memory read ${label}`,
              output: body === undefined ? `Memory file not found: ${rel}` : body.slice(0, Memory.FILE_MAX),
              metadata: meta,
            }
          }

          if (params.op === "write") {
            if (params.content === undefined)
              return yield* new Tool.InvalidArgumentsError({ tool: "memory", detail: `op "write" requires "content"` })
            yield* fs.writeWithDirs(target, params.content)
            return { title: `memory write ${label}`, output: `Wrote ${rel}.${REMIND}`, metadata: meta }
          }

          if (params.op === "update") {
            if (params.oldString === undefined || params.newString === undefined)
              return yield* new Tool.InvalidArgumentsError({
                tool: "memory",
                detail: `op "update" requires "oldString" and "newString"`,
              })
            const body = yield* fs.readFileStringSafe(target).pipe(Effect.catch(() => Effect.succeed(undefined)))
            if (body === undefined)
              return { title: `memory update ${label}`, output: `Memory file not found: ${rel}. Write it first.`, metadata: meta }
            const index = body.indexOf(params.oldString)
            if (index === -1)
              return {
                title: `memory update ${label}`,
                output: `oldString not found in ${rel}. Read the file first, then update with an exact match.`,
                metadata: meta,
              }
            const next = body.slice(0, index) + params.newString + body.slice(index + params.oldString.length)
            yield* fs.writeWithDirs(target, next)
            return { title: `memory update ${label}`, output: `Updated ${rel}.${REMIND}`, metadata: meta }
          }

          // delete
          const exists = yield* fs.existsSafe(target)
          if (!exists) return { title: `memory delete ${label}`, output: `Memory file not found: ${rel}`, metadata: meta }
          yield* Effect.promise(() => rm(target, { force: true }))
          return { title: `memory delete ${label}`, output: `Deleted ${rel}.${REMIND}`, metadata: meta }
        }).pipe(Effect.orDie),
    }
  }),
)
