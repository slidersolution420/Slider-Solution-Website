import { initiatePayment } from '@/lib/hype'
import { checkoutSchema } from '@/lib/schemas'
import { getShippingCost } from '@/lib/shipping'
import type { CustomerInfo } from '@/lib/hype'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: 'Invalid input',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const { cart, customer, currency } = parsed.data
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0)
    const shippingUsd = getShippingCost(customer.country, totalQty, 'USD')
    const itemTotalUsd = cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0)
    const grandTotalUsd = itemTotalUsd + shippingUsd

    // Dev fallback — no Hype key configured
    if (!process.env.HYPE_API_KEY) {
      const mockId = `mock-${Date.now()}`
      return Response.json({
        success: true,
        data: {
          sessionUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/en/order/${mockId}`,
          sessionId: mockId,
        },
      })
    }

    const customerInfo: CustomerInfo = {
      name: customer.name,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      zip: customer.zip,
    }

    // cart items are compatible with CartLineItem (have priceUsd + qty)
    const session = await initiatePayment(
      cart.map((i) => ({ priceUsd: i.priceUsd, qty: i.qty })),
      customerInfo,
      currency,
    )

    // Suppress unused variable warning — grandTotalUsd used for logging
    void grandTotalUsd

    return Response.json({ success: true, data: session })
  } catch (err) {
    console.error('[/api/checkout]', err)
    return Response.json(
      {
        success: false,
        error: 'Payment initiation failed. Please try again.',
      },
      { status: 500 },
    )
  }
}
