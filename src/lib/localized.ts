/**
 * Locale-aware field helpers for CMS objects.
 * Safe to import in both Server and Client Components.
 */

/** Pick a localized string field, falling back to English. */
export function localized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: string,
): string {
  const val = obj[`${field}_${locale}`]
  if (typeof val === 'string' && val) return val
  const fallback = obj[`${field}_en`]
  return typeof fallback === 'string' ? fallback : ''
}

/** Like localized() but for array fields (e.g. sections, kit_contents). */
export function localizedArray<V>(
  obj: Record<string, unknown>,
  field: string,
  locale: string,
): V[] {
  const val = obj[`${field}_${locale}`]
  if (Array.isArray(val) && val.length > 0) return val as V[]
  const fallback = obj[`${field}_en`]
  return Array.isArray(fallback) ? (fallback as V[]) : []
}
