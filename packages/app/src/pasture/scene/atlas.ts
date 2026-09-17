import * as THREE from "three"
import { hashString, mulberry32 } from "@/pasture/rng"
import type { Breed } from "../breeds"
import { COLLAR_PALETTE } from "../collars"

/**
 * One texture per breed: the coat painted across the top half (it tiles
 * horizontally, so every cow of a breed can wear it with its own offset),
 * then rows of flat colour swatches for the muzzle, hooves, horns, bell and
 * every collar colour. Every part of a cow samples this one atlas, so a whole
 * cow is a handful of merged meshes sharing one material.
 */
export const ATLAS = 512
const COAT_H = 256
const GUTTER = 16
const CELL = 32
const CELLS_PER_ROW = ATLAS / CELL

const TAU = Math.PI * 2

export const SWATCH = {
  muzzle: 0,
  dark: 1,
  horn: 2,
  white: 3,
  brass: 4,
  udder: 5,
  body: 6,
  face: 7,
  hoof: 8,
  nose: 9,
  tuft: 10,
  hornTip: 11,
  brassDark: 12,
} as const

/** Collar colours live on the second swatch row, in palette order. */
export const collarSwatch = (index: number) => CELLS_PER_ROW + index

export function swatchUV(index: number): [number, number] {
  const col = index % CELLS_PER_ROW
  const row = Math.floor(index / CELLS_PER_ROW)
  const u = (col + 0.5) / CELLS_PER_ROW
  const y = COAT_H + GUTTER + row * CELL + CELL / 2
  return [u, 1 - y / ATLAS]
}

/** The coat occupies v in [COAT_V0, 1]. */
export const COAT_V0 = 1 - COAT_H / ATLAS

type Ellipse = { x: number; y: number; rx: number; ry: number; rot: number }

function blobShape(rand: () => number, cx: number, cy: number, size: number): Ellipse[] {
  const shape: Ellipse[] = []
  const count = 6 + Math.floor(rand() * 5)
  for (let i = 0; i < count; i++) {
    shape.push({
      x: cx + (rand() - 0.5) * size * 0.9,
      y: cy + (rand() - 0.5) * size * 0.55,
      rx: size * (0.28 + rand() * 0.34),
      ry: size * (0.2 + rand() * 0.3),
      rot: rand() * Math.PI,
    })
  }
  return shape
}

function drawShape(ctx: CanvasRenderingContext2D, color: string, shape: Ellipse[], dx: number) {
  ctx.fillStyle = color
  for (const e of shape) {
    ctx.beginPath()
    ctx.ellipse(e.x + dx, e.y, e.rx, e.ry, e.rot, 0, TAU)
    ctx.fill()
  }
}

