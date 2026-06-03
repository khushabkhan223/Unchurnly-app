import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { verifySessionToken } from '@/lib/session'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'

const DEFAULTS = {
  pause_enabled: true,
  discount_enabled: true,
  discount_percent: 20,
  downgrade_enabled: false,
  stripe_coupon_id: null,
}

type ConfigRow = {
  pause_enabled: boolean
  discount_enabled: boolean
  discount_percent: number
  downgrade_enabled: boolean
  stripe_coupon_id: string | null
}

type ConnectionRow = { encrypted_access_token: string }

async function getSession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  return cookie ? await verifySessionToken(cookie) : null
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('cancel_flow_configs')
    .select('pause_enabled, discount_enabled, discount_percent, downgrade_enabled, stripe_coupon_id')
    .eq('user_id', session.userId)
    .maybeSingle()

  return NextResponse.json(data ? (data as ConfigRow) : DEFAULTS)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { pause_enabled, discount_enabled, discount_percent, downgrade_enabled } =
    body !== null && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {}

  if (typeof discount_percent !== 'number' || discount_percent < 1 || discount_percent > 100) {
    return NextResponse.json({ error: 'discount_percent must be between 1 and 100' }, { status: 400 })
  }

  const supabase = createServerClient()
  let stripeCouponId: string | null = null

  if (discount_enabled) {
    const { data: connectionData } = await supabase
      .from('stripe_connections')
      .select('encrypted_access_token')
      .eq('user_id', session.userId)
      .maybeSingle()

    if (!connectionData) {
      return NextResponse.json({ error: 'Stripe not connected' }, { status: 400 })
    }

    try {
      const stripeKey = decryptToken((connectionData as ConnectionRow).encrypted_access_token)
      const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })
      const coupon = await founderStripe.coupons.create({
        percent_off: discount_percent,
        duration: 'repeating',
        duration_in_months: 3,
        name: 'Unchurnly Retention Discount',
      })
      stripeCouponId = coupon.id
    } catch {
      return NextResponse.json({ error: 'Failed to create Stripe coupon' }, { status: 500 })
    }
  }

  const { error } = await supabase.from('cancel_flow_configs').upsert(
    {
      user_id: session.userId,
      pause_enabled: Boolean(pause_enabled),
      discount_enabled: Boolean(discount_enabled),
      discount_percent,
      downgrade_enabled: Boolean(downgrade_enabled),
      stripe_coupon_id: stripeCouponId,
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
