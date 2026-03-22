/**
 * store/index.ts
 * Zustand global store with localStorage persistence for currency and cart.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CartItem,
  Currency,
  ModalState,
  ProductColor,
} from '@/lib/types'

// ─── State interface ─────────────────────────────────────────────────────────

interface StoreState {
  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, color: ProductColor) => void
  updateQty: (productId: string, color: ProductColor, qty: number) => void
  clearCart: () => void

  // Product selection
  selectedColor: ProductColor
  setSelectedColor: (color: ProductColor) => void

  selectedQty: number
  setSelectedQty: (qty: number) => void

  // Currency (persisted)
  currency: Currency
  setCurrency: (currency: Currency) => void

  // Wholesale
  isWholesaleUser: boolean
  setIsWholesaleUser: (value: boolean) => void

  // Modals
  modals: ModalState
  openModal: (modal: keyof ModalState) => void
  closeModal: (modal: keyof ModalState) => void

  // Country selection (for shipping calc)
  selectedCountry: string
  setSelectedCountry: (country: string) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Cart
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (c) => c.productId === item.productId && c.color === item.color,
          )
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId && c.color === item.color
                  ? { ...c, qty: c.qty + item.qty }
                  : c,
              ),
            }
          }
          return { cart: [...state.cart, item] }
        }),
      removeFromCart: (productId, color) =>
        set((state) => ({
          cart: state.cart.filter(
            (c) => !(c.productId === productId && c.color === color),
          ),
        })),
      updateQty: (productId, color, qty) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.productId === productId && c.color === color ? { ...c, qty } : c,
          ),
        })),
      clearCart: () => set({ cart: [] }),

      // Product selection
      selectedColor: 'black',
      setSelectedColor: (color) => set({ selectedColor: color }),

      selectedQty: 1,
      setSelectedQty: (qty) => set({ selectedQty: qty }),

      // Currency — persisted
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),

      // Wholesale
      isWholesaleUser: false,
      setIsWholesaleUser: (value) => set({ isWholesaleUser: value }),

      // Modals
      modals: {
        cart: false,
        wholesale: false,
        ageGate: false,
        exitIntent: false,
      },
      openModal: (modal) =>
        set((state) => ({ modals: { ...state.modals, [modal]: true } })),
      closeModal: (modal) =>
        set((state) => ({ modals: { ...state.modals, [modal]: false } })),

      // Country
      selectedCountry: 'IL',
      setSelectedCountry: (country) => set({ selectedCountry: country }),
    }),
    {
      name: 'slider-solution-store',
      // Only persist currency — cart/color are session-based by default
      partialize: (state) => ({
        currency: state.currency,
        cart: state.cart,
      }),
    },
  ),
)
