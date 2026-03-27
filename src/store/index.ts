import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Currency } from '@/lib/types'

interface CartState {
  items: CartItem[]
  currency: Currency
  selectedColor: string
  selectedQty: number
  cartOpen: boolean
  ageVerified: boolean

  addItem: (item: CartItem) => void
  removeItem: (productId: string, color: string) => void
  updateQty: (productId: string, color: string, qty: number) => void
  clearCart: () => void
  setCurrency: (currency: Currency) => void
  setSelectedColor: (color: string) => void
  setSelectedQty: (qty: number) => void
  openCart: () => void
  closeCart: () => void
  setAgeVerified: (verified: boolean) => void
  totalItems: () => number
  totalUsd: () => number
}

export const useStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      currency: 'ILS',
      selectedColor: 'purple',
      selectedQty: 1,
      cartOpen: false,
      ageVerified: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.color === item.color
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (productId, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.color === color)
          ),
        })),

      updateQty: (productId, color, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter(
                  (i) => !(i.productId === productId && i.color === color)
                )
              : state.items.map((i) =>
                  i.productId === productId && i.color === color
                    ? { ...i, quantity: qty }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      setCurrency: (currency) => set({ currency }),

      setSelectedColor: (color) => set({ selectedColor: color }),

      setSelectedQty: (qty) => set({ selectedQty: qty }),

      openCart: () => set({ cartOpen: true }),

      closeCart: () => set({ cartOpen: false }),

      setAgeVerified: (verified) => set({ ageVerified: verified }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalUsd: () =>
        get().items.reduce((sum, i) => sum + i.priceUsd * i.quantity, 0),
    }),
    {
      name: 'slider-cart',
      partialize: (state) => ({
        items: state.items,
        currency: state.currency,
        ageVerified: state.ageVerified,
      }),
    }
  )
)
