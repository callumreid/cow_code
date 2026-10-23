# Flint on Apple Silicon

Kobi's [recommendation](https://coval-workspace.slack.com/archives/C08S9S52EE8/p1792714630373259)
is [Recursive Flint](https://huggingface.co/RecursiveSI/flint), a text-only 39.8B MoE with about 2.5B active parameters.

From the CowCode checkout, run:

```sh
bun script/flint-local.ts
```

This installs the pinned llama.cpp `b11838` Apple Silicon runtime and Unsloth's
18.5 GB `UD-Q3_K_XL` weights, verifies SHA-256 checksums, adds **Flint 40B-A2.5B Q3 (local)**
under **Flint (this Mac)** in the model picker, and starts a loopback-only server on port 8902.
Existing provider entries and the default model are preserved. The configuration is backed up before writing.
Allow the download to finish; failed downloads resume on the next invocation.

The LaunchAgent is `~/Library/LaunchAgents/dev.cowcode.flint.plist`; it starts at login and unloads
the model after five idle minutes. The next request wakes it. Logs are at
`~/.local/share/cowcode/flint-server.log`. It uses one inference slot and a practical 32K context,
with a 4K output limit. These are local resource limits, below the model's advertised 256K maximum.
Requests use temperature 1, top-p 0.95, top-k 20, and preserve `reasoning_content` for tool continuations.
The runtime follows the bundled GGUF chat template. It does not add image support.

CowCode compacts when a turn's total usage reaches context minus the output limit:
28,672 tokens with these settings. A project with many instructions and tools can use about
24K tokens before conversation history. The former 8K output budget left almost no room and
could repeatedly compact even a greeting, because summaries cannot shrink fixed instructions.
Keep automatic compaction enabled. The smaller output budget adds conversation headroom within the existing allocation;
raising the advertised context alone does not increase the runtime's actual 32K allocation.

## Thread speed

The thread header shows output tokens per second for the latest observed model turn, across providers.
Reasoning and streamed tool arguments count; prompt processing, tool results, and tool execution do not.
A live `~` rate estimates tokens at four characters per token. The final rate uses provider-reported
output plus reasoning token counts when the whole turn was observed. Missing counts and partial
observations stay estimates; a single buffered chunk has no measurable rate.

Measurements live in memory per server and thread, keep tracking background threads, and reset for
each provider turn. They are not historical benchmarks after a reload. Transport buffering and
provider chunk sizes affect timing, so compare models on similar prompts and contexts.

To stop the local server without deleting weights or other models:

```sh
launchctl bootout "gui/$(id -u)/dev.cowcode.flint"
```

Run the installer again to start it again. See the [Unsloth guide](https://unsloth.ai/docs/models/flint)
for alternative quantizations; Q3 was selected here because of available disk space.
