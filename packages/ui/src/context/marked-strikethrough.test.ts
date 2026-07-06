import { describe, expect, test } from "bun:test"
import { Marked } from "marked"
import { DOUBLE_TILDE_DEL } from "./marked"

// A minimal parser wired with the same del tokenizer the MarkedProvider installs,
// so the test exercises the real rule without pulling in shiki/katex.
const parser = new Marked({
  tokenizer: {
    del(src) {
      const match = DOUBLE_TILDE_DEL.exec(src)
      if (!match) return undefined
      return { type: "del", raw: match[0], text: match[2], tokens: this.lexer.inlineTokens(match[2]) }
    },
  },
})

const html = (md: string) => parser.parse(md, { async: false })

describe("strikethrough requires double tildes", () => {
  test("a single tilde is literal text, not strikethrough", () => {
    const out = html("~68°F and gusts to ~18 mph")
    expect(out).not.toContain("<del>")
    expect(out).toContain("~68°F")
    expect(out).toContain("~18 mph")
  })

  test("double tildes still strike", () => {
    const out = html("this is ~~struck~~ text")
    expect(out).toContain("<del>struck</del>")
  })

  test("mixed single and double tildes only strike the double-tilde run", () => {
    const out = html("keep ~this~ but ~~drop this~~")
    expect(out).toContain("~this~")
    expect(out).toContain("<del>drop this</del>")
  })
})
