/**
 * Lightweight in-memory rate limiter.
 * Tracks request timestamps per key (typically IP address).
 * Not suitable for multi-instance deployments — use Upstash Redis in that case.
 */

const WINDOW_MS = 60_000 // 1 minute
const store = new Map<string, number[]>()

export function rateLimit(key: string, max: number): boolean {
  const now = Date.now()
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (timestamps.length >= max) return false
  timestamps.push(now)
  store.set(key, timestamps)
  return true
}
