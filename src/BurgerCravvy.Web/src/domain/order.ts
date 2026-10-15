export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled'

/** Acciones que el panel puede pedir a la API. */
export type OrderAction = 'preparar' | 'listo' | 'entregar' | 'cancelar'

export interface OrderRequest {
  customerName: string
  items: { productId: string; quantity: number }[]
}

export interface Order {
  code: string
  customerName: string
  status: OrderStatus
  statusLabel: string
  createdAtUtc: string
  updatedAtUtc: string | null
  total: number
  items: { productName: string; unitPrice: number; quantity: number; subtotal: number }[]
}

/** Recorrido "feliz" de un pedido, en orden, para la línea de tiempo del cliente. */
export const ORDER_FLOW: { status: OrderStatus; label: string }[] = [
  { status: 'Pending', label: 'Recibido' },
  { status: 'Preparing', label: 'En preparación' },
  { status: 'Ready', label: 'Listo para recoger' },
  { status: 'Delivered', label: 'Entregado' },
]

/** Siguiente paso que puede dar la cocina desde cada estado. */
export const NEXT_ACTION: Partial<Record<OrderStatus, { action: OrderAction; label: string }>> = {
  Pending: { action: 'preparar', label: 'Empezar' },
  Preparing: { action: 'listo', label: 'Marcar listo' },
  Ready: { action: 'entregar', label: 'Entregado' },
}

export const canCancel = (s: OrderStatus) => s === 'Pending' || s === 'Preparing'

export const isFinal = (s: OrderStatus) => s === 'Delivered' || s === 'Cancelled'
