/**
 * lib/tapuz.ts
 * Tapuz delivery integration — ALL Tapuz logic lives here only.
 * SOAP call to http://crm.tapuzdelivery.co.il/baldarwebservice/Service.asmx
 * Method: SaveData1 with pipe-delimited pParam string.
 * Mock fallback when TAPUZ_CUSTOMER_CODE is '4041' (test code) or unset.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Config ──────────────────────────────────────────────────────────────────

const TAPUZ_WSDL_URL =
  'http://crm.tapuzdelivery.co.il/baldarwebservice/Service.asmx'

const TAPUZ_CUSTOMER_CODE = process.env.TAPUZ_CUSTOMER_CODE ?? ''
const TAPUZ_USERNAME = process.env.TAPUZ_USERNAME ?? 'WebUser'
const TAPUZ_PASSWORD = process.env.TAPUZ_PASSWORD ?? ''

const SOAP_ACTION = 'http://tempuri.org/SaveData1'

const TRACKING_BASE = 'https://www.tapuzdelivery.co.il/tracking?barcode='

const IS_TEST_MODE = TAPUZ_CUSTOMER_CODE === '4041' || !TAPUZ_CUSTOMER_CODE

// ─── SOAP helpers ────────────────────────────────────────────────────────────

function buildPParam(payload: TapuzOrderPayload): string {
  const fields = [
    TAPUZ_CUSTOMER_CODE,
    TAPUZ_USERNAME,
    TAPUZ_PASSWORD,
    payload.orderId,
    sanitizeField(payload.recipient.name),
    sanitizeField(payload.recipient.phone ?? ''),
    sanitizeField(payload.recipient.email),
    sanitizeField(payload.recipient.line1),
    sanitizeField(payload.recipient.city),
    sanitizeField(payload.recipient.country),
    sanitizeField(payload.recipient.zip),
    String(payload.packageCount ?? 1),
    String(payload.weightKg ?? 0.5),
    '',
  ]
  return fields.join('|')
}

function sanitizeField(value: string): string {
  return value.replace(/\|/g, ' ').trim()
}

function buildSoapEnvelope(pParam: string): string {
  const escaped = pParam
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SaveData1 xmlns="http://tempuri.org/">
      <pParam>${escaped}</pParam>
    </SaveData1>
  </soap:Body>
</soap:Envelope>`
}

function parseSoapResponse(xml: string): string {
  const match = xml.match(/<SaveData1Result>([\s\S]*?)<\/SaveData1Result>/)
  if (!match?.[1]) {
    throw new Error(`[tapuz] No SaveData1Result in response: ${xml.slice(0, 500)}`)
  }
  const result = match[1].trim()
  if (result.toLowerCase().startsWith('error')) {
    throw new Error(`[tapuz] API error: ${result}`)
  }
  return result
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function createShipment(
  payload: TapuzOrderPayload,
): Promise<TapuzShipment> {
  if (IS_TEST_MODE) {
    console.info('[tapuz] Test mode (code 4041) — returning mock shipment')
    const mockTracking = `MOCK-${payload.orderId.slice(0, 8).toUpperCase()}`
    return {
      trackingNumber: mockTracking,
      trackingUrl: '',
      carrier: 'mock',
      estimatedDays: 3,
    }
  }

  const pParam = buildPParam(payload)
  const soapBody = buildSoapEnvelope(pParam)

  const response = await fetch(TAPUZ_WSDL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: SOAP_ACTION,
    },
    body: soapBody,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `[tapuz] SOAP request failed ${response.status}: ${text.slice(0, 500)}`,
    )
  }

  const xml = await response.text()
  const trackingNumber = parseSoapResponse(xml)

  return {
    trackingNumber,
    trackingUrl: `${TRACKING_BASE}${encodeURIComponent(trackingNumber)}`,
    carrier: 'tapuz',
    estimatedDays: payload.recipient.country === 'IL' ? 3 : 14,
  }
}

export function getTrackingUrl(trackingNumber: string): string {
  if (trackingNumber.startsWith('MOCK-')) return ''
  return `${TRACKING_BASE}${encodeURIComponent(trackingNumber)}`
}

export async function getTrackingStatus(
  trackingNumber: string,
): Promise<string> {
  if (trackingNumber.startsWith('MOCK-')) return 'In transit (mock)'
  return 'In transit'
}
