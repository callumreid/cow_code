/** Records the frames the user actually saw, with a bounded memory/time budget. */
export function createBrowserRecording(input: {
  image: () => HTMLImageElement | undefined
  complete: (blob: Blob) => void
  failed: () => void
}) {
  let recorder: MediaRecorder | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let draw: ReturnType<typeof setInterval> | undefined
  const stop = () => {
    if (timer) clearTimeout(timer)
    if (draw) clearInterval(draw)
    timer = undefined
    draw = undefined
    if (recorder?.state === "recording") recorder.stop()
  }
  return {
    stop,
    start() {
      const image = input.image()
      if (!image?.naturalWidth || typeof MediaRecorder === "undefined") return false
      const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/mp4"].find((mime) =>
        MediaRecorder.isTypeSupported(mime),
      )
      if (!type) return false
      const canvas = document.createElement("canvas")
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext("2d")
      if (!context) return false
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const stream = canvas.captureStream(10)
      const chunks: Blob[] = []
      let bytes = 0
      recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 1_500_000 })
      recorder.ondataavailable = (event) => {
        if (!event.data.size) return
        chunks.push(event.data)
        bytes += event.data.size
        if (bytes >= 50 * 1024 * 1024) stop()
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        input.complete(new Blob(chunks, { type }))
      }
      recorder.onerror = () => {
        stop()
        input.failed()
      }
      recorder.start(1000)
      draw = setInterval(() => {
        const current = input.image()
        if (current?.complete && current.naturalWidth) context.drawImage(current, 0, 0, canvas.width, canvas.height)
      }, 100)
      timer = setTimeout(stop, 5 * 60_000)
      return true
    },
  }
}

export function downloadBrowserArtifact(url: string, filename: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
}
