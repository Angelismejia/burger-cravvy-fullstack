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
}

export const formatPrice = (n: number) => `$${n.toFixed(2)}`
