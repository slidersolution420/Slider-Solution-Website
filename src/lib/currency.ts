import type { Currency } from './types'

export const B2C_PRICE_USD = 25
export const B2B_BOX_PRICE_USD = 82

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  ILS: 3.7,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  ILS: '₪',
}

export function convertPrice(usd: number, currency: Currency): number {
  return Math.round(usd * EXCHANGE_RATES[currency])
}

export function formatPrice(usd: number, currency: Currency): string {
  const amount = convertPrice(usd, currency)
  const symbol = CURRENCY_SYMBOLS[currency]
  if (currency === 'ILS') {
    return `${amount}${symbol}`
  }
  return `${symbol}${amount}`
}
