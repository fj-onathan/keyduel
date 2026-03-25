/**
 * Synthesized race sounds using Web Audio API.
 * No audio files — all generated programmatically.
 * Sounds are opt-in (controlled by uiStore.soundEnabled).
 */

let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (audioCtx && audioCtx.state !== 'closed') {
    return audioCtx
  }
  try {
    audioCtx = new AudioContext()
  } catch {
    return null
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const ctx = getContext()
  if (!ctx) return

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)

  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

/** Short high-pitched tick for countdown seconds (3, 2, 1) */
export function playCountdownTick() {
  playTone(880, 0.08, 0.15, 'square')
}

/** Higher pitched double-beep for GO */
export function playGoBeep() {
  playTone(1200, 0.1, 0.2, 'square')
  setTimeout(() => playTone(1600, 0.12, 0.2, 'square'), 80)
}

/** Bright rising tone for race finish */
export function playFinishSound() {
  const ctx = getContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2)

  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.35)
}

/** Subtle soft click for keystrokes */
export function playKeystrokeClick() {
  const ctx = getContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  // Very short noise burst for a "click" feel
  const bufferSize = ctx.sampleRate * 0.012 // 12ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.04, ctx.currentTime)

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(4000, ctx.currentTime)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  source.start(ctx.currentTime)
}
