// Hype Pay (hyp-e.com) — Pay Protocol integration
// Docs: https://hypay.docs.apiary.io/
//
// Flow:
//  1. initiatePayment() → GET APISign?What=SIGN → returns signed query string
//  2. Redirect user to: https://pay.hyp.co.il/p/?action=pay&<signed_params>
//  3. User pays on Hype's hosted page
//  4. Hype redirects user's browser to SuccessURL with params (Id, CCode, Amount, etc.)
//  5. verifyPayment() → GET APISign?What=VERIFY → CCode=0 means verified

const HYPE_BASE = 'https://pay.hyp.co.il/p/'

export interface HypePaymentSession {
  payment_url: string
  order_ref: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  zip: string
  items: Array<{ name: string; quantity: number; priceIls: number }>
  totalIls: number
  orderRef: string // cart session UUID — used as Hype's Order reference
}

/**
 * Step 1+2: Call APISign (SIGN) to get signed payment page params, then build the payment URL.
 */
export async function initiatePayment(customer: CustomerInfo): Promise<HypePaymentSession> {
  const apiKey = process.env.HYPE_API_KEY
  // HYPE_PASSP is the "PassP" from Hype settings page (previously stored as HYPE_REFERER)
  const passP = process.env.HYPE_PASSP ?? process.env.HYPE_REFERER
  const masof = process.env.HYPE_TERMINAL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://slidersolution.com'

  if (!apiKey || !masof || !passP) {
    // Dev mock: redirect straight to thank-you with mock params
    return {
      payment_url: `${appUrl}/thankyou?Order=${customer.orderRef}&CCode=0&Amount=${Math.round(customer.totalIls)}&Id=mock_${Date.now()}&mock=1`,
      order_ref: customer.orderRef,
    }
  }

  const nameParts = customer.name.trim().split(' ')
  const firstName = nameParts[0] ?? customer.name
  const lastName = nameParts.slice(1).join(' ') || firstName

  // Build item list for Hype receipt: [0~Name~Qty~PriceIls][...]
  const heshParts = customer.items.map(
    i => `0~${i.name}~${i.quantity}~${Math.round(i.priceIls)}`
  )
  const heshDesc = `[${heshParts.join('][')}]`

  const params = new URLSearchParams({
    action: 'APISign',
    What: 'SIGN',
    KEY: apiKey,
    PassP: passP,
    Masof: masof,
    Order: customer.orderRef,
    Info: `Slider Kit ${customer.orderRef.slice(0, 8)}`,
    Amount: String(Math.round(customer.totalIls)),
    UTF8: 'True',
    UTF8out: 'True',
    Sign: 'True',
    MoreData: 'True',
    SendHesh: 'True',
    heshDesc,
    Pritim: 'True',
    PageLang: 'HEB',
    Coin: '1', // ILS
    Tash: '1',
    FixTash: 'False',
    ClientName: firstName,
    ClientLName: lastName,
    email: customer.email,
    phone: customer.phone,
    cell: customer.phone,
    street: customer.address,
    city: customer.city,
    zip: customer.zip,
    SuccessURL: `${appUrl}/thankyou`,
    ErrorURL: `${appUrl}/problem`,
    tmp: '1',
  })

  // When using REFERER auth mode in Hype dashboard, the Referer header must match
  const res = await fetch(`${HYPE_BASE}?${params.toString()}`, {
    headers: { Referer: passP },
  })
  if (!res.ok) throw new Error(`Hype APISign error: ${res.status}`)

  const signedText = await res.text()
  if (!signedText || signedText.toLowerCase().includes('error')) {
    throw new Error(`Hype APISign failed: ${signedText}`)
  }

  return {
    payment_url: `${HYPE_BASE}?action=pay&${signedText}`,
    order_ref: customer.orderRef,
  }
}

/**
 * Step 5: Verify a completed payment using params from the Hype success redirect URL.
 * Returns true if CCode=0 and Hype confirms the transaction is genuine.
 */
export async function verifyPayment(params: Record<string, string>): Promise<boolean> {
  // Mock payments always succeed
  if (params['mock'] === '1') return true

  const apiKey = process.env.HYPE_API_KEY
  const passP = process.env.HYPE_PASSP ?? process.env.HYPE_REFERER
  const masof = process.env.HYPE_TERMINAL

  // Dev mode — skip verification
  if (!apiKey || !masof || !passP) return true

  if (params['CCode'] !== '0') return false

  // Forward ALL redirect params (including Sign, Fild1-3, Bank, etc.) so Hype can
  // validate the cryptographic signature. Auth params are set last to prevent spoofing.
  const verifyParams = new URLSearchParams({
    ...params,
    action: 'APISign',
    What: 'VERIFY',
    KEY: apiKey,
    PassP: passP,
    Masof: masof,
    UTF8: 'True',
    UTF8out: 'True',
  })

  const res = await fetch(`${HYPE_BASE}?${verifyParams.toString()}`, {
    headers: { Referer: passP },
  })
  if (!res.ok) return false

  const result = await res.text()
  const resultParams = new URLSearchParams(result)
  return resultParams.get('CCode') === '0'
}
