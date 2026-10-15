import { motion } from 'motion/react'
import Logo from './Logo'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white-warm"
    >
      <div className="container-site grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[92px]">
        <Logo />
        <p className="hidden text-center font-hand text-xl text-ink/80 sm:block md:text-[1.45rem]">
          Momentos felices, recuerdos sabrosos.
        </p>
      </div>
    </motion.header>
  )
}
