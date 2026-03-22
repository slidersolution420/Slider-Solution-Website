/**
 * lib/tapuz.ts
 * ALL Tapuz shipping/delivery logic lives here only.
 * Stubs for Wave 0 — full implementation in Wave 3 after API docs provided.
 */

import type { ShippingAddress } from './types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TapuzShipment {
  shipmentId: string
  trackingNumber: string
  trackingUrl: string
  status: TapuzShipmentStatus
  estimatedDelivery?: string
  createdAt: string
}

export type TapuzShipmentStatus =
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned'

export interface TapuzCreateShipmentParams {
  orderId: string
  recipientName: string
  recipientEmail: string
  recipientPhone: string
  shippingAddress: ShippingAddress
  weightKg: number
  packageCount: number
}

export interface TapuzTrackingResult {
  shipmentId: string
  trackingNumber: string
  status: TapuzShipmentStatus
  events: TapuzTrackingEvent[]
}

export interface TapuzTrackingEvent {
  timestamp: string
  status: TapuzShipmentStatus
  location?: string
  description: string
}

// ─── Error ──────────────────────────────────────────────────────────────────

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`Tapuz.${method} not yet implemented — pending API docs (Wave 3)`)
    this.name = 'NotImplementedError'
  }
}

// ─── Stubs ──────────────────────────────────────────────────────────────────

/**
 * Create a shipment via Tapuz.
 * Full implementation in Wave 3 after API docs provided.
 */
export async function createShipment(
  _params: TapuzCreateShipmentParams,
): Promise<TapuzShipment> {
  throw new NotImplementedError('createShipment')
}

/**
 * Get tracking status for a Tapuz shipment.
 * Full implementation in Wave 3 after API docs provided.
 */
export async function getTrackingStatus(
  _trackingNumber: string,
): Promise<TapuzTrackingResult> {
  throw new NotImplementedError('getTrackingStatus')
}