function paintCoat(ctx: CanvasRenderingContext2D, breed: Breed, rand: () => number) {
  const W = ATLAS
  const H = COAT_H
  ctx.fillStyle = breed.body
  ctx.fillRect(0, 0, W, H + GUTTER)
  const patch = breed.patch ?? breed.body
  // Anything painted near the left or right edge is repeated one width over so the coat tiles.
  const wrapped = (draw: (dx: number) => void) => {
    for (const dx of [-W, 0, W]) draw(dx)
  }
  if (breed.pattern === "patches") {
    const count = 6 + Math.floor(rand() * 5)
    for (let i = 0; i < count; i++) {
      const shape = blobShape(rand, rand() * W, rand() * H, 55 + rand() * 80)
      wrapped((dx) => drawShape(ctx, patch, shape, dx))
    }
  } else if (breed.pattern === "belt") {
    // v runs along the body, so a belt is a horizontal band mid-coat, edges softened.
    const y0 = H * 0.36
    const y1 = H * 0.6
    const grad = ctx.createLinearGradient(0, y0 - 10, 0, y1 + 10)
    grad.addColorStop(0, "rgba(0,0,0,0)")
    grad.addColorStop(0.08, patch)
    grad.addColorStop(0.92, patch)
    grad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, y0 - 10, W, y1 - y0 + 20)
  } else if (breed.pattern === "backstripe") {
    // u runs around the body: the back sits at u = 0.5, the belly at u = 0 and 1.
    ctx.fillStyle = patch
    ctx.fillRect(W * 0.43, 0, W * 0.14, H)
    ctx.fillRect(0, 0, W * 0.05, H)
    ctx.fillRect(W * 0.95, 0, W * 0.05, H)
  } else if (breed.pattern === "roan") {
    for (let i = 0; i < 520; i++) {
      ctx.globalAlpha = 0.45 + rand() * 0.55
      ctx.fillStyle = patch
      const x = rand() * W
      const y = rand() * H
      const r = 1.5 + rand() * 5
      wrapped((dx) => {
        ctx.beginPath()
        ctx.arc(x + dx, y, r, 0, TAU)
        ctx.fill()
      })
    }
    ctx.globalAlpha = 1
  } else if (breed.pattern === "nguni") {
    // Nguni hides: a handful of large irregular patches, then a shower of spots
    // and specks that gets denser toward the patches, like ink bleeding through.
    const count = 3 + Math.floor(rand() * 3)
    const centres: Array<[number, number]> = []
    for (let i = 0; i < count; i++) {
      const cx = rand() * W
      const cy = rand() * H
      centres.push([cx, cy])
      const shape = blobShape(rand, cx, cy, 70 + rand() * 90)
      wrapped((dx) => drawShape(ctx, patch, shape, dx))
    }
    for (let i = 0; i < 900; i++) {
      const [cx, cy] = centres[Math.floor(rand() * centres.length)]
      const near = rand() < 0.65
      const x = near ? cx + (rand() - 0.5) * 220 : rand() * W
      const y = near ? cy + (rand() - 0.5) * 140 : rand() * H
      const r = 1.5 + rand() * (near ? 9 : 4)
      ctx.globalAlpha = 0.7 + rand() * 0.3
      ctx.fillStyle = patch
      wrapped((dx) => {
        ctx.beginPath()
        ctx.ellipse(x + dx, y, r, r * (0.6 + rand() * 0.6), rand() * Math.PI, 0, TAU)
        ctx.fill()
      })
    }
    ctx.globalAlpha = 1
  } else if (breed.pattern === "whiteface") {
    // A white belly to go with the white face.
    for (const [x, w] of [
      [0, W * 0.07],
      [W * 0.93, W * 0.07],
    ]) {
      const grad = ctx.createLinearGradient(x, 0, x + w, 0)
      grad.addColorStop(0, x === 0 ? patch : "rgba(0,0,0,0)")
      grad.addColorStop(1, x === 0 ? "rgba(0,0,0,0)" : patch)
      ctx.fillStyle = grad
      ctx.fillRect(x, 0, w, H)
    }
  }
  // Fur: short strokes along the body, heavier on the shaggy breeds.
  ctx.globalAlpha = breed.shaggy ? 0.14 : 0.07
  const strokes = breed.shaggy ? 3200 : 1800
  for (let i = 0; i < strokes; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#000000" : "#ffffff"
    ctx.fillRect(rand() * W, rand() * H, breed.shaggy ? 2 : 1, 3 + rand() * (breed.shaggy ? 10 : 5))
  }
  ctx.globalAlpha = 1
  // Ambient occlusion under the belly: the coat is darkest at u = 0 and 1.
  const shade = ctx.createLinearGradient(0, 0, W, 0)
  shade.addColorStop(0, "rgba(0,0,0,0.32)")
  shade.addColorStop(0.2, "rgba(0,0,0,0.06)")
  shade.addColorStop(0.5, "rgba(255,255,255,0.05)")
  shade.addColorStop(0.8, "rgba(0,0,0,0.06)")
  shade.addColorStop(1, "rgba(0,0,0,0.32)")
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, W, H)
}

function paintSwatch(ctx: CanvasRenderingContext2D, index: number, color: string) {
  const col = index % CELLS_PER_ROW
  const row = Math.floor(index / CELLS_PER_ROW)
  ctx.fillStyle = color
  ctx.fillRect(col * CELL, COAT_H + GUTTER + row * CELL, CELL, CELL)
}

function darken(hex: string, amount: number) {
  const c = new THREE.Color(hex)
  c.multiplyScalar(1 - amount)
  return `#${c.getHexString()}`
}

