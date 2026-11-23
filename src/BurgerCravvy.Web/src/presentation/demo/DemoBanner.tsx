import { useState } from 'react'
import { Loader2, LogOut, RotateCcw } from 'lucide-react'
import { currentDemoEntry, DEMO_ENTRIES, demoLink, exitDemo, resetDemo } from '../../application/demo'

/**
 * Franja superior del modo demo: avisa de que nada se guarda, deja cambiar de rol
 * (o abrirlo en otra pestaña para ver el tiempo real), reiniciar o salir.
 */
export default function DemoBanner({ isPanel }: { isPanel: boolean }) {
  const current = currentDemoEntry(isPanel)
  const [resetting, setResetting] = useState(false)
  if (!current) return null

  return (
    <div role="region" aria-label="Modo demo" className="relative z-40 bg-mustard text-green-dark">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
        <p className="font-ui text-sm">
          <strong>Modo demo</strong>
          <span className="hidden sm:inline"> · los cambios no se guardan</span>
        </p>

        <nav aria-label="Rol de la demo" className="flex items-center gap-1 rounded-full bg-green-dark/10 p-1">
          {DEMO_ENTRIES.map(({ value, label }) => (
            <a
              key={value}
              href={demoLink(value)}
              aria-current={value === current ? 'page' : undefined}
              title="Ábrelo en otra pestaña para ver los cambios en tiempo real"
              className={`rounded-full px-3 py-1 font-ui text-xs font-bold transition sm:text-sm ${
                value === current ? 'bg-white-warm shadow-sm' : 'hover:bg-white-warm/50'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={resetting}
            aria-label="Reiniciar la demo"
            onClick={() => {
              setResetting(true)
              resetDemo().catch(() => setResetting(false))
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-ui text-sm font-bold transition hover:bg-white-warm/50 disabled:opacity-60"
          >
            {resetting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={exitDemo}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-green-dark px-3 font-ui text-sm font-bold text-white-warm transition hover:bg-orange-deep"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Salir de la demo
          </button>
        </div>
      </div>
    </div>
  )
}
