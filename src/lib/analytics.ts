/**
 * lib/analytics.ts
 * ALL PostHog event tracking lives here.
 * No direct posthog.capture calls outside this file.
 */

import posthog from 'posthog-js'
import type { ProductColor, Currency } from './types'

// ─── Internal helper ────────────────────────────────────────────────────────

function track(event: string, props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  posthog.capture(event, props)
}

// ─── Typed event functions ──────────────────────────────────────────────────

export function trackViewProduct(
  color: ProductColor,
  currency: Currency,
  price: number,
): void {
  track('view_product', { color, currency, price })
}

export function trackSelectColor(
  newColor: ProductColor,
  prevColor: ProductColor,
): void {
  track('select_color', { color: newColor, previous_color: prevColor })
}

export function trackAddToCart(
  color: ProductColor,
  qty: number,
  type: 'b2c' | 'b2b',
): void {
  track('add_to_cart', { color, qty, type, unit_price_usd: 25 })
}

export function trackBeginCheckout(
  totalUsd: number,
  itemCount: number,
  type: 'b2c' | 'b2b',
): void {
  track('begin_checkout', { total_usd: totalUsd, item_count: itemCount, type })
}

export function trackPurchase(
  orderId: string,
  totalUsd: number,
  currency: Currency,
): void {
  track('purchase', { order_id: orderId, total_usd: totalUsd, currency })
}

export function trackOpenWholesale(source: 'nav' | 'footer' | 'buy_now'): void {
  track('open_wholesale', { source })
}

export function trackSignupWholesale(country: string): void {
  track('signup_wholesale', { country })
}
