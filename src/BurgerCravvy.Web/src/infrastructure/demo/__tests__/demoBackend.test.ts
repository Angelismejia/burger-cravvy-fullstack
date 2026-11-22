import { describe, expect, it } from 'vitest'
import type { Product, ProductDraft } from '../../../domain/product'
import { ApiError } from '../../http/apiClient'
import {
  archiveProduct,
  changeOrderStatus,
  createOrder,
  createProduct,
  getOrder,
  initialState,
  newOrderCode,
  orderQueue,
  publicMenu,
  restoreProduct,
  setAvailability,
  slugify,
  staffMenu,
  updateProduct,
  type DemoState,
} from '../demoBackend'

const product = (id: string, price: number, extra: Partial<Product> = {}): Product => ({
  id,
  name: id.toUpperCase(),
  description: '',
  price,
  image: `https://example.com/${id}.jpg`,
  alt: id,
  badge: 'none',
  category: 'burger',
  isAvailable: true,
  isFavorite: true,
  isArchived: false,
  ...extra,
})

const empty = (): DemoState => ({ id: 'test', products: [product('clasica', 300), product('papas', 150)], orders: [] })

const draft = (extra: Partial<ProductDraft> = {}): ProductDraft => ({
  name: 'Bacon Lovers Ñam',
  description: 'Con mucho bacon',
  price: 425.5,
  imageUrl: 'https://example.com/bacon.jpg',
  imageAlt: '',
  badge: 'heart',
  category: 'burger',
  isFavorite: true,
  ...extra,
})

/** Ejecuta `fn` y devuelve el ApiError que lanza. */
function apiError(fn: () => unknown): ApiError {
  try {
    fn()
  } catch (e) {
    if (e instanceof ApiError) return e
    throw e
  }
  throw new Error('No lanzó ningún error')
}

describe('demo: pedidos', () => {
  it('crea el pedido pendiente con los precios del menú, no del carrito', () => {
    const { state, result } = createOrder(empty(), {
      customerName: '  Ana ',
      items: [{ productId: 'clasica', quantity: 2 }, { productId: 'papas', quantity: 1 }],
    })
    expect(result.customerName).toBe('Ana')
    expect(result.status).toBe('Pending')
    expect(result.statusLabel).toBe('Pendiente')
    expect(result.total).toBe(750)
    expect(result.code).toMatch(/^BC-[0-9]{6}-[A-HJKMNP-Z2-9]{6}$/)
    expect(state.orders).toHaveLength(1)
  })

  it('junta las líneas repetidas del mismo producto', () => {
    const { result } = createOrder(empty(), {
      customerName: 'Ana',
      items: [{ productId: 'clasica', quantity: 1 }, { productId: 'clasica', quantity: 2 }],
    })
    expect(result.items).toEqual([{ productName: 'CLASICA', unitPrice: 300, quantity: 3, subtotal: 900 }])
  })

  it('valida nombre y productos con los mismos mensajes que la API', () => {
    const e = apiError(() => createOrder(empty(), { customerName: ' ', items: [] }))
    expect(e.status).toBe(400)
    expect(e.fieldErrors.customerName).toEqual(['Escribe tu nombre para el pedido.'])
    expect(e.fieldErrors.items).toEqual(['El pedido debe tener al menos un producto.'])
  })

  it('no deja pedir productos agotados, retirados o que no existen', () => {
    let state = setAvailability(empty(), 'papas', false).state
    expect(apiError(() => createOrder(state, { customerName: 'Ana', items: [{ productId: 'papas', quantity: 1 }] })).message)
      .toBe('«PAPAS» no está disponible ahora mismo.')

    state = archiveProduct(empty(), 'clasica').state
    expect(apiError(() => createOrder(state, { customerName: 'Ana', items: [{ productId: 'clasica', quantity: 1 }] })).message)
      .toBe('«CLASICA» ya no está en el menú.')

    expect(apiError(() => createOrder(empty(), { customerName: 'Ana', items: [{ productId: 'nada', quantity: 1 }] })).status)
      .toBe(404)
  })

  it('sigue el recorrido pendiente → preparación → listo → entregado', () => {
    let { state, result: order } = createOrder(empty(), { customerName: 'Ana', items: [{ productId: 'clasica', quantity: 1 }] })
    for (const [action, status] of [['preparar', 'Preparing'], ['listo', 'Ready'], ['entregar', 'Delivered']] as const) {
      ;({ state, result: order } = changeOrderStatus(state, order.code, action))
      expect(order.status).toBe(status)
      expect(order.updatedAtUtc).not.toBeNull()
    }
    expect(orderQueue(state)).toHaveLength(0)
    expect(getOrder(state, order.code.toLowerCase()).status).toBe('Delivered')
  })

  it('no permite saltarse pasos ni cancelar lo que ya está listo', () => {
    const created = createOrder(empty(), { customerName: 'Ana', items: [{ productId: 'clasica', quantity: 1 }] })
    expect(apiError(() => changeOrderStatus(created.state, created.result.code, 'entregar')).message)
      .toBe('No se puede pasar el pedido de «Pendiente» a «Entregado».')

    let state = changeOrderStatus(created.state, created.result.code, 'preparar').state
    state = changeOrderStatus(state, created.result.code, 'listo').state
    expect(() => changeOrderStatus(state, created.result.code, 'cancelar')).toThrow(ApiError)
  })

  it('la cola muestra solo los pedidos en curso, del más antiguo al más nuevo', () => {
    let state = empty()
    const at = (min: number) => new Date(Date.UTC(2026, 10, 20, 12, min))
    state = createOrder(state, { customerName: 'Nuevo', items: [{ productId: 'clasica', quantity: 1 }] }, at(30)).state
    const viejo = createOrder(state, { customerName: 'Viejo', items: [{ productId: 'clasica', quantity: 1 }] }, at(10))
    const cancelado = createOrder(viejo.state, { customerName: 'X', items: [{ productId: 'clasica', quantity: 1 }] }, at(20))
    state = changeOrderStatus(cancelado.state, cancelado.result.code, 'cancelar').state

    expect(orderQueue(state).map((o) => o.customerName)).toEqual(['Viejo', 'Nuevo'])
  })

  it('genera códigos con fecha y el alfabeto sin caracteres confusos', () => {
    expect(newOrderCode(new Date(Date.UTC(2026, 10, 17)), () => 0)).toBe('BC-261117-AAAAAA')
  })
})

