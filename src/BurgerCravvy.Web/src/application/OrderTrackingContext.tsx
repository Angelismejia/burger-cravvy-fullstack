import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isFinal, type Order } from '../domain/order'
import { orderRepository } from '../infrastructure/repositories/orderRepository'
import { lastOrderStore } from '../infrastructure/storage/sessionStore'

const POLL_MS = 8000

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

  // Mientras el panel esté abierto y el pedido siga en curso, refresca solo.
  useEffect(() => {
    if (!isOpen || !order || isFinal(order.status)) return
    const id = setInterval(() => fetchOrder(order.code, true), POLL_MS)
    return () => clearInterval(id)
  }, [isOpen, order, fetchOrder])

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
