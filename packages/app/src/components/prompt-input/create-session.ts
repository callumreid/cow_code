/**
 * Creating a thread is the one request in a send that must not run twice. The server treats a
 * create with an id it already has as a no-op that returns the recorded session, so the id is
 * minted once per send and every retry reuses it: a reply lost on a flaky tunnel (the ssh forward
 * to the box half-hangs several times a day) can be retried without making a second thread.
 */
export class CreateSessionTimeoutError extends Error {
  override name = "CreateSessionTimeoutError"
  constructor(readonly seconds: number) {
    super(`No answer from the server after ${seconds}s`)
  }
}

export async function createSessionWithRetry<T>(input: {
  id: string
  create: (id: string) => Promise<T>
  attempts?: number
  timeoutMs?: number
  /** Whether a failure is worth retrying; defaults to timeouts and transport errors. */
  retryable?: (error: unknown) => boolean
}): Promise<T> {
  const attempts = Math.max(1, input.attempts ?? 3)
  const timeoutMs = input.timeoutMs ?? 15_000
  const retryable = input.retryable ?? isRetryable
  let last: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new CreateSessionTimeoutError(Math.round(timeoutMs / 1000))), timeoutMs)
    })
    try {
      return await Promise.race([input.create(input.id), timeout])
    } catch (error) {
      last = error
      if (attempt === attempts || !retryable(error)) throw error
    } finally {
      clearTimeout(timer)
    }
  }
  throw last
}

export function isRetryable(error: unknown) {
  if (error instanceof CreateSessionTimeoutError) return true
  if (error instanceof TypeError) return true // fetch: connection refused / reset / network down
  if (!error || typeof error !== "object") return false
  const name = (error as { name?: unknown }).name
  return name === "TypeError" || name === "TimeoutError" || name === "AbortError" || name === "HttpClientError"
}
