import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { heroImage } from '../siteContent'
import WavySticker from './WavySticker'

const lines = ['Hay algo', 'para Todos']

export default function Hero() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  // Parallax suave: la foto se desplaza más lento que el scroll.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '60%'])

  return (
    <section ref={ref} id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-green-dark">
      <motion.div style={{ y: imageY }} className="absolute inset-0 -z-10">
        <motion.img
          src={heroImage.src}
          srcSet={heroImage.srcSet}
          sizes="100vw"
          alt={heroImage.alt}
          width={1920}
          height={1080}
          fetchPriority="high"
          initial={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="h-full w-full object-cover object-[50%_60%]"
        />
      </motion.div>
      {/* velo cálido para que el titular blanco se lea sobre cualquier foto */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(40,28,12,0.5)_0%,rgba(40,28,12,0.12)_42%,rgba(40,28,12,0)_70%,rgba(40,28,12,0.18)_100%)]"
      />

      <motion.div
        style={{ y: titleY }}
        className="container-site flex h-[clamp(440px,52vw,640px)] flex-col items-center pt-[clamp(40px,6vw,72px)] text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-hand text-xl text-white-warm/95 md:text-2xl"
        >
          Tus antojos, nuestro placer.
        </motion.p>
        <h1
          id="hero-title"
          className="hero-title mt-1 font-hero text-[clamp(2.75rem,8vw,5.75rem)] font-extrabold leading-[0.95] tracking-tight text-white-warm"
        >
          {lines.map((line, i) => (
            <span key={line} className="-mb-[0.18em] block overflow-hidden pb-[0.18em]">
              <motion.span
                className="block"
                initial={{ y: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: reduce ? 1 : 0.3, rotate: reduce ? -8 : -40 }}
        animate={{ opacity: 1, scale: 1, rotate: -8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.9 }}
        whileHover={reduce ? undefined : { rotate: 6, scale: 1.08 }}
        className="absolute bottom-[10%] left-[6%] cursor-default sm:bottom-[14%] sm:left-auto sm:right-[30%]"
      >
        <WavySticker className="h-24 w-24 md:h-32 md:w-32">
          <span className="block font-display text-base font-bold leading-none text-orange-deep md:text-[1.35rem]">
            ¡Delicioso!
          </span>
        </WavySticker>
      </motion.div>
    </section>
  )
}
