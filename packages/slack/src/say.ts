// `cow-slack say <channel> <thread_ts>` posts stdin to a Slack thread as the cowcode bot. It exists
// so a work session never reaches for Callum's own Slack token to give an update: the bot token
// stays with this binary, and it only posts in threads where Callum mentioned cowcode.
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { slackify } from "./work"

function botToken() {
  if (process.env.COW_SLACK_BOT_TOKEN) return process.env.COW_SLACK_BOT_TOKEN
  const file = process.env.COW_SLACK_TOKENS_FILE ?? join(homedir(), ".config/cow/slack-tokens.env")
  try {
    const line = readFileSync(file, "utf8").match(/^(?:export\s+)?COW_SLACK_BOT_TOKEN=(.*)$/m)?.[1]
    return line?.trim().replace(/^["']|["']$/g, "")
  } catch {
    return undefined
  }
}

export async function say(args: string[], input: string): Promise<number> {
  const [channel, thread] = args
  const text = input.trim()
  if (!channel || !thread || !text) {
    console.error("usage: cow-slack say <channel> <thread_ts>   (message text on stdin)")
    return 2
  }
  const stateFile = process.env.COW_SLACK_WORK_STATE ?? join(homedir(), ".coval/state/cow-slack-work.json")
  const known = (() => {
    try {
      return Boolean(
        (JSON.parse(readFileSync(stateFile, "utf8")) as { threads?: Record<string, unknown> }).threads?.[
          `${channel}:${thread}`
        ],
      )
    } catch {
      return false
    }
  })()
  if (!known) {
    console.error(`cow-slack say: ${channel}:${thread} is not a thread where Callum mentioned cowcode; nothing posted`)
    return 2
  }
  const token = botToken()
  if (!token) {
    console.error("cow-slack say: no bot token (COW_SLACK_BOT_TOKEN or ~/.config/cow/slack-tokens.env)")
    return 2
  }
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ channel, thread_ts: thread, text: slackify(text), unfurl_links: false }),
  })
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; ts?: string }
  if (!body.ok) {
    console.error(`cow-slack say: Slack refused the post: ${body.error ?? res.status}`)
    return 1
  }
  console.log(`posted as cowcode (${body.ts})`)
  return 0
}
