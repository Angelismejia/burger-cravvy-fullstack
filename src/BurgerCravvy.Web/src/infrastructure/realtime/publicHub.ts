import { RealtimeChannel } from './realtimeChannel'

/** Pedidos que este navegador está siguiendo: se vuelven a unir tras cada reconexión. */
const trackedOrders = new Set<string>()

let channel: RealtimeChannel | null = null

/** Conexión pública compartida por toda la web del cliente (menú + seguimiento). */
export function publicHub(): RealtimeChannel {
  if (!channel) {
    channel = new RealtimeChannel({
      onConnected: async (c) => {
        for (const code of trackedOrders) await c.invoke('TrackOrder', code)
      },
    })
    channel.start()
  }
  return channel
}

export async function trackOrder(code: string) {
  trackedOrders.add(code)
  await publicHub().invoke('TrackOrder', code).catch(() => undefined)
}

export async function stopTrackingOrder(code: string) {
  trackedOrders.delete(code)
  await publicHub().invoke('StopTracking', code).catch(() => undefined)
}
