export function voiceDevice(host, request, changed, caption, notice) {
  let current
  function cancelSounds(c) {
    for (const source of c.playing) {
      try {
        source.stop()
      } catch {}
    }
    c.playing.clear()
    c.playAt = 0
  }
  function close(reason) {
    const c = current
    if (!c) return
    current = null
    clearTimeout(c.timer)
    c.mic?.close()
    c.processor?.disconnect()
    c.source?.disconnect()
    c.gain?.disconnect()
    cancelSounds(c)
    c.audio.close().catch(() => {})
    if (c.id) request("/voice/close", { id: c.id }).catch(() => {})
    changed(false)
    caption("")
    if (reason) notice(reason)
  }
  function play(c, event) {
    const bytes = atob(event.data)
    const n = Math.floor(bytes.length / 2)
    if (n < 2) return
    const b = c.audio.createBuffer(1, n, event.rate)
    const floats = b.getChannelData(0)
    for (let i = 0; i < n; i++) {
      const raw = bytes.charCodeAt(2 * i) | (bytes.charCodeAt(2 * i + 1) << 8)
      floats[i] = ((raw << 16) >> 16) / 32768
    }
    const source = c.audio.createBufferSource()
    source.buffer = b
    source.connect(c.audio.destination)
    c.playAt = Math.max(c.audio.currentTime + 0.025, c.playAt)
    source.start(c.playAt)
    c.playAt += b.duration
    c.playing.add(source)
    source.onended = () => {
      c.playing.delete(source)
      source.disconnect()
    }
  }
  async function pump(c) {
    if (current !== c) return
    try {
      const count = Math.min(c.samples.length, 12000)
      const samples = c.samples.splice(0, count)
      const pcm = new Uint8Array(count * 2)
      const view = new DataView(pcm.buffer)
      samples.forEach((v, i) => view.setInt16(i * 2, Math.round(Math.max(-1, Math.min(1, v)) * 32767), true))
      const audio = count ? btoa(String.fromCharCode(...pcm)) : ""
      const result = await request("/voice/exchange", {
        id: c.id,
        after: c.after,
        inputSeq: audio ? ++c.inputSeq : c.inputSeq,
        audio,
      })
      if (current !== c) return
      for (const e of result.events) {
        if (e.seq <= c.after) continue
        c.after = e.seq
        if (e.type === "interrupt") cancelSounds(c)
        if (e.type === "audio") play(c, e)
        if (e.type === "caption") caption(e.speaker + " · " + e.text)
        if (e.type === "turn") caption("Listening…")
        if (e.type === "closed") {
          close(e.reason)
          return
        }
      }
      if (c.samples.length > 48000)
        throw new Error("The connection is too slow for live audio. Reconnect or continue in chat.")
      c.timer = setTimeout(() => pump(c), c.samples.length > 5000 ? 0 : 100)
    } catch (error) {
      if (current === c) close(error.message)
    }
  }
  async function start(context) {
    if (current) {
      close()
      return
    }
    const Audio = window.AudioContext || window.webkitAudioContext
    if (!Audio) throw new Error("This device cannot open an audio session.")
    const c = { audio: new Audio(), samples: [], playing: new Set(), playAt: 0, inputSeq: 0, after: 0 }
    current = c
    changed(true)
    caption("Connecting voice…")
    try {
      // Both requests start during the tap, which iOS requires for audio playback.
      const resumed = c.audio.resume()
      const mic = await host.openMicrophone()
      if (current !== c) {
        mic.close()
        return
      }
      c.mic = mic
      mic.onEnded(() => {
        if (current === c) close("Microphone disconnected.")
      })
      await resumed
      c.source = c.audio.createMediaStreamSource(mic.stream)
      c.processor = c.audio.createScriptProcessor(2048, 1, 1)
      c.gain = c.audio.createGain()
      c.gain.gain.value = 0
      c.source.connect(c.processor)
      c.processor.connect(c.gain)
      c.gain.connect(c.audio.destination)
      let phase = 0,
        sum = 0,
        used = 0
      c.processor.onaudioprocess = (e) => {
        if (!c.id || current !== c) return
        for (const x of e.inputBuffer.getChannelData(0)) {
          sum += x
          used++
          phase += 16000
          if (phase >= c.audio.sampleRate) {
            c.samples.push(sum / used)
            phase -= c.audio.sampleRate
            sum = 0
            used = 0
          }
        }
      }
      const result = await request("/voice/open", context)
      if (current !== c) {
        request("/voice/close", { id: result.id }).catch(() => {})
        return
      }
      c.id = result.id
      caption("Listening…")
      pump(c)
    } catch (error) {
      if (current === c) {
        close()
        throw error
      }
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) close()
  })
  window.addEventListener("pagehide", () => close())
  return {
    start,
    close,
    active: () => Boolean(current?.id),
    text: (value) => request("/voice/text", { id: current?.id, text: value }),
  }
}
