/**
 * lib/auth.ts
 * Wholesale auth helpers — all Supabase auth calls for B2B portal live here.
 */

import { createClient } from './supabase'
import type { WholesaleAccount } from './types'

export async function signUpWholesale(
  email: string,
  password: string,
  profile: Omit<
    WholesaleAccount,
    'id' | 'user_id' | 'status' | 'approved_at' | 'created_at'
  >,
): Promise<
  | { account: WholesaleAccount; error: null }
  | { account: null; error: string }
> {
  const supabase = createClient()

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { account: null, error: authError?.message ?? 'Signup failed' }
  }

  // 2. Insert wholesale_accounts row
  const { data: account, error: insertError } = await supabase
    .from('wholesale_accounts')
    .insert({
      user_id: authData.user.id,
      business_name: profile.business_name,
      contact_name: profile.contact_name,
      phone: profile.phone,
      email: email,
      username: profile.username,
      store_name: profile.store_name,
      address: profile.address,
      city: profile.city,
      country: profile.country,
      zip: profile.zip,
      status: 'active',
      approved_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError || !account) {
    return {
      account: null,
      error: insertError?.message ?? 'Failed to create account',
    }
  }

  return { account: account as WholesaleAccount, error: null }
}

export async function signInWholesale(
  email: string,
  password: string,
): Promise<
  | { account: WholesaleAccount; error: null }
  | { account: null; error: string }
> {
  const supabase = createClient()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { account: null, error: 'Invalid email or password' }
  }

  // Check account status
  const { data: account } = await supabase
    .from('wholesale_accounts')
    .select('*')
    .eq('email', email)
    .single()

  if (!account) {
    await supabase.auth.signOut()
    return { account: null, error: 'Account not found' }
  }

  if ((account as WholesaleAccount).status === 'blocked') {
    await supabase.auth.signOut()
    return {
      account: null,
      error:
        'Your account has been suspended. Contact support@slidersolution.com',
    }
  }

  return { account: account as WholesaleAccount, error: null }
}

export async function signOutWholesale(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

/**
 * Check if the current Supabase session belongs to an active wholesale user.
 * Call on app load to restore the wholesale session.
 */
export async function checkWholesaleSession(): Promise<WholesaleAccount | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: account } = await supabase
    .from('wholesale_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!account || (account as WholesaleAccount).status === 'blocked')
    return null

  return account as WholesaleAccount
}
