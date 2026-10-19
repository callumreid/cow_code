# Skills, images and spend

Type `/` in the composer to find skills by name or description. Skills have a badge; hover a result to see its canonical source and any declared compatibility requirements. Selecting a skill leaves it in your draft so you can add instructions before sending. CowCode includes `/cow-plan`, `/cow-investigate` and `/cow-verify`, and discovers your existing `.agents/skills`, `.claude/skills` and `.codex/skills` folders without copying them. Project/configured skills can override the built-ins. `user-invocable: false` or `slash: false` keeps a skill out of the slash menu.

Model choices show **Images**, **No images**, or **Image support unknown** from the selected provider's metadata. If images are attached to a model without advertised support, sending pauses and offers compatible choices. The draft and attachments stay intact. The same model name on another provider may have different capabilities.

**Spend and budget** shows the task plus descendants and today's recorded provider totals on the selected server. The day uses your device's local midnight. Charges are provider-reported when available, otherwise estimated from usage and catalog prices. `≈` means estimated; `≥` and `*` indicate incomplete accounting. Missing pricing, failed requests with missing usage, and usage outside CowCode cannot be reconciled against an account invoice. Older unpriced records remain unknown rather than free. Spend controls currently require the active v1 runtime; an unsupported server shows unavailable.

A task budget is saved on that task and applies to descendants. The runtime checks ancestor budgets before additional model turns. Zero pauses immediately; clearing the field removes the limit. Requests already in flight may finish above the amount. This is a recorded-spend pause threshold, not a hard provider billing cap. Increase/remove a reached threshold and resume the task to continue.

## Validation

Focused tests cover exact-provider image detection and draft preservation, v1/v2 slash discovery, canonical Codex skills, ancestor budgets, missing usage, OpenRouter reported charges, and the real SQLite task/day queries. App, core and opencode typechecks pass. Current and legacy clients were regenerated.

The usage index was verified against a local synthetic dataset of 240,000 messages, 10,000 sessions and 120 days. The daily query changed from `SCAN message` to `SEARCH message USING INDEX message_time_created_idx (time_created>? AND time_created<?)`: 2,000 returned rows, median 1.454 ms over eight executions. Task usage uses `message_session_time_created_id_idx`: 72 rows, median 0.048 ms. Ancestor/child queries use the primary key and `session_parent_idx`. These are representative local query checks, not live provider billing reconciliation.
