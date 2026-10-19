// A separate process exercises real stdio framing and bidirectional requests.
const send = (value: unknown) => process.stdout.write(JSON.stringify(value) + "\n")
const mode = process.argv[2]
let buffer = ""
const decoder = new TextDecoder()
const reader = Bun.stdin.stream().getReader()
while (true) {
  const chunk = await reader.read()
  if (chunk.done) break
  buffer += decoder.decode(chunk.value, { stream: true })
  let end: number
  while ((end = buffer.indexOf("\n")) !== -1) {
    const frame = JSON.parse(buffer.slice(0, end))
    buffer = buffer.slice(end + 1)
    if (frame.method === "initialize") {
      process.stdout.write('{"id":')
      await Bun.sleep(5)
      process.stdout.write(frame.id + ',"result":{"userAgent":"fixture"}}\n')
      continue
    }
    if (frame.method === "initialized") continue
    if (frame.method === "thread/start") {
      send({ id: frame.id, result: { thread: { id: "test-thread" }, model: "fixture" } })
      continue
    }
    if (frame.method === "turn/start") {
      send({ method: "item/agentMessage/delta", params: { delta: "hello" } })
      send({ method: "turn/completed", params: { turn: { id: "test-turn", status: "completed" } } })
      send({ id: frame.id, result: { turn: { id: "test-turn", status: "completed" } } })
      continue
    }
    if (frame.method === "approval-test") {
      send({ id: "server-approval", method: "item/commandExecution/requestApproval", params: { command: "test" } })
      continue
    }
    if (frame.id === "server-approval") {
      send({ method: "approval-decision", params: frame.result })
      continue
    }
    if (frame.method === "unsupported-test") {
      send({ id: "unsupported", method: "item/tool/requestUserInput", params: {} })
      continue
    }
    if (frame.id === "unsupported") {
      send({ method: "unsupported-response", params: frame.error })
      continue
    }
    if (frame.method === "exit-test") process.exit(7)
    if (frame.method === "pending-test") continue
    if (mode === "malformed") process.stdout.write("not JSON\n")
    else send({ id: frame.id, result: frame.params })
  }
}
