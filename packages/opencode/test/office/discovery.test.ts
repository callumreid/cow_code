import { expect, test } from "bun:test"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { rolloutFiles } from "../../src/office/discovery"
test("resumed rollouts are discovered outside recent creation-date folders", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "office-discovery-"))
  try {
    await fs.mkdir(path.join(root, "2024/01/01"), { recursive: true })
    await fs.writeFile(path.join(root, "2024/01/01/resumed.jsonl"), "{}")
    await fs.mkdir(path.join(root, "2026/09/09"), { recursive: true })
    await fs.writeFile(path.join(root, "2026/09/09/new.jsonl"), "{}")
    expect((await rolloutFiles(root)).map((file) => path.basename(file)).sort()).toEqual(["new.jsonl", "resumed.jsonl"])
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
