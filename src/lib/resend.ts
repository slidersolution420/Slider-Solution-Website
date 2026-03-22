/**
 * lib/resend.ts
 * ALL email sends via Resend live here only.
 * No Resend calls anywhere else in the codebase.
 */

import { Resend } from 'resend'
import type { Order, WholesaleAccount } from './types'

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.RESEND_FROM_EMAIL ?? 'support@slidersolution.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── HTML helpers ────────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #07080F; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .outer { background: #07080F; padding: 40px 20px; }
    .card { background: #0F1629; border-radius: 16px; padding: 40px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08); }
    .logo { font-size: 22px; font-weight: 800; color: #a855f7; letter-spacing: -0.5px; margin-bottom: 32px; }
    h1 { font-size: 28px; font-weight: 800; color: #ffffff; margin: 0 0 12px; }
    p { font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px; margin: 8px 0 20px; }
    .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 24px 0; }
    .footer { font-size: 12px; color: #4b5563; text-align: center; margin-top: 32px; }
    .badge { display: inline-block; background: rgba(168,85,247,0.15); color: #a855f7; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="outer">
    <div class="card">
      <div class="logo">Slider Solution</div>
      ${content}
      <div class="divider"></div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Slider Solution. All rights reserved.<br/>
        <a href="${APP_URL}" style="color:#6b7280; text-decoration:none;">slidersolution.com</a>
      </div>
    </div>
  </div>
</body>
</html>`
}

function h1(text: string): string {
  return `<h1>${text}</h1>`
}

function p(text: string): string {
  return `<p>${text}</p>`
}

function btn(text: string, href: string): string {
  return `<a class="btn" href="${href}">${text}</a>`
}

function colorDot(color: string): string {
  const bg: Record<string, string> = {
    black: '#0F0F0F',
    blue: '#1D4ED8',
    purple: '#7C3AED',
  }
  return `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${bg[color] ?? '#888'};vertical-align:middle;margin-right:6px;"></span>`
}

function orderItemsHtml(items: Order['items']): string {
  return items
    .map(
      (item) =>
        `<div style="margin-bottom:8px;">${colorDot(item.color)}<span style="color:#d1d5db;font-size:14px;">${item.color.charAt(0).toUpperCase() + item.color.slice(1)} Kit &times;${item.qty} &mdash; $${(item.priceUsd * item.qty).toFixed(2)}</span></div>`,
    )
    .join('')
}

// ─── Guard helper ─────────────────────────────────────────────────────────────

function noResend(fn: string): boolean {
  if (!resendClient) {
    console.warn(`[resend] RESEND_API_KEY not set — skipping ${fn}`)
    return true
  }
  return false
}

// ─── Email #1 — Order Confirmation (immediate) ───────────────────────────────

export async function sendOrderConfirmation(order: Order): Promise<void> {
  if (noResend('sendOrderConfirmation')) return

  const shortRef = order.id.slice(0, 8).toUpperCase()
  const html = emailWrapper(`
    ${h1('Your order is confirmed! 🎉')}
    ${p(`Hi ${order.name}, thanks for your order. We're getting your Slider ready.`)}
    <div class="divider"></div>
    <p style="color:#9ca3af;font-size:13px;margin-bottom:8px;">Order #${shortRef}</p>
    ${orderItemsHtml(order.items)}
    <p style="color:#9ca3af;font-size:14px;margin-top:12px;">Total: <strong style="color:#fff;">$${order.total_usd.toFixed(2)}</strong></p>
    <div class="divider"></div>
    ${p("You'll receive a shipping confirmation once your order is on its way.")}
    ${btn('View order', `${APP_URL}/en/order/${order.hype_payment_id ?? order.id}`)}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: order.email,
    subject: `Order confirmed #${shortRef} — Slider Solution`,
    html,
  })
}

// ─── Email #2 — How To Use (Day +3) ──────────────────────────────────────────

export async function sendHowToUse(order: Order): Promise<void> {
  if (noResend('sendHowToUse')) return

  const html = emailWrapper(`
    ${h1('Your Slider just arrived 📦')}
    ${p(`Hey ${order.name}! Hope you're loving your new Slider Kit. Here's a quick guide to get the most out of it.`)}
    <div class="divider"></div>
    ${p('<strong style="color:#fff;">Step 1 — Load</strong><br/>Place your cone on the loading tube.')}
    ${p('<strong style="color:#fff;">Step 2 — Fill</strong><br/>Add your material and tap gently to settle.')}
    ${p('<strong style="color:#fff;">Step 3 — Slide</strong><br/>Press the slider down in one smooth motion. Done.')}
    <div class="divider"></div>
    ${btn('Watch the tutorial →', `${APP_URL}/en#how-it-works`)}
    ${p('Questions? Reply to this email and we\'ll help you out.')}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: order.email,
    subject: 'How to use your Slider Kit',
    html,
  })
}

// ─── Email #3 — Leave a Review (Day +14) ─────────────────────────────────────

export async function sendLeaveReview(order: Order): Promise<void> {
  if (noResend('sendLeaveReview')) return

  const html = emailWrapper(`
    ${h1('Loving your Slider? ⭐')}
    ${p(`Hi ${order.name}, it's been two weeks since your kit arrived. We'd love to hear what you think!`)}
    ${p('Your review helps other people discover the Slider and supports our small team.')}
    ${btn('Leave a review →', `${APP_URL}/en/reviews`)}
    ${p('Takes 60 seconds. We read every single one. 🙏')}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: order.email,
    subject: 'How\'s your Slider treating you?',
    html,
  })
}

// ─── Email #4 — Abandoned Cart (+60 min) ─────────────────────────────────────

export async function sendAbandonedCart(
  email: string,
  cart: Array<{ color: string; qty: number; priceUsd: number }>,
  country: string,
): Promise<void> {
  if (noResend('sendAbandonedCart')) return

  const total = cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0)
  const itemsHtml = cart
    .map(
      (item) =>
        `<div style="margin-bottom:8px;">${colorDot(item.color)}<span style="color:#d1d5db;font-size:14px;">${item.color.charAt(0).toUpperCase() + item.color.slice(1)} Kit &times;${item.qty} &mdash; $${(item.priceUsd * item.qty).toFixed(2)}</span></div>`,
    )
    .join('')

  const html = emailWrapper(`
    ${h1('You left something behind 👀')}
    ${p(`Your cart is waiting. Only a few kits left at this price${country ? ` for ${country}` : ''}.`)}
    <div class="divider"></div>
    ${itemsHtml}
    <p style="color:#9ca3af;font-size:14px;margin-top:12px;">Cart total: <strong style="color:#fff;">$${total.toFixed(2)}</strong></p>
    <div class="divider"></div>
    ${btn('Complete my order →', `${APP_URL}/en`)}
    ${p('Your cart is saved. Complete your order before stock runs out.')}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: email,
    subject: 'Your cart is still waiting for you',
    html,
  })
}

