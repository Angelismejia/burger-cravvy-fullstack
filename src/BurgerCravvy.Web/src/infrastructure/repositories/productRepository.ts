import type { Product } from '../../domain/product'
import { apiRequest } from '../http/apiClient'
import { fallbackProducts } from './fallbackProducts'

export interface MenuResult {
  products: Product[]
  source: 'api' | 'offline'
}

export const productRepository = {
  /** Menú público completo (sin los retirados). Si la API no responde, usa la copia local. */
  async getMenu(): Promise<MenuResult> {
    try {
      const products = await apiRequest<Product[]>('/api/productos')
      return { products, source: 'api' }
    } catch {
      return { products: fallbackProducts, source: 'offline' }
    }
  },
}
