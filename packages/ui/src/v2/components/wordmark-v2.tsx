import { type ComponentProps } from "solid-js"

// New-design hero wordmark: cow face + "cow_code". Uses currentColor so it
// inherits the surrounding text color like the original wordmark did.
export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720.002 129.001"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g transform="translate(0 6) scale(1.16)" fill="currentColor">
        {/* horns */}
        <path d="M34 30 L18 13 L31 33 Z" opacity="0.55" />
        <path d="M66 30 L82 13 L69 33 Z" opacity="0.55" />
        {/* ears */}
        <ellipse cx="19" cy="47" rx="12" ry="7" transform="rotate(-28 19 47)" />
        <ellipse cx="81" cy="47" rx="12" ry="7" transform="rotate(28 81 47)" />
        {/* head */}
        <ellipse cx="50" cy="53" rx="30" ry="31" />
        {/* muzzle */}
        <ellipse cx="50" cy="68" rx="20" ry="13" opacity="0.4" />
        {/* eyes + nostrils punched via the background color */}
        <circle cx="39" cy="47" r="3.6" fill="var(--color-background-base, #000)" />
        <circle cx="61" cy="47" r="3.6" fill="var(--color-background-base, #000)" />
        <ellipse cx="43" cy="68" rx="2.6" ry="3.6" fill="var(--color-background-base, #000)" />
        <ellipse cx="57" cy="68" rx="2.6" ry="3.6" fill="var(--color-background-base, #000)" />
      </g>
      <text
        x="150"
        y="92"
        font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-size="84"
        font-weight="700"
        fill="currentColor"
      >
        cow_code
      </text>
    </svg>
  )
}
