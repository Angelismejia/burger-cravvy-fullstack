import { useState } from 'react'
import type { Order } from '../../domain/order'
import { orderRepository } from '../../infrastructure/repositories/orderRepository'
import { lastOrderStore } from '../../infrastructure/storage/sessionStore'
import { useCart } from '../CartContext'

type State =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'success'; order: Order }
  | { status: 'error'; message: string }

/** Caso de uso: enviar el carrito a la API como pedido pendiente (sin pago). */
export function usePlaceOrder() {
  const { lines, clear } = useCart()
  const [state, setState] = useState<State>({ status: 'idle' })

  const placeOrder = async (customerName: string) => {
    setState({ status: 'sending' })
    try {
      const order = await orderRepository.create({
        customerName,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      })
      clear()
      lastOrderStore.save(order.code)
      setState({ status: 'success', order })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Algo salió mal.' })
    }
  }

  return { state, placeOrder, reset: () => setState({ status: 'idle' }) }
}
