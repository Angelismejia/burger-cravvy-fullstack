import { useCallback, useEffect, useState } from 'react'
import { isExpired, type StaffSession } from '../../domain/staff'
import { staffRepository } from '../../infrastructure/repositories/staffRepository'
import { staffSessionStore } from '../../infrastructure/storage/sessionStore'

function initialSession() {
  const s = staffSessionStore.load()
  return s && !isExpired(s) ? s : null
}

export function useStaffSession() {
  const [session, setSession] = useState<StaffSession | null>(initialSession)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const logout = useCallback(() => {
    staffSessionStore.clear()
    setSession(null)
  }, [])

  // Cierra la sesión justo cuando caduca el token.
  useEffect(() => {
    if (!session) return
    const ms = new Date(session.expiresAtUtc).getTime() - Date.now()
    const t = setTimeout(logout, Math.max(ms, 0))
    return () => clearTimeout(t)
  }, [session, logout])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const s = await staffRepository.login(email, password)
      staffSessionStore.save(s)
      setSession(s)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return { session, login, logout, error, loading }
}
