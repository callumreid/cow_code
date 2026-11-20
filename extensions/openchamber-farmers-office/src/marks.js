export function publishMarks(desk, host) {
  const published = new Map((desk.state.marked || []).map((id) => [id, "restore"]))
  let working = false,
    retryAfter = 0
  const timer = setInterval(async () => {
    if (working || Date.now() < retryAfter) return
    const desired = new Map()
    for (const item of desk.attention()) if (!desired.has(item.sessionId)) desired.set(item.sessionId, item.kind)
    const id = [...new Set([...published.keys(), ...desired.keys()])].find(
      (id) => desired.get(id) !== published.get(id),
    )
    if (!id) return
    working = true
    const kind = desired.get(id)
    const mark = kind
      ? {
          icon: "flag-line",
          tone: kind === "milestone" ? "success" : "warning",
          text: kind === "milestone" ? "Outcome in Farmer’s Office" : "Needs attention in Farmer’s Office",
        }
      : null
    try {
      await host.setMark({ sessionId: id }, mark)
      if (kind) published.set(id, kind)
      else published.delete(id)
      desk.state.marked = [...published.keys()]
      desk.save()
    } catch {
      retryAfter = Date.now() + 15000
    } finally {
      working = false
    }
  }, 1400)
  timer.unref()
}
