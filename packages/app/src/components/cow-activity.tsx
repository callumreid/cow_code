import { createMemo, createSignal, onCleanup } from "solid-js"
import brahman2 from "@/assets/cow/brahman-cow-2.png"
import brahman3 from "@/assets/cow/brahman-cow-3.png"
import conductor1 from "@/assets/cow/brahman-cow-conductor.png"
import conductor2 from "@/assets/cow/brahman-cow-conductor-2.png"
import cowSide from "@/assets/cow/cow-side.png"
import cow3 from "@/assets/cow/cow-3.png"
import cow4 from "@/assets/cow/cow-4.png"
import cow5 from "@/assets/cow/cow-5.png"
import cowpolk1 from "@/assets/cow/cowpolk-cow.png"
import cowpolk2 from "@/assets/cow/cowpolk-cow-2.png"
import fancy2 from "@/assets/cow/fancy-cow-2.png"
import fancy3 from "@/assets/cow/fancy-cow-3.png"
import guernsey2 from "@/assets/cow/guernsey-cow-2.png"
import guernsey3 from "@/assets/cow/guernsey-cow-3.png"
import highland2 from "@/assets/cow/highland-cow-2.png"
import highland3 from "@/assets/cow/highland-cow-3.png"
import highland4 from "@/assets/cow/highland-cow-4.png"
import jersey2 from "@/assets/cow/jersey-cow-2.png"
import jersey3 from "@/assets/cow/jersey-cow-3.png"
import readyImage from "@/assets/cow/ready.png"
import seaCow1 from "@/assets/cow/sea-cow.png"
import seaCow2 from "@/assets/cow/sea-cow-2.png"
import upsideDown1 from "@/assets/cow/upside-down-cow.png"
import upsideDown2 from "@/assets/cow/upside-down-cow-2.png"
import { cowTypeForSeed } from "./cow-variant"

type CowFrame = { src: string; mirrored?: boolean }

// Each thread keeps one Slack cow breed. Paired left/right emoji become a
// four-step turntable by mirroring them for the return half of the revolution.
const CLASSIC: CowFrame[] = [
  { src: cowSide, mirrored: false },
  { src: cow4, mirrored: false },
  { src: cow3, mirrored: false },
  { src: cow5, mirrored: false },
]
const paired = (left: string, right: string): CowFrame[] => [
  { src: left },
  { src: right },
  { src: left, mirrored: true },
  { src: right, mirrored: true },
]
const COWS: CowFrame[][] = [
  CLASSIC,
  paired(brahman2, brahman3),
  paired(conductor1, conductor2),
  paired(cowpolk1, cowpolk2),
  paired(fancy2, fancy3),
  paired(guernsey2, guernsey3),
  [{ src: highland2 }, { src: highland4 }, { src: highland3 }, { src: highland4, mirrored: true }],
  paired(jersey2, jersey3),
  paired(seaCow1, seaCow2),
  paired(upsideDown1, upsideDown2),
]

const FRAME_MS = 1000

// A single timer drives every cow on screen so they turn in step, and it only
// runs while at least one is mounted.
const [frame, setFrame] = createSignal(0)
let mounted = 0
let timer: ReturnType<typeof setInterval> | undefined

function useFrame() {
  mounted++
  timer ??= setInterval(() => setFrame((current) => (current + 1) % CLASSIC.length), FRAME_MS)
  onCleanup(() => {
    mounted--
    if (mounted > 0 || !timer) return
    clearInterval(timer)
    timer = undefined
  })
  return frame
}

export function CowWorking(props: { seed: string; class?: string; title?: string }) {
  const current = useFrame()
  const frames = createMemo(() => COWS[cowTypeForSeed(props.seed, COWS.length)])
  const showing = createMemo(() => frames()[current() % frames().length])
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
