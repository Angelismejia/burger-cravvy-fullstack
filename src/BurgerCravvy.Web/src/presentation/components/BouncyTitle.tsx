import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface Props {
  /** Texto del título; también es su nombre accesible. */
  text: string
  id: string
  /** Id del ancla interna (para enlaces como #favorites). */
  anchorId?: string
}

/**
 * Título de sección cuyas letras "rebotan" al entrar en pantalla, con un subrayado
 * a mano que se dibuja al final. Las letras se agrupan por palabra para que el salto
 * de línea nunca corte una palabra a la mitad.
 */
export default function BouncyTitle({ text, id, anchorId }: Props) {
  const reduce = useReducedMotion()

  return (
    <h2
      id={id}
      aria-label={text}
      className="text-center font-display text-[clamp(2.25rem,4.5vw,3rem)] font-bold text-orange-deep"
    >
      <span id={anchorId} className="relative inline-block" aria-hidden>
        {text.split(' ').map((word, w, words) => {
          const offset = words.slice(0, w).join(' ').length + (w > 0 ? 1 : 0)
          return (
            <Fragment key={`${word}-${w}`}>
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
  )
}
