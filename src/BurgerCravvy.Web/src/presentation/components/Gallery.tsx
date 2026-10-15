import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { galleryImages } from '../siteContent'

export default function Gallery() {
  const reduce = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (openIndex === null) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenIndex(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      triggerRef.current?.focus()
    }
  }, [openIndex])

  const current = openIndex !== null ? galleryImages[openIndex] : null

  return (
    <section id="about" aria-labelledby="gallery-title" className="relative z-10 pb-20 pt-16 md:pb-24 md:pt-20">
      <h2 id="gallery-title" className="sr-only">
        Nosotros — así se vive Burger Cravvy
      </h2>
      <div className="container-site">
        <ul className="mx-auto grid max-w-[1000px] gap-5 sm:grid-cols-3 md:gap-7">
          {galleryImages.map((img, i) => (
            <motion.li
              key={img.src}
              initial={{ opacity: 0, y: reduce ? 0 : 36, rotate: reduce ? 0 : (i - 1) * 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
            >
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget
                  setOpenIndex(i)
                }}
                className="group block aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-pink-pastel/40 sm:aspect-[5/4]"
                aria-label={`Ampliar foto: ${img.alt}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  width={800}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[60] grid place-items-center bg-green-dark/85 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIndex(null)}
          >
            <motion.img
              src={current.full}
              alt={current.alt}
              initial={{ scale: reduce ? 1 : 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: reduce ? 1 : 0.94 }}
              className="max-h-[85vh] max-w-full rounded-[24px] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpenIndex(null)}
              className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white-warm text-green-dark transition hover:bg-orange-deep hover:text-white-warm"
              aria-label="Cerrar foto ampliada"
            >
              <X className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
