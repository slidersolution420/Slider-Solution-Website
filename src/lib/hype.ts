/**
 * lib/hype.ts
 * ALL Hype payment logic lives here only.
 * Stubs for Wave 0 — full implementation in Wave 2 after API docs provided.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HypePaymentSession {
  sessionId: string
  paymentUrl: string
  expiresAt: string
  amountUsd: number
  orderId: string
}

export interface HypeWebhookPayload {
  event: 'payment.completed' | 'payment.failed' | 'payment.refunded'
  sessionId: string
  orderId: string
  amountUsd: number
  currency: string
  timestamp: string
  signature: string
}

export interface HypeInitiatePaymentParams {
  orderId: string
  amountUsd: number
  customerEmail: string
  customerName: string
  successUrl: string
  cancelUrl: string
}

// ─── Error ──────────────────────────────────────────────────────────────────

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`Hype.${method} not yet implemented — pending API docs (Wave 2)`)
    this.name = 'NotImplementedError'
  }
}

// ─── Stubs ──────────────────────────────────────────────────────────────────

/**
 * Initiate a Hype payment session.
 * Full implementation in Wave 2 after API docs provided.
 */
export async function initiatePayment(
  _params: HypeInitiatePaymentParams,
): Promise<HypePaymentSession> {
  throw new NotImplementedError('initiatePayment')
}

/**
 * Verify the HMAC signature on an incoming Hype webhook.
 * Full implementation in Wave 2 after API docs provided.
 */
export function verifyWebhookSignature(
  _payload: string,
  _signature: string,
  _secret: string,
): boolean {
  throw new NotImplementedError('verifyWebhookSignature')
}
