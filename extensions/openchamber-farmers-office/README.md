# Farmer’s Office

Farmer’s Office is a shared desk for the OpenChamber server you connect to. Open its rail panel or its full-screen extension page. On a paired phone, open the sessions drawer, tap **More**, and choose **Farmer’s Office**.

Ask “What needs me?”, select **All work** to search across projects, or use **New thread** to dispatch work. “Tell the thread named ‘Export fix’ to run the February case” prepares a steer. The Office shows the target and instruction before committing a proposed action. Direct controls act on the thread you selected. A thread’s own request for permission or a decision has separate controls. For a custom page, open it or send a text reply that closes it. Complex forms open in the original thread.

**Talk** starts a hands-free call. You can interrupt Farmer, type during the call, or end the call and continue by text. The Office history, decisions, and inbox live on the host and follow you between clients. The host ends an abandoned voice connection when the device stops checking in.

## Incoming work

The service receives events while the Office is closed. Questions, blocked work, and concrete outcomes can appear in its inbox. Routine PR reviews and upkeep stay in **All work**. Use **Follow next result** to bring a particular thread’s next outcome to the inbox. The Office follows threads it dispatches automatically. Dismissal and action receipts survive a restart. An important update adds a flag to its thread in the OpenChamber sidebar. Opening the Office also checks for threads that were waiting before installation.

## Installation

Use OpenChamber 2.7.2 or later. The checked-in panel and service bundles are ready to install through **Settings → Extensions → Add from folder**. Install on the host your phone pairs with. The extension uses OpenChamber’s session control, read-only session inventory, events, and microphone bridge. An active connection to the same host is required.

The service reads the Gemini API key from the host’s existing `secret gemini_api_key` command. The key stays on the host. Gemini processes free-form chat and live microphone audio, along with Office history or thread information needed to answer the request. Event filtering and the work list run locally. A direct brief, dispatch, or steer through the controls works independently of the conversation provider. New workers use the selected session’s model and agent when available.

## Development

Run `npm ci`, `npm test`, `npm run build`, and `npm run check` from this folder. The check uses Bun and the SDK version pinned in the lockfile. The checked-in bundles are the installable outputs. Live voice uses Gemini Live with mono 16 kHz PCM from OpenChamber’s microphone bridge and streams the reply back to the device.
