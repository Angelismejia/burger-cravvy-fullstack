import type { HubEvents } from '../realtime/realtimeChannel'
import type { DemoState } from './demoBackend'

/**
 * Sesión del modo demo.
 *
 * - Los datos (menú y pedidos) viven en localStorage: todas las pestañas de la misma demo
 *   los comparten, así un pedido hecho como cliente aparece en la pestaña de cocina.
 * - Cada pestaña guarda en sessionStorage a qué demo pertenece y con qué rol entró al panel.
 * - Los avisos «en tiempo real» viajan entre pestañas con BroadcastChannel.
 *
 * El modo se decide al cargar la página: entrar, cambiar de rol o salir recarga la página.
 */

export type DemoStaffRole = 'Empleado' | 'Admin'

export interface DemoTab {
  id: string
  staffRole: DemoStaffRole
}

const DATA_KEY = 'burger-cravvy-demo'
const TAB_KEY = 'burger-cravvy-demo-tab'
const CHANNEL_NAME = 'burger-cravvy-demo'
/** Claves de la web que en la demo usan su propia copia (carrito, último pedido, historial). */
const DEMO_SUFFIX = '-demo'
const SCOPED_KEYS = ['burger-cravvy-cart', 'burger-cravvy-last-order', 'burger-cravvy-order-history']

type Message =
  | { type: 'hub'; event: keyof HubEvents; payload: unknown }
  | { type: 'reset' }
  | { type: 'ended' }

// ---------- almacenamiento ----------

function read<T>(storage: () => Storage, key: string): T | null {
  try {
    const raw = storage().getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(storage: () => Storage, key: string, value: unknown) {
  try {
    storage().setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function remove(storage: () => Storage, key: string) {
  try {
    storage().removeItem(key)
  } catch {
    /* nada que borrar */
  }
}

const local = () => localStorage
const session = () => sessionStorage

export const demoStore = {
  load: () => read<DemoState>(local, DATA_KEY),
  /** Devuelve false si el navegador no deja guardar datos. */
  save: (state: DemoState) => write(local, DATA_KEY, state),
  clear() {
    remove(local, DATA_KEY)
    for (const key of SCOPED_KEYS) remove(local, key + DEMO_SUFFIX)
  },
}

export const demoTabStore = {
  load: () => read<DemoTab>(session, TAB_KEY),
  save: (tab: DemoTab) => write(session, TAB_KEY, tab),
  clear: () => remove(session, TAB_KEY),
}

// ---------- avisos entre pestañas ----------

const channel: BroadcastChannel | null = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME)
const hubListeners = new Set<(event: keyof HubEvents, payload: unknown) => void>()

/** Emite un evento del «hub» a esta pestaña y a las demás de la demo. */
export function emitDemoEvent<K extends keyof HubEvents>(event: K, payload: HubEvents[K]) {
  hubListeners.forEach((l) => l(event, payload))
  channel?.postMessage({ type: 'hub', event, payload } satisfies Message)
}

export function onDemoEvent<K extends keyof HubEvents>(event: K, handler: (payload: HubEvents[K]) => void) {
  const listener = (e: keyof HubEvents, payload: unknown) => {
    if (e === event) handler(payload as HubEvents[K])
  }
  hubListeners.add(listener)
  return () => {
    hubListeners.delete(listener)
  }
}

/** Avisa a las otras pestañas de que la demo se reinició o terminó. */
export const broadcastDemo = (type: 'reset' | 'ended') => channel?.postMessage({ type } satisfies Message)

// ---------- demo activa en esta pestaña ----------

/**
 * Lee la demo de esta pestaña. Un enlace `?demo=<id>&rol=cocina|admin` une la pestaña a una
 * demo ya abierta (para abrir el panel en otra pestaña y ver el tiempo real).
 */
function resolveActiveDemo(): DemoTab | null {
  if (typeof window === 'undefined') return null
  const data = demoStore.load()

  const params = new URLSearchParams(window.location.search)
  const joinId = params.get('demo')
  if (joinId) {
    const role = params.get('rol')
    params.delete('demo')
    params.delete('rol')
    const query = params.toString()
    window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash)
    if (data?.id === joinId) {
      const current = demoTabStore.load()
      const staffRole: DemoStaffRole =
        role === 'admin' ? 'Admin' : role === 'cocina' ? 'Empleado' : current?.id === joinId ? current.staffRole : 'Empleado'
      demoTabStore.save({ id: joinId, staffRole })
    }
  }

  const tab = demoTabStore.load()
  if (!tab) return null
  if (tab.id !== data?.id) {
    demoTabStore.clear() // la demo terminó o se borraron los datos
    return null
  }
  return tab
}

export const activeDemo: DemoTab | null = resolveActiveDemo()

export const isDemo = activeDemo !== null

/** En la demo, el carrito y el último pedido se guardan aparte para no mezclarse con los reales. */
export const scopedKey = (key: string) => (isDemo ? key + DEMO_SUFFIX : key)

// Las demás pestañas de esta demo siguen al reiniciar o salir desde cualquiera de ellas.
if (isDemo && channel) {
  channel.addEventListener('message', (e: MessageEvent<Message>) => {
    const msg = e.data
    if (msg.type === 'hub') hubListeners.forEach((l) => l(msg.event, msg.payload))
    else if (msg.type === 'reset') window.location.reload()
    else if (msg.type === 'ended') {
      demoTabStore.clear()
      window.location.assign('/')
    }
  })
}
