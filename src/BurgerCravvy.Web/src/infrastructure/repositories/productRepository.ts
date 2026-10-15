import type { Product } from '../../domain/product'
import { apiRequest } from '../http/apiClient'
import { fallbackProducts } from './fallbackProducts'

export interface MenuResult {
  products: Product[]
  source: 'api' | 'offline'
}

export const productRepository = {
  async getFavorites(): Promise<MenuResult> {
    try {
      const products = await apiRequest<Product[]>('/api/productos?favoritos=true')
      return { products, source: 'api' }
    } catch {
      return { products: fallbackProducts, source: 'offline' }
    }
  },
}
