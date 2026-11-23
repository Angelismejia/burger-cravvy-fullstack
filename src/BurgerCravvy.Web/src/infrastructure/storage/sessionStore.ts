import type { StaffSession } from '../../domain/staff'
import { scopedKey } from '../demo/demoSession'

const SESSION_KEY = 'burger-cravvy-staff'
const LAST_ORDER_KEY = scopedKey('burger-cravvy-last-order')
const HISTORY_KEY = scopedKey('burger-cravvy-order-history')

/** La sesión del empleado vive en sessionStorage: se borra al cerrar la pestaña. */
export const staffSessionStore = {
  load(): StaffSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as StaffSession) : null
    } catch {
      return null
    }
  },
  save(session: StaffSession) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      /* sin almacenamiento: la sesión dura lo que dure la página */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* nada que limpiar */
    }
  },
}

/** Código del último pedido del cliente, para precargar el seguimiento. */
export const lastOrderStore = {
  load: () => {
    try {
      return localStorage.getItem(LAST_ORDER_KEY) ?? ''
    } catch {
      return ''
    }
  },
  save: (code: string) => {
    try {
      localStorage.setItem(LAST_ORDER_KEY, code)
    } catch {
      /* opcional */
    }
  },
}

/** Códigos de los pedidos hechos desde este navegador («Mis pedidos»), el más reciente primero. */
export const orderHistoryStore = {
  load(): string[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
      const codes = Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : []
      // Quien ya había pedido antes de existir el historial conserva al menos su último pedido.
      if (codes.length === 0 && localStorage.getItem(HISTORY_KEY) === null) {
        const last = lastOrderStore.load()
        return last ? [last] : []
      }
      return codes
    } catch {
      return []
    }
  },
  save(codes: string[]) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(codes))
    } catch {
      /* sin almacenamiento: el historial dura lo que dure la página */
    }
  },
}
