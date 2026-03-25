export const FREE_SHIPPING_COUNTRIES = ['IL']
export const FREE_SHIPPING_MIN_QTY = 3
export const INTL_PAID_SHIPPING_USD = 25

export function getShippingCost(country: string, totalQty: number): number {
  if (FREE_SHIPPING_COUNTRIES.includes(country.toUpperCase())) return 0
  if (totalQty >= FREE_SHIPPING_MIN_QTY) return 0
  return INTL_PAID_SHIPPING_USD
}

export function isShippingFree(country: string, totalQty: number): boolean {
  return getShippingCost(country, totalQty) === 0
}

export function getUpgradeMessage(country: string, totalQty: number, locale: string): string | null {
  if (FREE_SHIPPING_COUNTRIES.includes(country.toUpperCase())) return null
  if (totalQty >= FREE_SHIPPING_MIN_QTY) return null
  const needed = FREE_SHIPPING_MIN_QTY - totalQty
  if (locale === 'he') {
    return `הוסף עוד ${needed} קיט${needed > 1 ? 'ים' : ''} לקבלת משלוח חינם`
  }
  return `Add ${needed} more kit${needed > 1 ? 's' : ''} for free shipping`
}
