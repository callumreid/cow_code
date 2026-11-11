import { describe, expect, test } from "bun:test"
import { attachDecision, createThreadTabs } from "./threads"
import { agentPath, closesBrowser, wipesProfile } from "./cdp"

function setup() {
  let clock = 1_000
  const changes: string[] = []
  const threads = createThreadTabs({ now: () => clock, changed: (thread) => changes.push(thread) })
  return { threads, changes, tick: (ms: number) => (clock += ms) }
}

describe("thread tab registry", () => {
  test("each session owns the tabs it opened and nobody else's", () => {
    const { threads } = setup()
    threads.touch("ses_a", "ses_a")
    threads.touch("ses_b", "ses_b")
    expect(threads.own("ses_a", "tab-1")).toBe(true)
    expect(threads.own("ses_b", "tab-2")).toBe(true)
    // The first owner keeps a tab: another session cannot claim it.
    expect(threads.own("ses_b", "tab-1")).toBe(false)
    expect(threads.owner("tab-1")).toBe("ses_a")
    expect(threads.owner("tab-2")).toBe("ses_b")
    expect(threads.owner("callums-own-tab")).toBeUndefined()
    expect(threads.tabs("ses_a")).toEqual(["tab-1"])
    expect(threads.tabs("ses_b")).toEqual(["tab-2"])
  })

  test("a thread with no tab has no current tab", () => {
    const { threads } = setup()
    threads.touch("ses_a", "ses_a")
    expect(threads.current("ses_a")).toBeUndefined()
    expect(threads.current("never-seen")).toBeUndefined()
  })

  test("viewers follow the tab a thread used last, and only hear about real changes", () => {
    const { threads, changes, tick } = setup()
    threads.own("ses_a", "tab-1", "ses_a")
    tick(10)
    threads.own("ses_a", "tab-2", "ses_a")
    expect(threads.current("ses_a")?.target).toBe("tab-2")
    changes.length = 0
    threads.act("tab-2")
    threads.act("tab-2")
    expect(changes).toEqual([])
    threads.act("tab-1")
    expect(changes).toEqual(["ses_a"])
    expect(threads.current("ses_a")?.target).toBe("tab-1")
    // Another thread's activity never moves this thread's viewers.
    threads.own("ses_b", "tab-9", "ses_b")
    threads.act("tab-9")
    expect(changes.filter((thread) => thread === "ses_a")).toHaveLength(1)
    expect(threads.current("ses_a")?.target).toBe("tab-1")
  })

  test("a subagent session has its own tab, shown under its root thread", () => {
    const { threads, tick } = setup()
    threads.own("ses_root", "tab-root", "ses_root")
    tick(10)
    threads.own("ses_child", "tab-child", "ses_root")
    expect(threads.owner("tab-child")).toBe("ses_child")
    expect(threads.thread("ses_child")).toBe("ses_root")
    expect(threads.tabs("ses_root")).toEqual(["tab-root", "tab-child"])
    expect(threads.current("ses_root")).toEqual({ session: "ses_child", target: "tab-child" })
    tick(10)
    threads.act("tab-root")
    expect(threads.current("ses_root")).toEqual({ session: "ses_root", target: "tab-root" })
  })

  test("a tab opened before the server named the session's thread moves to that thread", () => {
    const { threads, changes } = setup()
    threads.own("ses_child", "tab-1")
    expect(threads.current("ses_child")?.target).toBe("tab-1")
    threads.touch("ses_child", "ses_root")
    expect(threads.current("ses_root")?.target).toBe("tab-1")
    expect(threads.current("ses_child")).toBeUndefined()
    expect(changes.slice(-2)).toEqual(["ses_child", "ses_root"])
    // A call that does not name a thread never moves it back.
    threads.touch("ses_child")
    expect(threads.thread("ses_child")).toBe("ses_root")
  })

  test("closing, pruning and removing only touch recorded tabs", () => {
    const { threads, tick } = setup()
    threads.own("ses_a", "tab-1", "ses_a")
    threads.own("ses_a", "tab-2", "ses_a")
    threads.own("ses_b", "tab-3", "ses_b")
    threads.drop("tab-2")
    expect(threads.current("ses_a")?.target).toBe("tab-1")
    threads.prune(new Set(["tab-3", "unowned"]))
    expect(threads.tabs("ses_a")).toEqual([])
    expect(threads.current("ses_a")).toBeUndefined()
    expect(threads.tabs("ses_b")).toEqual(["tab-3"])
    tick(60_000)
    threads.touch("ses_a")
    expect(threads.idle(30_000).map((entry) => entry.session)).toEqual(["ses_b"])
    expect(threads.remove("ses_b")).toEqual(["tab-3"])
    expect(threads.owner("tab-3")).toBeUndefined()
    expect(threads.remove("ses_b")).toEqual([])
  })

  test("ownership survives a bridge restart", () => {
    const { threads } = setup()
    threads.own("ses_a", "tab-1", "ses_root")
    threads.own("ses_a", "tab-2", "ses_root")
    threads.act("tab-1")
    const restored = createThreadTabs()
    restored.load(JSON.parse(JSON.stringify(threads.snapshot())))
    expect(restored.owner("tab-1")).toBe("ses_a")
    expect(restored.thread("ses_a")).toBe("ses_root")
    expect(restored.current("ses_root")?.target).toBe("tab-1")
    restored.load({ sessions: [{ session: "../bad", thread: "x", tabs: ["t"], active: 1 }] })
    expect(restored.owner("t")).toBeUndefined()
  })
})

describe("what a session's connection does with a newly announced page", () => {
  const base = { session: "ses_a", owner: undefined, openerOwner: undefined, creating: false }
  test("its own tab is shown, another thread's is hidden", () => {
    expect(attachDecision({ ...base, owner: "ses_a" })).toBe("show")
    expect(attachDecision({ ...base, owner: "ses_b" })).toBe("hide")
    expect(attachDecision({ ...base, owner: "ses_b", creating: true })).toBe("hide")
  })
  test("a popup follows the session whose page opened it", () => {
    expect(attachDecision({ ...base, openerOwner: "ses_a" })).toBe("adopt")
    expect(attachDecision({ ...base, openerOwner: "ses_b" })).toBe("hide")
  })
  test("an unowned tab is hidden unless a creation is still in flight", () => {
    expect(attachDecision(base)).toBe("hide")
    expect(attachDecision({ ...base, creating: true })).toBe("wait")
  })
})

describe("bridge paths and refusals", () => {
  test("the session is read from the connection path", () => {
    expect(agentPath("/cowcode/thread/ses_abc/json/version")).toEqual({
      session: "ses_abc",
      prefix: "/cowcode/thread/ses_abc",
      path: "/json/version",
    })
    expect(agentPath("/cowcode/thread/ses_abc/devtools/browser/x-1").path).toBe("/devtools/browser/x-1")
    expect(agentPath("/json/version")).toEqual({ session: undefined, prefix: "", path: "/json/version" })
    expect(agentPath("/cowcode/thread/has space/json").session).toBeUndefined()
  })
  test("shared-profile wipes and browser shutdown stay refused", () => {
    for (const method of ["Storage.clearCookies", "Network.clearBrowserCookies", "Storage.clearDataForOrigin"])
      expect(wipesProfile(method)).toBe(true)
    expect(wipesProfile("Network.deleteCookies")).toBe(false)
    expect(closesBrowser("Browser.close")).toBe(true)
    expect(closesBrowser("Browser.getVersion")).toBe(false)
  })
})
