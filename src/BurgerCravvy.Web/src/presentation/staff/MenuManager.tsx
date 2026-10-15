import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Archive, ArchiveRestore, Loader2, Pencil, Plus, Star } from 'lucide-react'
import { useStaffMenu } from '../../application/hooks/useStaffMenu'
import { formatPrice, type Product } from '../../domain/product'
import ProductFormDialog from './ProductFormDialog'

interface Props {
  token: string
  isAdmin: boolean
  onUnauthorized: () => void
}

type FormState = { open: false } | { open: true; product?: Product }

export default function MenuManager({ token, isAdmin, onUnauthorized }: Props) {
  const { products, error, savingId, setAvailability, archive, restore, save } = useStaffMenu(token, onUnauthorized)
  const [form, setForm] = useState<FormState>({ open: false })
  const closeForm = useCallback(() => setForm({ open: false }), [])

  const active = products.filter((p) => !p.isArchived)
  const archived = products.filter((p) => p.isArchived)

  return (
    <section aria-labelledby="menu-admin-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="menu-admin-title" className="font-display text-3xl font-bold text-orange-deep md:text-4xl">
            Menú
          </h1>
          <p className="font-ui text-sm text-green-dark/70">
            {isAdmin
              ? 'Crea productos, ajusta precios y elige qué sale en la portada. Los clientes lo ven al instante.'
              : 'Marca productos como agotados o disponibles. Los clientes lo ven al instante.'}
          </p>
        </div>
        {isAdmin && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setForm({ open: true })}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-deep px-5 font-ui text-sm font-bold uppercase tracking-wider text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage"
          >
            <Plus className="h-4 w-4" aria-hidden /> Nuevo producto
          </motion.button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-pink-pastel/35 px-4 py-3 font-body text-green-dark">
          {error}
        </p>
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {active.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ProductRow
                product={p}
                isAdmin={isAdmin}
                saving={savingId === p.id}
                onToggle={() => setAvailability(p.id, !p.isAvailable)}
                onEdit={() => setForm({ open: true, product: p })}
                onArchive={() => archive(p.id)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {isAdmin && archived.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-green-dark">Retirados del menú</h2>
          <p className="font-ui text-sm text-green-dark/65">No se muestran ni se pueden pedir. Los pedidos antiguos los conservan.</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {archived.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-[20px] border-2 border-dashed border-brown-light/25 bg-white-warm/60 p-3"
                >
                  <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-[14px] object-cover grayscale" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-green-dark/80">{p.name}</p>
                    <p className="font-ui text-xs text-green-dark/60">{formatPrice(p.price)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={savingId === p.id}
                    onClick={() => restore(p.id)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-emerald-vintage px-3 font-ui text-xs font-bold text-white-warm transition hover:bg-green-dark disabled:opacity-60"
                  >
                    {savingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArchiveRestore className="h-3.5 w-3.5" />}
                    Reactivar
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {isAdmin && (
        <ProductFormDialog
          open={form.open}
          product={form.open ? form.product : undefined}
          onClose={closeForm}
          onSave={save}
        />
      )}
    </section>
  )
}

function ProductRow({
  product,
  isAdmin,
  saving,
  onToggle,
  onEdit,
  onArchive,
}: {
  product: Product
  isAdmin: boolean
  saving: boolean
  onToggle: () => void
  onEdit: () => void
  onArchive: () => void
}) {
  return (
    <div className={`flex h-full gap-4 rounded-[24px] bg-white-warm p-4 ring-1 ring-brown-light/15 transition ${product.isAvailable ? '' : 'opacity-75'}`}>
      <div className="relative shrink-0">
        <img src={product.image} alt="" width={96} height={96} className="h-24 w-24 rounded-[18px] object-cover" />
        {product.isFavorite && (
          <span
            className="absolute -left-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-mustard shadow"
            title="En Nuestros Favoritos"
          >
            <Star className="h-4 w-4 fill-white-warm text-white-warm" aria-label="En Nuestros Favoritos" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-lg font-bold leading-tight text-green-dark">{product.name}</h2>
          {/* interruptor Disponible / Agotado: cualquier empleado */}
          <button
            type="button"
            role="switch"
            aria-checked={product.isAvailable}
            aria-label={`${product.name} disponible`}
            disabled={saving}
            onClick={onToggle}
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

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <span className="font-display text-lg font-semibold text-green-dark">{formatPrice(product.price)}</span>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-green-dark/60" aria-label="Guardando" />}
          {isAdmin && (
            <span className="ml-auto flex gap-1.5">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex min-h-9 items-center gap-1 rounded-full bg-orange-deep px-3 font-ui text-xs font-bold text-white-warm transition hover:bg-emerald-vintage"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onArchive}
                className="grid h-9 w-9 place-items-center rounded-full text-brown-light ring-1 ring-brown-light/30 transition hover:bg-pink-pastel/40 hover:text-orange-deep disabled:opacity-50"
                aria-label={`Retirar ${product.name} del menú`}
                title="Retirar del menú"
              >
                <Archive className="h-4 w-4" />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
