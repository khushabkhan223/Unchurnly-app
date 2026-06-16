import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

type UserRow = { dodo_customer_id: string | null }

export async function POST() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = cookie ? await verifySessionToken(cookie) : null

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data, error: dbError } = await supabase
    .from('users')
    .select('dodo_customer_id')
    .eq('id', session.userId)
    .maybeSingle()

  if (dbError) {
    logger.error('billing/portal: db error fetching dodo_customer_id', { error: dbError.message })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const row = data as UserRow | null
  const dodoCustomerId = row?.dodo_customer_id ?? null

  if (!dodoCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const dodoRes = await fetch(
    `https://api.dodopayments.com/customers/${dodoCustomerId}/customer-portal/session`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!dodoRes.ok) {
    logger.error('billing/portal: Dodo API error', { status: dodoRes.status, customerId: dodoCustomerId })
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 502 })
  }

  const dodoData = (await dodoRes.json()) as Record<string, unknown>

  if (typeof dodoData.link !== 'string') {
    logger.error('billing/portal: unexpected Dodo response shape', { dodoData })
    return NextResponse.json({ error: 'Invalid portal response' }, { status: 502 })
  }

  return NextResponse.json({ url: dodoData.link })
}
