import { initialState } from '../infrastructure/demo/demoBackend'
import {
  activeDemo,
  broadcastDemo,
  demoStore,
  demoTabStore,
  type DemoStaffRole,
} from '../infrastructure/demo/demoSession'
import { apiProductRepository } from '../infrastructure/repositories/productRepository'

/** Cómo se entra a la demo. */
export type DemoEntry = 'cliente' | 'cocina' | 'admin'

export const DEMO_ENTRIES: { value: DemoEntry; label: string; description: string }[] = [
  { value: 'cliente', label: 'Cliente', description: 'Pide del menú y sigue tu pedido en vivo.' },
  { value: 'cocina', label: 'Cocina', description: 'Recibe los pedidos y cámbialos de estado.' },
  { value: 'admin', label: 'Admin', description: 'Todo lo de cocina, y además edita el menú.' },
]

const roleFor = (entry: DemoEntry): DemoStaffRole => (entry === 'admin' ? 'Admin' : 'Empleado')

const pathFor = (entry: DemoEntry) => (entry === 'cliente' ? '/' : '/panel')

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)

/** Crea los datos de una demo nueva: copia del menú real (o la local si la API no responde). */
async function freshData(id: string) {
  const { products } = await apiProductRepository.getMenu()
  demoStore.clear()
  if (!demoStore.save(initialState(id, products))) throw new Error('Tu navegador no deja guardar los datos de la demo.')
}

/** Empieza una demo desde cero y abre la web o el panel con el rol elegido. */
export async function enterDemo(entry: DemoEntry) {
  const id = newId()
  await freshData(id)
  demoTabStore.save({ id, staffRole: roleFor(entry) })
  window.location.assign(pathFor(entry))
}

/**
 * Enlace a la misma demo con otro rol. Al abrirlo en otra pestaña (clic central o Ctrl+clic)
 * se ve el tiempo real: un pedido hecho en una aparece en la otra.
 */
export function demoLink(entry: DemoEntry) {
  if (!activeDemo) return pathFor(entry)
  const rol = entry === 'cliente' ? '' : `&rol=${entry}`
  return `${pathFor(entry)}?demo=${encodeURIComponent(activeDemo.id)}${rol}`
}

/** Rol con el que esta pestaña está viendo la demo. */
export function currentDemoEntry(isPanel: boolean): DemoEntry | null {
  if (!activeDemo) return null
  if (!isPanel) return 'cliente'
  return activeDemo.staffRole === 'Admin' ? 'admin' : 'cocina'
}

/** Vuelve a los datos del principio en todas las pestañas de esta demo. */
export async function resetDemo() {
  if (!activeDemo) return
  await freshData(activeDemo.id)
  broadcastDemo('reset')
  window.location.reload()
}

/** Sale de la demo (en todas sus pestañas) y borra todo lo que se hizo en ella. */
export function exitDemo() {
  demoStore.clear()
  demoTabStore.clear()
  broadcastDemo('ended')
  window.location.assign('/')
}
