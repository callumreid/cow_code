import { trim } from "./desk.js"

export const asksToAct = (text) =>
  /^(?:(?:hey )?farmer[, ]+)?(?:(?:could|can|would) you |please |i(?:’d| would) like (?:you )?to |i want (?:you )?to )*(?:start|create|open|spin up|launch|dispatch|steer|assign|tell|instruct|send|stop|pause|cancel|redirect|follow up with|ask (?:the|that|my))\b/i.test(
    text,
  )
const unquote = (value) => value.trim().replace(/^[‘“"']|[’”"']$/g, "")
export async function namedCommand(text, ctx, inventory, propose) {
  const cleaned = text.replace(/^(?:(?:hey )?farmer[, ]+)?(?:(?:could|can|would) you |please )?/i, "").trim()
  const splitSteer =
    /^steer\s+(?:the\s+)?(.+?)(?:\s+(?:thread|agent))?[.:,]\s*(?:ask|tell|instruct)\s+it\s+to\s+([\s\S]+)$/i.exec(
      cleaned,
    )
  const steer = splitSteer
    ? [splitSteer[0], splitSteer[1], null, splitSteer[2].replace(/\s*Prepare that instruction now[.!]?$/i, "")]
    : /^(?:tell|ask|instruct|steer)\s+(?:(?:the )?(?:thread|agent)(?: (?:named|called))?\s+)?(?:["“]([^"”]+)["”]|(.+?))\s+(?:to\s+|with\s+)([\s\S]+)$/i.exec(
        cleaned,
      )
  const stop = /^(?:stop|pause)\s+(?:(?:the )?(?:thread|agent)(?: (?:named|called))?\s+)?(.+?)[.!?]?$/i.exec(
    cleaned,
  )
  const goal =
    /^(?:start|create|launch|dispatch|spin up)\s+(?:(?:a|an|new)\s+)*(?:thread|agent|session)(?:\s+in\s+(.+?))?\s+to\s+([\s\S]+)$/i.exec(
      cleaned,
    )
  if (goal) {
    const name = unquote(goal[1] || "").toLowerCase()
    const matches = name
      ? (ctx.projects || []).filter((p) => p.toLowerCase() === name || p.split("/").pop().toLowerCase() === name)
      : [ctx.directory].filter(Boolean)
    if (matches.length !== 1) return "Which registered project should this new thread use?"
    return (await propose({ kind: "dispatch", directory: matches[0], title: trim(goal[2], 80), text: goal[2] }))
      .proposal.label
  }
  const dispatch =
    /^(?:start|create|launch|dispatch|spin up)\s+(?:a |an |new |a new )*(?:thread|agent|session)\s+(?:(?:named|called|titled)\s+)?(?:["“]([^"”]+)["”]|([^:\n]{1,95}?))\s*(?::|,\s*(?:to|with)|\s+to)\s*([\s\S]+)$/i.exec(
      cleaned,
    )
  if (dispatch && ctx.directory)
    return (
      await propose({
        kind: "dispatch",
        title: unquote(dispatch[1] || dispatch[2]),
        text: dispatch[3],
        directory: ctx.directory,
      })
    ).proposal.label
  if (!steer && !stop) return
  const target = unquote(steer ? steer[1] || steer[2] : stop[1])
  const { rows } = await inventory.list(trim(target, 160))
  const exact = rows.filter((r) => r.title.toLowerCase() === target.toLowerCase())
  const matches = exact.length ? exact : rows
  if (matches.length !== 1)
    return matches.length
      ? "Which thread did you mean? " +
          matches
            .slice(0, 4)
            .map((r) => r.title + " (" + r.directory + ")")
            .join(" · ")
      : "I couldn’t find a thread titled “" + target + "”. What name appears in All work?"
  return (await propose({ kind: steer ? "steer" : "stop", id: matches[0].id, text: steer?.[3] })).proposal.label
}
