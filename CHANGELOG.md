# changelog

every change to the cow lands here, newest first, one line per thing you would notice.
what each feature is, and the films, live in the [feature reel](docs/features/README.md).

## 2026-09-11 🚪

### Added

- the barn door watchdog: the box checks its public phone link every two minutes, from inside and from the internet, keeps the current link in a file the laptop reads, and (once you say yes to the DMs) DMs you when the address moves, when the door has been shut for ten minutes, and when it opens again ([the barn door](docs/features/phone.md))
- connect phone in the desktop app (⌘K) shows the box's public link first, the one that works anywhere, and when that door opened; the same-network squares are still there underneath
- a "this door needs its key" page for a phone that turns up without one, a "the cow is getting up" page that retries itself while the server restarts, and a gate access log (paths only, never the key) so the next phone mystery has evidence
- a changelog rule in [AGENTS.md](AGENTS.md#changelog): every change a user can notice lands a line here, in the same commit

### Changed

- home-screen launches keep their key: the box serves the phone a web-app manifest whose start address carries it, so the icon walks in the door instead of dying on a not found

### Fixed

- the phone shows a real "could not reach" screen with automatic retries instead of an endless spinner, and the event stream backs off to five seconds instead of knocking four times a second while the barn is unreachable
- the slack door leaves and relaunches instead of reconnecting forever: a bad handshake left the bot reconnecting 76 times a minute for a day, rate-limited and answering nobody (c1fe8fd1a)

## 2026-09-10 🐄

### Added

- the pasture: a 3D field under the farmer's office, one cow per pull request, thirty breeds wandering and grazing. hover for the PR, click to lift and inspect, double-click to open on github, a moo button pitched by breed size, and a timeframe control ([the pasture](docs/features/pasture.md)) (122ba72d4, f1ead9036)
- pasture pens: drafts, awaiting review, changes requested, ready to merge, merged, each with a sign and a headcount. when a PR changes stage the hand of god carries the cow to its new pen; new PRs are lowered in, closed ones taken away (f1ead9036)
- merge when ready: an opt-in per-PR switch (kept as a github label) that arms auto-merge once the PR is green, approved and comment-free, and has an agent fix and re-queue it after a merge-queue bounce ([pull requests, ranked](docs/features/README.md#-pull-requests-ranked)) (765724dfd)
- threads the farmer dispatches sit in the normal session list with the usual cow indicators, across projects; opening one keeps the sidebar on your project (de72eeceb, 58a4b465c)
- the feature reel: `docs/features` with the pasture film and poster, playable through a public link ([feature reel](docs/features/README.md)) (ff2abb92c, b56a7a7bb)

### Changed

- the pasture shows only your own PRs, caps the herd at 150, and the merged pen defaults to today (5b9552f0f, 035b29189)
- the pasture's sidebar count includes open cows, not just merged ones (6ca5ae0c1, 7a6d7f643)
- routines only card their kick-off and their problems; no finished or canceled cards, and a kick-off never wakes the farmer (5b9552f0f)
- the review-comment fixer re-requests the human reviewers who asked for changes once it has fixed them (cf62abf70)
- the review queue routine runs at :25 so it stops losing the routine lock to the fixer at :00 (a1360fb20, 0c053f4ae)

### Fixed

- the farmer's replies stay readable after a minute, and finished turns are labeled finished, not stopped (e119f6230)
- the office stream keeps the farmer's transcript text; an outcome replaces a reply only when this client holds one (16a7e41d2)
- the hourly review queue run crashed every time on a zsh-reserved variable (7407b62b8, e119f6230)
- the LLM-routine lock actually holds under zsh, so two routines cannot run on top of each other (3db193c51, 553dd8ea9)

## 2026-09-09 🗓️

### Added

- Scheduled: a sidebar entry with a running badge and a full-width panel for every routine the box runs on a clock — schedule, next run, the current run with a link to its thread, recent runs, a log tail, run now, and the always-on services ([scheduled](docs/features/README.md#️-scheduled)) (288fc91fc)
- Scheduled launcher in the phone and web titlebar, with the same running badge (fa70e3511)
- pull requests panel shows merge-queue membership and position, "behind base", and a "re-review requested" state; two per-PR switches — keep updated with base, auto-fix review comments — kept as github labels so every machine agrees, on by default (1d68ac3de)
- keep-updated routine: updates your branches every 30 minutes and DMs you full PR links when one hits a merge conflict, deduped (1d68ac3de, 8a7cab2ec)
- routines show up in the office: routine threads carry a tag and the farmer's state block lists the latest run per routine (1d68ac3de)
- scheduled jobs on the box: the PR review sweep, queue and fixer, two daily Coval jobs, and a daily box health routine that reports through Slack (1f58d7e84, 25e4c2a8c)
- the farmer's slack door: mention or DM the bot and the farmer answers in the thread; threads that need you (a permission, a question, a failure) are posted to a channel (62f1dd553, 288780647)
- eyes and hands: watch the box's browser from any browser and take the mouse and keyboard, from the LAN, the laptop tunnel or the phone under `/computer/`; the agent and you share the one browser, so sign-ins persist (047ee0dcc)
- the always-on box: a provisioning script installs the server, the phone gate and the tunnel as user-level launchd services, and only reloads what changed so the phone URL does not rotate on re-runs (52d6ef664, 62f1dd553)
- a ChatGPT subscription as its own provider, separate from the openai api key (1f58d7e84)
- office coordination persists across voice, hosts and routine runs (8af185fb8)

### Changed

- routine hours: the queue and fixer stop at 18:00, and a routine window can carry an exact last start time (ac56eacd8)
- no retry storms: a provider retry storm yields one error card per thread per 15 minutes, the slack door sends one DM per thread and bucket, and a routine that ends aborts its leftover sessions (ca3e5ced7, 99593059d)
- the review sweep and queue run on the ChatGPT provider; the fixer stays on glm-5.3-flash (8e6163bda)

### Fixed

- pull requests from archived repos are dropped everywhere; github search ignores `archived:false`, so the panel and the box routines check it themselves (39a2656da)
- the office's own overseer session is hidden from session lists and the command palette (e0057374a, b9cfbc8f6)
- steering sends the first queued follow-up first and leaves the composer draft alone (b9cfbc8f6)
- Scheduled rows are keyed by job name, so a poll keeps an expanded row open (994f4dc3a)
- run summaries drop colour codes and tool echoes; a run's thread summary wins over its stdout tail (f7d8354bf)
- office state holds up: completed turns are preserved, rejected request receipts persist, canceled recovery clears (dc81f63b1, 983e293fd, f7c2c6ee6)
- the Codex path no longer sends max_output_tokens, and the box lists only the models the ChatGPT backend accepts (71ecfd6ff)

## 2026-09-08 🔗

### Added

- urls in your own messages are links (60f6335a3)

## 2026-09-04 📱

### Fixed

- the phone's public tunnel heals itself: verified through public DNS, no poisoned DNS, and a healthy tunnel is left alone (6f97f13fc, 3123d955f, a52ffccdd, fbd383610)

## 2026-09-03 🧑‍🌾

### Added

- the farmer's office: a roster of every root session in five buckets with what each is waiting for, and a hidden farmer agent that can read, steer, answer, dispatch, remind, open and mark threads; a full-width panel with decision cards and peek-and-reply, the farmer's live feed and composer, and a WebRTC voice strip with hold-to-talk, barge-in, captions and a cost meter. commands office.open (mod+shift+f), office.next (mod+shift+j), office.voice; settings for voice model, voice and autonomy ([the farmer's office](docs/features/README.md#-the-farmers-office)) (e55b5cfab, 697323f5f, 921082dcb)
- office silence rules: a plain finish is just a card, review-ready threads batch into one digest per ten minutes, and permissions, questions, errors and stalls wake the farmer at once; a since-you-last-looked brief on open (563c5a5b3, c095855e6)
- office v2: one chronological stream with status chips, report cards that act in place (allow, deny, answer, steer, nudge, open, mute), an unread badge, and an open-on-launch setting (c095855e6)
- answer from the office: a pending question or permission stays live until it is actually answered; a finish wakes the farmer for an outcome read (what was done, what it means, next step); Codex threads from the ChatGPT desktop app join the roster read-only (2f08cd4f4)
- office hold-to-talk and tap-to-toggle mic in the composer, with settings for auto-send and spoken replies; a full-viewport phone layout; a Codex chip (4d36dc14a, bde2428f5)
- the farmer's office on mobile, from the titlebar (95b9a6a77)
- live tool picture-in-picture: while a thread works, a floating preview shows the latest tool screenshot, including code mode integrations (d521260e9, d40961398, b347184a6)
- the working cow picks a random breed per thread (37ebda63a)
- connect phone offers a secure HTTPS address so the microphone and voice work on mobile, and the QR carries the protected public tunnel (1829bb5bc, c3b9fae5d)

### Changed

- thread toasts, OS notifications and sounds stay quiet while the office is open; the farmer surfaces them as cards instead (bde2428f5)

### Fixed

- inline rename selects the existing title (58d2d0663)
- the packaged desktop sidecar starts again; the office service uses Node APIs (87914d214)
- the office briefs once per batch of news instead of on every reload (3067e576c)
- session highlight clears in the office (b4a7d2395)
- pull requests stay visible during github rate limits (b56406f83)
- the highland cow indicator lost its background (643d32a76)

## 2026-09-02 🚦

### Added

- pull requests open full width instead of filling the sidebar; the sidebar row is a launcher with the open count and a dot when something is ready to merge (d9f824ccd)
- queue follow-up prompts while a thread is working; a settings row picks queue or steer (7b83237df)

### Fixed

- PR state badges all fell back to a plus icon (d9f824ccd)
- a thread keeps the model it was put on instead of reverting to the agent's default (d647ec87a)
- Punjabi (Pakistan) matches its own bundle instead of falling through to english (f609c904a)
- the packaged app's sidecar builds on the app's own channel, so packaging from a feature branch no longer points at an empty session database (86b0b7495)

## 2026-09-01 🔊

### Changed

- permission requests moo (4e41c998e)

## 2026-08-31 🔌

### Added

- hover card for pull request links in the timeline: state, repo and number, age, title, author, diff size and file count, for any PR anyone mentions (9b5454c29)
- connectors settings tab for MCP servers: list what is configured, add a remote server with an optional bearer token, enable or disable; Oneleet as a quick-add preset (409fe17c4)

## 2026-08-28 🔔

### Added

- an archive action beside the pin puts a thread out to pasture; the pin is a cowbell (772602473)
- a finished thread moos: the done sound is the tab moo, and moo joins the sound list (03129f451)
- twelve ways to say big dog in the composer placeholder, chosen once per mount (6630cd844)

### Fixed

- the open pull request list scrolls instead of running off the panel (772602473)
- tab in the desktop composer takes the example prompt instead of switching agents (5f8f78ec9)

## 2026-08-26 🎨

### Added

- pull-request dashboard in the sidebar: every open PR you wrote, grouped by repo, oldest first, one badge each (ready, awaiting review, unresolved, checks failing, changes requested, draft) with the reason underneath, and a collapsed recently merged section for the trailing 30 days; via gh, so private repos show and no token is stored ([pull requests, ranked](docs/features/README.md#-pull-requests-ranked)) (78f1bc9f0)
- the wardrobe: eighteen cow-breed skins, light and dark pelts, in the theme pickers of the TUI and the desktop app ([the wardrobe](docs/features/README.md#-the-wardrobe)) (f6cf0ac83)
- the big dog census: a settings tab counting every big dog you said and every big dog mode the agent announced, across all sessions ([the big dog census](docs/features/README.md#-the-big-dog-census)) (fdab8007e)
- settings and help move into a named account row at the bottom of the sidebar ([the pen](docs/features/README.md#-the-pen)) (81996f573)
- a rotating cow marks working sessions, and a flame-shirted gentleman points at the ones done and waiting to be read (138c49849)
- jump to the last user message from the timeline (ee2a8c111)
- the composer placeholder says you got this, big dog (10a2eb2e6)
- the phone gets the fork's own web ui (cow theme, project seeding) instead of the proxied upstream app; pairing links seed the phone's project list, a fresh client with no projects derives them from server session history, and the companion listener is exposed at launch ([the phone](docs/features/README.md#-the-phone)) (611ec768a, ca390f407, 7d08d04aa, 700706f4b)
- the hype film, front and center in the README; v2 gives the phone its own segment ([hype film](artifacts/hype-video/README.md)) (21e88cdd8, 130ff1b55, ac8f55877)
- SETUP.md for agents, and a tell-your-AI beacon at the bottom of the README (881c45bb5, 5f8165bb2)

### Fixed

- tab only moos in the TUI; it no longer cycles the agent (and the model) on the way past. switch agents with /agents (fc57efe04)
- a conversation stays on the model it has been using instead of drifting to whichever local model was touched last (0da47c613)
- phone pairing works on the packaged app; iOS Safari keeps its session list after a reload; the companion password persists across launches (d877e17cf)

## 2026-08-25 🐮

### Added

- persistent session sidebar: always out, resizable at every window width, remembers its width ([the pen](docs/features/README.md#-the-pen)) (c97e12a8c, 6927c7e8b)
- github PR links in chat sprout an open/merged/closed badge (c97e12a8c)
- double-click a sidebar thread title to rename it inline (3e45bf59f)
- pin and unpin threads in the sidebar, plus a cow patch theme overlay (2626890cc)
- the DEV badge is a cow (4b7dd233c)
- cow code branding: wordmark, window title, menu (3176a6084)
- `/qr` in the TUI connects a phone to the live session over a password-protected listener, and the phone stays logged in ([the phone](docs/features/README.md#-the-phone)) (a47c82f65)
- connect phone in the desktop command palette: a QR dialog for the current server (fbf40b369)
- tab moos, in the TUI, the desktop app and the web app, with a mooooo toast; the sound respects the attention settings ([tab](docs/features/README.md#-tab)) (71fa7ccaa, add9c2835, 68aa21869)

### Changed

- the README got deep-fried, 90s cow edition (a07c6f01a, a16fe4d17, 79d1d5241, 6f5be8bc6)

### Fixed

- renaming a thread in the sidebar no longer crashes on the SDK context (3176a6084)
