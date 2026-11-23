import { isFinal, type Order } from './order'

/** Pedidos que recuerda el navegador del cliente. */
export const HISTORY_LIMIT = 20

/** Añade un código al principio del historial, sin repetidos y sin pasar del límite. */
export function rememberCode(codes: string[], code: string): string[] {
  const clean = code.trim().toUpperCase()
  if (!clean) return codes
  return [clean, ...codes.filter((c) => c !== clean)].slice(0, HISTORY_LIMIT)
}

const newestFirst = (a: Order, b: Order) => b.createdAtUtc.localeCompare(a.createdAtUtc)

/** Primero los pedidos en curso y después los terminados; dentro de cada grupo, el más reciente arriba. */
export function sortHistory(orders: Order[]): Order[] {
  return [...orders.filter((o) => !isFinal(o.status)).sort(newestFirst), ...orders.filter((o) => isFinal(o.status)).sort(newestFirst)]
}

/** Pedidos que todavía no se han entregado ni cancelado. */
export const countActive = (orders: Order[]) => orders.filter((o) => !isFinal(o.status)).length

/** "2× Classic Cravvy, 1× Papas" */
export const summarizeItems = (order: Order) => order.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')
