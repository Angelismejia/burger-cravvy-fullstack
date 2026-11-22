import { isFinal, type Order, type OrderAction, type OrderRequest, type OrderStatus } from '../../domain/order'
import { BADGES, CATEGORIES, type Product, type ProductDraft } from '../../domain/product'
import { ApiError } from '../http/apiClient'

/**
 * «Backend» del modo demo: las mismas reglas que la API (.NET), pero sobre datos en memoria.
 * Funciones puras: reciben el estado y devuelven el estado nuevo junto con el resultado.
 * Los errores se lanzan como ApiError, igual que los devolvería la API real.
 */

export interface DemoState {
  /** Identifica la sesión de demo: las pestañas con el mismo id comparten los datos. */
  id: string
  products: Product[]
  orders: Order[]
}

export interface Change<T> {
  state: DemoState
  result: T
}

const MAX_PRICE = 50_000
const MAX_QUANTITY = 50
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: 'Pendiente',
  Preparing: 'En preparación',
  Ready: 'Listo',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
}

/** Acción del panel → [estado nuevo, estados desde los que se permite]. */
const TRANSITIONS: Record<OrderAction, [OrderStatus, OrderStatus[]]> = {
  preparar: ['Preparing', ['Pending']],
  listo: ['Ready', ['Preparing']],
  entregar: ['Delivered', ['Ready']],
  cancelar: ['Cancelled', ['Pending', 'Preparing']],
}

const validationError = (errors: Record<string, string[]>) =>
  new ApiError(Object.values(errors)[0][0], 400, errors)

const notFound = (message: string) => new ApiError(message, 404)

/** Código con el mismo formato que la API: BC-yyMMdd-XXXXXX. */
export function newOrderCode(now: Date, random: () => number = Math.random) {
  const date = now.toISOString().slice(2, 10).replace(/-/g, '')
  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]
  return `BC-${date}-${suffix}`
}

/** "Bacon Lovers Ñam" → "bacon-lovers-nam" (igual que MenuAdminService.Slugify). */
export function slugify(text: string) {
  const slug = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '')
  return slug || 'producto'
}

function uniqueSlug(products: Product[], name: string) {
  const base = slugify(name)
  let slug = base
  for (let n = 2; products.some((p) => p.id === slug); n++) slug = `${base}-${n}`
  return slug
}

/** Activos primero y retirados al final, como el endpoint del panel. */
const sortMenu = (products: Product[]) => [...products.filter((p) => !p.isArchived), ...products.filter((p) => p.isArchived)]

function findProduct(state: DemoState, slug: string) {
  const product = state.products.find((p) => p.id === slug)
  if (!product) throw notFound(`No encontramos el producto «${slug}».`)
  return product
}

function replaceProduct(state: DemoState, product: Product): Change<Product> {
  const exists = state.products.some((p) => p.id === product.id)
  const products = exists ? state.products.map((p) => (p.id === product.id ? product : p)) : [...state.products, product]
  return { state: { ...state, products }, result: product }
}

// ---------- web pública ----------

/** Menú público: sin los productos retirados. */
export const publicMenu = (state: DemoState) => state.products.filter((p) => !p.isArchived)

export function createOrder(state: DemoState, request: OrderRequest, now = new Date()): Change<Order> {
  const errors: Record<string, string[]> = {}
  const name = request.customerName?.trim() ?? ''
  if (!name) errors.customerName = ['Escribe tu nombre para el pedido.']
  else if (name.length > 80) errors.customerName = ['El nombre no puede superar 80 caracteres.']
  if (!request.items?.length) errors.items = ['El pedido debe tener al menos un producto.']
  else if (request.items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > MAX_QUANTITY))
    errors.items = [`Cada cantidad debe estar entre 1 y ${MAX_QUANTITY}.`]
  if (Object.keys(errors).length) throw validationError(errors)

  const missing = [...new Set(request.items.map((i) => i.productId))].filter((id) => !state.products.some((p) => p.id === id))
  if (missing.length) throw notFound(`Productos no encontrados: ${missing.join(', ')}.`)

  // Los precios salen del «servidor», nunca del carrito.
  const quantities = new Map<string, number>()
  for (const item of request.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)

  const items = [...quantities].map(([id, quantity]) => {
    const product = findProduct(state, id)
    if (product.isArchived) throw new ApiError(`«${product.name}» ya no está en el menú.`, 400)
    if (!product.isAvailable) throw new ApiError(`«${product.name}» no está disponible ahora mismo.`, 400)
    if (quantity > MAX_QUANTITY) throw new ApiError(`La cantidad debe estar entre 1 y ${MAX_QUANTITY}.`, 400)
    return { productName: product.name, unitPrice: product.price, quantity, subtotal: product.price * quantity }
  })

  let code = newOrderCode(now)
  while (state.orders.some((o) => o.code === code)) code = newOrderCode(now)

  const order: Order = {
    code,
    customerName: name,
    status: 'Pending',
    statusLabel: STATUS_LABEL.Pending,
    createdAtUtc: now.toISOString(),
    updatedAtUtc: null,
    total: items.reduce((s, i) => s + i.subtotal, 0),
    items,
  }
  return { state: { ...state, orders: [...state.orders, order] }, result: order }
}

export function getOrder(state: DemoState, code: string): Order {
  const clean = code.trim().toUpperCase()
  const order = state.orders.find((o) => o.code === clean)
  if (!order) throw notFound(`No existe el pedido «${code}».`)
  return order
}

