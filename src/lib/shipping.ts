import type { Currency } from './types'
import { convertPrice } from './currency'

export const INTL_PAID_SHIPPING_USD = 25
export const FREE_SHIPPING_MIN_QTY = 3

/**
 * Returns the shipping cost in the selected currency.
 * IL → always 0
 * INT qty ≥ 3 → 0
 * INT qty < 3 → $25 converted to currency
 */
export function getShippingCost(
  country: string,
  qty: number,
  currency: Currency,
): number {
  if (country === 'IL') return 0
  if (qty >= FREE_SHIPPING_MIN_QTY) return 0
  return convertPrice(INTL_PAID_SHIPPING_USD, currency)
}

/**
 * Returns a human-readable shipping message.
 * IL any qty:   'Free shipping in Israel 🇮🇱'
 * INT qty ≥ 3:  'Free worldwide shipping'
 * INT qty < 3:  '$25 · 7–21 days'
 * Upgrade hint: 'Add X more for free shipping'
 */
export function getShippingMessage(country: string, qty: number): string {
  if (country === 'IL') {
    return 'Free shipping in Israel 🇮🇱'
  }

  if (qty >= FREE_SHIPPING_MIN_QTY) {
    return 'Free worldwide shipping'
  }

  return '$25 · 7–21 days'
}

/**
 * Returns the number of units needed to unlock free shipping,
 * or 0 if already eligible.
 */
export function getUpgradeQty(country: string, qty: number): number {
  if (country === 'IL') return 0
  if (qty >= FREE_SHIPPING_MIN_QTY) return 0
  return FREE_SHIPPING_MIN_QTY - qty
}

/**
 * Returns the upgrade message for non-IL users below free-shipping threshold.
 * Returns null if shipping is already free.
 */
export function getUpgradeMessage(country: string, qty: number): string | null {
  const needed = getUpgradeQty(country, qty)
  if (needed <= 0) return null
  return `Add ${needed} more for free shipping`
}
