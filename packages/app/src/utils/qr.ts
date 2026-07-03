// Self-contained QR code encoder: byte mode, error correction level M,
// versions 1-10 (up to 213 bytes of UTF-8 payload). The desktop CSP blocks
// remote scripts, so QR rendering (e.g. the remote-access join dialog) must be
// generated locally. Algorithm ported from Project Nayuki's QR Code generator
// library (MIT).

// Error-correction metadata for level M, versions 1-10.
const EC_CODEWORDS_PER_BLOCK = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26]
const EC_BLOCKS = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5]
const PENALTY_N1 = 3
const PENALTY_N2 = 3
const PENALTY_N3 = 40
const PENALTY_N4 = 10

function rawDataModules(version: number) {
  const numAlign = Math.floor(version / 7) + 2
  const alignDeduction = version >= 2 ? (25 * numAlign - 10) * numAlign - 55 : 0
  return (16 * version + 128) * version + 64 - alignDeduction - (version >= 7 ? 36 : 0)
}

function dataCodewords(version: number) {
  return Math.floor(rawDataModules(version) / 8) - EC_CODEWORDS_PER_BLOCK[version - 1] * EC_BLOCKS[version - 1]
}

function getBit(value: number, index: number) {
  return ((value >>> index) & 1) !== 0
}

// GF(2^8/0x11D) product, used by the Reed-Solomon error-correction generator.
function gfMultiply(x: number, y: number) {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z
}

function rsDivisor(degree: number) {
  const result: number[] = Array.from({ length: degree }, (_, i) => (i === degree - 1 ? 1 : 0))
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMultiply(result[j], root)
      if (j + 1 < result.length) result[j] ^= result[j + 1]
    }
    root = gfMultiply(root, 0x02)
  }
  return result
}

function rsRemainder(data: number[], divisor: number[]) {
  const result = divisor.map(() => 0)
  data.forEach((b) => {
    const factor = b ^ (result.shift() ?? 0)
    result.push(0)
    divisor.forEach((coef, i) => {
      result[i] ^= gfMultiply(coef, factor)
    })
  })
  return result
}

function buildCodewords(data: Uint8Array, version: number) {
  const capacity = dataCodewords(version) * 8
  const bits: number[] = []
  const appendBits = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  appendBits(4, 4) // byte-mode indicator
  appendBits(data.length, version <= 9 ? 8 : 16)
  data.forEach((byte) => appendBits(byte, 8))
  appendBits(0, Math.min(4, capacity - bits.length)) // terminator
  appendBits(0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) appendBits(pad, 8)

  const codewords = Array.from({ length: bits.length / 8 }, (_, i) =>
    bits.slice(i * 8, i * 8 + 8).reduce((acc, bit) => (acc << 1) | bit, 0),
  )

  // Split into blocks, append Reed-Solomon ECC, then interleave.
  const numBlocks = EC_BLOCKS[version - 1]
  const blockEccLen = EC_CODEWORDS_PER_BLOCK[version - 1]
  const rawCodewords = Math.floor(rawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)
  const divisor = rsDivisor(blockEccLen)
  const blocks: number[][] = []
  let k = 0
  for (let i = 0; i < numBlocks; i++) {
    const dat = codewords.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1))
    k += dat.length
    const ecc = rsRemainder(dat, divisor)
    if (i < numShortBlocks) dat.push(0)
    blocks.push(dat.concat(ecc))
  }
  const result: number[] = []
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i])
    })
  }
  return result
}

