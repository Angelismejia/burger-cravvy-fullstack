import type { CartItems } from '../../domain/cart'
import { scopedKey } from '../demo/demoSession'

const KEY = scopedKey('burger-cravvy-cart')

export const cartStorage = {
  load(): CartItems {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
      return Object.fromEntries(
        Object.entries(parsed).filter(([, q]) => Number.isInteger(q) && (q as number) > 0),
      ) as CartItems
    } catch {
      return {}
    }
  },
  save(items: CartItems) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* almacenamiento no disponible: el carrito sigue funcionando en memoria */
    }
  },
}
