import { describe, expect, it } from 'vitest'
import { countItems, MAX_QUANTITY, setQuantity, toLines, totalPrice } from '../cart'
import type { Product } from '../product'

const product = (id: string, price: number): Product => ({
  id,
  name: id,
  description: '',
  price,
  image: '',
  alt: '',
  badge: 'sticker',
  isAvailable: true,
})

const catalog = [product('classic', 8.99), product('fries', 4.99)]

describe('carrito', () => {
  it('suma cantidades y calcula el total', () => {
    let items = setQuantity({}, 'classic', 2)
    items = setQuantity(items, 'fries', 1)
    const lines = toLines(items, catalog)

    expect(countItems(lines)).toBe(3)
    expect(totalPrice(lines)).toBeCloseTo(22.97)
  })

  it('cantidad 0 o negativa quita el producto', () => {
    const items = setQuantity({ classic: 1 }, 'classic', 0)
    expect(items).toEqual({})
    expect(setQuantity({ classic: 1 }, 'classic', -3)).toEqual({})
  })

  it('no supera la cantidad máxima', () => {
    expect(setQuantity({}, 'classic', 999).classic).toBe(MAX_QUANTITY)
  })

  it('no modifica el objeto original', () => {
    const original = { classic: 1 }
    setQuantity(original, 'classic', 5)
    expect(original).toEqual({ classic: 1 })
  })

  it('ignora productos que ya no están en el catálogo', () => {
    const lines = toLines({ classic: 1, retirado: 4 }, catalog)
    expect(lines.map((l) => l.product.id)).toEqual(['classic'])
  })
})
