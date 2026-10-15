import type { StaffSession } from '../../domain/staff'

const SESSION_KEY = 'burger-cravvy-staff'
const LAST_ORDER_KEY = 'burger-cravvy-last-order'

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
