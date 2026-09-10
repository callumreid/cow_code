type PromptPlaceholderInput = {
  mode: "normal" | "shell"
  commentCount: number
  example: string
  suggest: boolean
  t: (key: string, params?: Record<string, string>) => string
}

export function promptPlaceholder(input: PromptPlaceholderInput) {
  if (input.mode === "shell") return input.t("prompt.placeholder.shell", { example: input.example })
  if (input.commentCount > 1) return input.t("prompt.placeholder.summarizeComments")
  if (input.commentCount === 1) return input.t("prompt.placeholder.summarizeComment")
  if (!input.suggest) return input.t("prompt.placeholder.simple")
  return input.t("prompt.placeholder.normal", { example: input.example })
}

// Every one of these says "big dog", because people need to be big dogging
// their agent. `.normal` is variation one; the rest live alongside it.
const BIG_DOG_PLACEHOLDERS = [
  "ui.promptInput.placeholder.normal",
  ...Array.from({ length: 11 }, (_, index) => `ui.promptInput.placeholder.bigdog.${index + 2}`),
]

/** Picks one big dog line. Call once per composer so it holds still while typing. */
export function pickBigDogPlaceholder(random = Math.random()) {
  const index = Math.floor(random * BIG_DOG_PLACEHOLDERS.length)
  return BIG_DOG_PLACEHOLDERS[Math.min(Math.max(index, 0), BIG_DOG_PLACEHOLDERS.length - 1)]
}

export function promptDesignPlaceholder(
  mode: PromptPlaceholderInput["mode"],
  placeholder: string,
  t: PromptPlaceholderInput["t"],
  key = "ui.promptInput.placeholder.normal",
) {
  if (mode === "shell") return placeholder
  return t(key, { slash: "/", at: "@" })
}
