# Pasture for OpenChamber

The CowCode Pasture as an OpenChamber extension. The package bundles the same 3D scene used by CowCode; it does not modify CowCode, Barn, OpenCode's provider, or any service. OpenChamber 2.7.2 or newer is required. This is a separate panel, not a replacement desktop app.

## Install locally

1. Open OpenChamber **Settings → Extensions**. Add the absolute path of this folder and allow the listed GitHub network integration. A local-folder install reads the built files in this folder directly.
2. In **Settings → Integrations → Pasture GitHub**, connect a GitHub personal access token. OpenChamber keeps the token and sends it to `api.github.com`; the panel never receives it. Use a token with read access to the desired repositories' pull requests, reviews, status checks and metadata. Organization SSO authorization and repository grants may be needed. Repositories outside the token's access will not appear. GitHub's GraphQL endpoint may require additional read permissions for some fields; errors are shown in the panel.
3. Open **Pasture** on the right rail. Expand the panel or open its full-page view for more room. Switch between **Pasture** and **PR list** at the top. In the field, hover a cow for the PR; click to lift and inspect it, moo or open it; double-click to open it. Drag to orbit, scroll to zoom, and use Tour for the camera tour. Escape or Put it down releases a cow.

The PR list groups open PRs by repository, with the most recently updated first in each group. Each row opens the PR and shows its checks, review, unresolved comments, and merge status when available. Expand **Recently merged** for the last 30 days, also grouped by repository with the newest merges first.

On a remote instance, the folder must exist on the remote machine. Alternatively, make a ZIP whose root contains this folder's `package.json` and `panel/` and add that ZIP; OpenChamber uploads and copies ZIP installations. Do not include `node_modules`. The server-side GitHub integration must be connected separately.

## Data and limits

The panel queries GitHub every minute while open for the authenticated user's open PRs and PRs merged since the UTC date seven days ago. The 30-day merged history is fetched when expanded and refreshed while it remains open. Searches paginate up to GitHub's 1,000-result search limit; the field draws at most 150 cows, with open PRs first. The PR list is independent of the field's cow limit. A notice appears when search results are incomplete or the field omits cows. Repository visibility is bounded by the connected token and GitHub search; an empty search is not proof the token can see every repository. Failed refreshes retain the last successful results with an error notice. Switching or disconnecting accounts clears them.

Drafts, changes requested, awaiting and merged map to their pens, and queued PRs join the ready pen. Ready is conservative: GitHub must report approved and `CLEAN`, the returned review threads must all be resolved and complete, and any reported checks must have succeeded. This is an approximation, not an authorization to merge. A re-review label still reports the underlying changes-requested verdict. The field does not currently show closed-without-merge burns. Changes visible between refreshes use the original scene's hand/saucer animation. Cows beyond the field limit cannot be tracked there, and transitions are only observed while the panel is open.

The San Francisco sun, resident characters and tour use the shared scene. Live weather, Datadog wolves, calendar parties and CowCode's desktop-only integrations are not connected here. No background service runs and no prompts are sent.

## Development

From this folder: `npm ci`, `npm run build`, `bun typecheck`, `npm test`. The browser bundle in `panel/main.js` is checked in because OpenChamber does not build extensions on install. The build reads the Pasture scene from this repository, so rebuild after changing it. `test/preview.html` is a synthetic host for visual testing; it contains no credentials and does not contact GitHub. For example, run `python3 -m http.server 18973 --bind 127.0.0.1` from this folder and open `http://127.0.0.1:18973/test/preview.html`.
