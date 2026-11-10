import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CakeSlice, CupSoda, Drumstick, Hamburger, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { byCategory, CATEGORIES, type ProductCategory } from '../../domain/product'
import { useCart } from '../../application/CartContext'
import BouncyTitle from './BouncyTitle'
import ProductCard from './ProductCard'

type Tab = ProductCategory | 'all'

const icons: Record<Tab, LucideIcon> = {
  all: UtensilsCrossed,
  burger: Hamburger,
  side: Drumstick,
  drink: CupSoda,
  dessert: CakeSlice,
}

const tabs: { value: Tab; label: string }[] = [{ value: 'all', label: 'Todo' }, ...CATEGORIES]

/**
 * Menú completo con pestañas por sección. Al cambiar de pestaña, la "píldora" naranja
 * se desliza hasta la nueva (layoutId), las tarjetas que sobran se encogen y las que
 * se quedan se recolocan con animación (layout + AnimatePresence en modo popLayout).
 */
export default function MenuSection() {
  const { products } = useCart()
  const reduce = useReducedMotion()
  const [selectedTab, setTab] = useState<Tab>('all')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Solo se muestran las pestañas que tienen productos (además de «Todo»).
  const available = tabs.filter((t) => t.value === 'all' || byCategory(products, t.value).length > 0)
  // Si la sección elegida se queda vacía (p. ej. el Admin retira su último producto
  // en tiempo real), volvemos a «Todo» en vez de dejar un panel vacío sin pestaña.
  const tab: Tab = available.some((t) => t.value === selectedTab) ? selectedTab : 'all'
  const visible = byCategory(products, tab)

  // Flechas izquierda/derecha para moverse entre pestañas (patrón ARIA de "tabs").
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + available.length) % available.length
    setTab(available[next].value)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="menu" aria-labelledby="menu-title" className="relative z-10 pt-20 md:pt-24">
      <div className="container-site">
        <BouncyTitle id="menu-title" text="Nuestro Menú" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-4 text-center font-hand text-2xl text-brown-light"
        >
          Elige tu antojo
        </motion.p>

        {/* pestañas */}
        <div
          role="tablist"
          aria-label="Secciones del menú"
          className="mx-auto mt-8 flex max-w-full flex-wrap justify-center gap-2 sm:gap-3"
        >
          {available.map((t, i) => {
            const Icon = icons[t.value]
            const selected = tab === t.value
            const count = byCategory(products, t.value).length
            return (
              <motion.button
                key={t.value}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`menu-tab-${t.value}`}
                aria-selected={selected}
                aria-controls="menu-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.value)}
                onKeyDown={(e) => onKeyDown(e, i)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.3 + i * 0.06 }}
                whileHover={reduce ? undefined : 'wiggle'}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                className={`relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 font-ui text-sm font-bold transition-colors sm:px-5 ${
                  selected ? 'text-white-warm' : 'text-green-dark ring-2 ring-green-dark/15 hover:ring-orange-retro'
                }`}
              >
                {/* la píldora de fondo se "desliza" entre pestañas gracias al layoutId compartido */}
                {selected && (
                  <motion.span
                    layoutId="menu-tab-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-orange-deep shadow-[0_3px_0_rgba(35,105,79,0.3)]"
                  />
                )}
                <motion.span
                  variants={{ wiggle: { rotate: [0, -14, 12, -6, 0], transition: { duration: 0.5 } } }}
                  className="relative"
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </motion.span>
                <span className="relative">{t.label}</span>
                <span
                  className={`relative grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] ${
                    selected ? 'bg-white-warm/25' : 'bg-mustard/35'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* tarjetas */}
        <motion.div
          id="menu-panel"
          role="tabpanel"
          aria-labelledby={`menu-tab-${tab}`}
          layout
          className="mx-auto mt-10 grid max-w-[1000px] gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 max-sm:max-w-[360px]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                exit={{ opacity: 0, scale: 0.8, rotate: -4, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
