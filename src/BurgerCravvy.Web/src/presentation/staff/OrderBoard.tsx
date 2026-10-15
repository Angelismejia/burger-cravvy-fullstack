import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Clock, Loader2, RefreshCw, X } from 'lucide-react'
import { useOrderQueue } from '../../application/hooks/useOrderQueue'
import { canCancel, NEXT_ACTION, type Order, type OrderStatus } from '../../domain/order'
import { formatPrice } from '../../domain/product'

const columns: { status: OrderStatus; title: string; accent: string }[] = [
  { status: 'Pending', title: 'Pendientes', accent: 'bg-mustard' },
  { status: 'Preparing', title: 'En preparación', accent: 'bg-orange-retro' },
  { status: 'Ready', title: 'Listos', accent: 'bg-emerald-vintage' },
]

/** "hace 3 min" — se recalcula cada 30 s. */
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function elapsed(iso: string, now: number) {
  const min = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  return h < 24 ? `hace ${h} h` : `hace ${Math.floor(h / 24)} d`
}

interface Props {
  token: string
  onUnauthorized: () => void
}

export default function OrderBoard({ token, onUnauthorized }: Props) {
  const { orders, loaded, error, busyCode, act, refresh } = useOrderQueue(token, onUnauthorized)
  const now = useNow()

  return (
    <section aria-labelledby="board-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="board-title" className="font-display text-3xl font-bold text-orange-deep md:text-4xl">
            Cola de pedidos
          </h1>
          <p className="font-ui text-sm text-green-dark/70">Se actualiza sola cada 5 segundos.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white-warm px-4 font-ui text-sm font-bold text-green-dark ring-1 ring-brown-light/20 transition hover:-translate-y-0.5"
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Actualizar
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-pink-pastel/35 px-4 py-3 font-body text-green-dark">
          {error}
        </p>
      )}

      {!loaded ? (
        <p className="mt-10 flex items-center justify-center gap-2 font-ui text-green-dark/70">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Cargando pedidos…
        </p>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {columns.map((col) => {
            const list = orders.filter((o) => o.status === col.status)
            return (
              <div key={col.status} className="rounded-[28px] bg-white-warm/70 p-4 ring-1 ring-brown-light/15">
                <h2 className="flex items-center gap-2 px-1 font-display text-xl font-bold text-green-dark">
                  <span className={`h-3 w-3 rounded-full ${col.accent}`} aria-hidden />
                  {col.title}
                  <motion.span
                    key={list.length}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="ml-auto grid h-7 min-w-7 place-items-center rounded-full bg-green-dark/10 px-2 font-ui text-sm"
                  >
                    {list.length}
                  </motion.span>
                </h2>
                <ul className="mt-3 space-y-3">
                  <AnimatePresence initial={false}>
                    {list.map((o) => (
                      <OrderCard key={o.code} order={o} now={now} busy={busyCode === o.code} onAct={act} />
                    ))}
                  </AnimatePresence>
                  {list.length === 0 && (
                    <li className="rounded-2xl border-2 border-dashed border-brown-light/20 px-4 py-6 text-center font-hand text-lg text-ink/60">
                      Nada por aquí
                    </li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function OrderCard({
  order,
  now,
  busy,
  onAct,
}: {
  order: Order
  now: number
  busy: boolean
  onAct: (code: string, action: 'preparar' | 'listo' | 'entregar' | 'cancelar') => void
}) {
  const reduce = useReducedMotion()
  const next = NEXT_ACTION[order.status]

  return (
    <motion.li
      layout={!reduce}
      layoutId={reduce ? undefined : order.code}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="rounded-[22px] bg-white-warm p-4 shadow-[0_3px_0_rgba(168,109,70,0.15)] ring-1 ring-brown-light/15"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-ui text-xs font-bold tracking-wider text-brown-light">{order.code}</p>
          <p className="font-display text-lg font-bold leading-tight text-green-dark">{order.customerName}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 font-ui text-xs text-green-dark/70">
          <Clock className="h-3 w-3" aria-hidden /> {elapsed(order.createdAtUtc, now)}
        </span>
      </div>

      <ul className="mt-2 space-y-0.5 font-body text-sm text-green-dark/85">
        {order.items.map((i) => (
          <li key={i.productName} className="flex justify-between gap-2">
            <span>
              <strong className="font-ui">{i.quantity}×</strong> {i.productName}
            </span>
            <span className="text-green-dark/60">{formatPrice(i.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2 border-t border-dashed border-brown-light/25 pt-3">
        <span className="font-display font-semibold text-emerald-vintage">{formatPrice(order.total)}</span>
        <div className="ml-auto flex gap-2">
          {canCancel(order.status) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAct(order.code, 'cancelar')}
              className="grid h-9 w-9 place-items-center rounded-full text-brown-light ring-1 ring-brown-light/30 transition hover:bg-pink-pastel/40 hover:text-orange-deep disabled:opacity-50"
              aria-label={`Cancelar pedido ${order.code}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {next && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              disabled={busy}
              onClick={() => onAct(order.code, next.action)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-orange-deep px-4 font-ui text-sm font-bold text-white-warm transition hover:bg-emerald-vintage disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              {next.label}
            </motion.button>
          )}
        </div>
      </div>
    </motion.li>
  )
}
