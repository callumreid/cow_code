/**
 * Moving a thread between machines (the MacBook's built-in server and the always-on box). Each
 * machine keeps its own database, so a move is an export from one server and an import into the
 * other under the same session id. The working tree is carried as a change set (tracked and
 * untracked edits against HEAD) plus the branch name; commits that only exist locally are not.
 */
import { SessionV1 } from "@opencode-ai/core/v1/session"
import { Database } from "@opencode-ai/core/database/database"
import { SessionTable, MessageTable, PartTable } from "@opencode-ai/core/session/sql"
import { Git } from "@opencode-ai/core/git"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { eq } from "drizzle-orm"
import { Effect, Schema } from "effect"
import fs from "fs/promises"
import path from "path"
import { InstanceState } from "@/effect/instance-state"
import { Session } from "./session"
import type { SessionID } from "./schema"

export const ExportResult = Schema.Struct({
  info: Session.Info,
  messages: Schema.Array(SessionV1.WithParts),
  /** Source folder, branch and uncommitted change set, when the thread lives in a git checkout. */
  git: Schema.optional(
    Schema.Struct({
      directory: Schema.String,
      branch: Schema.optional(Schema.String),
      head: Schema.optional(Schema.String),
      changes: Schema.String,
    }),
  ),
}).annotate({ identifier: "SessionTransferExport" })
export type ExportResult = typeof ExportResult.Type

export const ImportPayload = Schema.Struct({
  info: Schema.Unknown,
  messages: Schema.Array(Schema.Unknown),
  changes: Schema.optional(Schema.String),
}).annotate({ identifier: "SessionTransferImport" })
export type ImportPayload = typeof ImportPayload.Type

export class TransferError extends Schema.TaggedErrorClass<TransferError>()("SessionTransfer.TransferError", {
  message: Schema.String,
}) {}

export const ImportResult = Schema.Struct({
  sessionID: Schema.String,
  directory: Schema.String,
  changes: Schema.Literals(["none", "applied", "failed"]),
  error: Schema.optional(Schema.String),
}).annotate({ identifier: "SessionTransferImportResult" })
export type ImportResult = typeof ImportResult.Type

const decodeInfo = Schema.decodeUnknownSync(Session.Info)
const decodeMessage = Schema.decodeUnknownSync(SessionV1.Info)
const decodePart = Schema.decodeUnknownSync(SessionV1.Part)

export const exportSession = Effect.fn("SessionTransfer.export")(function* (sessionID: SessionID) {
  const sessions = yield* Session.Service
  const git = yield* Git.Service
  const info = yield* sessions.get(sessionID)
  const messages = yield* sessions.messages({ sessionID })
  const directory = AbsolutePath.make(info.directory)
  const repository = yield* git.repo.discover(directory)
  if (!repository) return { info, messages } satisfies ExportResult
  const changes = yield* git.change
    .capture({ repository, path: directory })
    .pipe(Effect.catch(() => Effect.succeed(Git.ChangeSet.make(""))))
  const branch = yield* git.history.branch(repository)
  const head = yield* git.history.head(repository)
  return { info, messages, git: { directory, branch, head, changes } } satisfies ExportResult
})

/** Writes the thread into this server under the request's folder, replacing any earlier copy of it. */
export const importSession = Effect.fn("SessionTransfer.import")(function* (input: ImportPayload) {
  const ctx = yield* InstanceState.context
  const exists = yield* Effect.promise(() =>
    fs.stat(ctx.directory).then(
      (stat) => stat.isDirectory(),
      () => false,
    ),
  )
  if (!exists) return yield* new TransferError({ message: `${ctx.directory} does not exist on this machine` })
  const { db } = yield* Database.Service
  const git = yield* Git.Service
  // The copy here is the live one again, so it must not stay archived.
  const { archived: _archived, ...time } = (input.info as { time?: Record<string, unknown> }).time ?? {}
  const info = decodeInfo({
    ...(input.info as object),
    projectID: ctx.project.id,
    directory: ctx.directory,
    path: path.relative(path.resolve(ctx.worktree), ctx.directory).replaceAll("\\", "/"),
    time,
  })
  const row = Session.toRow(info as Session.Info)
  const messages = input.messages.map((entry) => {
    const msg = entry as { info: unknown; parts: unknown[] }
    return { info: decodeMessage(msg.info), parts: msg.parts.map((part) => decodePart(part)) }
  })

  yield* db
    .transaction((tx) =>
      Effect.gen(function* () {
        // A thread that went away and came back: its old copy here is stale, so replace it wholesale.
        yield* tx.delete(PartTable).where(eq(PartTable.session_id, row.id)).run()
        yield* tx.delete(MessageTable).where(eq(MessageTable.session_id, row.id)).run()
        yield* tx.insert(SessionTable).values(row).onConflictDoUpdate({ target: SessionTable.id, set: row }).run()
        for (const msg of messages) {
          const { id, sessionID: _, ...data } = msg.info
          yield* tx
            .insert(MessageTable)
            .values({ id, session_id: row.id, time_created: msg.info.time?.created ?? Date.now(), data: data as never })
            .run()
          for (const part of msg.parts) {
            const { id: partID, sessionID: _s, messageID, ...partData } = part
            yield* tx
              .insert(PartTable)
              .values({ id: partID, message_id: messageID, session_id: row.id, data: partData as never })
              .run()
          }
        }
      }),
    )
    .pipe(Effect.orDie)

  const result = { sessionID: row.id, directory: ctx.directory }
  if (!input.changes?.trim()) return { ...result, changes: "none" as const }
  const repository = yield* git.repo.discover(AbsolutePath.make(ctx.directory))
  if (!repository) return { ...result, changes: "failed" as const, error: "This folder is not a git checkout" }
  return yield* git.change
    .apply({ repository, path: AbsolutePath.make(ctx.directory), changes: Git.ChangeSet.make(input.changes) })
    .pipe(
      Effect.as({ ...result, changes: "applied" as const }),
      Effect.catch((error) => Effect.succeed({ ...result, changes: "failed" as const, error: error.message })),
    )
})
