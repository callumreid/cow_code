#!/usr/bin/env bun
import { $ } from "bun"

import { downloadCliToResources, resolveChannel } from "./utils"

const channel = resolveChannel()
await $`bun ./scripts/copy-icons.ts ${channel}`
await $`bun ./scripts/copy-metainfo.ts ${channel}`

// The sidecar owns the session database, and its name comes from the channel it was
// built with. Without this the server build falls back to `git branch --show-current`
// while the app is always dev/beta/prod, so packaging off a feature branch points the
// app at an empty store and every existing thread disappears.
await $`cd ../opencode && bun script/build-node.ts`.env({ ...process.env, OPENCODE_CHANNEL: channel })
if (channel === "dev") await downloadCliToResources()
