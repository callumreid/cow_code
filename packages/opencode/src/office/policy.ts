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

// Automatic approval is deliberately a small, whole-command grammar. Shell
// operators, substitutions, redirects and script runners can conceal writes.
const READ_COMMAND =
  /^(?:pwd|(?:ls|cat|head|tail|wc|rg|grep|which)\b[^;&|`$<>\n\r]*|git\s+(?:status|log|diff|show|rev-parse|ls-files|blame)(?:\s+[^;&|`$<>\n\r]*)?)$/
const SHELL_SYNTAX = /[;&|`$<>\n\r]|\\/

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
  const commands = typeof input.metadata?.command === "string" ? [input.metadata.command] : input.patterns
  if (
    commands.length &&
    commands.every((command) => {
      const text = command.trim()
      return (
        !SHELL_SYNTAX.test(text) &&
        !/(?:^|\s)--(?:output|ext-diff|textconv|pre|pre-glob|exec-path|config-env)(?:[=\s]|$)/.test(text) &&
        READ_COMMAND.test(text)
      )
    })
  )
    return "auto"
  return "callum"
}

// The only thing that approves a "callum" tier action is Callum's own words.
export function looksLikeApproval(text: string | undefined) {
  if (!text || looksLikeDenial(text)) return false
  return /^(?:(?:yes|yep|yeah|approve|approved|do it|run it|go ahead|ship it|confirmed|confirm|allow|allowed|send it)\b|(?:i approve|please allow|you may proceed|you can proceed)\b)/i.test(
    text.trim(),
  )
}

export function looksLikeDenial(text: string | undefined) {
  if (!text) return false
  return /\b(no|nope|deny|denied|don'?t|do not|stop|cancel|reject|hold off)\b/i.test(text)
}

// The quoted tool argument is never evidence of user authority. The caller must
// resolve this origin from the assistant's real parent message in the ledger.
export function authorizesDecision(
  origin: {
    source: string
    text: string
    decisionIDs?: string[]
  },
  id: string,
  reply: "once" | "always" | "reject",
  quote?: string,
) {
  if (reply === "reject") return true
  if (origin.source !== "user" || !origin.decisionIDs?.includes(id)) return false
  if (!looksLikeApproval(origin.text)) return false
  if (quote && !origin.text.includes(quote)) return false
  return reply !== "always" || /\b(always|remember|standing)\b/i.test(origin.text)
}

export function roleAllowsTool(agent: string, tool: string) {
  return agent === "farmer" ? tool.startsWith("office_") : !tool.startsWith("office_")
}
