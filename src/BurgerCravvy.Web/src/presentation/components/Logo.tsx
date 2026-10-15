import BurgerIcon from './BurgerIcon'

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className="group flex items-center gap-2.5" aria-label="Burger Cravvy — volver arriba">
      <BurgerIcon
        className={`${compact ? 'h-10 w-11' : 'h-12 w-14 md:h-14 md:w-16'} shrink-0 transition-transform duration-300 group-hover:-rotate-6`}
      />
      <span className={`font-display font-bold leading-[0.88] ${compact ? 'text-xl' : 'text-[1.4rem] md:text-[1.6rem]'}`}>
        <span className="block text-orange-deep">Burger</span>
        <span className="block text-green-dark">Cravvy</span>
      </span>
    </a>
  )
}
