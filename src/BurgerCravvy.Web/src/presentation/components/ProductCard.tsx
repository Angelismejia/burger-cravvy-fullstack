import { memo, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Heart, Plus } from 'lucide-react'
import { formatPrice, type Product } from '../../domain/product'
import { useCart } from '../../application/CartContext'
import WavySticker from './WavySticker'

const FriesGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 9 7 3M11 9V2M14 9l1-6M17 10l2-5" />
    <path d="M5 9h14l-2 12H7z" />
  </svg>
)

function Badge({ type }: { type: Product['badge'] }) {
  if (type === 'sticker')
    return (
      <div className="absolute -left-3 -top-3 z-10 -rotate-12">
        <WavySticker shape="small" className="h-[4.25rem] w-[4.25rem]">
          <span className="block text-center font-display text-[11px] font-bold leading-[1.05] text-orange-deep">
            Más
            <br />
            vendida
          </span>
        </WavySticker>
      </div>
    )
  return (
    <span className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-orange-retro text-white-warm shadow-[0_3px_0_rgba(35,105,79,0.35)]">
      {type === 'heart' ? <Heart className="h-5 w-5 fill-white-warm" aria-hidden /> : <FriesGlyph />}
    </span>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart()
  const reduce = useReducedMotion()
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 1200)
    return () => clearTimeout(t)
  }, [justAdded])

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      whileHover={reduce ? undefined : { rotate: index === 1 ? 0.6 : -0.6 }}
      className="group relative"
    >
      <Badge type={product.badge} />
      <div className="flex h-full flex-col items-center rounded-[34px] bg-emerald-vintage px-5 pb-6 pt-5 text-center text-white-warm transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
        {/* photo on a pastel "plate" */}
        <div className="relative w-full overflow-hidden rounded-[26px] bg-pink-pastel p-2">
          <div className="aspect-[4/3] overflow-hidden rounded-[20px]">
            <img
              src={product.image}
              alt={product.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
            />
          </div>
        </div>

        <h3 className="mt-4 font-display text-[1.6rem] font-bold leading-tight">{product.name}</h3>
        <p className="mt-1 max-w-[24ch] font-body text-[15px] leading-snug text-white-warm/85">{product.description}</p>

        <div className="mt-auto flex w-full items-center justify-between gap-3 pt-5">
          <span className="font-display text-xl font-semibold text-mustard">{formatPrice(product.price)}</span>
          <motion.button
            type="button"
            whileTap={reduce ? undefined : { scale: 0.9 }}
            disabled={!product.isAvailable}
            onClick={() => {
              add(product.id)
              setJustAdded(true)
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white-warm/12 px-4 py-2 font-ui text-sm font-bold text-white-warm ring-1 ring-white-warm/40 transition-colors duration-300 hover:bg-orange-deep hover:ring-orange-deep disabled:cursor-not-allowed disabled:opacity-50 group-hover:bg-white-warm group-hover:text-emerald-vintage group-hover:hover:bg-orange-deep group-hover:hover:text-white-warm"
            aria-label={product.isAvailable ? `Añadir ${product.name} al carrito` : `${product.name} no disponible`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={justAdded ? 'ok' : 'add'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-1.5"
              >
                {justAdded ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                {!product.isAvailable ? 'Agotado' : justAdded ? '¡Añadido!' : 'Añadir'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)
