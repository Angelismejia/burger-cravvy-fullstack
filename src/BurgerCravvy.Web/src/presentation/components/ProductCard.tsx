import { memo, useEffect, useState, type PointerEvent } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react'
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

// ---------- coreografía de entrada ----------
// La tarjeta sube con un muelle, la foto se "destapa" de abajo arriba mientras se aleja
// el zoom, y al final aparecen el distintivo y el precio. Los hijos heredan los estados
// "hidden" / "shown" del <article>, así que basta con un único whileInView.

const card: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.92, rotate: -2 },
  shown: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22, delay, delayChildren: delay + 0.15, staggerChildren: 0.08 },
  }),
}

const photo: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0% round 20px)' },
  shown: { clipPath: 'inset(0% 0% 0% 0% round 20px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const photoZoom: Variants = {
  hidden: { scale: 1.3 },
  shown: { scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -25 },
  shown: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 480, damping: 14 } },
}

function Badge({ type }: { type: Product['badge'] }) {
  if (type === 'none') return null
  if (type === 'sticker')
    return (
      <motion.div variants={pop} className="absolute -left-3 -top-3 z-20 -rotate-12">
        <WavySticker shape="small" className="h-[4.25rem] w-[4.25rem]">
          <span className="block text-center font-display text-[11px] font-bold leading-[1.05] text-orange-deep">
            Más
            <br />
            vendida
          </span>
        </WavySticker>
      </motion.div>
    )
  return (
    <motion.span
      variants={pop}
      className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-orange-retro text-white-warm shadow-[0_3px_0_rgba(35,105,79,0.35)]"
    >
      {type === 'heart' ? <Heart className="h-5 w-5 fill-white-warm" aria-hidden /> : <FriesGlyph />}
    </motion.span>
  )
}

/** Inclinación 3D que sigue al puntero, con un brillo que se mueve encima de la tarjeta. */
function useTilt(enabled: boolean) {
  // Posición del puntero dentro de la tarjeta, de 0 a 1 (0.5 = centro).
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const spring = { stiffness: 220, damping: 20, mass: 0.6 }
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring)
  const shineX = useTransform(px, (v) => `${v * 100}%`)
  const shineY = useTransform(py, (v) => `${v * 100}%`)
  const shine = useMotionTemplate`radial-gradient(circle at ${shineX} ${shineY}, rgba(255,253,245,0.28), transparent 55%)`

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!enabled || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onPointerLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return { style: enabled ? { rotateX, rotateY } : undefined, shine, onPointerMove, onPointerLeave }
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart()
  const reduce = useReducedMotion()
  const tilt = useTilt(!reduce)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 1200)
    return () => clearTimeout(t)
  }, [justAdded])

  return (
    // cada tarjeta tiene su propia perspectiva: así la inclinación se ve igual en todas las columnas
    <div className="h-full [perspective:1000px]">
    <motion.article
      variants={card}
      custom={(index % 3) * 0.1} // escalonado por columna: cada fila entra de izquierda a derecha
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-60px' }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      style={tilt.style}
      className="group relative h-full [transform-style:preserve-3d]"
    >
      <Badge type={product.badge} />
      <div className="relative flex h-full flex-col items-center overflow-hidden rounded-[34px] bg-emerald-vintage px-5 pb-6 pt-5 text-center text-white-warm shadow-[0_8px_0_rgba(35,105,79,0.18)] transition-shadow duration-300 group-hover:shadow-[0_16px_30px_rgba(35,105,79,0.35)]">
        {/* brillo que sigue al ratón (solo se ve al pasar por encima) */}
        {!reduce && (
          <motion.span
            aria-hidden
            style={{ backgroundImage: tilt.shine }}
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* foto sobre un "plato" pastel */}
        <div className="relative w-full rounded-[26px] bg-pink-pastel p-2">
          <motion.div variants={photo} className="aspect-[4/3] overflow-hidden rounded-[20px]">
            <motion.img
              variants={photoZoom}
              src={product.image}
              alt={product.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.08] ${product.isAvailable ? '' : 'grayscale'}`}
            />
          </motion.div>
          {!product.isAvailable && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-full bg-orange-deep px-4 py-1 font-display text-lg font-bold uppercase tracking-wide text-white-warm shadow">
              Agotado
            </span>
          )}
        </div>

        <motion.h3 variants={rise} className="mt-4 font-display text-[1.6rem] font-bold leading-tight">
          {product.name}
        </motion.h3>
        <motion.p variants={rise} className="mt-1 max-w-[24ch] font-body text-[15px] leading-snug text-white-warm/85">
          {product.description}
        </motion.p>

        <div className="mt-auto flex w-full items-center justify-between gap-3 pt-5">
          <motion.span variants={pop} className="font-display text-xl font-semibold text-mustard">
            {formatPrice(product.price)}
          </motion.span>
          <motion.button
            type="button"
            variants={rise}
            whileTap={reduce ? undefined : { scale: 0.88, rotate: -3 }}
            disabled={!product.isAvailable}
            onClick={() => {
              add(product.id)
              setJustAdded(true)
            }}
            className="relative z-20 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white-warm/12 px-4 py-2 font-ui text-sm font-bold text-white-warm ring-1 ring-white-warm/40 transition-colors duration-300 hover:bg-orange-deep hover:ring-orange-deep disabled:cursor-not-allowed disabled:opacity-50 group-hover:bg-white-warm group-hover:text-emerald-vintage group-hover:hover:bg-orange-deep group-hover:hover:text-white-warm"
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
    </div>
  )
}

export default memo(ProductCard)
