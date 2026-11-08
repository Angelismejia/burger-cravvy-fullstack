export type ProductBadge = 'sticker' | 'heart' | 'fries' | 'none'

/** Sección del menú. Coincide con el enum ProductCategory de la API. */
export type ProductCategory = 'burger' | 'side' | 'drink' | 'dessert'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  alt: string
  badge: ProductBadge
  category: ProductCategory
  isAvailable: boolean
  /** Sale en «Nuestros Favoritos». */
  isFavorite: boolean
  /** Retirado del menú: solo lo ve el administrador. */
  isArchived: boolean
}

/** Datos que el administrador envía al crear o editar un producto. */
export interface ProductDraft {
  name: string
  description: string
  price: number
  imageUrl: string
  imageAlt: string
  badge: ProductBadge
  category: ProductCategory
  isFavorite: boolean
}

export const BADGES: { value: ProductBadge; label: string }[] = [
  { value: 'sticker', label: 'Pegatina «Más vendida»' },
  { value: 'heart', label: 'Corazón' },
  { value: 'fries', label: 'Papas' },
  { value: 'none', label: 'Sin distintivo' },
]

/** Secciones del menú en el orden en que se muestran. */
export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'burger', label: 'Hamburguesas' },
  { value: 'side', label: 'Acompañantes' },
  { value: 'drink', label: 'Bebidas' },
  { value: 'dessert', label: 'Postres' },
]

/** ¿Debe aparecer en «Nuestros Favoritos» de la web pública? */
export const isPublicFavorite = (p: Product) => p.isFavorite && !p.isArchived

/** ¿Debe aparecer en el menú de la web pública? Los retirados solo los ve el Admin. */
export const isOnPublicMenu = (p: Product) => !p.isArchived

/** Filtra el menú por sección; `'all'` devuelve todo. */
export const byCategory = (products: Product[], category: ProductCategory | 'all') =>
  category === 'all' ? products : products.filter((p) => p.category === category)

const dop = new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatPrice = (n: number) => `RD$ ${dop.format(n)}`
