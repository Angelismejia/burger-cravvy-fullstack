import type { Order, OrderAction } from '../../domain/order'
import type { Product } from '../../domain/product'
import type { StaffSession } from '../../domain/staff'
import { apiRequest } from '../http/apiClient'

export const staffRepository = {
  login: (email: string, password: string) =>
    apiRequest<StaffSession>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getQueue: (token: string) => apiRequest<Order[]>('/api/panel/pedidos', { token }),

  changeStatus: (token: string, code: string, action: OrderAction) =>
    apiRequest<Order>(`/api/panel/pedidos/${encodeURIComponent(code)}/estado`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ action }),
    }),

  getMenu: (token: string) => apiRequest<Product[]>('/api/panel/productos', { token }),

  updateProduct: (token: string, slug: string, patch: { isAvailable?: boolean; price?: number }) =>
    apiRequest<Product>(`/api/panel/productos/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(patch),
    }),
}
