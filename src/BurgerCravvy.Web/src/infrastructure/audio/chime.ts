let ctx: AudioContext | null = null

/** "Ding-dong" corto para avisar a la cocina de un pedido nuevo (sin archivos de audio). */
export function playChime() {
  try {
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    ;[880, 660].forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.18
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + 0.4)
    })
  } catch {
    /* sin audio disponible: el aviso visual basta */
  }
}
