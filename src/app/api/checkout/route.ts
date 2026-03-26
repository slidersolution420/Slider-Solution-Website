import { NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/schemas'
import { initiatePayment } from '@/lib/hype'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, phone, address, city, country, zip, currency, items } = parsed.data

    const session = await initiatePayment({
      name,
      email,
      phone,
      address,
      city,
      country,
      zip,
      items,
      currency,
    })

    return NextResponse.json({ payment_url: session.payment_url, payment_id: session.payment_id })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}
