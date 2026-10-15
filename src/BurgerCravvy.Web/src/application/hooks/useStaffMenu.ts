import { useCallback, useEffect, useState } from 'react'
import type { Product } from '../../domain/product'
import { ApiError } from '../../infrastructure/http/apiClient'
import { staffRepository } from '../../infrastructure/repositories/staffRepository'

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

  const update = async (id: string, patch: { isAvailable?: boolean; price?: number }) => {
    setSavingId(id)
    setError(null)
    try {
      const updated = await staffRepository.updateProduct(token, id, patch)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return true
    } catch (e) {
      handleError(e)
      return false
    } finally {
      setSavingId(null)
    }
  }

  return { products, error, savingId, update }
}
