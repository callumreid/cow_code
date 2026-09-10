import { Schema } from "effect"
export const Outcome = Schema.Struct({
  id: Schema.String,
  requestID: Schema.optional(Schema.String),
  clientID: Schema.optional(Schema.String),
  generation: Schema.optional(Schema.Finite),
  sessionID: Schema.String,
  text: Schema.String,
  time: Schema.Finite,
  reportIDs: Schema.Array(Schema.String),
  urgent: Schema.Boolean,
  observations: Schema.Array(
    Schema.Struct({ sessionID: Schema.String, runID: Schema.optional(Schema.String), updated: Schema.Finite }),
  ),
})
export type Outcome = typeof Outcome.Type
