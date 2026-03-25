/**
 * Server-side auth functions — only import in Server Components or Route Handlers.
 * Uses next/headers via supabase-server.ts.
 */
import { createClient } from './supabase-server'

export async function checkWholesaleSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: account } = await supabase
    .from('wholesale_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return account
}
