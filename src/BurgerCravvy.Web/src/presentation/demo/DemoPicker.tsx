import { useRef, useState } from 'react'
import { ChefHat, KeyRound, Loader2, Play, ShoppingBag, X, type LucideIcon } from 'lucide-react'
import { DEMO_ENTRIES, enterDemo, type DemoEntry } from '../../application/demo'

const icons: Record<DemoEntry, LucideIcon> = { cliente: ShoppingBag, cocina: ChefHat, admin: KeyRound }

interface Props {
  /** Aspecto del botón que abre el selector. */
  variant?: 'pill' | 'link'
  className?: string
}

/** Botón «Ver demo» y el diálogo para elegir con qué rol entrar. */
export default function DemoPicker({ variant = 'pill', className = '' }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [starting, setStarting] = useState<DemoEntry | null>(null)
  const [error, setError] = useState<string | null>(null)

  const start = async (entry: DemoEntry) => {
    setStarting(entry)
    setError(null)
    try {
      await enterDemo(entry) // recarga la página al terminar
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir la demo.')
      setStarting(null)
    }
  }

  const trigger =
    variant === 'pill'
      ? 'inline-flex min-h-10 items-center gap-1.5 rounded-full bg-emerald-vintage px-4 font-ui text-sm font-bold text-white-warm shadow-[0_3px_0_rgba(35,105,79,0.3)] transition hover:-translate-y-0.5 hover:bg-orange-deep'
      : 'inline-flex items-center gap-1.5 font-ui text-sm font-semibold text-emerald-vintage underline-offset-4 hover:underline'

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={`${trigger} ${className}`}>
        <Play className="h-4 w-4" aria-hidden />
        Ver demo
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="demo-title"
        onClick={(e) => e.target === dialogRef.current && !starting && dialogRef.current?.close()}
        className="paper m-auto w-[calc(100%-2rem)] max-w-[440px] overflow-hidden rounded-[30px] p-0 text-green-dark shadow-[0_10px_0_rgba(35,105,79,0.2)] backdrop:bg-green-dark/60"
      >
        <header className="flex items-start justify-between gap-4 bg-emerald-vintage px-6 py-4 text-white-warm">
          <div>
            <h2 id="demo-title" className="font-display text-2xl font-bold">Ver demo</h2>
            <p className="font-hand text-lg text-cream/85">Prueba todo: al salir, vuelve como estaba.</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-white-warm/20"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="space-y-3 px-6 py-5">
          <p className="font-body text-sm text-green-dark/75">
            Elige cómo quieres entrar. Puedes borrar productos, cambiar precios o mover pedidos:
            nada se guarda de verdad.
          </p>

          {DEMO_ENTRIES.map(({ value, label, description }) => {
            const Icon = icons[value]
            return (
              <button
                key={value}
                type="button"
                disabled={starting !== null}
                onClick={() => start(value)}
                className="flex w-full items-center gap-4 rounded-[22px] border-2 border-brown-light/20 bg-white-warm px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-orange-retro disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mustard text-green-dark">
                  {starting === value ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
                </span>
                <span>
                  <span className="block font-ui font-bold">Entrar como {label.toLowerCase()}</span>
                  <span className="block font-body text-sm text-green-dark/70">{description}</span>
                </span>
              </button>
            )
          })}

          <p role="alert" className="min-h-5 text-center font-body text-sm text-orange-deep">
            {error}
          </p>
        </div>
      </dialog>
    </>
  )
}