describe('demo: menú', () => {
  it('crea productos con un slug único a partir del nombre', () => {
    const first = createProduct(empty(), draft())
    expect(first.result.id).toBe('bacon-lovers-nam')
    expect(first.result.alt).toBe('Bacon Lovers Ñam')
    expect(first.result.isAvailable).toBe(true)
    expect(createProduct(first.state, draft()).result.id).toBe('bacon-lovers-nam-2')
  })

  it('valida el formulario con errores por campo', () => {
    const e = apiError(() => createProduct(empty(), draft({ name: '', price: 0, imageUrl: 'foto.jpg' })))
    expect(Object.keys(e.fieldErrors).sort()).toEqual(['imageUrl', 'name', 'price'])
  })

  it('editar no cambia el slug', () => {
    const { result } = updateProduct(empty(), 'clasica', draft({ name: 'Clásica 2.0', price: 350 }))
    expect(result.id).toBe('clasica')
    expect(result.name).toBe('Clásica 2.0')
    expect(result.price).toBe(350)
  })

  it('retirar quita el producto del menú público y de favoritos; reactivar lo devuelve', () => {
    const archived = archiveProduct(empty(), 'clasica')
    expect(archived.result.isFavorite).toBe(false)
    expect(publicMenu(archived.state).map((p) => p.id)).toEqual(['papas'])
    expect(staffMenu(archived.state).map((p) => p.id)).toEqual(['papas', 'clasica'])

    const restored = restoreProduct(archived.state, 'clasica')
    expect(publicMenu(restored.state)).toHaveLength(2)
  })

  it('no modifica el estado anterior (cada cambio devuelve uno nuevo)', () => {
    const before = empty()
    setAvailability(before, 'clasica', false)
    expect(before.products[0].isAvailable).toBe(true)
  })

  it('slugify quita acentos y símbolos', () => {
    expect(slugify('  Papas Fritas ¡Ñam! ')).toBe('papas-fritas-nam')
    expect(slugify('¿?')).toBe('producto')
  })
})

describe('demo: estado inicial', () => {
  it('copia el menú y crea dos pedidos de ejemplo en la cola', () => {
    const menu = [product('clasica', 300), product('papas', 150)]
    const state = initialState('abc', menu)
    expect(state.id).toBe('abc')
    expect(state.products).toEqual(menu)
    expect(state.products[0]).not.toBe(menu[0])
    expect(orderQueue(state).map((o) => [o.customerName, o.status])).toEqual([
      ['Ana', 'Preparing'],
      ['Luis', 'Pending'],
    ])
  })

  it('sin productos disponibles empieza sin pedidos', () => {
    expect(initialState('abc', [product('clasica', 300, { isAvailable: false })]).orders).toEqual([])
  })
})
