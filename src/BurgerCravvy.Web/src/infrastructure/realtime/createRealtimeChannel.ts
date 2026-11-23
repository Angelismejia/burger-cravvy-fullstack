import { DemoChannel } from '../demo/demoChannel'
import { isDemo } from '../demo/demoSession'
import { RealtimeChannel, type LiveChannel } from './realtimeChannel'

/** Conexión en vivo: SignalR contra la API, o el canal entre pestañas en el modo demo. */
export function createRealtimeChannel(options: ConstructorParameters<typeof RealtimeChannel>[0] = {}): LiveChannel {
  return isDemo ? new DemoChannel(options) : new RealtimeChannel(options)
}
