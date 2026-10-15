import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import OrderButton from './OrderButton'
import { useCart } from '../../application/CartContext'
import { useActiveSection } from '../../application/hooks/useActiveSection'

export const navLinks = [
  { id: 'home', label: 'Inicio' },
  { id: 'menu', label: 'Nuestro Menú' },
  { id: 'about', label: 'Nosotros' },
]
const sectionIds = navLinks.map((l) => l.id)

export default function Navigation() {
  const active = useActiveSection(sectionIds)
  const { count, open } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <nav aria-label="Principal" className="sticky top-0 z-40 bg-orange-retro shadow-[0_2px_0_rgba(168,109,70,0.15)]">
      <div className="container-site flex h-16 items-center gap-6 md:h-[84px] md:gap-10">
        {/* decorative seal */}
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white-warm font-display text-[13px] font-bold leading-none text-orange-deep ring-2 ring-white-warm/40 ring-offset-2 ring-offset-orange-retro md:h-12 md:w-12"
        >
          <span className="text-center">
            <span className="block text-[9px] tracking-widest">DESDE</span>76
          </span>
        </span>

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((l, i) => (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            >
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? 'true' : undefined}
                className="nav-link font-ui text-[15px] font-semibold text-white-warm transition-opacity hover:opacity-100 aria-[current]:opacity-100 opacity-90"
              >
                {l.label}
              </a>
            </motion.li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={open}
            className="relative grid h-11 w-11 place-items-center rounded-full text-white-warm transition hover:bg-white-warm/15"
            aria-label={`Abrir carrito, ${count} producto${count === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-vintage px-1 text-[11px] font-bold text-white-warm"
              >
                {count}
              </motion.span>
            )}
          </button>
          <OrderButton variant="cream" className="max-sm:px-4 max-sm:text-xs" />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full text-white-warm transition hover:bg-white-warm/15 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white-warm/25 bg-orange-retro md:hidden"
          >
            {navLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className="block px-6 py-3.5 font-ui text-base font-semibold text-white-warm aria-[current]:bg-white-warm/15"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  )
}
