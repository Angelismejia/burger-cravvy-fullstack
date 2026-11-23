import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronRight, Loader2, Receipt, Trash2, X } from 'lucide-react'
import { useOrderHistory } from '../../application/OrderHistoryContext'
import { useOrderTracking } from '../../application/OrderTrackingContext'
import type { OrderStatus } from '../../domain/order'
import { summarizeItems } from '../../domain/orderHistory'
import { formatPrice } from '../../domain/product'

const statusStyle: Record<OrderStatus, string> = {
  Pending: 'bg-mustard/70 text-green-dark',
  Preparing: 'bg-orange-retro text-white-warm',
  Ready: 'bg-emerald-vintage text-white-warm',
  Delivered: 'bg-green-dark/10 text-green-dark/70',
  Cancelled: 'bg-pink-pastel/50 text-green-dark/70',
}

const dateFormat = new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

/** Diálogo «Mis pedidos»: los pedidos hechos desde este navegador, con su estado en vivo. */
export default function OrderHistory() {
  const { isOpen, close, orders, size, loading, failed, clear } = useOrderHistory()
  const tracking = useOrderTracking()
  const reduce = useReducedMotion()
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setConfirmClear(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  const openOrder = (code: string) => {
    close()
    tracking.open(code)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[55] grid place-items-center bg-green-dark/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
            initial={{ y: reduce ? 0 : 30, scale: reduce ? 1 : 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: reduce ? 0 : 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="paper flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-[30px] shadow-[0_10px_0_rgba(35,105,79,0.2)]"
          >
            <header className="flex items-center justify-between bg-emerald-vintage px-6 py-4 text-white-warm">
              <h2 id="history-title" className="flex items-center gap-2 font-display text-2xl font-bold">
                Mis pedidos
                {loading && <Loader2 className="h-5 w-5 animate-spin" aria-label="Actualizando" />}
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white-warm/20"
                aria-label="Cerrar mis pedidos"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div aria-live="polite" className="flex-1 overflow-y-auto px-5 py-5">
              {size === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-mustard/60 text-green-dark">
                    <Receipt className="h-7 w-7" aria-hidden />
                  </span>
                  <p className="font-body text-green-dark/80">Aún no has hecho pedidos desde este navegador.</p>
                  <a
                    href="#menu"
                    onClick={close}
                    className="rounded-full bg-orange-deep px-6 py-3 font-ui text-sm font-bold uppercase tracking-wider text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage"
                  >
                    Ver el menú
                  </a>
                </div>
              ) : (
                <>
                  {failed && (
                    <p className="mb-3 rounded-2xl bg-pink-pastel/35 px-4 py-2 text-center font-body text-sm text-green-dark">
                      {orders.length === 0
                        ? `No pudimos conectar con la cocina. ${size === 1 ? 'Tu pedido sigue guardado' : `Tus ${size} pedidos siguen guardados`}: lo volvemos a intentar en un momento.`
                        : 'Algunos pedidos no se pudieron actualizar. Lo volvemos a intentar en un momento.'}
                    </p>
                  )}
                  <ul className="space-y-3">
                    {orders.map((o) => (
                      <li key={o.code}>
                        <button
                          type="button"
                          onClick={() => openOrder(o.code)}
                          className="flex w-full items-center gap-3 rounded-[22px] bg-white-warm px-4 py-3 text-left ring-1 ring-brown-light/15 transition hover:-translate-y-0.5 hover:ring-orange-retro"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-ui text-xs font-bold tracking-wide text-brown-light">{o.code}</span>
                              <motion.span
                                key={o.status}
                                initial={reduce ? false : { scale: 0.7 }}
                                animate={{ scale: 1 }}
                                className={`rounded-full px-2 py-0.5 font-ui text-xs font-bold ${statusStyle[o.status]}`}
                              >
                                {o.statusLabel}
                              </motion.span>
                            </span>
                            <span className="mt-1 block truncate font-body text-sm text-green-dark">{summarizeItems(o)}</span>
                            <span className="block font-body text-xs text-green-dark/60">
                              {dateFormat.format(new Date(o.createdAtUtc))} · {o.customerName}
                            </span>
                          </span>
                          <span className="shrink-0 font-ui text-sm font-bold text-emerald-vintage">{formatPrice(o.total)}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-green-dark/40" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {size > 0 && (
              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-brown-light/15 px-5 py-3">
                <p className="font-body text-xs text-green-dark/60">Se guarda solo en este navegador.</p>
                {confirmClear ? (
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="rounded-full px-3 py-1.5 font-ui text-xs font-bold text-green-dark/70 transition hover:bg-green-dark/5"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={clear}
                      className="rounded-full bg-orange-deep px-3 py-1.5 font-ui text-xs font-bold text-white-warm transition hover:bg-orange-retro"
                    >
                      Sí, borrar historial
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-ui text-xs font-bold text-green-dark/70 transition hover:bg-green-dark/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Borrar historial
                  </button>
                )}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
