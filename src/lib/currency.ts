import type { Currency } from './types'

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  ILS: 3.70,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  ILS: '₪',
}

export const B2C_PRICE_USD = 25
export const B2B_BOX_PRICE_USD = 82

/**
 * Convert a USD price to the target currency.
 * Returns a raw number (unformatted).
 */
export function convertPrice(usd: number, currency: Currency): number {
  return usd * EXCHANGE_RATES[currency]
}

/**
 * Format a USD price into the selected display currency.
 * ILS: no decimals  (₪85)
 * USD/EUR: 2 decimals ($25.00 / €23.00)
 */
export function formatPrice(usd: number, currency: Currency): string {
  const converted = convertPrice(usd, currency)
  const symbol = CURRENCY_SYMBOLS[currency]

  if (currency === 'ILS') {
    return `${symbol}${Math.round(converted)}`
  }

  return `${symbol}${converted.toFixed(2)}`
}
