// Risk tiers for answering a thread's permission prompt on Callum's behalf.
// "auto"   = read-only; answered silently, logged as auto_allowed.
// "farmer" = reversible edits and routine checks; the farmer may decide.
// "callum" = irreversible or outward-facing; only Callum's own words approve it.
export type Tier = "auto" | "farmer" | "callum"
export type Autonomy = "brief" | "act"

const READ_ONLY = new Set([
  "read",
  "glob",
  "grep",
  "list",
  "webfetch",
  "websearch",
  "codesearch",
  "skill",
  "lsp",
  "todowrite",
  "todoread",
  "list_mcp_resources",
  "read_mcp_resource",
  "list_mcp_resource_templates",
  "plan_enter",
  "plan_exit",
])

const REVERSIBLE = new Set(["edit", "write", "apply_patch", "patch", "task", "external_directory", "question"])

// Commands that only read or verify: version control reads, listings, test and lint runners.
const SAFE_COMMAND =
  /^\s*(git\s+(status|log|diff|show|branch|fetch|rev-parse|ls-files|blame|stash\s+list|worktree\s+list)|ls|cat|head|tail|wc|grep|rg|find|pwd|echo|which|env|printenv|bun\s+(test|typecheck|run\s+(test|typecheck|lint|build))|bunx\s+(tsc|vitest|eslint|prettier|playwright\s+test)|npm\s+(test|run\s+(test|typecheck|lint|build))|pnpm\s+(test|typecheck|lint|build)|npx\s+(tsc|vitest|eslint|prettier)|pytest|ruff|cargo\s+(check|test|build|clippy)|go\s+(test|build|vet)|make\s+(test|check|lint))\b/

// Anything that deletes, publishes, deploys, or touches shared state stays with Callum.
const DANGEROUS_COMMAND =
  /\b(rm\s+-r|rm\s+-f|git\s+push|git\s+reset\s+--hard|git\s+clean|git\s+rebase|git\s+checkout\s+\.|sudo|curl\s+.*-X\s*(POST|PUT|DELETE|PATCH)|terraform\s+(apply|destroy)|aws\s+\S+\s+(delete|put|update|create|run|start|stop|terminate|modify)|kubectl\s+(apply|delete|scale|rollout)|npm\s+publish|docker\s+(rm|rmi|push)|drop\s+table|truncate|chmod\s+-R|mkfs|dd\s+if=|>\s*\/dev\/|launchctl|killall|pkill)\b/i

export function classify(
  input: { permission: string; patterns: ReadonlyArray<string>; metadata?: Record<string, unknown> },
  autonomy: Autonomy,
): Tier {
  const tier = base(input)
  if (autonomy === "brief" && tier === "farmer") return "callum"
  return tier
}

function base(input: {
  permission: string
  patterns: ReadonlyArray<string>
  metadata?: Record<string, unknown>
}): Tier {
  if (READ_ONLY.has(input.permission)) return "auto"
  if (REVERSIBLE.has(input.permission)) return "farmer"
  if (input.permission !== "bash") return "callum"
  const command = [
    ...(typeof input.metadata?.command === "string" ? [input.metadata.command] : []),
    ...input.patterns,
  ].join("\n")
  if (DANGEROUS_COMMAND.test(command)) return "callum"
  if (command.split("\n").every((line) => SAFE_COMMAND.test(line))) return "auto"
  return "farmer"
}

// The only thing that approves a "callum" tier action is Callum's own words.
export function looksLikeApproval(text: string | undefined) {
  if (!text) return false
  return /\b(yes|yep|yeah|approve|approved|do it|run it|go ahead|ship it|confirmed|confirm|allow|allowed|send it)\b/i.test(
    text,
  )
}

export function looksLikeDenial(text: string | undefined) {
  if (!text) return false
  return /\b(no|nope|deny|denied|don'?t|do not|stop|cancel|reject|hold off)\b/i.test(text)
}
