import { useCallback, useEffect, useState } from 'react'
import { isFinal, type Order, type OrderAction } from '../../domain/order'
import { playChime } from '../../infrastructure/audio/chime'
import { ApiError } from '../../infrastructure/http/apiClient'
import { RealtimeChannel, type LiveStatus } from '../../infrastructure/realtime/realtimeChannel'
import { staffRepository } from '../../infrastructure/repositories/staffRepository'

/** Respaldo por si se pierde algún aviso en tiempo real. */
const FALLBACK_POLL_MS = 30_000

/** Aplica un pedido actualizado a la cola: los entregados y cancelados salen de ella. */
function applyUpdate(queue: Order[], updated: Order): Order[] {
  if (isFinal(updated.status)) return queue.filter((o) => o.code !== updated.code)
  return queue.some((o) => o.code === updated.code)
    ? queue.map((o) => (o.code === updated.code ? updated : o))
    : [...queue, updated]
}

/** Cola de pedidos de cocina en tiempo real (SignalR) con refresco de respaldo. */
export function useOrderQueue(token: string, onUnauthorized: () => void) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [live, setLive] = useState<LiveStatus>('connecting')
  const [highlight, setHighlight] = useState<string | null>(null)

  const handleError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) onUnauthorized()
      else setError(e instanceof Error ? e.message : 'Algo salió mal.')
    },
    [onUnauthorized],
  )

  const refresh = useCallback(async () => {
    try {
      setOrders(await staffRepository.getQueue(token))
      setError(null)
    } catch (e) {
      handleError(e)
    } finally {
      setLoaded(true)
    }
  }, [token, handleError])

  // Refresco inicial + respaldo periódico.
  useEffect(() => {
    refresh()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, FALLBACK_POLL_MS)
    return () => clearInterval(id)
  }, [refresh])

  // Tiempo real: pedidos nuevos y cambios de estado al instante.
  useEffect(() => {
    const channel = new RealtimeChannel({
      token,
      onConnected: async (c) => {
        await c.invoke('JoinKitchen')
        refresh() // por si algo cambió mientras estábamos desconectados
      },
    })
    const offs = [
      channel.on('OrderCreated', (order) => {
        setOrders((prev) => applyUpdate(prev, order))
        setHighlight(order.code)
        playChime()
      }),
      channel.on('OrderUpdated', (order) => setOrders((prev) => applyUpdate(prev, order))),
      channel.onStatus(setLive),
    ]
    channel.start()
    return () => {
      offs.forEach((off) => off())
      void channel.stop()
    }
  }, [token, refresh])

  useEffect(() => {
    if (!highlight) return
    const t = setTimeout(() => setHighlight(null), 4000)
    return () => clearTimeout(t)
  }, [highlight])

  const act = async (code: string, action: OrderAction) => {
    setBusyCode(code)
    try {
      const updated = await staffRepository.changeStatus(token, code, action)
      setOrders((prev) => applyUpdate(prev, updated))
    } catch (e) {
      handleError(e)
      refresh()
    } finally {
      setBusyCode(null)
    }
  }

  return { orders, loaded, error, busyCode, act, refresh, live, highlight }
}
