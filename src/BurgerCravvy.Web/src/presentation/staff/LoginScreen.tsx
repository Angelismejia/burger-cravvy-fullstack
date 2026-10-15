import { useState } from 'react'
import { motion } from 'motion/react'
import { Loader2, Lock } from 'lucide-react'
import BurgerIcon from '../components/BurgerIcon'

interface Props {
  onLogin: (email: string, password: string) => void
  error: string | null
  loading: boolean
}

export default function LoginScreen({ onLogin, error, loading }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!loading) onLogin(email, password)
        }}
        className="w-full max-w-[400px] overflow-hidden rounded-[32px] bg-white-warm shadow-[0_10px_0_rgba(35,105,79,0.18)] ring-1 ring-brown-light/15"
        aria-labelledby="login-title"
      >
        <div className="flex flex-col items-center bg-emerald-vintage px-8 pb-6 pt-8 text-center text-white-warm">
          <motion.span
            initial={{ rotate: -20, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-cream p-3"
          >
            <BurgerIcon className="h-full w-full" />
          </motion.span>
          <h1 id="login-title" className="mt-3 font-display text-3xl font-bold">Panel de cocina</h1>
          <p className="font-hand text-xl text-cream/85">Solo para el equipo de Burger Cravvy</p>
        </div>

        <div className="space-y-4 px-8 py-7">
          <div>
            <label htmlFor="staff-email" className="font-ui text-sm font-semibold text-green-dark/80">
              Correo
            </label>
            <input
              id="staff-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-full border-2 border-brown-light/25 bg-cream px-4 py-2.5 font-body text-green-dark outline-none transition focus:border-orange-retro"
            />
          </div>
          <div>
            <label htmlFor="staff-password" className="font-ui text-sm font-semibold text-green-dark/80">
              Contraseña
            </label>
            <input
              id="staff-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-full border-2 border-brown-light/25 bg-cream px-4 py-2.5 font-body text-green-dark outline-none transition focus:border-orange-retro"
            />
          </div>

          <motion.p
            role="alert"
            key={error ?? 'none'}
            initial={error ? { x: -8 } : false}
            animate={{ x: [0, 6, -4, 0] }}
            transition={{ duration: 0.35 }}
            className="min-h-5 text-center font-body text-sm text-orange-deep"
          >
            {error}
          </motion.p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-deep py-3.5 font-ui text-sm font-bold uppercase tracking-wider text-white-warm transition hover:-translate-y-0.5 hover:bg-emerald-vintage disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
            Entrar
          </button>
          <a href="/" className="block text-center font-ui text-sm text-green-dark/70 underline-offset-4 hover:underline">
            ← Volver a la web
          </a>
        </div>
      </motion.form>
    </main>
  )
}
