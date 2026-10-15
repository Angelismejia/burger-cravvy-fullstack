import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Loader2 } from 'lucide-react'
import { useStaffMenu } from '../../application/hooks/useStaffMenu'
import { formatPrice, type Product } from '../../domain/product'

interface Props {
  token: string
  onUnauthorized: () => void
}

export default function MenuManager({ token, onUnauthorized }: Props) {
  const { products, error, savingId, update } = useStaffMenu(token, onUnauthorized)

  return (
    <section aria-labelledby="menu-admin-title">
      <h1 id="menu-admin-title" className="font-display text-3xl font-bold text-orange-deep md:text-4xl">
        Menú
      </h1>
      <p className="font-ui text-sm text-green-dark/70">
        Marca productos como agotados o ajusta precios. Los clientes ven los cambios al recargar la web.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-pink-pastel/35 px-4 py-3 font-body text-green-dark">
          {error}
        </p>
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <ProductRow product={p} saving={savingId === p.id} onUpdate={update} />
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

function ProductRow({
  product,
  saving,
  onUpdate,
}: {
  product: Product
  saving: boolean
  onUpdate: (id: string, patch: { isAvailable?: boolean; price?: number }) => Promise<boolean>
}) {
  const [price, setPrice] = useState(product.price.toFixed(2))
  const [saved, setSaved] = useState(false)

  useEffect(() => setPrice(product.price.toFixed(2)), [product.price])
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 1500)
    return () => clearTimeout(t)
  }, [saved])

  const parsed = Number(price)
  const priceChanged = Number.isFinite(parsed) && parsed > 0 && parsed.toFixed(2) !== product.price.toFixed(2)

  return (
    <div className={`flex gap-4 rounded-[24px] bg-white-warm p-4 ring-1 ring-brown-light/15 transition ${product.isAvailable ? '' : 'opacity-75'}`}>
      <img src={product.image} alt="" width={96} height={96} className="h-24 w-24 shrink-0 rounded-[18px] object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-lg font-bold leading-tight text-green-dark">{product.name}</h2>
          {/* interruptor Disponible / Agotado */}
          <button
            type="button"
            role="switch"
            aria-checked={product.isAvailable}
            aria-label={`${product.name} disponible`}
            disabled={saving}
            onClick={() => onUpdate(product.id, { isAvailable: !product.isAvailable })}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${product.isAvailable ? 'bg-emerald-vintage' : 'bg-brown-light/40'}`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-1 h-5 w-5 rounded-full bg-white-warm shadow ${product.isAvailable ? 'right-1' : 'left-1'}`}
            />
          </button>
        </div>
        <p className={`font-ui text-xs font-bold uppercase tracking-wider ${product.isAvailable ? 'text-emerald-vintage' : 'text-orange-deep'}`}>
          {product.isAvailable ? 'Disponible' : 'Agotado'}
        </p>

        <form
          className="mt-auto flex items-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (priceChanged && (await onUpdate(product.id, { price: parsed }))) setSaved(true)
          }}
        >
          <label htmlFor={`price-${product.id}`} className="sr-only">
            Precio de {product.name}
          </label>
          <span className="font-ui text-green-dark/60">$</span>
          <input
            id={`price-${product.id}`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 rounded-full border-2 border-brown-light/25 bg-cream px-3 py-1.5 font-ui text-green-dark outline-none focus:border-orange-retro"
          />
          <button
            type="submit"
            disabled={!priceChanged || saving}
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-orange-deep px-3 font-ui text-xs font-bold uppercase text-white-warm transition hover:bg-emerald-vintage disabled:bg-brown-light/30"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
          <span className="sr-only" aria-live="polite">
            {saved ? `Precio guardado: ${formatPrice(product.price)}` : ''}
          </span>
        </form>
      </div>
    </div>
  )
}
