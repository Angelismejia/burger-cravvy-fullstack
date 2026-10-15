import { useCallback, useEffect, useState } from 'react'
import type { Order, OrderAction } from '../../domain/order'
import { ApiError } from '../../infrastructure/http/apiClient'
import { staffRepository } from '../../infrastructure/repositories/staffRepository'

const POLL_MS = 5000

/** Cola de pedidos de cocina con refresco automático cada 5 s. */
export function useOrderQueue(token: string, onUnauthorized: () => void) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyCode, setBusyCode] = useState<string | null>(null)

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

  useEffect(() => {
    refresh()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    return () => clearInterval(id)
  }, [refresh])

  const act = async (code: string, action: OrderAction) => {
    setBusyCode(code)
    try {
      const updated = await staffRepository.changeStatus(token, code, action)
      // Entregados y cancelados salen de la cola.
      setOrders((prev) =>
        updated.status === 'Delivered' || updated.status === 'Cancelled'
          ? prev.filter((o) => o.code !== code)
          : prev.map((o) => (o.code === code ? updated : o)),
      )
    } catch (e) {
      handleError(e)
      refresh()
    } finally {
      setBusyCode(null)
    }
  }

  return { orders, loaded, error, busyCode, act, refresh }
}
