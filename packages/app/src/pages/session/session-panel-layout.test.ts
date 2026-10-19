import { describe, expect, test } from "bun:test"
import { browserCandidates, sessionPanelLayout } from "./session-panel-layout"

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
})
