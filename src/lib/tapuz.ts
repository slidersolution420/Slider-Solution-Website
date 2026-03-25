/**
 * lib/tapuz.ts
 * Tapuz delivery integration — ALL Tapuz logic lives here only.
 * SOAP call to http://crm.tapuzdelivery.co.il/baldarwebservice/Service.asmx
 * Method: SaveData1 with pipe-delimited pParam string.
 * Mock fallback when TAPUZ_CUSTOMER_CODE is '4041' (test code).
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

// ─── Config ─────────────────────────────────────────────────────────────────

const TAPUZ_WSDL_URL =
  'http://crm.tapuzdelivery.co.il/baldarwebservice/Service.asmx'

const TAPUZ_CUSTOMER_CODE = process.env.TAPUZ_CUSTOMER_CODE ?? ''
const TAPUZ_USERNAME = process.env.TAPUZ_USERNAME ?? 'WebUser'
const TAPUZ_PASSWORD = process.env.TAPUZ_PASSWORD ?? ''

const SOAP_ACTION = 'http://tempuri.org/SaveData1'

const IS_TEST_MODE = TAPUZ_CUSTOMER_CODE === '4041' || !TAPUZ_CUSTOMER_CODE

// ─── SOAP helpers ───────────────────────────────────────────────────────────

/**
 * Build the pipe-delimited pParam string for SaveData1.
 *
 * Tapuz field order (pipe-separated):
 *  0: CustomerCode
 *  1: Username
 *  2: Password
 *  3: OrderID (external ref)
 *  4: RecipientName
 *  5: RecipientPhone
 *  6: RecipientEmail
 *  7: Street
 *  8: City
 *  9: Country
 * 10: ZipCode
 * 11: PackageCount
 * 12: WeightKg
 * 13: Notes (empty)
 */
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
    '', // Notes
  ]
  return fields.join('|')
}

/** Remove pipe characters from field values to prevent delimiter injection. */
function sanitizeField(value: string): string {
  return value.replace(/\|/g, ' ').trim()
}

/**
 * Wrap the pParam in the SOAP envelope for SaveData1.
 */
function buildSoapEnvelope(pParam: string): string {
  // XML-escape the pParam value
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

/**
 * Parse the SaveData1 SOAP response to extract the tracking number.
 * The response contains <SaveData1Result>...</SaveData1Result>.
 * Tapuz returns a numeric tracking/barcode string on success,
 * or an error message prefixed with "Error" on failure.
 */
function parseSoapResponse(xml: string): string {
  const match = xml.match(/<SaveData1Result>([\s\S]*?)<\/SaveData1Result>/)
  if (!match?.[1]) {
    throw new Error(`[tapuz] No SaveData1Result in response: ${xml.slice(0, 500)}`)
  }
  const result = match[1].trim()

  // Tapuz returns "Error: ..." or similar on failure
  if (result.toLowerCase().startsWith('error')) {
    throw new Error(`[tapuz] API error: ${result}`)
  }

  return result
}

// ─── Mock ───────────────────────────────────────────────────────────────────

function createMockShipment(orderId: string): TapuzShipment {
  return {
    trackingNumber: `MOCK-${orderId.slice(0, 8).toUpperCase()}`,
    labelUrl: '',
    carrier: 'mock',
    estimatedDays: 7,
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Create a shipment via Tapuz SaveData1 SOAP call.
 * Returns a mock shipment when customer code is '4041' (test) or not set.
 */
export async function createShipment(
  payload: TapuzOrderPayload,
): Promise<TapuzShipment> {
  // Mock mode for test/dev
  if (IS_TEST_MODE) {
    console.info('[tapuz] Test mode (code 4041) — returning mock shipment')
    return createMockShipment(payload.orderId)
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
    labelUrl: '', // Tapuz doesn't return a label URL via SaveData1
    carrier: 'tapuz',
    estimatedDays: payload.recipient.country === 'IL' ? 3 : 14,
  }
}

/**
 * Get tracking status for a shipment.
 * Mock shipments return a static status.
 * Real tracking lookup is not yet available via Tapuz SOAP —
 * returns a Tapuz tracking page URL instead.
 */
export async function getTrackingStatus(
  trackingNumber: string,
): Promise<string> {
  if (trackingNumber.startsWith('MOCK-')) {
    return 'In transit (mock)'
  }

  // Tapuz does not expose a tracking-status SOAP method.
  // Return a link to their tracking portal for now.
  return `Track at: https://www.tapuzdelivery.co.il/tracking?barcode=${encodeURIComponent(trackingNumber)}`
}
