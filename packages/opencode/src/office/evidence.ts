import type { SessionV1 } from "@opencode-ai/core/v1/session"
import type { Lifecycle } from "./lifecycle"

/** Evidence names the exact successful tool observation; it never verifies a whole objective. */
export function toolEvidence(part: SessionV1.Part): Lifecycle["evidence"][number] | undefined {
  if (part.type !== "tool" || part.state.status !== "completed") return
  const reference = part.sessionID + "/" + part.messageID + "/" + part.id
  if (["edit", "write", "apply_patch", "multiedit"].includes(part.tool))
    return { kind: "implementation", reference, status: "verified" }
  if (part.tool !== "bash") return
  const code = part.state.metadata?.exit ?? part.state.metadata?.exitCode
  if (code !== 0) return
  const command = part.state.input?.command
  if (typeof command !== "string" || /[|;&\n]/.test(command)) return
  if (
    /^(?:bun|npm|pnpm|yarn)(?: run)? (?:test|typecheck|lint|check)(?:\s|$)|^pytest(?:\s|$)|^cargo (?:test|check)(?:\s|$)/.test(
      command,
    )
  )
    return { kind: "check", reference: command + " (exit 0) · " + reference, status: "verified" }
  if (/^git push(?:\s|$)/.test(command))
    return {
      kind: "shipment",
      reference: command + " (exit 0; repository push only) · " + reference,
      status: "verified",
    }
}
