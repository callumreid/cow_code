import { EventEmitter } from "events"
import { Identifier } from "@/id/id"

export type GlobalEvent = {
  directory?: string
  project?: string
  workspace?: string
  payload: any
}

class GlobalBusEmitter extends EventEmitter<{
  event: [GlobalEvent]
}> {
  // Number of attached consumers that want durable events mirrored as "sync"
  // payloads (workspace-sync SSE clients). First-party UIs (desktop app, TUI)
  // discard sync payloads, so when this is zero the event bridge skips
  // building and emitting them entirely.
  #syncSubscribers = 0

  retainSyncSubscriber() {
    this.#syncSubscribers += 1
    let released = false
    return () => {
      if (released) return
      released = true
      this.#syncSubscribers -= 1
    }
  }

  get syncSubscribers() {
    return this.#syncSubscribers
  }

  override emit(eventName: "event", event: GlobalEvent): boolean {
    if (event.payload && typeof event.payload === "object" && !("id" in event.payload)) {
      event.payload.id = event.payload.syncEvent?.id ?? Identifier.create("evt", "ascending")
    }
    return super.emit(eventName, event)
  }
}

export const GlobalBus = new GlobalBusEmitter()
