import type { Order, OrderRequest } from '../../domain/order'
import { demoOrderRepository } from '../demo/demoRepositories'
import { isDemo } from '../demo/demoSession'
import { apiRequest } from '../http/apiClient'

export const apiOrderRepository = {
  create: (request: OrderRequest) =>
    apiRequest<Order>('/api/pedidos', { method: 'POST', body: JSON.stringify(request) }),

  getByCode: (code: string) => apiRequest<Order>(`/api/pedidos/${encodeURIComponent(code)}`),
}

/** En el modo demo, los pedidos se quedan en el navegador. */
export const orderRepository = isDemo ? demoOrderRepository : apiOrderRepository
