import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/* ---------- individual pen-drawn doodles ---------- */

export const HappyBun = () => (
  <svg viewBox="0 0 120 130" {...stroke}>
    <path d="M18 62c0-26 19-42 42-42s42 16 42 42c0 4-3 6-6 6H24c-3 0-6-2-6-6z" />
    <path d="M38 34l2 1M58 28l2 1M78 34l2 1M48 46l2 1M70 46l2 1" />
    <path d="M14 76c6-5 10 4 16 0s10 4 16 0 10 4 16 0 10 4 16 0 10 4 16 0 8 3 12 0" />
    <rect x="16" y="82" width="88" height="14" rx="7" />
    <path d="M18 100h84v4c0 8-12 12-42 12s-42-4-42-12z" />
    {/* face */}
    <circle cx="48" cy="54" r="2.5" fill="currentColor" />
    <circle cx="72" cy="54" r="2.5" fill="currentColor" />
    <path d="M52 61c4 4 12 4 16 0" />
    {/* little legs */}
    <path d="M44 116l-4 10h-6M76 116l4 10h6" />
  </svg>
)

export const FriesBox = () => (
  <svg viewBox="0 0 100 130" {...stroke}>
    <path d="M30 50l-4-38 8-2 4 40M42 48l-2-42 8-1 2 44M54 48l3-40 8 1-3 40M64 52l8-34 7 2-8 34" />
    <path d="M18 52h64l-8 70H26z" />
    <path d="M24 66c9 6 43 6 52 0" />
    <circle cx="40" cy="88" r="2.4" fill="currentColor" />
    <circle cx="60" cy="88" r="2.4" fill="currentColor" />
    <path d="M44 98c4 4 8 4 12 0" />
  </svg>
)

export const ShakeMascot = () => (
  <svg viewBox="0 0 100 150" {...stroke}>
    <path d="M58 6l-6 40" />
    <path d="M26 44c-2-12 10-16 16-12 4-10 18-10 22 0 8-4 16 4 12 12" />
    <path d="M22 46h56l-8 92H30z" />
    <path d="M25 70h50M27 92h46" />
    <circle cx="42" cy="108" r="2.4" fill="currentColor" />
    <circle cx="58" cy="108" r="2.4" fill="currentColor" />
    <path d="M45 117c3 3 7 3 10 0" />
    <path d="M22 100l-12-8M78 100l12-10" />
  </svg>
)

export const HotDogPal = () => (
  <svg viewBox="0 0 150 80" {...stroke}>
    <path d="M14 40c0-14 20-22 61-22s61 8 61 22-20 24-61 24-61-10-61-24z" />
    <path d="M10 38c0-6 6-10 14-10h102c8 0 14 4 14 10s-6 10-14 10H24c-8 0-14-4-14-10z" />
    <path d="M30 34c8 6 14-6 22 0s14-6 22 0 14-6 22 0 14-6 22 0" />
    <circle cx="62" cy="52" r="2" fill="currentColor" />
    <circle cx="86" cy="52" r="2" fill="currentColor" />
    <path d="M68 57c3 3 9 3 12 0" />
  </svg>
)

export const Squiggle = () => (
  <svg viewBox="0 0 140 40" {...stroke}>
    <path d="M4 22c10-16 20 16 30 0s20 16 30 0 20 16 30 0 20 16 30 0 8-8 12-6" />
  </svg>
)

export const Sparkle = () => (
  <svg viewBox="0 0 40 40" {...stroke}>
    <path d="M20 3v12M20 25v12M3 20h12M25 20h12M9 9l5 5M26 26l5 5M31 9l-5 5M14 26l-5 5" />
  </svg>
)

export const Swirl = () => (
  <svg viewBox="0 0 80 80" {...stroke}>
    <path d="M40 40c0-4 6-4 6 0 0 8-12 8-12 0 0-12 18-12 18 0 0 16-24 16-24 0 0-20 30-20 30 0" />
  </svg>
)

/* ---------- placement ---------- */

function Float({ children, className, delay = 0 }: { children: ReactNode; className: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, rotate: reduce ? 0 : -10 }}
      whileInView={{ opacity: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Brown pen doodles living on both edges of the favorites section. */
export default function DecorativeDoodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden text-brown-light/45 lg:block">
      {/* left edge */}
      <Float className="left-[2%] top-[14%] w-24 xl:w-32" delay={0.1}>
        <HappyBun />
      </Float>
      <Float className="left-[5%] top-[46%] w-14 xl:w-20" delay={0.2}>
        <Swirl />
      </Float>
      <Float className="left-[1.5%] top-[60%] w-20 xl:w-28" delay={0.3}>
        <FriesBox />
      </Float>
      <Float className="left-[9%] top-[6%] w-8" delay={0.15}>
        <Sparkle />
      </Float>
      <Float className="left-[3%] bottom-[6%] w-32" delay={0.35}>
        <Squiggle />
      </Float>

      {/* right edge */}
      <Float className="right-[2%] top-[10%] w-20 xl:w-24" delay={0.15}>
        <ShakeMascot />
      </Float>
      <Float className="right-[8%] top-[42%] w-8" delay={0.25}>
        <Sparkle />
      </Float>
      <Float className="right-[1.5%] top-[56%] w-28 xl:w-36" delay={0.3}>
        <HotDogPal />
      </Float>
      <Float className="right-[4%] bottom-[8%] w-16" delay={0.4}>
        <Swirl />
      </Float>
    </div>
  )
}
