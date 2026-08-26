import { createMemo, createSignal, onCleanup } from "solid-js"
import cowBack from "@/assets/cow/cow-back.png"
import cowFront from "@/assets/cow/cow-front.png"
import cowSide from "@/assets/cow/cow-side.png"
import readyImage from "@/assets/cow/ready.png"

// One turntable revolution: right flank, head-on, left flank (the side frame
// mirrored), tail-on.
const FRAMES = [
  { src: cowSide, mirrored: false },
  { src: cowFront, mirrored: false },
  { src: cowSide, mirrored: true },
  { src: cowBack, mirrored: false },
]

const FRAME_MS = 1000

// A single timer drives every cow on screen so they turn in step, and it only
// runs while at least one is mounted.
const [frame, setFrame] = createSignal(0)
let mounted = 0
let timer: ReturnType<typeof setInterval> | undefined

function useFrame() {
  mounted++
  timer ??= setInterval(() => setFrame((current) => (current + 1) % FRAMES.length), FRAME_MS)
  onCleanup(() => {
    mounted--
    if (mounted > 0 || !timer) return
    clearInterval(timer)
    timer = undefined
  })
  return frame
}

export function CowWorking(props: { class?: string; title?: string }) {
  const current = useFrame()
  const showing = createMemo(() => FRAMES[current()])
  return (
    <img
      src={showing().src}
      alt=""
      aria-hidden="true"
      draggable={false}
      title={props.title}
      class={props.class}
      style={{
        "object-fit": "contain",
        transform: showing().mirrored ? "scaleX(-1)" : undefined,
      }}
    />
  )
}

export function CowReady(props: { class?: string; title?: string }) {
  return (
    <img
      src={readyImage}
      alt=""
      aria-hidden="true"
      draggable={false}
      title={props.title}
      class={props.class}
      style={{ "object-fit": "contain" }}
    />
  )
}
