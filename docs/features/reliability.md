# Keeping work moving

CowCode's v1 runtime saves task checkpoints in its existing local Office ledger. A checkpoint includes the conversation, workspace, original recovery deadline, last observed progress and the next provider retry. The thread banner shows working, waiting for input, retrying or blocked, with Stop and an explicit Resume after review action.

Transient provider failures retry with backoff for at most 30 retries and 15 minutes per provider turn. Account actions and payment limits stop for attention. A task can continue automatically for up to 24 hours from its checkpoint; an explicit resume after a pause starts a new window. Models and providers are never silently substituted.

On startup, a server claims work only after the previous local owning process has exited. A file lock prevents two recovering servers claiming the same checkpoint. A still-live or unknown owner is left alone. This is local recovery, not a distributed execution lease; a reused process ID conservatively requires inspection.

Recovery reads persisted conversation and tool results first. A finished response stays finished. Completed tools are supplied to the next provider request, including when a provider fails after returning a tool result. Pending, running or interrupted tools pause for inspection because their external effect is uncertain. Recovery never re-executes those saved calls. Stop is durable and cancels a saved retry wait. Graceful server shutdown preserves the checkpoint; interrupted tools still require inspection.

Budgets are checked before each provider turn, including ancestor task budgets. They use recorded/estimated usage and cannot prevent concurrent requests already in flight from overshooting. An attached image blocks a model whose capability metadata does not advertise image input, leaving the image in the thread for a compatible model.

## Connections

The integration menu separates configured/authentication status from a current test. Test sends an MCP ping and reads the tool catalog; it never executes an integration tool or reconnects implicitly. Reconnect is a separate explicit action. A successful test proves transport and catalog access, not permission to every external action. The last successful tool call is observed on this connection and resets when the connection or server restarts; no observation is shown as unknown, never as a successful action.

## Schedules

Schedules preserve the existing distinction between process status, correlated agent status and reported/verified outcome. A missing calendar attempt is shown after a two-minute grace period. A worker with no correlated thread progress for 15 minutes asks for inspection; it is not automatically restarted. Snapshots older than 90 seconds are marked stale. Last verified success comes from the retained run history, separately from the latest attempt. Existing Open thread and Run now actions remain available.

The app gives routine requests 30 seconds, discards responses from a previously selected server and refreshes when it returns online or visible. Missing receipts and quiet workers are evidence to investigate, not proof that a job failed.

These recovery and connection-test APIs target the installed v1 runtime. The v2 session engine is preserved; the app does not present a successful v1 health test for a v2 server.
