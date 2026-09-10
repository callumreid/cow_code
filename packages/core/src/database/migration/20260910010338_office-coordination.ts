import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260910010338_office-coordination",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`office_event\` (
          \`cursor\` integer PRIMARY KEY AUTOINCREMENT,
          \`id\` text NOT NULL UNIQUE,
          \`kind\` text NOT NULL,
          \`session_id\` text,
          \`value\` text NOT NULL,
          \`time_created\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`office_record\` (
          \`id\` text PRIMARY KEY,
          \`kind\` text NOT NULL,
          \`session_id\` text,
          \`state\` text NOT NULL,
          \`value\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`CREATE INDEX \`office_event_session\` ON \`office_event\` (\`session_id\`,\`cursor\`);`)
      yield* tx.run(`CREATE INDEX \`office_record_kind\` ON \`office_record\` (\`kind\`,\`time_created\`);`)
    })
  },
} satisfies DatabaseMigration.Migration
