import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isOnPublicMenu, isPublicFavorite, type Product } from '../domain/product'
import { countItems, setQuantity, toLines, totalPrice, type CartItems, type CartLine } from '../domain/cart'
import { cartStorage } from '../infrastructure/storage/cartStorage'
import { productRepository, type MenuResult } from '../infrastructure/repositories/productRepository'
import { fallbackProducts } from '../infrastructure/repositories/fallbackProducts'
import { publicHub } from '../infrastructure/realtime/publicHub'

interface CartContextValue {
  /** Menú público completo. */
  products: Product[]
  /** Los de «Nuestros Favoritos» (subconjunto de `products`). */
  favorites: Product[]
  menuSource: MenuResult['source'] | 'loading'
  lines: CartLine[]
  count: number
  total: number
  isOpen: boolean
  lastAdded: { name: string; key: number } | null
  open: () => void
  close: () => void
  add: (id: string) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [menuSource, setMenuSource] = useState<CartContextValue['menuSource']>('loading')
  const [items, setItems] = useState<CartItems>(cartStorage.load)
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<CartContextValue['lastAdded']>(null)

  useEffect(() => {
    let cancelled = false
    productRepository.getMenu().then((r) => {
      if (cancelled) return
      setProducts(r.products)
      setMenuSource(r.source)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Cambios del panel al instante: precio, agotado, categoría, productos nuevos,
  // retirados o que entran / salen de favoritos.
  useEffect(
    () =>
      publicHub().on('ProductUpdated', (p) =>
        setProducts((prev) => {
          const without = prev.filter((x) => x.id !== p.id)
          if (!isOnPublicMenu(p)) return without
          return prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p]
        }),
      ),
    [],
  )

  useEffect(() => cartStorage.save(items), [items])

  const change = useCallback((id: string, fn: (q: number) => number) => {
    setItems((prev) => setQuantity(prev, id, fn(prev[id] ?? 0)))
  }, [])

  const add = useCallback(
    (id: string) => {
      change(id, (q) => q + 1)
      const p = products.find((x) => x.id === id)
      if (p) setLastAdded({ name: p.name, key: Date.now() })
    },
    [change, products],
  )

  const value = useMemo<CartContextValue>(() => {
    const lines = toLines(items, products)
    return {
      products,
      favorites: products.filter(isPublicFavorite),
      menuSource,
      lines,
      count: countItems(lines),
      total: totalPrice(lines),
      isOpen,
      lastAdded,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      increment: (id) => change(id, (q) => q + 1),
      decrement: (id) => change(id, (q) => q - 1),
      remove: (id) => change(id, () => 0),
      clear: () => setItems({}),
    }
  }, [items, products, menuSource, isOpen, lastAdded, add, change])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
