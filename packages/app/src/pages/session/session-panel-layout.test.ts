import { describe, expect, test } from "bun:test"
import { browserCandidates, browserThread, sessionPanelLayout } from "./session-panel-layout"

describe("sessionPanelLayout", () => {
  test("keeps one V2 owner while changing panel geometry", () => {
    expect(sessionPanelLayout({ review: false, terminal: false, files: false })).toEqual({
      visible: false,
      stacked: false,
    })
    expect(sessionPanelLayout({ review: false, terminal: true, files: false })).toEqual({
      visible: true,
      stacked: false,
    })
    expect(sessionPanelLayout({ review: true, terminal: true, files: false })).toEqual({
      visible: true,
      stacked: true,
    })
    expect(sessionPanelLayout({ review: false, browser: true, terminal: false, files: false })).toEqual({
      visible: true,
      stacked: false,
    })
    expect(sessionPanelLayout({ review: false, browser: true, terminal: true, files: false })).toEqual({
      visible: true,
      stacked: true,
    })
  })

  test("builds browser websocket and popout candidates with auth_token", () => {
    const http = browserCandidates({
      url: "http://100.65.225.30:4097",
      username: "cow",
      password: "secret",
    })
    expect(http.ws).toEqual([
      "ws://100.65.225.30:4099/ws?auth_token=Y293OnNlY3JldA%3D%3D",
      "ws://100.65.225.30:4097/computer/ws?auth_token=Y293OnNlY3JldA%3D%3D",
    ])
    expect(http.popout).toBe("http://100.65.225.30:4099/?auth_token=Y293OnNlY3JldA%3D%3D")

    const https = browserCandidates({
      url: "https://cow.trycloudflare.com",
    })
    expect(https.ws).toEqual(["wss://cow.trycloudflare.com/computer/ws"])
    expect(https.popout).toBe("https://cow.trycloudflare.com/computer/")
  })

  test("asks the browser view for the open thread's tab", () => {
    const http = browserCandidates(
      { url: "http://100.65.225.30:4097", username: "cow", password: "secret" },
      "ses_root",
    )
    expect(http.ws).toEqual([
      "ws://100.65.225.30:4099/ws?auth_token=Y293OnNlY3JldA%3D%3D&thread=ses_root",
      "ws://100.65.225.30:4097/computer/ws?auth_token=Y293OnNlY3JldA%3D%3D&thread=ses_root",
    ])
    expect(http.popout).toBe("http://100.65.225.30:4099/?auth_token=Y293OnNlY3JldA%3D%3D&thread=ses_root")
    expect(browserCandidates({ url: "https://cow.trycloudflare.com" }, "ses_root").ws).toEqual([
      "wss://cow.trycloudflare.com/computer/ws?thread=ses_root",
    ])
  })

  test("a subagent session shows its root thread's browser tab", () => {
    const parents: Record<string, string | undefined> = { ses_grand: "ses_child", ses_child: "ses_root" }
    const parentOf = (id: string) => parents[id]
    expect(browserThread("ses_root", parentOf)).toBe("ses_root")
    expect(browserThread("ses_grand", parentOf)).toBe("ses_root")
    expect(browserThread(undefined, parentOf)).toBeUndefined()
    // A parent loop ends instead of spinning.
    expect(browserThread("ses_a", (id) => (id === "ses_a" ? "ses_b" : "ses_a"))).toBe("ses_a")
  })
})
