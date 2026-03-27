import type { Order } from '@/lib/types'

export type TapuzResult = { deliveryNumber: string; branch: string }

function sanitize(s: string): string {
  return s.replace(/['"*&,]/g, '')
}

function formatPhone(phone: string): string {
  // Strip +972 prefix and ensure leading 0
  const stripped = phone.replace(/^\+972/, '0').replace(/\s+/g, '')
  return stripped.startsWith('0') ? stripped : `0${stripped}`
}

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildPayload(order: Order): string {
  const addr = order.shipping_address
  const orderId = order.id

  const fields: string[] = [
    '1',                               // 1  - delivery type
    sanitize('סירקין'),               // 2  - origin street
    '36',                              // 3  - origin house
    sanitize('הרצליה'),               // 4  - origin city
    sanitize(addr.address),            // 5  - dest street
    '',                                // 6  - dest house (embedded in address)
    sanitize(addr.city),               // 7  - dest city
    sanitize('slider online'),         // 8  - company
    sanitize(order.name),              // 9  - customer name
    '',                                // 10
    '1',                               // 11 - package type regular
    '0',                               // 12
    '1',                               // 13 - standard delivery
    '1',                               // 14
    '1',                               // 15
    '0',                               // 16
    `SS-${orderId}`,                   // 17 - reference
    '27167',                           // 18 - customer code
    `SS-${orderId}`,                   // 19 - barcode
    sanitize(order.email),             // 20 - customer email
    '',                                // 21
    '',                                // 22
    '',                                // 23
    '',                                // 24
    formatPhone(addr.phone),           // 25 - customer phone
    '0',                               // 26
    todayYMD(),                        // 27 - delivery date
    '',                                // 28
    'slider',                          // 29 - username
    'Slider123$',                      // 30 - password
    '',                                // 31
    '',                                // 32
    '',                                // 33
    '',                                // 34
    '',                                // 35
    '',                                // 36
    '',                                // 37
    '',                                // 38
  ]

  return fields.join(';')
}

export async function createShipment(order: Order): Promise<TapuzResult> {
  const apiUrl = process.env.TAPUZ_API_URL

  if (!apiUrl) {
    console.warn('[Tapuz] TAPUZ_API_URL not set — using mock response')
    return { deliveryNumber: '9999999', branch: 'MOCK' }
  }

  const payload = buildPayload(order)
  const fullUrl = `${apiUrl}?${payload}`

  console.log('[Tapuz] Calling API:', fullUrl)

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const text = (await response.text()).trim()
  console.log('[Tapuz] Response:', text)

  // Success: "1234567;branchCode"
  const parts = text.split(';')
  const firstPart = parts[0]
  const code = parseInt(firstPart, 10)

  if (!isNaN(code) && code > 0) {
    return {
      deliveryNumber: firstPart,
      branch: parts[1] ?? '',
    }
  }

  // Failure: negative error code
  throw new Error(`Tapuz error code: ${text}`)
}
