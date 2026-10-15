import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './presentation/App'

// El panel interno se descarga solo cuando se visita /panel.
const StaffApp = lazy(() => import('./presentation/staff/StaffApp'))
const isPanel = window.location.pathname.replace(/\/+$/, '') === '/panel'

if (isPanel) document.title = 'Panel de cocina — Burger Cravvy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPanel ? (
      <Suspense fallback={<div className="paper min-h-screen" />}>
        <StaffApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
