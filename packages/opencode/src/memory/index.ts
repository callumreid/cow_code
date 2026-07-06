import path from "path"
import { Effect, Schema } from "effect"

// Persistent cross-session memory storage: a MEMORY.md index plus one markdown
// file per fact, in two scopes. The index is injected at session start (see
// session/instruction.ts); fact files are read on demand via the memory tool.
// This module owns the scope roots and the path jail so the tool and the
// instruction injector cannot drift.

export const INDEX_FILE = "MEMORY.md"
export const INDEX_MAX = 4_000 // chars per scope injected at session start (~1k tokens)
export const FILE_MAX = 50_000 // chars per fact file returned by read

export type Scope = "global" | "project"

export class InvalidPathError extends Schema.TaggedErrorClass<InvalidPathError>()("MemoryInvalidPathError", {
  file: Schema.String,
  reason: Schema.String,
}) {
  override get message() {
    return `Invalid memory path "${this.file}": ${this.reason}. Use a .md path relative to the memory root, without ".." segments or absolute paths.`
  }
}

// global = <xdg config>/memory, project = <worktree>/.opencode/memory
export const root = (scope: Scope, input: { config: string; worktree: string }) =>
  scope === "global" ? path.join(input.config, "memory") : path.join(input.worktree, ".opencode", "memory")

// The jail: lexical containment after resolve, .md-only. `file` is model-supplied.
export const resolve = (rootDir: string, file: string) =>
  Effect.gen(function* () {
    const target = path.resolve(rootDir, file)
    const rel = path.relative(rootDir, target)
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel))
      return yield* new InvalidPathError({ file, reason: "path escapes the memory directory" })
    if (!target.endsWith(".md")) return yield* new InvalidPathError({ file, reason: "only .md files are allowed" })
    return { target, rel }
  })

export * as Memory from "./index"
