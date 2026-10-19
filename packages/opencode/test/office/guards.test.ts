import { expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { SessionProjector } from "@opencode-ai/core/session/projector"
import { NamedError } from "@opencode-ai/core/util/error"
import { Office } from "@/office/office"
import { OfficeLedger } from "@/office/ledger"
import { Session } from "@/session/session"
import { SessionStatus } from "@/session/status"
import { SessionGuard } from "@/session/guard"
import { EventV2Bridge } from "@/event-v2-bridge"
import { InstanceBootstrap } from "@/project/bootstrap"
import { InstanceStore } from "@/project/instance-store"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { pollWithTimeout, testEffect } from "../lib/effect"

const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      Office.node,
      OfficeLedger.node,
      Session.node,
      SessionProjector.node,
      SessionStatus.node,
      EventV2Bridge.node,
      InstanceStore.node,
    ]),
    [
      [RuntimeFlags.node, RuntimeFlags.layer({ experimentalWorkspaces: false })],
      [InstanceBootstrap.node, Layer.mock(InstanceBootstrap.Service)({ run: Effect.void })],
    ],
  ),
)

it.instance("budget and image guards remain visible without creating paid Farmer report work", () =>
  Effect.gen(function* () {
    const sessions = yield* Session.Service
    const events = yield* EventV2Bridge.Service
    const office = yield* Office.Service
    const ledger = yield* OfficeLedger.Service
    for (const message of [SessionGuard.budgetMessage(0, 0), SessionGuard.unsupportedImage]) {
      const session = yield* sessions.create({ title: "Expected user-action guard" })
      yield* events.publish(Session.Event.Error, {
        sessionID: session.id,
        error: new NamedError.Unknown({ message }).toObject(),
      })
      const row = yield* pollWithTimeout(
        office.thread(session.id).pipe(Effect.map((row) => (row?.lifecycle?.reason === message ? row : undefined))),
        "guard did not reach the Office roster",
      )
      expect(row.bucket).toBe("needs_you")
      expect(row.lifecycle?.phase).toBe("waiting")
      expect(row.summary).toBe(message)
      yield* events.publish(SessionStatus.Event.Idle, { sessionID: session.id })
      expect((yield* ledger.list<Office.Report>("report")).filter((row) => row.sessionID === session.id)).toEqual([])
    }

    const session = yield* sessions.create({ title: "Actual provider failure" })
    yield* events.publish(Session.Event.Error, {
      sessionID: session.id,
      error: new NamedError.Unknown({ message: "Provider authentication failed" }).toObject(),
    })
    const report = yield* pollWithTimeout(
      ledger.list<Office.Report>("report").pipe(Effect.map((rows) => rows.find((row) => row.sessionID === session.id))),
      "real failure did not create a Farmer report",
    )
    expect(report.value.kind).toBe("error")
    expect((yield* office.thread(session.id))?.bucket).toBe("failed")
  }),
)

test("guard classification does not hide provider errors or partial message matches", () => {
  expect(SessionGuard.isUserAction({ name: "APIError", data: { message: SessionGuard.unsupportedImage } })).toBe(false)
  expect(
    SessionGuard.isUserAction({ name: "UnknownError", data: { message: SessionGuard.budgetMessage(1, 2) + " extra" } }),
  ).toBe(false)
  expect(
    SessionGuard.isUserAction({ name: "UnknownError", data: { message: "Task budget reached: provider error" } }),
  ).toBe(false)
  expect(
    SessionGuard.isUserAction({ name: "UnknownError", data: { message: SessionGuard.budgetMessage(100, 10) } }),
  ).toBe(true)
})
