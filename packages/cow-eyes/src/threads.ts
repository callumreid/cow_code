// Which browser tabs belong to which CowCode session. One Chrome profile is shared so sign-ins are
// shared; tabs are not. A session only ever sees and drives tabs recorded here as its own.

export type ThreadEntry = {
  /** The session whose agent drives these tabs. A subagent session has its own entry. */
  session: string
  /** The root session the app shows as a thread; the Browser panel asks for this. */
  thread: string
  /** Tabs opened by this session or by its pages, oldest first. */
  tabs: string[]
  /** The tab this session acted on last. */
  front?: string
  /** When the session last used the browser. */
  active: number
}

export type ThreadSnapshot = { sessions: ThreadEntry[] }

export const SHARED_SESSION = "shared"
export const validSession = (value: unknown): value is string =>
  typeof value === "string" && /^[\w.-]{1,128}$/.test(value)

export function createThreadTabs(input: { now?: () => number; changed?: (thread: string) => void } = {}) {
  const now = input.now ?? Date.now
  const sessions = new Map<string, ThreadEntry>()
  const owners = new Map<string, string>()
  const changed = (thread: string) => input.changed?.(thread)

  function touch(session: string, thread?: string) {
    const existing = sessions.get(session)
    if (existing) {
      existing.active = now()
      // The server names the root on every call; a tab opened before it did moves to that thread.
      if (thread && existing.thread !== thread) {
        const previous = existing.thread
        existing.thread = thread
        changed(previous)
        changed(thread)
      }
      return existing
    }
    const entry: ThreadEntry = { session, thread: thread ?? session, tabs: [], active: now() }
    sessions.set(session, entry)
    return entry
  }

  /** Record a tab the session opened. The first owner keeps it. */
  function own(session: string, target: string, thread?: string) {
    const current = owners.get(target)
    if (current) return current === session
    const entry = touch(session, thread)
    owners.set(target, session)
    entry.tabs.push(target)
    entry.front = target
    changed(entry.thread)
    return true
  }

  /** The session (or a person picking it) used this tab: the thread's viewers follow it. */
  function act(target: string) {
    const entry = sessions.get(owners.get(target) ?? "")
    if (!entry) return
    const before = current(entry.thread)?.target
    entry.active = now()
    entry.front = target
    // Called for every input event, so only a change of the thread's visible tab notifies viewers.
    if (current(entry.thread)?.target !== before) changed(entry.thread)
  }

  function drop(target: string) {
    const session = owners.get(target)
    if (!session) return
    owners.delete(target)
    const entry = sessions.get(session)
    if (!entry) return
    entry.tabs = entry.tabs.filter((item) => item !== target)
    if (entry.front === target) entry.front = entry.tabs.at(-1)
    changed(entry.thread)
  }

  /** Forget a session and return the tabs it owned, for the caller to close. */
  function remove(session: string) {
    const entry = sessions.get(session)
    if (!entry) return []
    sessions.delete(session)
    for (const target of entry.tabs) owners.delete(target)
    changed(entry.thread)
    return entry.tabs
  }

  const inThread = (thread: string) => [...sessions.values()].filter((entry) => entry.thread === thread)

  /** The tab a thread's viewers show: the front tab of its most recently active session. */
  function current(thread: string) {
    const entry = inThread(thread)
      .filter((item) => item.tabs.length)
      .sort((a, b) => b.active - a.active)[0]
    if (!entry) return
    return { session: entry.session, target: entry.front ?? entry.tabs.at(-1)! }
  }

  return {
    touch,
    own,
    act,
    drop,
    remove,
    current,
    owner: (target: string) => owners.get(target),
    get: (session: string) => sessions.get(session),
    thread: (session: string) => sessions.get(session)?.thread ?? session,
    tabs: (thread: string) => inThread(thread).flatMap((entry) => entry.tabs),
    list: () => [...sessions.values()],
    /** Sessions that have not used the browser for `ms`. */
    idle: (ms: number) => [...sessions.values()].filter((entry) => now() - entry.active >= ms),
    /** Drop tabs Chrome no longer has (closed by a person, a page, or a Chrome restart). */
    prune(live: Set<string>) {
      for (const target of [...owners.keys()]) if (!live.has(target)) drop(target)
    },
    snapshot: (): ThreadSnapshot => ({ sessions: [...sessions.values()].map((entry) => ({ ...entry })) }),
    load(snapshot: ThreadSnapshot | undefined) {
      for (const item of snapshot?.sessions ?? []) {
        if (!validSession(item?.session) || !validSession(item.thread) || !Array.isArray(item.tabs)) continue
        const entry = touch(item.session, item.thread)
        entry.active = typeof item.active === "number" ? item.active : now()
        for (const target of item.tabs) {
          if (typeof target !== "string" || owners.has(target)) continue
          owners.set(target, item.session)
          entry.tabs.push(target)
        }
        entry.front = entry.tabs.includes(item.front ?? "") ? item.front : entry.tabs.at(-1)
      }
    },
  }
}

export type ThreadTabs = ReturnType<typeof createThreadTabs>

/**
 * What a session's CDP connection does with a page Chrome just attached it to.
 * Chrome announces every new page to every connection, so this is the tab boundary.
 */
export function attachDecision(input: {
  session: string
  owner: string | undefined
  openerOwner: string | undefined
  creating: boolean
}): "show" | "adopt" | "hide" | "wait" {
  if (input.owner) return input.owner === input.session ? "show" : "hide"
  // A popup or target=_blank tab belongs to the session whose page opened it.
  if (input.openerOwner) return input.openerOwner === input.session ? "adopt" : "hide"
  // The page is announced before Chrome answers the request that created it, so while any
  // creation is in flight its owner is not known yet.
  return input.creating ? "wait" : "hide"
}
