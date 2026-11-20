export function watchWaiting(host) {
  const subscriptions = new Map()
  host
    .onProjects(async (snapshot) => {
      if (snapshot.state !== "ready") return
      const ids = new Set(snapshot.projects.map((p) => p.id))
      for (const [id, unsubscribe] of subscriptions)
        if (!ids.has(id)) {
          unsubscribe?.()
          subscriptions.delete(id)
        }
      for (const id of ids) {
        if (subscriptions.has(id)) continue
        subscriptions.set(id, null)
        try {
          const unsub = await host.onSessions(id, (s) => {
            if (s.state !== "ready") return
            const directories = s.coverage.filter((c) => c.state === "ready").map((c) => c.directory)
            const waiting = s.sessions
              .filter((r) => !r.archivedAt && r.activity.startsWith("waiting-"))
              .map((r) => ({
                id: r.id,
                title: r.title,
                directory: r.directory,
                activity: r.activity,
                updated: r.updatedAt,
              }))
            host
              .serviceRequest({
                method: "POST",
                path: "/reconcile",
                body: JSON.stringify({ project: id, directories, waiting }),
              })
              .catch(() => {})
          })
          if (subscriptions.has(id)) subscriptions.set(id, unsub)
          else unsub()
        } catch {
          subscriptions.delete(id)
        }
      }
    })
    .catch(() => {})
}
