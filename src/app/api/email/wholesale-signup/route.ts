import { createServiceClient } from '@/lib/supabase-server'
import { sendWholesaleWelcome, sendOwnerB2BAlert } from '@/lib/resend'
import type { WholesaleAccount } from '@/lib/types'

export async function POST(request: Request): Promise<Response> {
  let body: { accountId?: string }
  try {
    body = (await request.json()) as { accountId?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { accountId } = body
  if (!accountId) {
    return Response.json({ error: 'accountId required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: row, error } = await supabase
    .from('wholesale_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (error || !row) {
    console.error('[wholesale-signup] Account not found:', accountId, error)
    return Response.json({ error: 'Account not found' }, { status: 404 })
  }

  const account: WholesaleAccount = {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    business_name: String(row.business_name ?? ''),
    contact_name: String(row.contact_name ?? ''),
    email: row.email ? String(row.email) : undefined,
    phone: String(row.phone ?? ''),
    username: String(row.username ?? ''),
    store_name: String(row.store_name ?? ''),
    address: String(row.address ?? ''),
    city: String(row.city ?? ''),
    country: String(row.country ?? ''),
    zip: String(row.zip ?? ''),
    status: (row.status as WholesaleAccount['status']) ?? 'active',
    approved_at: row.approved_at ? String(row.approved_at) : undefined,
    created_at: String(row.created_at ?? ''),
  }

  // Send both emails in parallel
  const [welcomeResult, alertResult] = await Promise.allSettled([
    sendWholesaleWelcome(account),
    sendOwnerB2BAlert(account),
  ])

  if (welcomeResult.status === 'rejected') {
    console.error('[wholesale-signup] sendWholesaleWelcome failed:', welcomeResult.reason)
  }
  if (alertResult.status === 'rejected') {
    console.error('[wholesale-signup] sendOwnerB2BAlert failed:', alertResult.reason)
  }

  return Response.json({ ok: true })
}
