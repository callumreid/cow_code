import { describe, expect, test } from "bun:test"
import type { SessionNotFoundError } from "@opencode-ai/sdk/v2/client"
import type { ConfigInvalidError, ProviderModelNotFoundError } from "./server-errors"
import {
  formatServerError,
  isSessionNotFoundError,
  isTransportError,
  parseReadableConfigInvalidError,
} from "./server-errors"
import { ClientError } from "@opencode-ai/client"

function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => {
    const value = vars[key]
    if (value === undefined) return ""
    return String(value)
  })
}

function useLanguageMock() {
  const dict: Record<string, string> = {
    "error.chain.unknown": "Erro desconhecido",
    "error.chain.configInvalid": "Arquivo de config em {{path}} invalido",
    "error.chain.configInvalidWithMessage": "Arquivo de config em {{path}} invalido: {{message}}",
    "error.chain.modelNotFound": "Modelo nao encontrado: {{provider}}/{{model}}",
    "error.chain.didYouMean": "Voce quis dizer: {{suggestions}}",
    "error.chain.checkConfig": "Revise provider/model no config",
  }
  return {
    t(key: string, vars?: Record<string, string | number>) {
      const text = dict[key]
      if (!text) return key
      return fill(text, vars)
    },
  }
}

const language = useLanguageMock()

describe("parseReadableConfigInvalidError", () => {
  test("formats issues with file path", () => {
    const error = {
      name: "ConfigInvalidError",
      data: {
        path: "opencode.config.ts",
        issues: [
          { path: ["settings", "host"], message: "Required" },
          { path: ["mode"], message: "Invalid" },
        ],
      },
    } satisfies ConfigInvalidError

    const result = parseReadableConfigInvalidError(error, language.t)

    expect(result).toBe(
      ["Arquivo de config em opencode.config.ts invalido: settings.host: Required", "mode: Invalid"].join("\n"),
    )
  })

  test("uses trimmed message when issues are missing", () => {
    const error = {
      name: "ConfigInvalidError",
      data: {
        path: "config",
        message: "  Bad value  ",
      },
    } satisfies ConfigInvalidError

    const result = parseReadableConfigInvalidError(error, language.t)

    expect(result).toBe("Arquivo de config em config invalido: Bad value")
  })
})

describe("formatServerError", () => {
  test("formats config invalid errors", () => {
    const error = {
      name: "ConfigInvalidError",
      data: {
        message: "Missing host",
      },
    } satisfies ConfigInvalidError

    const result = formatServerError(error, language.t)

    expect(result).toBe("Arquivo de config em config invalido: Missing host")
  })

  test("returns error messages", () => {
    expect(formatServerError(new Error("Request failed with status 503"), language.t)).toBe(
      "Request failed with status 503",
    )
  })

  test("returns provided string errors", () => {
    expect(formatServerError("Failed to connect to server", language.t)).toBe("Failed to connect to server")
  })

  test("uses translated unknown fallback", () => {
    expect(formatServerError(0, language.t)).toBe("Erro desconhecido")
  })

  test("falls back for unknown error objects and names", () => {
    expect(formatServerError({ name: "ServerTimeoutError", data: { seconds: 30 } }, language.t)).toBe(
      "Erro desconhecido",
    )
  })

  test("formats provider model errors using provider/model", () => {
    const error = {
      name: "ProviderModelNotFoundError",
      data: {
        providerID: "openai",
        modelID: "gpt-4.1",
      },
    } satisfies ProviderModelNotFoundError

    expect(formatServerError(error, language.t)).toBe(
      ["Modelo nao encontrado: openai/gpt-4.1", "Revise provider/model no config"].join("\n"),
    )
  })

  test("formats provider model suggestions", () => {
    const error = {
      name: "ProviderModelNotFoundError",
      data: {
        providerID: "x",
        modelID: "y",
        suggestions: ["x/y2", "x/y3"],
      },
    } satisfies ProviderModelNotFoundError

    expect(formatServerError(error, language.t)).toBe(
      ["Modelo nao encontrado: x/y", "Voce quis dizer: x/y2, x/y3", "Revise provider/model no config"].join("\n"),
    )
  })

  test("unwraps SDK-wrapped errors from cause.body", () => {
    const body = {
      name: "ConfigInvalidError",
      data: {
        message: "Missing host",
      },
    } satisfies ConfigInvalidError

    const wrapped = new Error("ConfigInvalidError", { cause: { body, status: 400 } })

    expect(formatServerError(wrapped, language.t)).toBe("Arquivo de config em config invalido: Missing host")
  })
})

describe("isSessionNotFoundError", () => {
  test("matches an SDK-wrapped error for the requested session", () => {
    const body = {
      _tag: "SessionNotFoundError",
      sessionID: "ses_missing",
      message: "Session not found",
    } satisfies SessionNotFoundError

    expect(isSessionNotFoundError(new Error(body.message, { cause: { body, status: 404 } }), body.sessionID)).toBe(true)
  })

  test("rejects errors for other sessions and other 404 responses", () => {
    const body = {
      _tag: "SessionNotFoundError",
      sessionID: "ses_parent",
      message: "Session not found",
    } satisfies SessionNotFoundError

    expect(isSessionNotFoundError(new Error(body.message, { cause: { body, status: 404 } }), "ses_tab")).toBe(false)
    expect(
      isSessionNotFoundError(
        new Error("Provider not found", {
          cause: { body: { _tag: "ProviderNotFoundError", providerID: "missing" }, status: 404 },
        }),
        "ses_tab",
      ),
    ).toBe(false)
  })
})

describe("isTransportError", () => {
  test("recognizes the fetch failures browsers and node raise when the server is unreachable", () => {
    expect(isTransportError(new TypeError("Failed to fetch"))).toBe(true)
    expect(isTransportError(new TypeError("Load failed"))).toBe(true)
    expect(isTransportError(new TypeError("NetworkError when attempting to fetch resource."))).toBe(true)
    expect(isTransportError(new ClientError("Transport", { cause: new TypeError("Failed to fetch") }))).toBe(true)
  })

  test("follows the cause chain to a socket error", () => {
    const socket = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:4096"), { code: "ECONNREFUSED" })
    expect(isTransportError(new TypeError("fetch failed", { cause: socket }))).toBe(true)
    expect(isTransportError(new Error("wrapped", { cause: { code: "UND_ERR_SOCKET" } }))).toBe(true)
  })

  test("leaves server answers, aborts, and ordinary bugs alone", () => {
    expect(isTransportError(new ClientError("UnexpectedStatus"))).toBe(false)
    expect(isTransportError(new Error("Session not found: ses_1"))).toBe(false)
    expect(isTransportError(new TypeError("Cannot read properties of undefined (reading 'id')"))).toBe(false)
    expect(isTransportError(new DOMException("Aborted", "AbortError"))).toBe(false)
    expect(isTransportError({ name: "ConfigInvalidError", data: { path: "opencode.json" } })).toBe(false)
    expect(isTransportError(undefined)).toBe(false)
    expect(isTransportError("boom")).toBe(false)
  })
})
