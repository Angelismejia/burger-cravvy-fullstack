import type { HubEvents, LiveChannel, LiveStatus } from '../realtime/realtimeChannel'
import { onDemoEvent } from './demoSession'

interface Options {
  onConnected?: (channel: LiveChannel) => Promise<void> | void
}

/** Canal «en vivo» de la demo: los avisos llegan desde las pestañas de la misma demo, sin servidor. */
export class DemoChannel implements LiveChannel {
  private started = false

  constructor(private readonly options: Options = {}) {}

  start() {
    if (this.started) return
    this.started = true
    void this.options.onConnected?.(this)
  }

  on<K extends keyof HubEvents>(event: K, handler: (payload: HubEvents[K]) => void) {
    return onDemoEvent(event, handler)
  }

  /** Unirse a grupos (cocina, seguimiento) no hace falta: todas las pestañas reciben todo. */
  async invoke() {}

  onStatus(listener: (s: LiveStatus) => void) {
    listener('live')
    return () => {}
  }

  async stop() {}
}
