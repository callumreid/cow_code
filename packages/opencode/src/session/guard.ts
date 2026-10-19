export const unsupportedImage =
  "This model cannot read the attached image. Choose a model with image support before resuming."

export function budgetMessage(spent: number, limit: number) {
  return `Task budget reached ($${spent.toFixed(2)} of $${limit.toFixed(2)}). Increase the budget to resume.`
}

/** Keep the legacy error shape while distinguishing expected user-action stops. */
export function isUserAction(error: { name?: string; data?: { message?: string } } | undefined) {
  if (error?.name !== "UnknownError") return false
  const message = error.data?.message
  return (
    message === unsupportedImage ||
    (message !== undefined &&
      /^Task budget reached \(\$\d+\.\d{2} of \$\d+\.\d{2}\)\. Increase the budget to resume\.$/.test(message))
  )
}

export * as SessionGuard from "./guard"
