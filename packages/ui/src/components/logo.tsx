import { type ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path data-slot="logo-logo-mark-shadow" d="M12 16H4V8H12V16Z" fill="var(--icon-weak-base)" />
      <path data-slot="logo-logo-mark-o" d="M12 4H4V16H12V4ZM16 20H0V0H16V20Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60 80H20V40H60V80Z" fill="var(--icon-base)" />
      <path d="M60 20H20V80H60V20ZM80 100H0V0H80V100Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

const PIXEL_FONT: Record<string, string[]> = {
  c: [".###", "#...", "#...", "#...", ".###"],
  o: [".###", "#..#", "#..#", "#..#", ".###"],
  w: ["#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
  d: ["...#", ".###", "#..#", "#..#", ".###"],
  e: [".###", "#..#", "####", "#...", ".###"],
  " ": [".."],
}

export const Logo = (props: { class?: string }) => {
  const unit = 6
  const gap = 2
  const text = "cow code"
  const rects: { x: number; y: number; strong: boolean }[] = []
  let cursor = 0
  let width = 0
  for (const [index, char] of [...text].entries()) {
    const glyph = PIXEL_FONT[char] ?? PIXEL_FONT[" "]
    const strong = index >= text.indexOf("code")
    for (const [row, line] of glyph.entries()) {
      for (const [col, cell] of [...line].entries()) {
        if (cell !== "#") continue
        rects.push({ x: cursor + col * unit, y: 6 + row * unit, strong })
      }
    }
    cursor += (glyph[0].length + gap) * unit
    width = cursor - gap * unit
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} 42`}
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        {rects.map((rect) => (
          <path
            d={`M${rect.x} ${rect.y}h${unit}v${unit}h-${unit}z`}
            fill={rect.strong ? "var(--icon-strong-base)" : "var(--icon-base)"}
          />
        ))}
      </g>
    </svg>
  )
}
