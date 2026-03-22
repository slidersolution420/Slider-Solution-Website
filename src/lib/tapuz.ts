/**
 * lib/tapuz.ts
 * Tapuz delivery integration — typed stub for Wave 3.
 * Full implementation pending API docs from Tapuz.
 * Mock fallback is used when TAPUZ_API_KEY is not set.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TapuzShipment {
  trackingNumber: string
  labelUrl: string
  carrier: string
  estimatedDays: number
}

export interface TapuzAddress {
  name: string
  email: string
  phone?: string
  line1: string
  city: string
  country: string
  zip: string
}

export interface TapuzOrderPayload {
  orderId: string
  recipient: TapuzAddress
  weightKg?: number
  packageCount?: number
}

// ─── Implementation ──────────────────────────────────────────────────────────

/**
 * Create a shipment via Tapuz.
 * Returns a mock shipment when TAPUZ_API_KEY is not set.
 * Logs a warning if API key is present but Tapuz implementation is pending.
 */
export async function createShipment(
  payload: TapuzOrderPayload,
): Promise<TapuzShipment> {
  if (!process.env.TAPUZ_API_KEY) {
    // Dev / staging mock — no external call
    return {
      trackingNumber: `MOCK-${payload.orderId.slice(0, 8).toUpperCase()}`,
      labelUrl: '',
      carrier: 'mock',
      estimatedDays: 7,
    }
  }

  // TODO: implement real Tapuz API call once docs are provided
  console.warn('[tapuz] TAPUZ_API_KEY is set but API not yet implemented')
  return {
    trackingNumber: `MOCK-${payload.orderId.slice(0, 8).toUpperCase()}`,
    labelUrl: '',
    carrier: 'mock',
    estimatedDays: 7,
  }
}

/**
 * Get tracking status for a shipment.
 * Returns a human-readable status string.
 */
export async function getTrackingStatus(trackingNumber: string): Promise<string> {
  if (trackingNumber.startsWith('MOCK-')) {
    return 'In transit (mock)'
  }

  if (!process.env.TAPUZ_API_KEY) {
    return 'Unknown'
  }

  // TODO: implement real Tapuz tracking call once docs are provided
  console.warn('[tapuz] getTrackingStatus not yet implemented')
  return 'Unknown'
}
