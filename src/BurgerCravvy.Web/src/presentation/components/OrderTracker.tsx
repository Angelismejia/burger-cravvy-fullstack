import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChefHat, Loader2, PackageCheck, Receipt, Search, X, XCircle } from 'lucide-react'
import { useOrderTracking } from '../../application/OrderTrackingContext'
import { ORDER_FLOW } from '../../domain/order'
import { formatPrice } from '../../domain/product'

const stepIcons = [Receipt, ChefHat, PackageCheck, Check]

/** Diálogo "Sigue tu pedido": línea de tiempo que se actualiza sola. */
export default function OrderTracker() {
  const { isOpen, close, code, order, error, loading, track } = useOrderTracking()
  const reduce = useReducedMotion()
  const [input, setInput] = useState(code)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setInput(code)
    requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // Solo al abrir: no queremos reenfocar en cada refresco.
  }, [isOpen])

  const cancelled = order?.status === 'Cancelled'
  const currentStep = order ? ORDER_FLOW.findIndex((s) => s.status === order.status) : -1

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
            aria-labelledby="tracker-title"
            initial={{ y: reduce ? 0 : 30, scale: reduce ? 1 : 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: reduce ? 0 : 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="paper w-full max-w-[460px] overflow-hidden rounded-[30px] shadow-[0_10px_0_rgba(35,105,79,0.2)]"
          >
            <header className="flex items-center justify-between bg-emerald-vintage px-6 py-4 text-white-warm">
              <h2 id="tracker-title" className="font-display text-2xl font-bold">Sigue tu pedido</h2>
              <button
                type="button"
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white-warm/20"
                aria-label="Cerrar seguimiento"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="px-6 py-5">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  track(input)
                }}
              >
                <label htmlFor="track-code" className="sr-only">
                  Código del pedido
                </label>
                <input
                  ref={inputRef}
                  id="track-code"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="BC-261015-1234"
                  maxLength={20}
                  className="min-w-0 flex-1 rounded-full border-2 border-brown-light/25 bg-white-warm px-4 py-2.5 font-ui uppercase tracking-wide text-green-dark outline-none transition focus:border-orange-retro"
                />
                <button
                  type="submit"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-deep text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage"
                  aria-label="Buscar pedido"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </form>

              <div aria-live="polite" className="mt-5 min-h-40">
                {error && !loading && <p className="text-center font-body text-orange-deep">{error}</p>}

                {order && (
                  <motion.div key={order.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="font-body text-green-dark/80">
                      Pedido de <strong className="text-green-dark">{order.customerName}</strong> ·{' '}
                      {formatPrice(order.total)}
                    </p>

                    {cancelled ? (
                      <p className="mt-4 flex items-center gap-2 rounded-2xl bg-pink-pastel/35 px-4 py-3 font-ui font-semibold text-green-dark">
                        <XCircle className="h-5 w-5 text-orange-deep" aria-hidden /> Este pedido fue cancelado.
                      </p>
                    ) : (
                      <ol className="mt-4 space-y-0">
                        {ORDER_FLOW.map((step, i) => {
                          const Icon = stepIcons[i]
                          const done = i < currentStep
                          const active = i === currentStep
                          return (
                            <li key={step.status} className="relative flex items-center gap-3 pb-5 last:pb-0">
                              {i < ORDER_FLOW.length - 1 && (
                                <span aria-hidden className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 overflow-hidden bg-brown-light/20">
                                  <motion.span
                                    className="block h-full w-full origin-top bg-emerald-vintage"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: done ? 1 : 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                  />
                                </span>
                              )}
                              <motion.span
                                className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                                  done || active ? 'bg-emerald-vintage text-white-warm' : 'bg-brown-light/15 text-brown-light'
                                }`}
                                initial={false}
                                animate={active && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                                transition={{ duration: 0.6 }}
                              >
                                <Icon className="h-5 w-5" aria-hidden />
                                {active && <span className="absolute inset-0 rounded-full ring-4 ring-mustard/60" aria-hidden />}
                              </motion.span>
                              <span className={`font-ui ${active ? 'font-bold text-green-dark' : done ? 'text-green-dark/80' : 'text-green-dark/45'}`}>
                                {step.label}
                                {active && <span className="sr-only"> (estado actual)</span>}
                              </span>
                            </li>
                          )
                        })}
                      </ol>
                    )}
                    {!cancelled && order.status !== 'Delivered' && (
                      <p className="mt-4 font-ui text-xs text-green-dark/60">Se actualiza solo cada pocos segundos.</p>
                    )}
                  </motion.div>
                )}

                {!order && !error && !loading && (
                  <p className="text-center font-hand text-xl text-ink/70">Escribe el código que te dimos al pedir.</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
