/**
 * lib/analytics.ts
 * ALL PostHog event tracking lives here.
 * No direct posthog.capture calls outside this file.
 * Stubs for Wave 0 — full PostHog init wired in Wave 5.
 */

import type { ProductColor, Currency, CartItem } from './types'

// ─── Event payload types ────────────────────────────────────────────────────

interface ViewProductPayload {
  color: ProductColor
  currency: Currency
}

interface SelectColorPayload {
  color: ProductColor
  previousColor: ProductColor
}

interface AddToCartPayload {
  color: ProductColor
  qty: number
  priceUsd: number
  currency: Currency
  shippingCountry: string
}

interface BeginCheckoutPayload {
  items: CartItem[]
  totalUsd: number
  currency: Currency
  shippingCountry: string
}

interface PurchasePayload {
  orderId: string
  totalUsd: number
  currency: Currency
  shippingCountry: string
  items: CartItem[]
}

interface OpenWholesalePayload {
  source: 'navbar' | 'footer'
}

interface SignupWholesalePayload {
  country: string
}

// ─── Tracker (stubbed — PostHog client injected in Wave 5) ──────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function capture(event: string, properties: Record<string, any>): void {
  if (typeof window === 'undefined') return
  // TODO Wave 5: posthog.capture(event, properties)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, properties)
  }
}

// ─── Typed event functions ──────────────────────────────────────────────────

export function trackViewProduct(payload: ViewProductPayload): void {
  capture('view_product', payload)
}

export function trackSelectColor(payload: SelectColorPayload): void {
  capture('select_color', payload)
}

export function trackAddToCart(payload: AddToCartPayload): void {
  capture('add_to_cart', payload)
}

export function trackBeginCheckout(payload: BeginCheckoutPayload): void {
  capture('begin_checkout', payload)
}

export function trackPurchase(payload: PurchasePayload): void {
  capture('purchase', payload)
}

export function trackOpenWholesale(payload: OpenWholesalePayload): void {
  capture('open_wholesale', payload)
}

export function trackSignupWholesale(payload: SignupWholesalePayload): void {
  capture('signup_wholesale', payload)
}
