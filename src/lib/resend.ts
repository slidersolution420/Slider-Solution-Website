/**
 * lib/resend.ts
 * ALL email sends via Resend live here only.
 * No Resend calls anywhere else in the codebase.
 * Stubs for Wave 0 — full implementation in Wave 3.
 */

import type { Order, WholesaleAccount, CartItem } from './types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmailResult {
  id: string
  success: boolean
}

export interface OrderConfirmationParams {
  order: Order
  toEmail: string
  toName: string
}

export interface AbandonedCartParams {
  toEmail: string
  toName: string
  cartItems: CartItem[]
  cartUrl: string
}

export interface WholesaleWelcomeParams {
  account: WholesaleAccount
  toEmail: string
}

export interface OwnerB2BAlertParams {
  account: WholesaleAccount
}

export interface HowToUseParams {
  toEmail: string
  toName: string
  orderId: string
}

export interface LeaveReviewParams {
  toEmail: string
  toName: string
  orderId: string
  reviewUrl: string
}

export interface WholesaleReorderParams {
  account: WholesaleAccount
  toEmail: string
}

// ─── Error ──────────────────────────────────────────────────────────────────

class NotImplementedError extends Error {
  constructor(fn: string) {
    super(`resend.${fn} not yet implemented — full impl in Wave 3`)
    this.name = 'NotImplementedError'
  }
}

// ─── Email #1 — Order Confirmation (immediate) ─────────────────────────────

export async function sendOrderConfirmation(
  _params: OrderConfirmationParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendOrderConfirmation')
}

// ─── Email #2 — How To Use (Day +3) ────────────────────────────────────────

export async function sendHowToUse(
  _params: HowToUseParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendHowToUse')
}

// ─── Email #3 — Leave a Review (Day +14) ───────────────────────────────────

export async function sendLeaveReview(
  _params: LeaveReviewParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendLeaveReview')
}

// ─── Email #4 — Abandoned Cart (+60 min) ───────────────────────────────────

export async function sendAbandonedCart(
  _params: AbandonedCartParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendAbandonedCart')
}

// ─── Email #5 — Wholesale Welcome (immediate) ──────────────────────────────

export async function sendWholesaleWelcome(
  _params: WholesaleWelcomeParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendWholesaleWelcome')
}

// ─── Email #6 — Wholesale Reorder (Day +30, ENABLE_REORDER_EMAIL=false) ────

export async function sendWholesaleReorder(
  _params: WholesaleReorderParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendWholesaleReorder')
}

// ─── Email #7 — Owner B2B Alert (immediate) ────────────────────────────────

export async function sendOwnerB2BAlert(
  _params: OwnerB2BAlertParams,
): Promise<EmailResult> {
  throw new NotImplementedError('sendOwnerB2BAlert')
}
