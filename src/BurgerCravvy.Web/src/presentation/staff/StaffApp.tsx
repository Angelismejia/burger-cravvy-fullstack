import { useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { ClipboardList, LogOut, UtensilsCrossed } from 'lucide-react'
import { useStaffSession } from '../../application/hooks/useStaffSession'
import BurgerIcon from '../components/BurgerIcon'
import LoginScreen from './LoginScreen'
import OrderBoard from './OrderBoard'
import MenuManager from './MenuManager'

const tabs = [
  { id: 'orders', label: 'Pedidos', icon: ClipboardList },
  { id: 'menu', label: 'Menú', icon: UtensilsCrossed },
] as const

type Tab = (typeof tabs)[number]['id']

/** Panel interno de cocina. Se carga aparte (lazy) para no pesar en la web del cliente. */
export default function StaffApp() {
  const { session, login, logout, error, loading } = useStaffSession()
  const [tab, setTab] = useState<Tab>('orders')

  return (
    <MotionConfig reducedMotion="user">
      <div className="paper min-h-screen">
        {!session ? (
          <LoginScreen onLogin={login} error={error} loading={loading} />
        ) : (
          <>
            <header className="sticky top-0 z-30 bg-emerald-vintage text-white-warm shadow-[0_3px_0_rgba(35,105,79,0.25)]">
              <div className="container-site flex h-16 items-center gap-3 md:h-[72px]">
                <a href="/" className="flex items-center gap-2" aria-label="Ir a la web de Burger Cravvy">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cream p-1.5">
                    <BurgerIcon className="h-full w-full" />
                  </span>
                  <span className="hidden font-display text-xl font-bold sm:block">Panel de cocina</span>
                </a>

                <nav aria-label="Secciones del panel" className="ml-2 flex gap-1 rounded-full bg-green-dark/30 p-1 md:ml-6">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      aria-current={tab === id ? 'page' : undefined}
                      className="relative rounded-full px-3 py-1.5 font-ui text-sm font-bold transition md:px-4"
                    >
                      {tab === id && (
                        <motion.span
                          layoutId="staff-tab"
                          className="absolute inset-0 rounded-full bg-white-warm"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className={`relative flex items-center gap-1.5 ${tab === id ? 'text-emerald-vintage' : 'text-white-warm'}`}>
                        <Icon className="h-4 w-4" aria-hidden /> {label}
                      </span>
                    </button>
                  ))}
                </nav>

                <div className="ml-auto flex items-center gap-3">
                  <span className="hidden font-ui text-sm text-white-warm/85 md:block">Hola, {session.fullName}</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-orange-deep px-4 font-ui text-sm font-bold transition hover:-translate-y-0.5 hover:bg-orange-retro"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </div>
            </header>

            <main className="container-site py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {tab === 'orders' ? (
                    <OrderBoard token={session.token} onUnauthorized={logout} />
                  ) : (
                    <MenuManager token={session.token} onUnauthorized={logout} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </>
        )}
      </div>
    </MotionConfig>
  )
}
