import { base64Decode } from "@opencode-ai/core/util/encode"

export function decode64(value: string | undefined) {
  if (value === undefined) return
  try {
    return base64Decode(value)
  } catch {
    return
  }
}

// btoa over the whole buffer overflows the argument limit on large inputs;
// chunk it. Used for encoding recorded dictation audio for the wire.
export function encode64Bytes(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  let binary = ""
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
  }
  return btoa(binary)
}
