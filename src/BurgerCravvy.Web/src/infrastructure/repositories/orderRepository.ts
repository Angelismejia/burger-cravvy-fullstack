import type { Order, OrderRequest } from '../../domain/order'
import { apiRequest } from '../http/apiClient'

export const orderRepository = {
  create: (request: OrderRequest) =>
    apiRequest<Order>('/api/pedidos', { method: 'POST', body: JSON.stringify(request) }),

  getByCode: (code: string) => apiRequest<Order>(`/api/pedidos/${encodeURIComponent(code)}`),
}
