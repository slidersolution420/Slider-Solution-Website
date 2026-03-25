import { NextResponse } from 'next/server'
import { wholesaleSignupSchema } from '@/lib/schemas'
import { createServiceClient } from '@/lib/supabase-server'
import { sendWholesaleWelcome } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const parsed = wholesaleSignupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      email,
      password,
      business_name,
      contact_name,
      phone,
      username,
      store_name,
      address,
      city,
      country,
      zip,
    } = parsed.data

    const supabase = createServiceClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create wholesale account
    const { error: accountError } = await supabase.from('wholesale_accounts').insert({
      user_id: authData.user.id,
      business_name,
      contact_name,
      phone,
      username,
      store_name,
      address,
      city,
      country,
      zip,
      status: 'pending',
    })

    if (accountError) {
      // Clean up auth user if account creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Send welcome emails (non-blocking)
    void sendWholesaleWelcome(business_name, contact_name, email).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Wholesale signup error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
