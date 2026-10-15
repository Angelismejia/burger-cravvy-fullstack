import { useCart } from '../../application/CartContext'

interface OrderButtonProps {
  variant?: 'orange' | 'cream'
  className?: string
}

/**
 * "ORDER NOW": opens the cart when it has items, otherwise
 * scrolls to the menu so the visitor can pick something first.
 */
export default function OrderButton({ variant = 'orange', className = '' }: OrderButtonProps) {
  const { count, open } = useCart()

  const handleClick = () => {
    if (count > 0) open()
    else document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
  }

  const styles =
    variant === 'orange'
      ? 'bg-orange-deep text-white-warm hover:bg-emerald-vintage'
      : 'bg-white-warm text-orange-deep hover:bg-green-dark hover:text-white-warm'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 font-ui text-sm font-bold uppercase tracking-wider transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_6px_0_-1px_rgba(35,105,79,0.25)] active:translate-y-0 md:px-8 ${styles} ${className}`}
      aria-label={count > 0 ? `Pide ya — ver carrito con ${count} productos` : 'Pide ya — ver nuestro menú'}
    >
      Pide ya
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-mustard px-1 text-[11px] leading-none text-green-dark">
          {count}
        </span>
      )}
    </button>
  )
}
