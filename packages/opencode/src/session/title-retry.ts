/**
 * Auto-title retry policy for SessionPrompt.ensureTitle.
 *
 * Historically title generation fired only when a session's history held
 * EXACTLY one real user message — a single fire-and-forget attempt. If that
 * one generation failed, the session stayed "New session" forever. This
 * policy instead allows a retry on any turn while the session still carries
 * a default title, bounded to the first few user turns.
 */

/** Maximum number of real user messages (≈ turns) during which auto-title generation keeps retrying. */
export const TITLE_MAX_ATTEMPT_TURNS = 5

/**
 * Decide whether ensureTitle should attempt a generation this turn.
 * Child sessions and sessions already titled (by a prior generation or a
 * user rename) never attempt; otherwise retry while within the turn bound.
 */
export const shouldAttemptTitle = (input: {
  isChildSession: boolean
  hasDefaultTitle: boolean
  realUserMessageCount: number
}) =>
  !input.isChildSession &&
  input.hasDefaultTitle &&
  input.realUserMessageCount >= 1 &&
  input.realUserMessageCount <= TITLE_MAX_ATTEMPT_TURNS
