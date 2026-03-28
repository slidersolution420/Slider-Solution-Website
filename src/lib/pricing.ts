/**
 * Centralized discount pricing logic.
 *
 * Pure function — no DB access, works in both server (checkout API)
 * and client (React components) contexts.
 */

export interface PriceInfo {
  originalUsd: number
  discountedUsd: number
  hasDiscount: boolean
  discountPct: number
}

/**
 * Calculate effective price given a base USD price and a discount percentage.
 * Clamps discountPct to 0–100 and rounds discounted price to 2 decimal places.
 */
export function calcPrice(baseUsd: number, discountPct: number): PriceInfo {
  const pct = Math.max(0, Math.min(100, Math.round(discountPct)))
  const hasDiscount = pct > 0
  const discountedUsd = hasDiscount
    ? Math.round(baseUsd * (1 - pct / 100) * 100) / 100
    : baseUsd
  return { originalUsd: baseUsd, discountedUsd, hasDiscount, discountPct: pct }
}
