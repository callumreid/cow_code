import { expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

test("the real phone gate reports upstream health without weakening authentication", async () => {
  const directory = await mkdtemp(join(tmpdir(), "cow-phone-gate-"))
  const gateToken = "fixture-gate-token-".repeat(3)
  let healthy = true
  const target = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch(request) {
      expect(request.headers.get("authorization")).toBe(
        `Basic ${Buffer.from("cow:fixture-password").toString("base64")}`,
      )
      return Response.json({ healthy })
    },
  })
  const reserved = Bun.serve({ port: 0, fetch: () => new Response() })
  const port = reserved.port!
  reserved.stop(true)
  await writeFile(join(directory, "password"), "fixture-password")
  await writeFile(join(directory, "token"), gateToken)
  await writeFile(join(directory, "origin"), "https://cow.example.com")
  await writeFile(
    join(directory, "gate.cjs"),
    await readFile(new URL("../../../../scripts/box/cow-gate.js", import.meta.url), "utf8"),
  )
  const child = Bun.spawn(["node", join(directory, "gate.cjs")], {
    env: {
      ...process.env,
      COW_TARGET_PORT: String(target.port),
      COW_GATE_PORT: String(port),
      COW_SERVER_PASSWORD_FILE: join(directory, "password"),
      COW_GATE_TOKEN_FILE: join(directory, "token"),
      COW_PHONE_ORIGIN_FILE: join(directory, "origin"),
      COW_GATE_ACCESS_LOG: join(directory, "access.log"),
    },
    stdout: "pipe",
    stderr: "inherit",
  })
  try {
    const reader = child.stdout.getReader()
    await reader.read() // The server's listening receipt, not an arbitrary startup sleep.
    reader.releaseLock()
    const base = `http://127.0.0.1:${port}`
    expect((await fetch(`${base}/_cow/ping`)).status).toBe(404)
    const headers = { cookie: `cowcode_gate=${gateToken}` }
    expect(await fetch(`${base}/_cow/ping`, { headers }).then((response) => response.json())).toMatchObject({
      ok: true,
      server: true,
      origin: "https://cow.example.com",
    })
    healthy = false
    expect(await fetch(`${base}/_cow/ping`, { headers }).then((response) => response.json())).toMatchObject({
      ok: true,
      server: false,
    })
    expect(await readFile(join(directory, "token"), "utf8")).toBe(gateToken)
  } finally {
    child.kill()
    await child.exited
    target.stop(true)
    await rm(directory, { recursive: true, force: true })
  }
})
