import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isFinal, type Order } from '../domain/order'
import { orderRepository } from '../infrastructure/repositories/orderRepository'
import { publicHub, stopTrackingOrder, trackOrder } from '../infrastructure/realtime/publicHub'
import { lastOrderStore } from '../infrastructure/storage/sessionStore'

/** Respaldo por si se pierde algún aviso en tiempo real. */
const FALLBACK_POLL_MS = 30_000

interface TrackingValue {
  isOpen: boolean
  code: string
  order: Order | null
  error: string | null
  loading: boolean
  open: (code?: string) => void
  close: () => void
  track: (code: string) => void
}

const TrackingContext = createContext<TrackingValue | null>(null)

/** Caso de uso del cliente: seguir el estado de su pedido por código. */
export function OrderTrackingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState(lastOrderStore.load)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchOrder = useCallback(async (c: string, silent = false) => {
    if (!silent) setLoading(true)
    try {
      setOrder(await orderRepository.getByCode(c))
      setError(null)
    } catch (e) {
      setOrder(null)
      setError(e instanceof Error ? e.message : 'No pudimos encontrar el pedido.')
    } finally {
      setLoading(false)
    }
  }, [])

  const track = useCallback(
    (c: string) => {
      const clean = c.trim().toUpperCase()
      setCode(clean)
      if (clean) fetchOrder(clean)
    },
    [fetchOrder],
  )

  const trackedCode = order && !isFinal(order.status) ? order.code : null

  // Mientras el diálogo esté abierto y el pedido siga en curso: avisos en tiempo real
  // de su grupo en SignalR, más un refresco lento de respaldo.
  useEffect(() => {
    if (!isOpen || !trackedCode) return
    void trackOrder(trackedCode)
    const off = publicHub().on('OrderUpdated', (updated) => {
      if (updated.code === trackedCode) setOrder(updated)
    })
    const id = setInterval(() => fetchOrder(trackedCode, true), FALLBACK_POLL_MS)
    return () => {
      off()
      clearInterval(id)
      void stopTrackingOrder(trackedCode)
    }
  }, [isOpen, trackedCode, fetchOrder])

  const value = useMemo<TrackingValue>(
    () => ({
      isOpen,
      code,
      order,
      error,
      loading,
      open: (c) => {
        setIsOpen(true)
        const target = c ?? code
        if (c) lastOrderStore.save(c)
        if (target) track(target)
      },
      close: () => setIsOpen(false),
      track,
    }),
    [isOpen, code, order, error, loading, track],
  )

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}

export function useOrderTracking() {
  const ctx = useContext(TrackingContext)
  if (!ctx) throw new Error('useOrderTracking debe usarse dentro de OrderTrackingProvider')
  return ctx
}
