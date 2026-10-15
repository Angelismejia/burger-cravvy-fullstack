export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5256'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    /** Errores de validación por campo (respuesta 400 de la API). */
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message)
  }
}

interface RequestOptions extends RequestInit {
  /** JWT del empleado, para los endpoints del panel. */
  token?: string
}

/** Cliente HTTP mínimo que entiende las respuestas ProblemDetails de la API. */
export async function apiRequest<T>(path: string, { token, ...init }: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError('No pudimos conectar con la cocina (API apagada).', 0)
  }
  if (!res.ok) {
    if (res.status === 429) throw new ApiError('Demasiados intentos. Espera un minuto.', 429)
    const problem = await res.json().catch(() => null)
    const fieldErrors = (problem?.errors ?? {}) as Record<string, string[]>
    const firstError = Object.values(fieldErrors)[0]?.[0]
    const fallback =
      res.status === 401 ? 'Tu sesión expiró. Vuelve a entrar.'
      : res.status === 403 ? 'Tu usuario no tiene permiso para esto.'
      : 'Algo salió mal.'
    throw new ApiError(firstError ?? problem?.detail ?? fallback, res.status, fieldErrors)
  }
  return res.json() as Promise<T>
}
