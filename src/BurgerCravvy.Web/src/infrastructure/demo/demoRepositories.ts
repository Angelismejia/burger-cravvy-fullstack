import type { Order, OrderAction, OrderRequest } from '../../domain/order'
import type { Product, ProductDraft } from '../../domain/product'
import type { StaffSession } from '../../domain/staff'
import { ApiError } from '../http/apiClient'
import type { MenuResult } from '../repositories/productRepository'
import * as backend from './demoBackend'
import { demoStore, emitDemoEvent, type DemoStaffRole } from './demoSession'

/**
 * Repositorios del modo demo: misma forma que los reales, pero leen y escriben en la
 * sesión de demo del navegador. Nada llega a la API ni a la base de datos.
 */

/** Pequeña espera para que los botones muestren su estado «guardando», como con la API. */
const LATENCY_MS = 180
const latency = () => new Promise((r) => setTimeout(r, LATENCY_MS))

const tokenFor = (role: DemoStaffRole) => `demo:${role}`

/** Sesión del panel en la demo: no hay contraseña ni token real. */
export function demoStaffSession(role: DemoStaffRole): StaffSession {
  return {
    token: tokenFor(role),
    expiresAtUtc: new Date(Date.now() + 365 * 24 * 3600_000).toISOString(),
    fullName: role === 'Admin' ? 'Admin (demo)' : 'Cocina (demo)',
    role,
  }
}

function currentState() {
  const state = demoStore.load()
  if (!state) throw new ApiError('La demo terminó. Vuelve a entrar desde «Ver demo».', 0)
  return state
}

async function query<T>(fn: (s: backend.DemoState) => T): Promise<T> {
  await latency()
  return fn(currentState())
}

async function mutate<T>(fn: (s: backend.DemoState) => backend.Change<T>): Promise<T> {
  await latency()
  const { state, result } = fn(currentState())
  if (!demoStore.save(state)) throw new ApiError('Tu navegador no deja guardar los datos de la demo.', 0)
  return result
}

function requireStaff(token: string) {
  if (token !== tokenFor('Empleado') && token !== tokenFor('Admin')) throw new ApiError('Tu sesión expiró. Vuelve a entrar.', 401)
}

function requireAdmin(token: string) {
  requireStaff(token)
  if (token !== tokenFor('Admin')) throw new ApiError('Tu usuario no tiene permiso para esto.', 403)
}

async function productChange(token: string, admin: boolean, fn: (s: backend.DemoState) => backend.Change<Product>) {
  if (admin) requireAdmin(token)
  else requireStaff(token)
  const product = await mutate(fn)
  emitDemoEvent('ProductUpdated', product)
  return product
}

export const demoProductRepository = {
  getMenu: async (): Promise<MenuResult> => ({ products: await query(backend.publicMenu), source: 'api' }),
}

export const demoOrderRepository = {
  async create(request: OrderRequest): Promise<Order> {
    const order = await mutate((s) => backend.createOrder(s, request))
    emitDemoEvent('OrderCreated', order)
    return order
  },

  getByCode: (code: string) => query((s) => backend.getOrder(s, code)),
}

export const demoStaffRepository = {
  login: async (): Promise<StaffSession> => {
    throw new ApiError('En la demo no hace falta contraseña: entra desde «Ver demo».', 400)
  },

  getQueue: (token: string) => {
    requireStaff(token)
    return query(backend.orderQueue)
  },

  async changeStatus(token: string, code: string, action: OrderAction): Promise<Order> {
    requireStaff(token)
    const order = await mutate((s) => backend.changeOrderStatus(s, code, action))
    emitDemoEvent('OrderUpdated', order)
    return order
  },

  getMenu: (token: string) => {
    requireStaff(token)
    return query(backend.staffMenu)
  },

  setAvailability: (token: string, slug: string, isAvailable: boolean) =>
    productChange(token, false, (s) => backend.setAvailability(s, slug, isAvailable)),

  createProduct: (token: string, draft: ProductDraft) => productChange(token, true, (s) => backend.createProduct(s, draft)),

  updateProduct: (token: string, slug: string, draft: ProductDraft) =>
    productChange(token, true, (s) => backend.updateProduct(s, slug, draft)),

  archiveProduct: (token: string, slug: string) => productChange(token, true, (s) => backend.archiveProduct(s, slug)),

  restoreProduct: (token: string, slug: string) => productChange(token, true, (s) => backend.restoreProduct(s, slug)),
}
