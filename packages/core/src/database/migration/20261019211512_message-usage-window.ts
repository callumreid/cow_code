import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20261019211512_message-usage-window",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`CREATE INDEX \`message_time_created_idx\` ON \`message\` (\`time_created\`);`)
    })
  },
} satisfies DatabaseMigration.Migration
