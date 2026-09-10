import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// Office coordination shares the session database, but does not own worker execution.
export const OfficeRecordTable = sqliteTable(
  "office_record",
  {
    id: text().primaryKey(),
    kind: text().notNull(),
    session_id: text(),
    state: text().notNull(),
    value: text({ mode: "json" }).$type<unknown>().notNull(),
    time_created: integer().notNull(),
    time_updated: integer().notNull(),
  },
  (table) => [index("office_record_kind").on(table.kind, table.time_created)],
)

export const OfficeEventTable = sqliteTable(
  "office_event",
  {
    cursor: integer().primaryKey({ autoIncrement: true }),
    id: text().notNull().unique(),
    kind: text().notNull(),
    session_id: text(),
    value: text({ mode: "json" }).$type<unknown>().notNull(),
    time_created: integer().notNull(),
  },
  (table) => [index("office_event_session").on(table.session_id, table.cursor)],
)
