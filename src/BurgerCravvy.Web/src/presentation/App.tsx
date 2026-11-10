import { MotionConfig } from 'motion/react'
import { CartProvider } from '../application/CartContext'
import { OrderTrackingProvider } from '../application/OrderTrackingContext'
import OrderTracker from './components/OrderTracker'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import FavoriteProducts from './components/FavoriteProducts'
import MenuSection from './components/MenuSection'
import Gallery from './components/Gallery'
import Footer from './components/Footer'
import DecorativeDoodles from './components/DecorativeDoodles'
import CartDrawer, { AddedToast } from './components/CartDrawer'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <OrderTrackingProvider>
        <a
          href="#menu"
          className="sr-only z-[70] rounded-full bg-orange-deep px-4 py-2 font-ui font-bold text-white-warm focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al menú
        </a>
        <Header />
        <Navigation />
        <main>
          <Hero />
          <div className="paper relative">
            <DecorativeDoodles />
            <FavoriteProducts />
            <MenuSection />
            <Gallery />
          </div>
        </main>
        <Footer />
        <CartDrawer />
        <AddedToast />
        <OrderTracker />
        </OrderTrackingProvider>
      </CartProvider>
    </MotionConfig>
  )
}
