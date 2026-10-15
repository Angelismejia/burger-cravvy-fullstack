const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5256'

export class ApiError extends Error {
  constructor(message: string, public status: number) {
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
    res = await fetch(`${BASE_URL}${path}`, {
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
    const firstError = problem?.errors && Object.values(problem.errors as Record<string, string[]>)[0]?.[0]
    const fallback = res.status === 401 ? 'Tu sesión expiró. Vuelve a entrar.' : 'Algo salió mal.'
    throw new ApiError(firstError ?? problem?.detail ?? fallback, res.status)
  }
  return res.json() as Promise<T>
}
