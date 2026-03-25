/**
 * lib/tapuz.ts
 * Tapuz Express delivery integration — SOAP over HTTP.
 * Uses the SaveData1 endpoint with pipe-delimited parameters.
 * Mock fallback used when TAPUZ_CUSTOMER_CODE is unset or equals '4041' (test account).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TapuzShipment {
  trackingNumber: string
  trackingUrl: string
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

// ─── Constants ───────────────────────────────────────────────────────────────

const TAPUZ_SOAP_URL =
  'http://www.tapuzexpress.co.il/webservice/delivery.asmx'

const SOAP_ACTION = 'http://tempuri.org/SaveData1'

const TRACKING_BASE = 'https://www.tapuzexpress.co.il/track/'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSoapEnvelope(customerCode: string, senderCode: string, data: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <SaveData1 xmlns="http://tempuri.org/">
      <custumer_code>${customerCode}</custumer_code>
      <sender_code>${senderCode}</sender_code>
      <data>${data}</data>
    </SaveData1>
  </soap:Body>
</soap:Envelope>`
}

function buildPipeParams(payload: TapuzOrderPayload, customerCode: string): string {
  const { recipient, packageCount = 1, weightKg = 0.5 } = payload

  // Split house number from street address if present
  const addrMatch = recipient.line1.match(/^(.*?)\s+(\d+[a-zA-Z]?)$/)
  const street = addrMatch ? (addrMatch[1] ?? recipient.line1) : recipient.line1
  const houseNo = addrMatch ? (addrMatch[2] ?? '') : ''

  const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '/')

  // Format: CustomerCode|PackageCount|Date|Description|RecipientName|Street|HouseNo|City|Phone|Email|Notes|Weight|Value
  return [
    customerCode,
    String(packageCount),
    today,
    `Order ${payload.orderId.slice(0, 12)}`,
    recipient.name,
    street,
    houseNo,
    recipient.city,
    recipient.phone ?? '',
    recipient.email,
    '',
    String(weightKg),
    '',
  ].join('|')
}

function parseDeliveryNumber(xml: string): string | null {
  const match = xml.match(/<DeliveryNumber[^>]*>([^<]+)<\/DeliveryNumber>/)
  return match ? (match[1] ?? null) : null
}

function isMockMode(): boolean {
  const code = process.env.TAPUZ_CUSTOMER_CODE
  return !code || code === '4041'
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a shipment via Tapuz Express SOAP API.
 * Returns a mock shipment when TAPUZ_CUSTOMER_CODE is unset or is the test value '4041'.
 */
export async function createShipment(
  payload: TapuzOrderPayload,
): Promise<TapuzShipment> {
  if (isMockMode()) {
    const mockTracking = `MOCK-${payload.orderId.slice(0, 8).toUpperCase()}`
    return {
      trackingNumber: mockTracking,
      trackingUrl: '',
      carrier: 'mock',
      estimatedDays: 3,
    }
  }

  const customerCode = process.env.TAPUZ_CUSTOMER_CODE!
  const senderCode = process.env.TAPUZ_SENDER_CODE ?? customerCode
  const pipeData = buildPipeParams(payload, customerCode)
  const envelope = buildSoapEnvelope(customerCode, senderCode, pipeData)

  const response = await fetch(TAPUZ_SOAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': SOAP_ACTION,
    },
    body: envelope,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`[tapuz] SOAP request failed ${response.status}: ${body}`)
  }

  const xml = await response.text()
  const deliveryNumber = parseDeliveryNumber(xml)

  if (!deliveryNumber) {
    console.error('[tapuz] Unexpected response XML:', xml.slice(0, 500))
    throw new Error('[tapuz] DeliveryNumber not found in SOAP response')
  }

  return {
    trackingNumber: deliveryNumber,
    trackingUrl: `${TRACKING_BASE}${deliveryNumber}`,
    carrier: 'tapuz',
    estimatedDays: 3,
  }
}

/**
 * Build a public tracking URL for a Tapuz tracking number.
 */
export function getTrackingUrl(trackingNumber: string): string {
  if (trackingNumber.startsWith('MOCK-')) return ''
  return `${TRACKING_BASE}${trackingNumber}`
}

/**
 * Get tracking status for a shipment.
 * Returns a human-readable status string.
 */
export async function getTrackingStatus(trackingNumber: string): Promise<string> {
  if (trackingNumber.startsWith('MOCK-')) {
    return 'In transit (mock)'
  }
  // Status lookup not implemented — check Tapuz dashboard directly
  return 'In transit'
}
