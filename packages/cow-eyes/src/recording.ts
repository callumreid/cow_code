import { spawn } from "node:child_process"
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const MAX_SECONDS = 300
const MAX_BYTES = 50 * 1024 * 1024

type Artifact = { path: string; bytes: number; durationMs: number }

/** Encode only the shared visible stream; never enumerate or record other browser tabs. */
export function createAgentRecording(output: string) {
  let active: { stop: (error?: Error) => void; done: Promise<Artifact | Error> } | undefined
  let last: Artifact | Error | undefined
  return {
    async start() {
      if (active) throw new Error("A browser recording is already running. Stop it before starting another.")
      const ffmpeg = process.env.COW_FFMPEG ?? Bun.which("ffmpeg")
      if (!ffmpeg) throw new Error("Browser video needs ffmpeg installed on the machine running CowCode.")
      const password = (
        await readFile(
          process.env.COW_SERVER_PASSWORD_FILE ?? join(homedir(), ".config/opencode/server-password"),
          "utf8",
        )
      )
        .split("\n")[0]!
        .trim()
      await mkdir(output, { recursive: true })
      const filename = `browser-recording-${Date.now()}-${crypto.randomUUID()}.webm`
      const path = join(output, filename)
      const temporary = `${path}.partial`
      const started = Date.now()
      let failure: Error | undefined
      let finishing = false
      let frame: Buffer | undefined
      let writeable = true
      let frames = 0
      let stderr = ""
      let draw: ReturnType<typeof setInterval> | undefined
      let deadline: ReturnType<typeof setTimeout> | undefined
      let killTimer: ReturnType<typeof setTimeout> | undefined
      let resolve!: (value: Artifact | Error) => void
      const done = new Promise<Artifact | Error>((callback) => (resolve = callback))
      const child = spawn(
        ffmpeg,
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-f",
          "image2pipe",
          "-vcodec",
          "mjpeg",
          "-framerate",
          "10",
          "-i",
          "pipe:0",
          "-an",
          "-vf",
          "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
          "-c:v",
          "libvpx-vp9",
          "-deadline",
          "realtime",
          "-cpu-used",
          "8",
          "-b:v",
          "1200k",
          "-t",
          String(MAX_SECONDS),
          "-fs",
          String(MAX_BYTES),
          "-f",
          "webm",
          temporary,
        ],
        { stdio: ["pipe", "ignore", "pipe"] },
      )
      const token = Buffer.from(`cow:${password}`).toString("base64")
      const socket = new WebSocket(
        `ws://127.0.0.1:${process.env.COW_EYES_PORT ?? 4099}/ws?auth_token=${encodeURIComponent(token)}`,
      )
      const stop = (error?: Error) => {
        if (finishing) return
        finishing = true
        failure = error
        if (draw) clearInterval(draw)
        if (deadline) clearTimeout(deadline)
        socket.close()
        child.stdin.end()
        killTimer = setTimeout(() => child.kill("SIGKILL"), 5_000)
      }
      active = { stop, done }
      last = undefined
      child.stderr.on("data", (chunk) => {
        stderr = (stderr + String(chunk)).slice(-1500)
      })
      child.stdin.on("drain", () => {
        writeable = true
      })
      child.stdin.on("error", () => stop())
      child.on("error", () => stop(new Error("Could not start ffmpeg for browser recording.")))
      child.on("close", async (code) => {
        stop()
        if (killTimer) clearTimeout(killTimer)
        let result: Artifact | Error = failure ?? new Error(stderr || "Browser recording produced no frames.")
        if (!failure && code === 0 && frames > 0) {
          try {
            await rename(temporary, path)
            result = { path, bytes: (await stat(path)).size, durationMs: Date.now() - started }
          } catch {
            result = new Error("Could not save the browser recording.")
          }
        }
        await rm(temporary, { force: true }).catch(() => undefined)
        active = undefined
        last = result
        resolve(result)
      })
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data))
          if (message.type === "frame" && typeof message.data === "string") frame = Buffer.from(message.data, "base64")
        } catch {}
      }
      socket.onerror = () => stop(new Error("Could not connect to the visible browser stream."))
      socket.onclose = () => {
        if (!finishing) stop(new Error("Browser disconnected; the incomplete recording was removed."))
      }
      draw = setInterval(() => {
        if (!frame || !writeable || finishing) return
        writeable = child.stdin.write(frame)
        frames++
      }, 100)
      deadline = setTimeout(() => stop(), MAX_SECONDS * 1000)
      const firstFrame = Date.now() + 8_000
      while (!frame && !finishing && Date.now() < firstFrame) await Bun.sleep(50)
      if (!frame || finishing) {
        stop(new Error("The browser stream did not provide a frame; open the Browser panel to check its connection."))
        const result = await done
        throw result instanceof Error ? result : new Error("Browser recording stopped during startup.")
      }
      return `Recording the shared visible browser. Call browser_recording_stop for the saved WebM. Recording stops automatically after ${MAX_SECONDS} seconds or about 50 MB. Browser video only; no audio.`
    },
    async stop() {
      const current = active
      current?.stop()
      const result = current ? await current.done : last
      if (result instanceof Error) throw result
      if (!result) throw new Error("No browser recording has been started.")
      return {
        content: [
          {
            type: "text",
            text: `Browser recording saved on the CowCode server: ${result.path}\n${result.bytes} bytes; ${Math.round(result.durationMs / 1000)} seconds. Use this exact file as the video artifact.`,
          },
          {
            type: "resource_link",
            uri: pathToFileURL(result.path).href,
            name: "Browser recording",
            mimeType: "video/webm",
            size: result.bytes,
          },
        ],
      }
    },
  }
}

export const recordingTools = [
  {
    name: "browser_recording_start",
    description:
      "Start a video of only the browser currently visible in CowCode. Follows the shared tab, with no audio. Requires the managed browser bridge and ffmpeg. Stops after five minutes or about 50 MB. Call browser_recording_stop to receive the saved WebM file.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "browser_recording_stop",
    description:
      "Stop the explicit browser recording, finalize its WebM and return the exact video file path on the CowCode server. Also retrieves the artifact after its automatic time or size limit. Always available during human takeover so recording can be stopped.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
]