// ---------- panel de cocina ----------

/** Pedidos en curso, del más antiguo al más nuevo. */
export const orderQueue = (state: DemoState) =>
  state.orders.filter((o) => !isFinal(o.status)).sort((a, b) => a.createdAtUtc.localeCompare(b.createdAtUtc))

export function changeOrderStatus(state: DemoState, code: string, action: OrderAction, now = new Date()): Change<Order> {
  const order = getOrder(state, code)
  const transition = TRANSITIONS[action]
  if (!transition) throw validationError({ action: ['Acción no válida. Usa: preparar, listo, entregar o cancelar.'] })

  const [next, allowedFrom] = transition
  if (!allowedFrom.includes(order.status))
    throw new ApiError(`No se puede pasar el pedido de «${STATUS_LABEL[order.status]}» a «${STATUS_LABEL[next]}».`, 400)

  const updated: Order = { ...order, status: next, statusLabel: STATUS_LABEL[next], updatedAtUtc: now.toISOString() }
  return { state: { ...state, orders: state.orders.map((o) => (o.code === order.code ? updated : o)) }, result: updated }
}

/** Menú completo para el panel, con los retirados al final. */
export const staffMenu = (state: DemoState) => sortMenu(state.products)

export const setAvailability = (state: DemoState, slug: string, isAvailable: boolean) =>
  replaceProduct(state, { ...findProduct(state, slug), isAvailable })

// ---------- solo Admin ----------

function validateDraft(d: ProductDraft) {
  const errors: Record<string, string[]> = {}
  const name = d.name?.trim() ?? ''
  if (!name) errors.name = ['Escribe el nombre del producto.']
  else if (name.length > 80) errors.name = ['El nombre no puede superar 80 caracteres.']

  const description = d.description?.trim() ?? ''
  if (description.length > 300) errors.description = ['La descripción no puede superar 300 caracteres.']

  if (!Number.isFinite(d.price) || d.price <= 0) errors.price = ['El precio debe ser mayor que cero.']
  else if (d.price > MAX_PRICE) errors.price = [`El precio no puede superar ${MAX_PRICE}.`]

  const imageUrl = d.imageUrl?.trim() ?? ''
  if (!/^https?:\/\/[^\s/]+/i.test(imageUrl)) errors.imageUrl = ['La foto debe ser una dirección web (https://…).']
  else if (imageUrl.length > 500) errors.imageUrl = ['La dirección de la foto es demasiado larga.']

  const imageAlt = d.imageAlt?.trim() ?? ''
  if (imageAlt.length > 200) errors.imageAlt = ['La descripción de la foto no puede superar 200 caracteres.']

  if (!BADGES.some((b) => b.value === d.badge)) errors.badge = ['Elige un distintivo: sticker, heart, fries o none.']
  if (!CATEGORIES.some((c) => c.value === d.category)) errors.category = ['Elige una categoría: burger, side, drink o dessert.']

  if (Object.keys(errors).length) throw validationError(errors)
  return {
    name,
    description,
    price: Math.round(d.price * 100) / 100,
    image: imageUrl,
    alt: imageAlt || name,
    badge: d.badge,
    category: d.category,
  }
}

export function createProduct(state: DemoState, draft: ProductDraft): Change<Product> {
  const data = validateDraft(draft)
  const product: Product = {
    id: uniqueSlug(state.products, data.name),
    ...data,
    isAvailable: true,
    isFavorite: draft.isFavorite,
    isArchived: false,
  }
  return replaceProduct(state, product)
}

/** El id (slug) no cambia al renombrar, igual que en la API. */
export function updateProduct(state: DemoState, slug: string, draft: ProductDraft): Change<Product> {
  const data = validateDraft(draft)
  const current = findProduct(state, slug)
  return replaceProduct(state, {
    ...current,
    ...data,
    isFavorite: current.isArchived ? current.isFavorite : draft.isFavorite,
  })
}

/** Un producto retirado deja de ser favorito. */
export const archiveProduct = (state: DemoState, slug: string) =>
  replaceProduct(state, { ...findProduct(state, slug), isArchived: true, isFavorite: false })

export const restoreProduct = (state: DemoState, slug: string) =>
  replaceProduct(state, { ...findProduct(state, slug), isArchived: false })

// ---------- arranque ----------

/**
 * Estado inicial de una demo: una copia del menú real y dos pedidos de ejemplo,
 * para que el panel de cocina no empiece vacío.
 */
export function initialState(id: string, menu: Product[], now = new Date()): DemoState {
  let state: DemoState = { id, products: menu.map((p) => ({ ...p })), orders: [] }
  const orderable = state.products.filter((p) => p.isAvailable && !p.isArchived)
  if (orderable.length === 0) return state

  const pick = (i: number) => orderable[i % orderable.length].id
  const samples: { name: string; items: OrderRequest['items']; minutesAgo: number; advance?: OrderAction }[] = [
    { name: 'Ana', items: [{ productId: pick(0), quantity: 2 }, { productId: pick(3), quantity: 1 }], minutesAgo: 6, advance: 'preparar' },
    { name: 'Luis', items: [{ productId: pick(1), quantity: 1 }], minutesAgo: 2 },
  ]
  for (const s of samples) {
    const at = new Date(now.getTime() - s.minutesAgo * 60_000)
    const created = createOrder(state, { customerName: s.name, items: s.items }, at)
    state = s.advance ? changeOrderStatus(created.state, created.result.code, s.advance, at).state : created.state
  }
  return state
}
