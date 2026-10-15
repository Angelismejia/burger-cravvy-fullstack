import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useCart } from '../../application/CartContext'
import ProductCard from './ProductCard'

const title = 'Nuestros Favoritos'

export default function FavoriteProducts() {
  const { products, menuSource } = useCart()
  const reduce = useReducedMotion()

  return (
    <section id="menu" aria-labelledby="favorites-title" className="relative z-10 pt-16 md:pt-20">
      <div className="container-site">
        <h2
          id="favorites-title"
          aria-label={title}
          className="text-center font-display text-[clamp(2.25rem,4.5vw,3rem)] font-bold text-orange-deep"
        >
          <span id="favorites" className="relative inline-block" aria-hidden>
            {/* las letras "rebotan" al entrar en pantalla; se agrupan por palabra
                para que el salto de línea nunca corte una palabra a la mitad */}
            {title.split(' ').map((word, w, words) => {
              const offset = words.slice(0, w).join(' ').length + (w > 0 ? 1 : 0)
              return (
                <Fragment key={word}>
                  {w > 0 && ' '}
                  <span className="inline-block whitespace-nowrap">
                    {word.split('').map((ch, i) => (
                      <motion.span
                        key={i}
                        className="inline-block"
                        initial={{ opacity: 0, y: reduce ? 0 : 22, rotate: reduce ? 0 : -8 }}
                        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: (offset + i) * 0.03 }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </span>
                </Fragment>
              )
            })}
            <motion.svg
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-3 w-full text-mustard"
              aria-hidden
            >
              <motion.path
                d="M3 9c40-6 90-8 194-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
              />
            </motion.svg>
          </span>
        </h2>

        {menuSource === 'offline' && (
          <p className="mt-6 text-center font-ui text-xs text-ink/70" role="status">
            Mostrando el menú sin conexión — la API no responde.
          </p>
        )}

        <div className="mx-auto mt-10 grid max-w-[1000px] gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 max-sm:max-w-[360px]">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