// ─── Email #5 — Wholesale Welcome (immediate) ────────────────────────────────

export async function sendWholesaleWelcome(account: WholesaleAccount): Promise<void> {
  if (noResend('sendWholesaleWelcome')) return
  if (!account.email) {
    console.warn('[resend] sendWholesaleWelcome: no email on account', account.id)
    return
  }

  const html = emailWrapper(`
    ${h1('Welcome to the Slider family! 🤝')}
    ${p(`Hi ${account.contact_name}, your wholesale account for <strong style="color:#fff;">${account.store_name}</strong> has been approved.`)}
    <div class="divider"></div>
    <span class="badge">Wholesale Partner</span>
    ${p('You now have access to wholesale pricing and bulk ordering. A member of our team will be in touch with your account details within 24 hours.')}
    ${btn('Visit wholesale portal →', `${APP_URL}/en/wholesale`)}
    ${p('Questions? Just reply to this email.')}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: account.email,
    subject: 'Your Slider wholesale account is approved',
    html,
  })
}

// ─── Email #6 — Wholesale Reorder (Day +30) ──────────────────────────────────

export async function sendWholesaleReorder(
  email: string,
  contactName: string,
  lastOrder: Order,
): Promise<void> {
  if (noResend('sendWholesaleReorder')) return
  if (process.env.ENABLE_REORDER_EMAIL !== 'true') {
    console.warn('[resend] sendWholesaleReorder: ENABLE_REORDER_EMAIL not set to true, skipping')
    return
  }

  const shortRef = lastOrder.id.slice(0, 8).toUpperCase()
  const html = emailWrapper(`
    ${h1('Time to restock? 📦')}
    ${p(`Hi ${contactName}, it's been 30 days since order #${shortRef}. Running low on Slider Kits?`)}
    ${p('Reorder now to keep your shelves stocked — we ship the same week.')}
    ${btn('Place reorder →', `${APP_URL}/en/wholesale`)}
    ${p('Need a custom quantity or have questions? Reply to this email.')}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: email,
    subject: 'Time to restock your Slider Kits?',
    html,
  })
}

// ─── Email #7 — Owner B2B Alert (immediate) ───────────────────────────────────

export async function sendOwnerB2BAlert(account: WholesaleAccount): Promise<void> {
  if (noResend('sendOwnerB2BAlert')) return

  const ownerEmail = process.env.OWNER_ALERT_EMAIL
  if (!ownerEmail) {
    console.warn('[resend] sendOwnerB2BAlert: OWNER_ALERT_EMAIL not set, skipping')
    return
  }

  const html = emailWrapper(`
    ${h1('New wholesale signup! 🎯')}
    ${p('A new business has signed up for a wholesale account.')}
    <div class="divider"></div>
    <p style="color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Store:</strong> ${account.store_name}</p>
    <p style="color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Contact:</strong> ${account.contact_name}</p>
    <p style="color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Business:</strong> ${account.business_name}</p>
    <p style="color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Phone:</strong> ${account.phone}</p>
    <p style="color:#d1d5db;font-size:14px;"><strong style="color:#fff;">City:</strong> ${account.city}, ${account.country}</p>
    ${account.email ? `<p style="color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Email:</strong> ${account.email}</p>` : ''}
    <div class="divider"></div>
    ${p('Review and approve their account in Supabase or the admin panel.')}
  `)

  await resendClient!.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `New wholesale signup: ${account.store_name}`,
    html,
  })
}
