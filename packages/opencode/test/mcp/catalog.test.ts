import { describe, expect, test } from "bun:test"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { McpCatalog } from "@/mcp/catalog"
import { Effect } from "effect"

const options = { toolCallId: "call_mcp", abortSignal: new AbortController().signal } as any

function clientReturning(result: unknown) {
  return {
    callTool: async () => result,
  } as unknown as Client
}

function mcpTool() {
  return {
    name: "screenshot",
    description: "Take a screenshot",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  } as any
}

describe("McpCatalog session metadata", () => {
  test("a tool call to a local server carries the session and thread; arguments are untouched", async () => {
    const seen: any[] = []
    const client = {
      callTool: async (params: unknown) => {
        seen.push(params)
        return { content: [{ type: "text", text: "ok" }] }
      },
    } as unknown as Client
    const meta = { "cowcode/sessionID": "ses_child", "cowcode/threadID": "ses_root" }
    await McpCatalog.convertTool(mcpTool(), client, undefined, meta).execute!({ url: "https://example.com" }, options)
    await McpCatalog.convertTool(mcpTool(), client).execute!({}, options)
    expect(seen[0]).toEqual({ name: "screenshot", arguments: { url: "https://example.com" }, _meta: meta })
    // Without metadata the request is exactly what it was before.
    expect(seen[1]).toEqual({ name: "screenshot", arguments: {} })
  })

  test("only servers started as local processes receive it", () => {
    const local = { transport: new StdioClientTransport({ command: "true" }) } as unknown as Client
    const remote = { transport: {} } as unknown as Client
    expect(McpCatalog.sessionMeta(local, { sessionID: "ses_a", threadID: "ses_root" })).toEqual({
      "cowcode/sessionID": "ses_a",
      "cowcode/threadID": "ses_root",
    })
    expect(McpCatalog.sessionMeta(local, { sessionID: "ses_a" })?.["cowcode/threadID"]).toBe("ses_a")
    expect(McpCatalog.sessionMeta(remote, { sessionID: "ses_a" })).toBeUndefined()
  })

  test("the metadata reaches a real server next to the progress token", async () => {
    const server = new Server({ name: "meta", version: "1" }, { capabilities: { tools: {} } })
    let received: unknown
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      received = request.params._meta
      return { content: [{ type: "text", text: "ok" }] }
    })
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: "test", version: "1" })
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
    const meta = { "cowcode/sessionID": "ses_a", "cowcode/threadID": "ses_a" }
    await McpCatalog.convertTool(mcpTool(), client, undefined, meta).execute!({}, options)
    expect(received).toMatchObject(meta)
    expect((received as { progressToken?: unknown }).progressToken).toBeDefined()
    await client.close()
  })
})

describe("McpCatalog.convertTool", () => {
  test("preserves content when structuredContent is also present", async () => {
    const content = [{ type: "image" as const, mimeType: "image/png", data: "AAAA" }]
    const structuredContent = { image: { mimeType: "image/png", data: "AAAA" } }
    const converted = McpCatalog.convertTool(mcpTool(), clientReturning({ content, structuredContent }))

    const output = await converted.execute?.({}, options)

    expect(output).toMatchObject({ content, structuredContent })
  })

  test("falls back to structuredContent only when content is absent", async () => {
    const structuredContent = { results: [{ title: "one" }] }
    const converted = McpCatalog.convertTool(mcpTool(), clientReturning({ content: [], structuredContent }))

    const output = await converted.execute?.({}, options)

    expect(output).toMatchObject({
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(structuredContent) }],
    })
  })
})

test("preserves output schema validation across paginated tool discovery", async () => {
  const server = new Server({ name: "pagination", version: "1.0.0" }, { capabilities: { tools: {} } })
  server.setRequestHandler(ListToolsRequestSchema, ({ params }) =>
    Promise.resolve(
      params?.cursor === "page-2"
        ? {
            tools: [
              {
                name: "second",
                inputSchema: { type: "object" },
                outputSchema: {
                  type: "object",
                  properties: { value: { type: "number" } },
                  required: ["value"],
                },
              },
            ],
          }
        : {
            tools: [
              {
                name: "first",
                inputSchema: { type: "object" },
                outputSchema: {
                  type: "object",
                  properties: { value: { type: "string" } },
                  required: ["value"],
                },
              },
            ],
            nextCursor: "page-2",
          },
    ),
  )
  server.setRequestHandler(CallToolRequestSchema, ({ params }) =>
    Promise.resolve({
      content: [],
      structuredContent: { value: params.name === "first" ? 42 : 1 },
    }),
  )

  const client = new Client({ name: "pagination-test", version: "1.0.0" })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)])

  try {
    const tools = await Effect.runPromise(McpCatalog.defs(client))
    expect(tools?.map((tool) => tool.name)).toEqual(["first", "second"])
    await expect(client.callTool({ name: "first", arguments: {} })).rejects.toThrow(
      "Structured content does not match the tool's output schema",
    )
  } finally {
    await Promise.all([client.close(), server.close()])
  }
})
