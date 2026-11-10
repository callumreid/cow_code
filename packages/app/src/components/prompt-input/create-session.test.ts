import { describe, expect, test } from "bun:test"
import { CreateSessionTimeoutError, createSessionWithRetry } from "./create-session"

describe("createSessionWithRetry", () => {
  test("retries a timed-out create with the same id", async () => {
    const ids: string[] = []
    const result = await createSessionWithRetry({
      id: "ses_fixed",
      timeoutMs: 10,
      create: (id) => {
        ids.push(id)
        return ids.length === 1 ? new Promise<string>(() => {}) : Promise.resolve(`created ${id}`)
      },
    })
    expect(result).toBe("created ses_fixed")
    expect(ids).toEqual(["ses_fixed", "ses_fixed"])
  })

  test("retries transport errors, then gives up", async () => {
    let calls = 0
    const failure = createSessionWithRetry({
      id: "ses_fixed",
      attempts: 3,
      create: () => {
        calls++
        return Promise.reject(new TypeError("Failed to fetch"))
      },
    })
    await expect(failure).rejects.toThrow("Failed to fetch")
    expect(calls).toBe(3)
  })

  test("does not retry a server rejection", async () => {
    let calls = 0
    const failure = createSessionWithRetry({
      id: "ses_fixed",
      create: () => {
        calls++
        return Promise.reject(Object.assign(new Error("bad request"), { name: "BadRequest" }))
      },
    })
    await expect(failure).rejects.toThrow("bad request")
    expect(calls).toBe(1)
  })

  test("reports a timeout after the last attempt", async () => {
    const failure = createSessionWithRetry({
      id: "ses_fixed",
      attempts: 2,
      timeoutMs: 5,
      create: () => new Promise<string>(() => {}),
    })
    await expect(failure).rejects.toBeInstanceOf(CreateSessionTimeoutError)
  })
})
