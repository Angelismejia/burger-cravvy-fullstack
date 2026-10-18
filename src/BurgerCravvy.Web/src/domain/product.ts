export type ProductBadge = 'sticker' | 'heart' | 'fries'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  alt: string
  badge: ProductBadge
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
  isFavorite: boolean
}

export const BADGES: { value: ProductBadge; label: string }[] = [
  { value: 'sticker', label: 'Pegatina «Más vendida»' },
  { value: 'heart', label: 'Corazón' },
  { value: 'fries', label: 'Papas' },
]

/** ¿Debe aparecer en «Nuestros Favoritos» de la web pública? */
export const isPublicFavorite = (p: Product) => p.isFavorite && !p.isArchived

const dop = new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatPrice = (n: number) => `RD$ ${dop.format(n)}`
