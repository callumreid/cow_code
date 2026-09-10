// Only committed audio items from the current connection can admit user input.
// Transcription completion may be out of order; commit order is authoritative.
export function createVoiceAdmission() {
  let generation = 0
  let active = false
  const items = new Map<string, { text?: string; failed?: boolean }>()
  const consumed = new Set<string>()
  return {
    begin() {
      generation += 1
      active = true
      items.clear()
      consumed.clear()
      return generation
    },
    stop() {
      generation += 1
      active = false
      items.clear()
      consumed.clear()
    },
    generation: () => generation,
    current: (value: number) => active && generation === value,
    commit(id: string) {
      if (active && !items.has(id) && !consumed.has(id)) items.set(id, {})
    },
    complete(id: string, text: string, failed = false) {
      const item = items.get(id)
      if (!active || !item) return []
      item.text = text.trim()
      item.failed = failed
      const ready: { id: string; text: string; generation: number }[] = []
      for (const [key, value] of items) {
        if (value.text === undefined && !value.failed) break
        items.delete(key)
        consumed.add(key)
        if (value.text && !value.failed) ready.push({ id: key, text: value.text, generation })
      }
      return ready
    },
  }
}
