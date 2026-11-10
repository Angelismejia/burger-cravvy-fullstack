import { useCart } from '../../application/CartContext'
import BouncyTitle from './BouncyTitle'
import ProductCard from './ProductCard'

/** «Nuestros Favoritos»: los productos que el Admin marca para la portada. */
export default function FavoriteProducts() {
  const { favorites, menuSource } = useCart()

  return (
    <section id="favoritos" aria-labelledby="favorites-title" className="relative z-10 pt-16 md:pt-20">
      <div className="container-site">
        <BouncyTitle id="favorites-title" anchorId="favorites" text="Nuestros Favoritos" />

        {menuSource === 'offline' && (
          <p className="mt-6 text-center font-ui text-xs text-ink/70" role="status">
            Mostrando el menú sin conexión — la API no responde.
          </p>
        )}

        <div className="mx-auto mt-10 grid max-w-[1000px] gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 max-sm:max-w-[360px]">
          {favorites.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