function finderPenaltyCountPatterns(runHistory: number[]) {
  const n = runHistory[1]
  const core = n > 0 && runHistory[2] === n && runHistory[3] === n * 3 && runHistory[4] === n && runHistory[5] === n
  return (
    (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
    (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0)
  )
}

function finderPenaltyAddHistory(currentRunLength: number, runHistory: number[], size: number) {
  const adjusted = runHistory[0] === 0 ? currentRunLength + size : currentRunLength // light border on initial run
  runHistory.pop()
  runHistory.unshift(adjusted)
}

/**
 * Encode text as a QR symbol (byte mode, EC level M, versions 1-10, standard
 * mask selection). Returns the module matrix: `true` = dark. Throws when the
 * payload exceeds version 10 capacity (213 bytes).
 */
export function qrEncode(text: string): boolean[][] {
  const data = new TextEncoder().encode(text)
  const version = Array.from({ length: 10 }, (_, i) => i + 1).find(
    (v) => 4 + (v <= 9 ? 8 : 16) + data.length * 8 <= dataCodewords(v) * 8,
  )
  if (!version) throw new Error(`QR payload too long: ${data.length} bytes`)

  const size = version * 4 + 17
  const modules = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
  const isFunction = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
  const setFunction = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark
    isFunction[y][x] = true
  }

  // Timing patterns.
  for (let i = 0; i < size; i++) {
    setFunction(6, i, i % 2 === 0)
    setFunction(i, 6, i % 2 === 0)
  }

  // Finder patterns with separators.
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) setFunction(x, y, dist !== 2 && dist !== 4)
      }
    }
  }
  drawFinder(3, 3)
  drawFinder(size - 4, 3)
  drawFinder(3, size - 4)

  // Alignment patterns.
  const numAlign = Math.floor(version / 7) + 2
  const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const alignPos =
    version === 1 ? [] : [6, ...Array.from({ length: numAlign - 1 }, (_, i) => size - 7 - (numAlign - 2 - i) * step)]
  alignPos.forEach((py, i) => {
    alignPos.forEach((px, j) => {
      const corner =
        (i === 0 && j === 0) || (i === 0 && j === numAlign - 1) || (i === numAlign - 1 && j === 0)
      if (corner) return
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) setFunction(px + dx, py + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    })
  })

  // Format info (15 bits, EC level M = 0b00, BCH(15,5), masked with 0x5412).
  const drawFormatBits = (mask: number) => {
    const formatData = mask // EC level M contributes 0b00 to the top bits
    let rem = formatData
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((formatData << 10) | rem) ^ 0x5412
    for (let i = 0; i <= 5; i++) setFunction(8, i, getBit(bits, i))
    setFunction(8, 7, getBit(bits, 6))
    setFunction(8, 8, getBit(bits, 7))
    setFunction(7, 8, getBit(bits, 8))
    for (let i = 9; i < 15; i++) setFunction(14 - i, 8, getBit(bits, i))
    for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, getBit(bits, i))
    for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, getBit(bits, i))
    setFunction(8, size - 8, true) // dark module
  }
  drawFormatBits(0)

  // Version info (18 bits, BCH(18,6)) for versions 7+.
  if (version >= 7) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i)
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      setFunction(a, b, bit)
      setFunction(b, a, bit)
    }
  }

  // Place data codewords in the zigzag order.
  const codewords = buildCodewords(data, version)
  let bitIndex = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!isFunction[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = getBit(codewords[bitIndex >> 3], 7 - (bitIndex & 7))
          bitIndex++
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    const invert = (x: number, y: number) => {
      const masked =
        mask === 0
          ? (x + y) % 2 === 0
          : mask === 1
            ? y % 2 === 0
            : mask === 2
              ? x % 3 === 0
              : mask === 3
                ? (x + y) % 3 === 0
                : mask === 4
                  ? (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
                  : mask === 5
                    ? ((x * y) % 2) + ((x * y) % 3) === 0
                    : mask === 6
                      ? (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
                      : (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
      return masked && !isFunction[y][x]
    }
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (invert(x, y)) modules[y][x] = !modules[y][x]
      }
    }
  }

  const penaltyScore = () => {
    let result = 0
    // Adjacent same-color runs and finder-like patterns, per row then column.
    for (let axis = 0; axis < 2; axis++) {
      for (let major = 0; major < size; major++) {
        const runHistory = [0, 0, 0, 0, 0, 0, 0]
        let runColor = false
        let runLength = 0
        for (let minor = 0; minor < size; minor++) {
          const color = axis === 0 ? modules[major][minor] : modules[minor][major]
          if (color === runColor) {
            runLength++
            if (runLength === 5) result += PENALTY_N1
            else if (runLength > 5) result++
          } else {
            finderPenaltyAddHistory(runLength, runHistory, size)
            if (!runColor) result += finderPenaltyCountPatterns(runHistory) * PENALTY_N3
            runColor = color
            runLength = 1
          }
        }
        // Terminate the final run against the light border.
        const terminalRun = runColor ? size : runLength + size
        if (runColor) finderPenaltyAddHistory(runLength, runHistory, size)
        finderPenaltyAddHistory(terminalRun, runHistory, size)
        result += finderPenaltyCountPatterns(runHistory) * PENALTY_N3
      }
    }
    // 2x2 blocks of the same color.
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const color = modules[y][x]
        if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1])
          result += PENALTY_N2
      }
    }
    // Dark/light balance.
    const dark = modules.flat().filter((module) => module).length
    const total = size * size
    result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * PENALTY_N4
    return result
  }

  const best = Array.from({ length: 8 }, (_, mask) => mask).reduce(
    (acc, mask) => {
      applyMask(mask)
      drawFormatBits(mask)
      const penalty = penaltyScore()
      applyMask(mask) // XOR mask is its own inverse
      return penalty < acc.penalty ? { mask, penalty } : acc
    },
    { mask: -1, penalty: Number.POSITIVE_INFINITY },
  )
  applyMask(best.mask)
  drawFormatBits(best.mask)

  return modules
}

/** SVG path data drawing each dark module as a unit square at its (x, y). */
export function qrSvgPath(modules: boolean[][]) {
  return modules
    .flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])))
    .join("")
}
