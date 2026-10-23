#!/usr/bin/env bun
// bun script/flint-local.ts: install and register Flint on this Apple Silicon Mac.
import { $ } from "bun"
import { homedir } from "node:os"
import path from "node:path"
import { mkdir, statfs } from "node:fs/promises"

if (process.platform !== "darwin" || process.arch !== "arm64")
  throw new Error("Flint setup requires Apple Silicon macOS")

const root = path.join(homedir(), ".local/share/cowcode")
const model = path.join(root, "models/flint/flint-UD-Q3_K_XL.gguf")
const runtime = path.join(root, "runtimes/llama-b11838")
const binary = path.join(runtime, "llama-b11838/llama-server")
const modelSHA = "91b8d85ab6ff7fb095d9a972f9afa6f3fa2b9acb642867a079f3e013ea3c350c"
const modelSize = 18_494_977_472
const revision = "20468edfc38ab43d6914cc88b08cbecb05d0fc62"
await mkdir(path.dirname(model), { recursive: true })
await mkdir(runtime, { recursive: true })

if (!(await Bun.file(binary).exists())) {
  const archive = path.join(runtime, "llama-b11838-bin-macos-arm64.tar.gz")
  await $`curl -fL --retry 3 -o ${archive} https://github.com/ggml-org/llama.cpp/releases/download/b11838/llama-b11838-bin-macos-arm64.tar.gz`
  const hash = (await $`shasum -a 256 ${archive}`.text()).split(/\s/)[0]
  if (hash !== "caefe329714c7583e7f1688454c61e7024979d221ef4948eb13ca1c68ad9b6e4")
    throw new Error("Runtime checksum mismatch")
  await $`tar -xzf ${archive} -C ${runtime}`
}
const existing = (await Bun.file(model).exists()) ? Bun.file(model).size : 0
if (existing !== modelSize) {
  const disk = await statfs(root)
  if (disk.bavail * disk.bsize < modelSize - existing + 2_000_000_000)
    throw new Error(
      "Not enough free disk space for Flint plus 2 GB of working space; keep the partial download to resume",
    )
  const url = `https://huggingface.co/unsloth/flint-GGUF/resolve/${revision}/flint-UD-Q3_K_XL.gguf`
  await $`curl -fL --retry 5 -C - -o ${model} ${url}`
}
console.log("Verifying Flint weights…")
if (Bun.file(model).size !== modelSize || (await $`shasum -a 256 ${model}`.text()).split(/\s/)[0] !== modelSHA)
  throw new Error("Flint size or checksum mismatch")

const configPath = path.join(homedir(), ".config/opencode/opencode.json")
const configFile = Bun.file(configPath)
const config = (await configFile.exists()) ? await configFile.json() : {}
config.provider ??= {}
config.provider["flint-local"] = {
  npm: "@ai-sdk/openai-compatible",
  name: "Flint (this Mac)",
  options: { baseURL: "http://127.0.0.1:8902/v1" },
  models: {
    flint: {
      name: "Flint 40B-A2.5B Q3 (local)",
      limit: { context: 32768, output: 8192 },
      tool_call: true,
      reasoning: true,
      interleaved: { field: "reasoning_content" },
      modalities: { input: ["text"], output: ["text"] },
      cost: { input: 0, output: 0 },
      options: { temperature: 1, topP: 0.95, topK: 20 },
    },
  },
}
await mkdir(path.dirname(configPath), { recursive: true })
if (await configFile.exists()) await Bun.write(`${configPath}.bak-flint-${Date.now()}`, configFile)
// Atomic rename keeps a concurrent config reader from observing a truncated JSON file.
const next = `${configPath}.flint-${process.pid}.tmp`
await Bun.write(next, JSON.stringify(config, null, 2) + "\n")
await $`chmod 600 ${next}`
await $`mv ${next} ${configPath}`

const label = "dev.cowcode.flint"
const plist = path.join(homedir(), "Library/LaunchAgents", `${label}.plist`)
const log = path.join(root, "flint-server.log")
const args = [
  binary,
  "--model",
  model,
  "--alias",
  "flint",
  "--host",
  "127.0.0.1",
  "--port",
  "8902",
  "--ctx-size",
  "32768",
  "--parallel",
  "1",
  "--n-gpu-layers",
  "99",
  "--temp",
  "1.0",
  "--top-p",
  "0.95",
  "--top-k",
  "20",
  "--min-p",
  "0.0",
  "--jinja",
  "--reasoning-format",
  "deepseek",
  "--sleep-idle-seconds",
  "300",
]
const xml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
await mkdir(path.dirname(plist), { recursive: true })
await Bun.write(
  plist,
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array>${args.map((arg) => `<string>${xml(arg)}</string>`).join("")}</array>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>30</integer>
<key>StandardOutPath</key><string>${xml(log)}</string>
<key>StandardErrorPath</key><string>${xml(log)}</string>
</dict></plist>
`,
)
await $`plutil -lint ${plist}`
const target = `gui/${process.getuid!()}`
if ((await $`launchctl print ${target}/${label}`.quiet().nothrow()).exitCode !== 0)
  await $`launchctl bootstrap ${target} ${plist}`
console.log("Flint registered as flint-local/flint. Choose Flint 40B-A2.5B Q3 (local) in CowCode.")
console.log(`Local endpoint: http://127.0.0.1:8902/v1. Logs: ${log}. Model unloads after 5 idle minutes.`)
