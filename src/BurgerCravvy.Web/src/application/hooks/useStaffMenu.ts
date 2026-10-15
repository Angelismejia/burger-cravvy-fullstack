import { useCallback, useEffect, useState } from 'react'
import type { Product, ProductDraft } from '../../domain/product'
import { ApiError } from '../../infrastructure/http/apiClient'
import { publicHub } from '../../infrastructure/realtime/publicHub'
import { staffRepository } from '../../infrastructure/repositories/staffRepository'

export type SaveResult = { ok: true; product: Product } | { ok: false; message: string; fieldErrors: Record<string, string[]> }

/** Inserta o reemplaza un producto manteniendo el orden: activos primero, retirados al final. */
function upsert(list: Product[], p: Product) {
  const next = list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]
  return [...next.filter((x) => !x.isArchived), ...next.filter((x) => x.isArchived)]
}

export function useStaffMenu(token: string, onUnauthorized: () => void) {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) onUnauthorized()
      else setError(e instanceof Error ? e.message : 'Algo salió mal.')
    },
    [onUnauthorized],
  )

  useEffect(() => {
    staffRepository.getMenu(token).then(setProducts).catch(handleError)
  }, [token, handleError])

  // Cambios hechos por otro empleado o administrador aparecen sin recargar.
  useEffect(() => publicHub().on('ProductUpdated', (p) => setProducts((prev) => upsert(prev, p))), [])

  /** Ejecuta una acción sobre un producto mostrando su estado de guardado. */
  const run = async (id: string, action: () => Promise<Product>) => {
    setSavingId(id)
    setError(null)
    try {
      const updated = await action()
      setProducts((prev) => upsert(prev, updated))
    } catch (e) {
      handleError(e)
    } finally {
      setSavingId(null)
    }
  }

  const setAvailability = (id: string, available: boolean) =>
    run(id, () => staffRepository.setAvailability(token, id, available))
  const archive = (id: string) => run(id, () => staffRepository.archiveProduct(token, id))
  const restore = (id: string) => run(id, () => staffRepository.restoreProduct(token, id))

  /** Crear (sin id) o editar (con id). Devuelve los errores por campo para el formulario. */
  const save = async (draft: ProductDraft, id?: string): Promise<SaveResult> => {
    try {
      const product = id
        ? await staffRepository.updateProduct(token, id, draft)
        : await staffRepository.createProduct(token, draft)
      setProducts((prev) => upsert(prev, product))
      return { ok: true, product }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) onUnauthorized()
      return {
        ok: false,
        message: e instanceof Error ? e.message : 'Algo salió mal.',
        fieldErrors: e instanceof ApiError ? e.fieldErrors : {},
      }
    }
  }

  return { products, error, savingId, setAvailability, archive, restore, save }
}
