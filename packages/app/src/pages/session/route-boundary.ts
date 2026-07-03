import { ErrorBoundary, createComponent, createEffect, on } from "solid-js"
import type { JSX } from "solid-js"

// Error scope for the target session route. All session tabs on a server share
// one route instance, so this must NOT key or remount per session: the subtree
// holds workspace-scoped state (notably TerminalProvider and its PTY WebSockets)
// that has to survive switching tabs within the same workspace.
export function SessionRouteErrorBoundary(props: {
  sessionID: string
  fallback: (error: unknown) => JSX.Element
  children: JSX.Element
}) {
  return createComponent(ErrorBoundary, {
    fallback: (error: unknown, reset: () => void) => {
      // Clear stale session errors (for example, not found) on tab switch
      // without remounting workspace-scoped providers below the boundary.
      createEffect(on(() => props.sessionID, reset, { defer: true }))
      return props.fallback(error)
    },
    get children() {
      return props.children
    },
  })
}
