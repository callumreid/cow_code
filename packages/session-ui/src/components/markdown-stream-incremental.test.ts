import { describe, expect, test } from "bun:test"
import { project, stream, type Projection } from "./markdown-stream"

// Reference implementation: the pre-incremental project(), which re-lexed the whole
// accumulated text on every delta outside the open-code-fence fast path. The
// incremental version must stay byte-identical to this for every streamed prefix.
function legacyClosesFence(raw: string, suffix: string) {
  const mark = raw.match(/^[ \t]{0,3}(`{3,}|~{3,})/)?.[1]
  if (!mark) return suffix.includes("```") || suffix.includes("~~~")
  return `${raw.slice(-(mark.length - 1))}${suffix}`.includes(mark)
}

function legacyProject(previous: Projection | undefined, text: string, live: boolean): Projection {
  if (!live || !previous || !text.startsWith(previous.text)) return { text, blocks: stream(text, live) }
  const tail = previous.blocks.at(-1)
  const suffix = text.slice(previous.text.length)
  if (!suffix || tail?.mode !== "code" || tail.complete || legacyClosesFence(tail.raw, suffix))
    return { text, blocks: stream(text, live) }
  return {
    text,
    blocks: [
      ...previous.blocks.slice(0, -1),
      {
        ...tail,
        raw: tail.raw + suffix,
        src: tail.src + suffix,
      },
    ],
  }
}

const CORPUS: { name: string; text: string }[] = [
  {
    name: "mixed prose, lists, tables, fences",
    text: [
      "# Plan\n",
      "\n",
      "First paragraph with **bold**, `inline code`, and a [link](https://example.com/a) inside it.\n",
      "Second line of the same paragraph.\n",
      "\n",
      "- item one\n",
      "- item two with `code`\n",
      "  - nested item\n",
      "- item three\n",
      "\n",
      "```ts\nconst x = compute(1)\nif (x > 0) {\n  console.log(x)\n}\n```\n",
      "\n",
      "| col a | col b |\n|-------|-------|\n| 1     | 2     |\n| x     | y     |\n",
      "\n",
      "Closing paragraph after the table wraps things up.\n",
    ].join(""),
  },
  { name: "unterminated fence at end", text: "before\n\n```ts\nconst x = 1\nconst y = 2\n" },
  { name: "fence closed then prose", text: "```py\nprint(1)\n```\n\nafter the fence\n\nmore prose\n" },
  { name: "tilde fence with metadata", text: "intro\n\n~~~ts title=example\nconst x = 1\n~~~\n\noutro paragraph\n" },
  { name: "compact reference definition", text: "[docs][1]\n\nsome paragraph\n\n[1]: https://example.com\n\ntail\n" },
  { name: "indented reference definition", text: "[docs]\n\n   [docs]:/guide\n\nafter\n" },
  { name: "multiline reference definition", text: "[docs][id]\n\nfiller paragraph\n\n[id]:\n  /guide\n\nend\n" },
  { name: "def-lookalike inside a code fence", text: "intro\n\n```\n[1]: https://example.com\n```\n\nafter fence\n" },
  { name: "late reference definition after stable blocks", text: "# H\n\npara one\n\npara two\n\n[ref]: https://x.dev\n" },
  { name: "setext heading equals", text: "Title\n=====\n\nbody paragraph\n\nSecond\n---\n\nafter\n" },
  { name: "hr vs setext vs list soup", text: "para\n\n---\n\n- item\n---\nmore\n\n***\n\ntail para\n" },
  { name: "blockquote with lazy continuation", text: "> quoted line\nlazy continuation\n\n> another\n> quote\n\nafter\n" },
  { name: "indented code after blank line", text: "para\n\n    indented code line 1\n    indented code line 2\n\nafter\n" },
  { name: "indented lines as paragraph continuation", text: "para line one\n    still the same paragraph\nmore\n\nnext\n" },
  { name: "html block", text: "before\n\n<div class=\"x\">\n  <span>hi</span>\n</div>\n\nafter\n" },
  { name: "crlf line endings", text: "# H\r\n\r\npara one\r\n\r\n- a\r\n- b\r\n\r\ntail\r\n" },
  { name: "lone carriage returns", text: "para one\r\rpara two\r\rtail" },
  { name: "whitespace runs and blank lines", text: "  \n\npara\n\n\n\nnext para\n   \n\ntail\n\n" },
  { name: "unicode and emoji", text: "# Résumé 📝\n\nnaïve café — “quotes” and emoji 🎉 inside.\n\n- ✓ done\n" },
  { name: "def line spanning a would-be freeze boundary", text: "para\n[x]:\n # h\nmore\n" },
  { name: "paragraph interrupted by leading-space heading", text: "para line\n  ## heading\n\nafter\n" },
  { name: "growing table frozen by later block", text: "| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n\nafter table\n" },
  { name: "consecutive fences", text: "```a\none\n```\n```b\ntwo\n```\n\ntail\n" },
  { name: "fence markers split across deltas", text: "```ts\nconst x = 1\n```\nafter\n" },
  { name: "only whitespace", text: " \n \n \n" },
  { name: "single long paragraph", text: `start ${"word ".repeat(400)}end\n` },
]

const CHUNK_SIZES = [1, 2, 3, 5, 8, 24, 64]
const VARIABLE_PATTERN = [1, 7, 2, 30, 3, 11]

function snapshots(text: string, next: (index: number) => number) {
  const result: string[] = []
  let cursor = 0
  let index = 0
  while (cursor < text.length) {
    cursor = Math.min(text.length, cursor + next(index))
    result.push(text.slice(0, cursor))
    index++
  }
  return result
}

function compareChains(text: string, sizes: (index: number) => number, label: string) {
  const steps = snapshots(text, sizes)
  let actual: Projection | undefined
  let expected: Projection | undefined
  steps.forEach((step, index) => {
    actual = project(actual, step, true)
    expected = legacyProject(expected, step, true)
    if (!Bun.deepEquals(actual.blocks, expected.blocks, true)) {
      expect(actual.blocks).toEqual(expected!.blocks)
      throw new Error(`${label}: diverged at step ${index + 1}/${steps.length} (${step.length} chars)`)
    }
  })
  // final non-live projection (stream finished)
  const finalActual = project(actual, text, false)
  const finalExpected = legacyProject(expected, text, false)
  expect(finalActual.blocks).toEqual(finalExpected.blocks)
}

describe("incremental project() stays byte-identical to full re-lex", () => {
  CORPUS.forEach(({ name, text }) => {
    // Each case compares against the deliberately O(n²) legacy re-lex; the long
    // corpus entries blow past bun's 5s default even though project() itself is
    // fast, so give the equivalence cases a generous per-test budget.
    test(name, () => {
      CHUNK_SIZES.forEach((size) => compareChains(text, () => size, `${name} chunk=${size}`))
      compareChains(text, (index) => VARIABLE_PATTERN[index % VARIABLE_PATTERN.length]!, `${name} variable`)
    }, 60000)
  })

  test("non-prefix replacement reprojects from scratch", () => {
    const first = project(undefined, "# One\n\nalpha beta", true)
    const replaced = project(first, "# Two\n\ndifferent body", true)
    expect(replaced.blocks).toEqual(stream("# Two\n\ndifferent body", true))
  })

  test("frozen prefix blocks keep object identity across deltas", () => {
    const base = "# Heading\n\nFinished paragraph.\n\n"
    const first = project(undefined, `${base}live tail`, true)
    const second = project(first, `${base}live tail grows`, true)
    expect(second.blocks[0]).toBe(first.blocks[0])
    expect(second.blocks[1]).toBe(first.blocks[1])
  })
})
