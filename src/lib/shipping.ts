export const FREE_SHIPPING_COUNTRIES = ['IL']
export const FREE_SHIPPING_MIN_QTY = 3
export const INTL_PAID_SHIPPING_USD = 25

export interface ShippingConfig {
  freeCountries: string[]
  minQty: number
  intlCost: number
}

const DEFAULT_CONFIG: ShippingConfig = {
  freeCountries: FREE_SHIPPING_COUNTRIES,
  minQty: FREE_SHIPPING_MIN_QTY,
  intlCost: INTL_PAID_SHIPPING_USD,
}

export function getShippingCost(
  country: string,
  totalQty: number,
  config: ShippingConfig = DEFAULT_CONFIG
): number {
  if (config.freeCountries.includes(country.toUpperCase())) return 0
  if (totalQty >= config.minQty) return 0
  return config.intlCost
}

export function isShippingFree(
  country: string,
  totalQty: number,
  config: ShippingConfig = DEFAULT_CONFIG
): boolean {
  return getShippingCost(country, totalQty, config) === 0
}

export function getUpgradeMessage(
  country: string,
  totalQty: number,
  locale: string,
  config: ShippingConfig = DEFAULT_CONFIG
): string | null {
  if (config.freeCountries.includes(country.toUpperCase())) return null
  if (totalQty >= config.minQty) return null
  const needed = config.minQty - totalQty
  if (locale === 'he') {
    return `הוסף עוד ${needed} קיט${needed > 1 ? 'ים' : ''} לקבלת משלוח חינם`
  }
  return `Add ${needed} more kit${needed > 1 ? 's' : ''} for free shipping`
}
