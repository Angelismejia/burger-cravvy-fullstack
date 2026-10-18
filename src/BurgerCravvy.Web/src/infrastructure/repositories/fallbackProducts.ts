import type { Product } from '../../domain/product'

const unsplash = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

/** Copia local del menú: se usa si la API no responde, para que la web nunca quede vacía. */
export const fallbackProducts: Product[] = [
  {
    id: 'classic-cravvy',
    name: 'Classic Cravvy',
    description: 'Carne jugosa, queso fundido y todos los clásicos.',
    price: 450,
    image: unsplash('1571091718767-18b5b1457add'),
    alt: 'Hamburguesa clásica con queso, lechuga, tomate y pan brioche con sésamo',
    badge: 'sticker',
    isAvailable: true,
    isFavorite: true,
    isArchived: false,
  },
  {
    id: 'double-trouble',
    name: 'Double Trouble',
    description: 'El doble de sabor, el doble de felicidad.',
    price: 595,
    image: unsplash('1553979459-d2229ba7433b'),
    alt: 'Hamburguesa doble de carne con queso fundido',
    badge: 'heart',
    isAvailable: true,
    isFavorite: true,
    isArchived: false,
  },
  {
    id: 'golden-fries',
    name: 'Papas Doradas',
    description: 'Doradas, crujientes e imposibles de compartir.',
    price: 225,
    image: unsplash('1573080496219-bb080dd4f877'),
    alt: 'Papas fritas doradas y crujientes en una cesta con papel',
    badge: 'fries',
    isAvailable: true,
    isFavorite: true,
    isArchived: false,
  },
]
