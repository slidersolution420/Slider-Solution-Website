import type { Currency } from './types'
import siteSettingsData from '../../content/singletons/site-settings.json'

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  ILS: siteSettingsData.ils_exchange_rate,
  EUR: siteSettingsData.eur_exchange_rate,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  ILS: '₪',
  EUR: '€',
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
  if (currency === 'EUR') {
    return `${amount}${symbol}`
  }
  return `${symbol}${amount}`
}
