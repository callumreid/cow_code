import { expect, test } from "bun:test"
import fs from "fs/promises"
import os from "os"
import path from "path"
test("the real wrapper carries an execution ID into its marker, command, and ledger", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "office-routine-"))
  try {
    const script = path.resolve(import.meta.dir, "../../../../scripts/box/cow-routine-run.sh")
    const code = [
      "import os,json",
      "execution=os.environ['COW_ROUTINE_EXECUTION_ID']",
      "marker=json.load(open(os.environ['COW_ROUTINE_LEDGER_DIR']+'/fixture.running'))",
      "assert marker['executionID']==execution",
      "json.dump(dict(sessionID='ses_fixture',directory='/fixture'),open(os.environ['COW_ROUTINE_RESULT_FILE'],'w'))",
      "print(execution)",
    ].join(";")
    const result = Bun.spawn(["bash", script, "fixture", "--", "python3", "-c", code], {
      env: { ...process.env, COW_ROUTINE_LEDGER_DIR: dir },
      stdout: "pipe",
      stderr: "pipe",
    })
    const text = await new Response(result.stdout).text()
    expect(await result.exited).toBe(0)
    const entry = JSON.parse((await fs.readFile(path.join(dir, "ledger.jsonl"), "utf8")).trim())
    expect(entry).toMatchObject({
      executionID: text.trim(),
      sessionID: "ses_fixture",
      directory: "/fixture",
      status: "ok",
      rc: 0,
    })
    expect(entry.executionID).toMatch(/^[a-f0-9-]{36}$/)
    expect(await fs.stat(path.join(dir, "fixture.running")).catch(() => undefined)).toBeUndefined()
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})
