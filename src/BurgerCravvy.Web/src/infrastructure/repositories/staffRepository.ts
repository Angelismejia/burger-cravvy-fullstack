import type { Order, OrderAction } from '../../domain/order'
import type { Product, ProductDraft } from '../../domain/product'
import type { StaffSession } from '../../domain/staff'
import { demoStaffRepository } from '../demo/demoRepositories'
import { isDemo } from '../demo/demoSession'
import { apiRequest } from '../http/apiClient'

export const apiStaffRepository = {
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

  /** Agotado / disponible (cualquier empleado). */
  setAvailability: (token: string, slug: string, isAvailable: boolean) =>
    apiRequest<Product>(`/api/panel/productos/${encodeURIComponent(slug)}/disponibilidad`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isAvailable }),
    }),

  // ---- Solo Admin ----
  createProduct: (token: string, draft: ProductDraft) =>
    apiRequest<Product>('/api/panel/productos', { method: 'POST', token, body: JSON.stringify(draft) }),

  updateProduct: (token: string, slug: string, draft: ProductDraft) =>
    apiRequest<Product>(`/api/panel/productos/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(draft),
    }),

  archiveProduct: (token: string, slug: string) =>
    apiRequest<Product>(`/api/panel/productos/${encodeURIComponent(slug)}/retirar`, { method: 'POST', token }),

  restoreProduct: (token: string, slug: string) =>
    apiRequest<Product>(`/api/panel/productos/${encodeURIComponent(slug)}/reactivar`, { method: 'POST', token }),
}

/** En el modo demo, el panel trabaja sobre los datos de la sesión de demo. */
export const staffRepository = isDemo ? demoStaffRepository : apiStaffRepository
