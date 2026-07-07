import { type ComponentProps } from "solid-js"

// Shared cow-face brand glyph drawn in a 100x100 box, themed via the icon CSS
// vars so it works on every surface (watermark, splash, empty state). Each
// exported logo scales/translates this into its own viewBox and keeps its
// original export name so all call sites are unchanged.
function CowGlyph(props: { fill?: string }) {
  const base = props.fill ?? "var(--icon-base)"
  const strong = props.fill ?? "var(--icon-strong-base)"
  const weak = props.fill ?? "var(--icon-weak-base)"
  return (
    <>
      {/* horns */}
      <path d="M34 30 L18 13 L31 33 Z" fill={weak} />
      <path d="M66 30 L82 13 L69 33 Z" fill={weak} />
      {/* ears */}
      <ellipse cx="19" cy="47" rx="12" ry="7" fill={base} transform="rotate(-28 19 47)" />
      <ellipse cx="81" cy="47" rx="12" ry="7" fill={base} transform="rotate(28 81 47)" />
      {/* head */}
      <ellipse cx="50" cy="53" rx="30" ry="31" fill={base} />
      {/* forelock tuft */}
      <path d="M42 25 Q50 14 58 25 Q54 31 50 29 Q46 31 42 25 Z" fill={strong} />
      {/* muzzle */}
      <ellipse cx="50" cy="68" rx="20" ry="13" fill={weak} />
      {/* nostrils */}
      <ellipse cx="43" cy="68" rx="2.6" ry="3.6" fill={strong} />
      <ellipse cx="57" cy="68" rx="2.6" ry="3.6" fill={strong} />
      {/* eyes */}
      <circle cx="39" cy="47" r="3.6" fill={strong} />
      <circle cx="61" cy="47" r="3.6" fill={strong} />
    </>
  )
}

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(0 2) scale(0.16)">
        <CowGlyph />
      </g>
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
      <g transform="translate(0 10) scale(0.8)">
        <CowGlyph />
      </g>
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 234 42"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g transform="scale(0.42)">
        <CowGlyph />
      </g>
      <text
        x="52"
        y="31"
        font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-size="26"
        font-weight="600"
        fill="var(--icon-base)"
      >
        cow_code
      </text>
    </svg>
  )
}
