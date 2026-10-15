import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ImageOff, Loader2, Star, X } from 'lucide-react'
import { BADGES, type Product, type ProductDraft } from '../../domain/product'
import type { SaveResult } from '../../application/hooks/useStaffMenu'

interface Props {
  open: boolean
  /** Producto a editar; sin él, el formulario crea uno nuevo. */
  product?: Product
  onClose: () => void
  onSave: (draft: ProductDraft, id?: string) => Promise<SaveResult>
}

const empty: ProductDraft = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  imageAlt: '',
  badge: 'sticker',
  isFavorite: true,
}

const toDraft = (p: Product): ProductDraft => ({
  name: p.name,
  description: p.description,
  price: p.price,
  imageUrl: p.image,
  imageAlt: p.alt,
  badge: p.badge,
  isFavorite: p.isFavorite,
})

const inputCls =
  'mt-1 w-full rounded-2xl border-2 border-brown-light/25 bg-cream px-4 py-2.5 font-body text-green-dark outline-none transition focus:border-orange-retro aria-[invalid=true]:border-orange-deep'

export default function ProductFormDialog({ open, product, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ProductDraft>(empty)
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageBroken, setImageBroken] = useState(false)
  const firstInput = useRef<HTMLInputElement>(null)

  // Al abrir: precarga el producto (o vacío) y enfoca el primer campo.
  useEffect(() => {
    if (!open) return
    const initial = product ? toDraft(product) : empty
    setDraft(initial)
    setPrice(product ? product.price.toFixed(2) : '')
    setErrors({})
    setMessage(null)
    setImageBroken(false)
    requestAnimationFrame(() => firstInput.current?.focus())
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, product, onClose])

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const submit = async () => {
    setSaving(true)
    const result = await onSave({ ...draft, price: Number(price) }, product?.id)
    setSaving(false)
    if (result.ok) onClose()
    else {
      setErrors(result.fieldErrors)
      setMessage(Object.keys(result.fieldErrors).length ? 'Revisa los campos marcados.' : result.message)
    }
  }

  const fieldError = (key: string) => errors[key]?.[0]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-green-dark/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault()
              if (!saving) void submit()
            }}
            className="paper my-8 w-full max-w-[640px] overflow-hidden rounded-[30px] shadow-[0_10px_0_rgba(35,105,79,0.2)]"
          >
            <header className="flex items-center justify-between bg-emerald-vintage px-6 py-4 text-white-warm">
              <h2 id="product-form-title" className="font-display text-2xl font-bold">
                {product ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white-warm/20"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-[1fr_200px]">
              <div className="space-y-4">
                <Field label="Nombre" error={fieldError('name')} htmlFor="pf-name">
                  <input
                    ref={firstInput}
                    id="pf-name"
                    value={draft.name}
                    maxLength={80}
                    aria-invalid={!!fieldError('name')}
                    onChange={(e) => set('name', e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Descripción" error={fieldError('description')} htmlFor="pf-desc">
                  <textarea
                    id="pf-desc"
                    rows={2}
                    maxLength={300}
                    value={draft.description}
                    aria-invalid={!!fieldError('description')}
                    onChange={(e) => set('description', e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <Field label="Precio ($)" error={fieldError('price')} htmlFor="pf-price">
                  <input
                    id="pf-price"
                    type="number"
                    min="0.01"
                    max="1000"
                    step="0.01"
                    inputMode="decimal"
                    value={price}
                    aria-invalid={!!fieldError('price')}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${inputCls} max-w-40`}
                  />
                </Field>

                <Field label="Foto (dirección web)" error={fieldError('imageUrl')} htmlFor="pf-img">
                  <input
                    id="pf-img"
                    type="url"
                    placeholder="https://…"
                    value={draft.imageUrl}
                    aria-invalid={!!fieldError('imageUrl')}
                    onChange={(e) => {
                      set('imageUrl', e.target.value)
                      setImageBroken(false)
                    }}
                    className={inputCls}
                  />
                </Field>

                <Field label="Descripción de la foto (accesibilidad)" error={fieldError('imageAlt')} htmlFor="pf-alt">
                  <input
                    id="pf-alt"
                    maxLength={200}
                    value={draft.imageAlt}
                    placeholder="Si lo dejas vacío se usa el nombre"
                    aria-invalid={!!fieldError('imageAlt')}
                    onChange={(e) => set('imageAlt', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                {/* Vista previa de la foto */}
                <div className="overflow-hidden rounded-[22px] bg-pink-pastel p-1.5">
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[18px] bg-cream">
                    {draft.imageUrl && !imageBroken ? (
                      <img
                        src={draft.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={() => setImageBroken(true)}
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-1 px-2 text-center font-ui text-xs text-ink/60">
                        <ImageOff className="h-6 w-6" aria-hidden />
                        {draft.imageUrl ? 'No se pudo cargar la foto' : 'Vista previa'}
                      </span>
                    )}
                  </div>
                </div>

                <fieldset>
                  <legend className="font-ui text-sm font-semibold text-green-dark/80">Distintivo</legend>
                  <div className="mt-1 space-y-1.5">
                    {BADGES.map((b) => (
                      <label
                        key={b.value}
                        className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 font-ui text-sm text-green-dark has-[:checked]:bg-mustard/30"
                      >
                        <input
                          type="radio"
                          name="badge"
                          value={b.value}
                          checked={draft.badge === b.value}
                          onChange={() => set('badge', b.value)}
                          className="accent-orange-deep"
                        />
                        {b.label}
                      </label>
                    ))}
                  </div>
                  {fieldError('badge') && <p className="mt-1 font-ui text-xs text-orange-deep">{fieldError('badge')}</p>}
                </fieldset>

                <label className="flex cursor-pointer items-start gap-2 rounded-2xl bg-white-warm p-3 font-ui text-sm text-green-dark ring-1 ring-brown-light/15">
                  <input
                    type="checkbox"
                    checked={draft.isFavorite}
                    disabled={product?.isArchived}
                    onChange={(e) => set('isFavorite', e.target.checked)}
                    className="mt-0.5 accent-orange-deep"
                  />
                  <span>
                    <span className="flex items-center gap-1 font-bold">
                      <Star className="h-4 w-4 fill-mustard text-mustard" aria-hidden /> En «Nuestros Favoritos»
                    </span>
                    <span className="text-xs text-green-dark/65">
                      {product?.isArchived ? 'Reactívalo primero para mostrarlo.' : 'Se muestra en la portada.'}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-3 border-t-2 border-dashed border-brown-light/20 px-6 py-4">
              <p role="alert" className="mr-auto font-body text-sm text-orange-deep">
                {message}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 font-ui text-sm font-bold text-green-dark ring-2 ring-green-dark/15 transition hover:bg-green-dark/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-orange-deep px-6 py-2.5 font-ui text-sm font-bold uppercase tracking-wider text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage disabled:opacity-70"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {product ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-ui text-sm font-semibold text-green-dark/80">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 font-ui text-xs text-orange-deep">{error}</p>}
    </div>
  )
}