function buildAtlas(breed: Breed): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = ATLAS
  canvas.height = ATLAS
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = breed.body
  ctx.fillRect(0, 0, ATLAS, ATLAS)
  paintCoat(ctx, breed, mulberry32(hashString(breed.id)))
  const light = new THREE.Color(breed.body).getHSL({ h: 0, s: 0, l: 0 }).l > 0.5
  paintSwatch(ctx, SWATCH.muzzle, breed.muzzle)
  paintSwatch(ctx, SWATCH.dark, "#1d1917")
  paintSwatch(ctx, SWATCH.horn, light ? "#d9ccb4" : "#e6dac3")
  paintSwatch(ctx, SWATCH.white, "#ffffff")
  paintSwatch(ctx, SWATCH.brass, "#d4a63a")
  paintSwatch(ctx, SWATCH.udder, "#efb8ae")
  paintSwatch(ctx, SWATCH.body, breed.body)
  paintSwatch(ctx, SWATCH.face, breed.pattern === "whiteface" ? (breed.patch ?? breed.body) : breed.body)
  paintSwatch(ctx, SWATCH.hoof, "#2a221f")
  paintSwatch(ctx, SWATCH.nose, darken(breed.muzzle, 0.45))
  paintSwatch(ctx, SWATCH.tuft, light ? "#3a312c" : "#15120f")
  paintSwatch(ctx, SWATCH.hornTip, "#3d342c")
  paintSwatch(ctx, SWATCH.brassDark, "#8a6a1f")
  COLLAR_PALETTE.forEach((color, index) => paintSwatch(ctx, collarSwatch(index), color))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.anisotropy = 4
  return texture
}

const atlases = new Map<string, THREE.CanvasTexture>()

/** The atlas for a breed, painted once and shared by every cow of that breed. */
export function atlasFor(breed: Breed): THREE.CanvasTexture {
  let texture = atlases.get(breed.id)
  if (!texture) {
    texture = buildAtlas(breed)
    atlases.set(breed.id, texture)
  }
  return texture
}

export function disposeAtlases() {
  for (const texture of atlases.values()) texture.dispose()
  atlases.clear()
}

// ---------------------------------------------------------------- the field

export function groundTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")!
  const rand = mulberry32(7)
  ctx.fillStyle = "#5fae4a"
  ctx.fillRect(0, 0, 1024, 1024)
  const tones = ["#56a443", "#6ab854", "#4f9c3f", "#73bf5a", "#62ab4b", "#7cc463"]
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = tones[Math.floor(rand() * tones.length)]
    ctx.globalAlpha = 0.25 + rand() * 0.35
    ctx.beginPath()
    ctx.ellipse(rand() * 1024, rand() * 1024, 18 + rand() * 70, 10 + rand() * 40, rand() * Math.PI, 0, TAU)
    ctx.fill()
  }
  ctx.globalAlpha = 0.22
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#3f8a33" : "#9ad77c"
    ctx.fillRect(rand() * 1024, rand() * 1024, 2, 3 + rand() * 5)
  }
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(7, 7)
  texture.anisotropy = 8
  return texture
}

export type Sign = { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; name: string; count: number }

export function paintSign(sign: Sign) {
  const ctx = sign.canvas.getContext("2d")!
  const { width, height } = sign.canvas
  ctx.fillStyle = "#c9a26b"
  ctx.fillRect(0, 0, width, height)
  // Wood grain.
  const rand = mulberry32(hashString(sign.name))
  ctx.strokeStyle = "rgba(120, 80, 40, 0.18)"
  ctx.lineWidth = 2
  for (let i = 0; i < 26; i++) {
    const y = rand() * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(width * 0.3, y + (rand() - 0.5) * 18, width * 0.7, y + (rand() - 0.5) * 18, width, y + (rand() - 0.5) * 10)
    ctx.stroke()
  }
  ctx.strokeStyle = "#8a6238"
  ctx.lineWidth = 14
  ctx.strokeRect(7, 7, width - 14, height - 14)
  ctx.fillStyle = "#3b2a1a"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = "bold 58px 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif"
  ctx.fillText(sign.name, width / 2, height * 0.38, width - 60)
  ctx.font = "600 40px 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif"
  ctx.fillText(`${sign.count} cow${sign.count === 1 ? "" : "s"}`, width / 2, height * 0.74)
  sign.texture.needsUpdate = true
}
