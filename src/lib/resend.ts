import { Resend } from 'resend'
import type { Order } from './types'

// Lazy initialization — avoids build-time error when RESEND_API_KEY is not set
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'support@slidersolution.com'
const OWNER = process.env.OWNER_ALERT_EMAIL ?? 'ceo@slidersolution.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://slidersolution.com'

function emailTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#fff;font-family:Inter,system-ui,sans-serif;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#111;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px;text-align:center">
      <h1 style="margin:0;font-size:24px;font-weight:700">SLIDER</h1>
      <p style="margin:8px 0 0;opacity:0.85;font-size:14px">The Original All-in-One Cone Kit</p>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 16px;font-size:20px">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #222;margin:24px 0">
      <p style="margin:0;font-size:12px;color:#666;text-align:center">
        © Slider Solution | <a href="${APP_URL}" style="color:#a855f7">slidersolution.com</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const items = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;color:#ccc">${item.name} × ${item.quantity}</td><td style="padding:8px 0;text-align:right">$${(item.priceUsd * item.quantity).toFixed(2)}</td></tr>`
    )
    .join('')

  const body = `
    <p style="color:#ccc">Thank you for your order, <strong>${order.name}</strong>!</p>
    <p style="color:#ccc">Order #: <strong>${order.id.slice(0, 8).toUpperCase()}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${items}
      <tr style="border-top:1px solid #333">
        <td style="padding:8px 0;font-weight:700">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:700">$${order.total_usd.toFixed(2)}</td>
      </tr>
    </table>
    <p style="color:#ccc">Shipping to: ${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.country}</p>
    <p style="color:#ccc">We'll send you a tracking number once your order ships.</p>
  `

  await getResend().emails.send({
    from: FROM,
    to: order.email,
    subject: `Order Confirmed — SLIDER #${order.id.slice(0, 8).toUpperCase()}`,
    html: emailTemplate('Order Confirmed!', body),
  })
}

export async function sendContactSubmission(
  name: string,
  email: string,
  message: string
): Promise<void> {
  const body = `
    <p style="color:#ccc"><strong>From:</strong> ${name} (${email})</p>
    <p style="color:#ccc"><strong>Message:</strong></p>
    <p style="color:#ccc;background:#1a1a1a;padding:16px;border-radius:8px">${message}</p>
    <p style="color:#ccc"><a href="mailto:${email}" style="color:#a855f7">Reply to ${name}</a></p>
  `

  await getResend().emails.send({
    from: FROM,
    to: OWNER,
    replyTo: email,
    subject: `Contact Form: ${name}`,
    html: emailTemplate('New Contact Message', body),
  })
}

export async function sendWholesaleWelcome(
  businessName: string,
  contactName: string,
  email: string
): Promise<void> {
  const body = `
    <p style="color:#ccc">Welcome to the Slider Solution wholesale program, <strong>${contactName}</strong>!</p>
    <p style="color:#ccc">Your account for <strong>${businessName}</strong> is under review. We'll notify you within 24 hours once approved.</p>
    <p style="color:#ccc">Once approved, you'll have access to wholesale pricing:</p>
    <ul style="color:#ccc">
      <li>Display Box (6 kits): $82</li>
      <li>Minimum order: 1 display box</li>
    </ul>
    <p style="color:#ccc">Questions? Reply to this email or contact us at <a href="mailto:support@slidersolution.com" style="color:#a855f7">support@slidersolution.com</a></p>
  `

  const r = getResend()
  await Promise.all([
    r.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to Slider Solution Wholesale',
      html: emailTemplate('Wholesale Application Received', body),
    }),
    r.emails.send({
      from: FROM,
      to: OWNER,
      subject: `New Wholesale Signup: ${businessName}`,
      html: emailTemplate(
        'New Wholesale Signup',
        `<p style="color:#ccc"><strong>${businessName}</strong> (${contactName}) just registered for wholesale access. Email: ${email}</p>
         <p><a href="${APP_URL}/wholesale" style="color:#a855f7">View in dashboard →</a></p>`
      ),
    }),
  ])
}
