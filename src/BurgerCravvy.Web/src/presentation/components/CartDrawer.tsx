import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Loader2, Minus, PartyPopper, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../../application/CartContext'
import { formatPrice } from '../../domain/product'
import { usePlaceOrder } from '../../application/hooks/usePlaceOrder'
import { useOrderTracking } from '../../application/OrderTrackingContext'

export default function CartDrawer() {
  const { isOpen, close, lines, total, count, increment, decrement, remove } = useCart()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const { state: orderState, placeOrder, reset } = usePlaceOrder()
  const tracking = useOrderTracking()
  const [customerName, setCustomerName] = useState('')

  // Escape cierra, bloqueo de scroll, trampa de foco y restauración del foco.
  useEffect(() => {
    if (!isOpen) {
      reset()
      return
    }
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button, a[href], input') ?? []).filter((el) => !el.hasAttribute('disabled'))
    requestAnimationFrame(() => focusables()[0]?.focus())

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        const els = focusables()
        if (!els.length) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-green-dark/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="paper absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col shadow-[-8px_0_0_rgba(35,105,79,0.15)]"
          >
            <header className="flex items-center justify-between bg-emerald-vintage px-6 py-5 text-white-warm">
              <h2 id="cart-title" className="flex items-center gap-2 font-display text-2xl font-bold">
                <ShoppingBag className="h-6 w-6" aria-hidden /> Tu pedido
                <span className="font-ui text-sm font-semibold text-white-warm/75">({count})</span>
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-white-warm/20"
                aria-label="Cerrar carrito"
              >
                <X className="h-6 w-6" />
              </button>
            </header>

            {orderState.status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center"
                role="status"
              >
                <motion.span
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-mustard text-green-dark"
                >
                  <PartyPopper className="h-8 w-8" aria-hidden />
                </motion.span>
                <p className="font-display text-2xl font-bold text-orange-deep">¡Gracias, {orderState.order.customerName}!</p>
                <p className="font-body text-green-dark/85">
                  Tu pedido <strong className="font-ui">{orderState.order.code}</strong> quedó registrado como{' '}
                  <strong>pendiente</strong> por {formatPrice(orderState.order.total)}.
                </p>
                <p className="rounded-2xl bg-pink-pastel/30 px-4 py-2 font-ui text-xs text-green-dark/80">
                  Sitio de demostración: no se cobró nada. Guarda tu código para seguir el pedido.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const code = orderState.order.code
                      close()
                      tracking.open(code)
                    }}
                    className="rounded-full bg-orange-deep px-6 py-3 font-ui text-sm font-bold uppercase tracking-wider text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage"
                  >
                    Seguir mi pedido
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full px-5 py-3 font-ui text-sm font-bold uppercase tracking-wider text-green-dark ring-2 ring-green-dark/20 transition hover:bg-green-dark/5"
                  >
                    Seguir mirando
                  </button>
                </div>
              </motion.div>
            ) : lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-display text-2xl font-bold text-orange-deep">¡Tu bandeja está vacía!</p>
                <p className="font-body text-green-dark/80">Elige uno de nuestros favoritos y vuelve con hambre.</p>
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
                <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-5" aria-label="Productos en el carrito">
                  <AnimatePresence initial={false}>
                    {lines.map(({ product, quantity }) => (
                      <motion.li
                        key={product.id}
                        layout={!reduce}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-3 rounded-[22px] bg-white-warm p-3 ring-1 ring-brown-light/15"
                      >
                        <img src={product.image} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-[16px] object-cover" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-lg font-bold leading-tight text-green-dark">{product.name}</h3>
                            <button
                              type="button"
                              onClick={() => remove(product.id)}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-brown-light transition hover:bg-pink-pastel/40 hover:text-orange-deep"
                              aria-label={`Quitar ${product.name} del carrito`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="font-ui text-xs text-green-dark/70">{formatPrice(product.price)} c/u</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 rounded-full bg-cream p-1 ring-1 ring-brown-light/20">
                              <button
                                type="button"
                                onClick={() => decrement(product.id)}
                                className="grid h-8 w-8 place-items-center rounded-full bg-orange-deep text-white-warm transition hover:bg-emerald-vintage"
                                aria-label={`Restar una unidad de ${product.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-7 text-center font-ui font-bold" aria-live="polite">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increment(product.id)}
                                className="grid h-8 w-8 place-items-center rounded-full bg-orange-deep text-white-warm transition hover:bg-emerald-vintage"
                                aria-label={`Sumar una unidad de ${product.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="font-display text-lg font-semibold text-emerald-vintage">
                              {formatPrice(product.price * quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="border-t-2 border-dashed border-brown-light/25 px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-ui font-semibold text-green-dark/80">Total</span>
                    <span className="font-display text-3xl font-bold text-green-dark" aria-live="polite">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <form
                    className="mt-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (orderState.status !== 'sending') placeOrder(customerName)
                    }}
                  >
                    <label htmlFor="customer-name" className="font-ui text-sm font-semibold text-green-dark/80">
                      Nombre para el pedido
                    </label>
                    <input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      maxLength={80}
                      required
                      autoComplete="given-name"
                      placeholder="Ej. Ana"
                      className="mt-1 w-full rounded-full border-2 border-brown-light/25 bg-white-warm px-4 py-2.5 font-body text-green-dark outline-none transition focus:border-orange-retro"
                    />
                    <button
                      type="submit"
                      disabled={orderState.status === 'sending'}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-deep py-3.5 font-ui text-sm font-bold uppercase tracking-wider text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage disabled:opacity-70"
                    >
                      {orderState.status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                      Confirmar pedido (demo)
                    </button>
                  </form>
                  <p role="status" className={`mt-3 min-h-10 text-center font-body text-sm ${orderState.status === 'error' ? 'text-orange-deep' : 'text-green-dark/75'}`}>
                    {orderState.status === 'error'
                      ? orderState.message
                      : 'Demostración: el pedido se guarda en la base de datos, pero no se cobra nada.'}
                  </p>
                </footer>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Pequeña confirmación que aparece al añadir un producto. */
export function AddedToast() {
  const { lastAdded, open } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastAdded) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [lastAdded])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <AnimatePresence>
        {visible && lastAdded && (
          <motion.div
            key={lastAdded.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-green-dark py-2 pl-3 pr-2 text-white-warm shadow-[0_6px_0_rgba(0,0,0,0.12)]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-mustard text-green-dark">
              <Check className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-ui text-sm font-semibold">¡{lastAdded.name} añadido!</span>
            <button
              type="button"
              onClick={open}
              className="rounded-full bg-orange-deep px-4 py-1.5 font-ui text-xs font-bold uppercase tracking-wider transition hover:bg-orange-retro"
            >
              Ver carrito
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
