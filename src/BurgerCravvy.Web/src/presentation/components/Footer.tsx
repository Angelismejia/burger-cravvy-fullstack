import { useRef, useState, type ReactNode } from 'react'
import { Mail, Phone, X } from 'lucide-react'
import BurgerIcon from './BurgerIcon'
import { useOrderTracking } from '../../application/OrderTrackingContext'

const socials = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/',
    path: 'M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V9c0-.6.4-1 1-1z',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/',
    path: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4.6-3.4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/',
    path: 'M16.5 3c.4 2.3 1.9 3.8 4 4v3.2a7.4 7.4 0 0 1-4-1.3v6.6A5.6 5.6 0 1 1 11 9.9v3.3a2.4 2.4 0 1 0 2.2 2.4V3z',
  },
]

const infoContent: Record<string, { title: string; body: ReactNode }> = {
  hours: {
    title: 'Horarios',
    body: (
      <ul className="space-y-1">
        <li>Lun – Jue · 11:00 – 22:00</li>
        <li>Vie – Sáb · 11:00 – 00:00</li>
        <li>Domingo · 12:00 – 21:00</li>
      </ul>
    ),
  },
  privacy: {
    title: 'Política de privacidad',
    body: 'Burger Cravvy es un proyecto de demostración. Tu carrito se guarda solo en tu navegador (localStorage); al confirmar un pedido demo solo se envía el nombre que escribas y los productos elegidos.',
  },
  terms: {
    title: 'Términos y condiciones',
    body: 'Este sitio es una pieza de portafolio ficticia. Precios y productos son ilustrativos: no se procesan pagos ni se entregan pedidos reales.',
  },
}

function FooterHeading({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-xl font-bold text-mustard">{children}</h3>
}

const linkCls =
  'inline-block py-1 text-left font-ui text-[15px] text-white-warm/85 transition hover:translate-x-0.5 hover:text-white-warm'

export default function Footer() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const tracking = useOrderTracking()
  const [info, setInfo] = useState<keyof typeof infoContent>('hours')

  const openInfo = (key: keyof typeof infoContent) => {
    setInfo(key)
    dialogRef.current?.showModal()
  }

  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-emerald-vintage text-white-warm">
      {/* soft organic shapes */}
      <svg aria-hidden className="absolute -left-16 -top-20 -z-10 h-64 w-64 text-pink-pastel/15" viewBox="0 0 200 200">
        <path fill="currentColor" d="M44 -60C58 -48 70 -30 72 -11 74 8 66 28 52 43 38 58 19 68 -2 70-23 72-46 66-58 50-70 34-72 9-66-12-60-33-46-50-30-62-14-74 4-80 18-77 32-74 30-72 44-60Z" transform="translate(100 100)" />
      </svg>
      <svg aria-hidden className="absolute -bottom-24 -right-10 -z-10 h-72 w-72 text-cream/10" viewBox="0 0 200 200">
        <path fill="currentColor" d="M50-58C64-44 74-24 74-4 74 16 62 36 46 50 30 64 10 72-12 70-34 68-56 56-66 37-76 18-74-8-62-28-50-48-28-62-6-66 16-70 36-72 50-58Z" transform="translate(100 100)" />
      </svg>
      <svg aria-hidden viewBox="0 0 140 40" className="absolute right-[18%] top-8 -z-10 hidden w-28 text-cream/25 md:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 22c10-16 20 16 30 0s20 16 30 0 20 16 30 0 20 16 30 0" />
      </svg>

      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 pb-8 pt-14 md:grid-cols-[1.1fr_1fr_1fr_1fr] md:pt-16">
        <div className="col-span-2 flex flex-col items-start gap-3 md:col-span-1">
          <a href="#home" aria-label="Burger Cravvy — volver arriba" className="rounded-full bg-cream p-4 transition-transform duration-300 hover:-rotate-6">
            <BurgerIcon className="h-20 w-24" />
          </a>
          <p className="font-hand text-xl text-cream/90">Momentos felices, recuerdos sabrosos.</p>
        </div>

        <nav aria-label="Explora">
          <FooterHeading>Explora</FooterHeading>
          <ul className="mt-3">
            <li><a className={linkCls} href="#home">Inicio</a></li>
            <li><a className={linkCls} href="#menu">Nuestro Menú</a></li>
            <li><a className={linkCls} href="#favorites">Favoritos</a></li>
            <li><a className={linkCls} href="#contact">Contacto</a></li>
            <li><button type="button" className={linkCls} onClick={() => tracking.open()}>Sigue tu pedido</button></li>
          </ul>
        </nav>

        <nav aria-label="Información">
          <FooterHeading>Información</FooterHeading>
          <ul className="mt-3">
            <li><a className={linkCls} href="#about">Nosotros</a></li>
            <li><button type="button" className={linkCls} onClick={() => openInfo('hours')}>Horarios</button></li>
            <li><button type="button" className={linkCls} onClick={() => openInfo('privacy')}>Política de privacidad</button></li>
            <li><button type="button" className={linkCls} onClick={() => openInfo('terms')}>Términos y condiciones</button></li>
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-1">
          <FooterHeading>Redes sociales</FooterHeading>
          <ul className="mt-4 flex gap-3">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.name} (se abre en una pestaña nueva)`}
                  className="grid h-12 w-12 place-items-center rounded-full bg-cream text-emerald-vintage transition-all duration-250 hover:-translate-y-1 hover:bg-orange-retro hover:text-white-warm"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                    <path d={s.path} fillRule="evenodd" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-5 space-y-2 font-ui text-sm text-white-warm/85">
            <li>
              <a href="tel:+18099777238" className="inline-flex items-center gap-2 hover:text-white-warm">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/15"><Phone className="h-3.5 w-3.5" aria-hidden /></span>
                809-977-7238
              </a>
            </li>
            <li>
              <a href="mailto:hello@burgercravvy.example" className="inline-flex items-center gap-2 hover:text-white-warm">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/15"><Mail className="h-3.5 w-3.5" aria-hidden /></span>
                hello@burgercravvy.example
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-site">
        <p className="border-t border-cream/20 py-6 text-center font-ui text-sm text-cream/80">
          © 2026 Burger Cravvy. Hecho con amor y extra queso.
        </p>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="info-title"
        className="m-auto w-[min(92vw,440px)] rounded-[28px] bg-cream p-0 text-green-dark backdrop:bg-green-dark/70"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <div className="flex items-center justify-between bg-emerald-vintage px-6 py-4 text-white-warm">
          <h2 id="info-title" className="font-display text-xl font-bold">{infoContent[info].title}</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white-warm/20"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 font-body leading-relaxed">{infoContent[info].body}</div>
      </dialog>
    </footer>
  )
}
