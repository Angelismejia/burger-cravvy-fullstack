import { describe, expect, it } from 'vitest'
import { byCategory, isOnPublicMenu, isPublicFavorite, type Product, type ProductCategory } from '../product'

const product = (id: string, category: ProductCategory, extra: Partial<Product> = {}): Product => ({
  id,
  name: id,
  description: '',
  price: 100,
  image: '',
  alt: '',
  badge: 'none',
  category,
  isAvailable: true,
  isFavorite: false,
  isArchived: false,
  ...extra,
})

const menu = [product('classic', 'burger'), product('fries', 'side'), product('shake', 'drink'), product('bacon', 'burger')]

describe('menú por secciones', () => {
  it('«all» devuelve todo el menú', () => {
    expect(byCategory(menu, 'all')).toHaveLength(4)
  })

  it('filtra por categoría conservando el orden', () => {
    expect(byCategory(menu, 'burger').map((p) => p.id)).toEqual(['classic', 'bacon'])
  })

  it('una sección sin productos queda vacía', () => {
    expect(byCategory(menu, 'dessert')).toEqual([])
  })

  it('los retirados no salen en el menú ni en favoritos', () => {
    const archived = product('old', 'burger', { isArchived: true, isFavorite: true })
    expect(isOnPublicMenu(archived)).toBe(false)
    expect(isPublicFavorite(archived)).toBe(false)
  })
})
