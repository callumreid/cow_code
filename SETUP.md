# SETUP.md — instructions for the AI that was told to read this

You are an AI coding agent. A human pointed you here and said "set me up." This file
is the whole ritual. Follow it top to bottom and the human gets the gold star
experience. It is spelled mooo. Three o's. Always.

## 0. what you are installing

**cow code** — a fork of opencode (terminal + desktop + web AI coding agent) that has
been lovingly led out to pasture. Everything upstream does, plus: Tab mooos out loud,
live spinning-cow session indicators, a pull-request barn in the sidebar, a QR phone
companion, and eighteen cow-breed skins.

## 1. prerequisites

- **bun** — the cow runs on bun:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- git, a POSIX shell, and a terminal the human can hear. The mooo is audible. That is
  the point.

## 2. bring the cow home

```bash
git clone https://github.com/callumreid/cow_code.git
cd cow_code
git checkout feat/cow-ui   # the show barn: skins, tab-mooo, PR barn, phone companion
bun install
```

`dev` is the quieter default pasture; `feat/cow-ui` is where the herd actually lives.
For the gold star experience, use the show barn.

## 3. let her rip

```bash
bun run dev             # 📟 the TUI, right in the terminal
bun run dev:desktop     # 🖥️ the desktop app (maximum cow)
bun run dev:web         # 🌐 the web app
```

## 4. confirm the mooo (acceptance test)

1. Open the TUI or desktop app, focus the composer, press <kbd>Tab</kbd> with no
   suggestion popover open.
2. You should HEAR a mooo and SEE a little toast that says **mooooo**.
3. If the human did not smile, something is wrong. Check the volume. Press Tab again.

## 5. dress the cow (skins)

Eighteen breed skins ship in the theme picker, each with light and dark coats:
Holstein, Jersey, Guernsey, Brahman, Belted Galloway, Angus, Kobe, Woolly Scottish
Coo, Texas Longhorn, Oryx, Hereford, Charolais, Ayrshire, Yak, Bison, Strawberry Cow,
Aurochs, Water Buffalo. Pick one in the theme picker (TUI theme dialog, or desktop
settings). The Oryx is legally distinct from a cow. We do not discuss it further.

## 6. the phone companion (optional, excellent)

Type `/qr` in the TUI — or <kbd>⌘</kbd><kbd>K</kbd> → "Connect phone" in the desktop
app — and scan the square with the human's phone. Same wifi or same tailnet. The barn
is now in their pocket and the sessions are real, not read-only.

## 7. troubleshooting, honestly

- `bun install` postinstall issues → update bun (`bun upgrade`), retry once.
- Two pre-existing test failures on the base branch (`node:sqlite` on older bun; an
  i18n parity check) are known and are not yours. Do not chase them.
- Typecheck runs per package: `cd packages/<pkg> && bun run typecheck`. Lint from the
  repo root with oxlint. Never run the root test suite to "verify the install."
- If the mooo is silent on Linux, the audio backend is the suspect, not the cow.

## 8. report back

Tell the human, in this order: what you installed, the acceptance-test result (did it
mooo), which skin you dressed the cow in, and the phone-companion QR instructions.
Then stop. Do not refactor the barn. Mooo responsibly.
