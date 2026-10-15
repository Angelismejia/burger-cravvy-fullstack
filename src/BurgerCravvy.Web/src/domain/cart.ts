import type { Product } from './product'

/** Carrito como mapa id de producto → cantidad. Funciones puras, sin React. */
export type CartItems = Record<string, number>

export interface CartLine {
  product: Product
  quantity: number
}

export const MAX_QUANTITY = 50

export function setQuantity(items: CartItems, id: string, quantity: number): CartItems {
  const next = { ...items }
  const q = Math.min(quantity, MAX_QUANTITY)
  if (q <= 0) delete next[id]
  else next[id] = q
  return next
}

export function toLines(items: CartItems, catalog: Product[]): CartLine[] {
  return catalog.filter((p) => items[p.id]).map((product) => ({ product, quantity: items[product.id] }))
}

export const countItems = (lines: CartLine[]) => lines.reduce((s, l) => s + l.quantity, 0)
export const totalPrice = (lines: CartLine[]) => lines.reduce((s, l) => s + l.quantity * l.product.price, 0)
