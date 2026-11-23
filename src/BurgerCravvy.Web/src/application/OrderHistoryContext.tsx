import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isFinal, type Order } from '../domain/order'
import { countActive, rememberCode, sortHistory } from '../domain/orderHistory'
import { ApiError } from '../infrastructure/http/apiClient'
import { publicHub, stopTrackingOrder, trackOrder } from '../infrastructure/realtime/publicHub'
import { orderRepository } from '../infrastructure/repositories/orderRepository'
import { orderHistoryStore } from '../infrastructure/storage/sessionStore'

/** Respaldo por si se pierde algún aviso en tiempo real. */
const FALLBACK_POLL_MS = 30_000

interface HistoryValue {
  /** Pedidos ya cargados, en el orden en que se muestran. */
  orders: Order[]
  /** Cuántos pedidos guardados hay (aunque aún no se hayan cargado). */
  size: number
  activeCount: number
  loading: boolean
  /** Algunos pedidos no se pudieron cargar (API apagada o dormida). */
  failed: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  /** Guarda un pedido en el historial (al hacerlo o al buscarlo por código). */
  remember: (order: Order) => void
  clear: () => void
}

const HistoryContext = createContext<HistoryValue | null>(null)

/** Caso de uso del cliente: ver los pedidos hechos desde este navegador, con su estado en vivo. */
export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes] = useState<string[]>(orderHistoryStore.load)
  const [byCode, setByCode] = useState<Record<string, Order>>({})
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const codesRef = useRef(codes)
  codesRef.current = codes

  useEffect(() => orderHistoryStore.save(codes), [codes])

  /** Vuelve a pedir cada pedido. Los que ya no existen salen del historial. */
  const refresh = useCallback(async (silent = false) => {
    const current = codesRef.current
    if (current.length === 0) return
    if (!silent) setLoading(true)
    const results = await Promise.allSettled(current.map((c) => orderRepository.getByCode(c)))
    const found: Record<string, Order> = {}
    const gone = new Set<string>()
    let anyFailed = false
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') found[r.value.code] = r.value
      else if (r.reason instanceof ApiError && r.reason.status === 404) gone.add(current[i])
      else anyFailed = true
    })
    setByCode((prev) => ({ ...prev, ...found }))
    if (gone.size) setCodes((prev) => prev.filter((c) => !gone.has(c)))
    setFailed(anyFailed)
    setLoading(false)
  }, [])

  // Al cargar la web: así el contador de pedidos en curso ya sale al día.
  useEffect(() => {
    void refresh(true)
  }, [refresh])

  // Cambios de estado en tiempo real de cualquier pedido del historial.
  useEffect(
    () =>
      publicHub().on('OrderUpdated', (updated) => {
        if (codesRef.current.includes(updated.code)) setByCode((prev) => ({ ...prev, [updated.code]: updated }))
      }),
    [],
  )

  const activeCodes = useMemo(
    () => codes.filter((c) => byCode[c] && !isFinal(byCode[c].status)).join(','),
    [codes, byCode],
  )

  // Al abrir la lista: datos frescos y un refresco lento de respaldo mientras siga abierta.
  useEffect(() => {
    if (!isOpen) return
    void refresh()
    const id = setInterval(() => void refresh(true), FALLBACK_POLL_MS)
    return () => clearInterval(id)
  }, [isOpen, refresh])

  // Mientras está abierta: unirse a los grupos en vivo de los pedidos en curso.
  useEffect(() => {
    if (!isOpen || !activeCodes) return
    const tracked = activeCodes.split(',')
    tracked.forEach((c) => void trackOrder(c))
    return () => tracked.forEach((c) => void stopTrackingOrder(c))
  }, [isOpen, activeCodes])

  const remember = useCallback((order: Order) => {
    setCodes((prev) => rememberCode(prev, order.code))
    setByCode((prev) => ({ ...prev, [order.code]: order }))
  }, [])

  const value = useMemo<HistoryValue>(() => {
    const orders = sortHistory(codes.map((c) => byCode[c]).filter((o): o is Order => Boolean(o)))
    return {
      orders,
      size: codes.length,
      activeCount: countActive(orders),
      loading,
      failed,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      remember,
      clear: () => {
        setCodes([])
        setByCode({})
      },
    }
  }, [codes, byCode, loading, failed, isOpen, remember])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useOrderHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useOrderHistory debe usarse dentro de OrderHistoryProvider')
  return ctx
}
