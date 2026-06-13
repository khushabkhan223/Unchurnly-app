import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyHmac } from '@/lib/hmac'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

type AppKeyRow = { user_id: string; encrypted_app_secret: string }
type ConnectionRow = { encrypted_access_token: string }
type ConfigRow = { discount_percent: number; stripe_coupon_id: string | null }
type IdRow = { id: string }

const VALID_ACTIONS = ['pause', 'discount', 'cancel'] as const
type Action = (typeof VALID_ACTIONS)[number]

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
type RateLimitEntry = { count: number; windowStart: number }
const rateLimitMap = new Map<string, RateLimitEntry>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  for (const [k, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(k)
  }
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { appKey, customerId, authHash, subscriptionId, action } =
    body !== null && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {}

  if (
    typeof appKey !== 'string' || !appKey ||
    typeof customerId !== 'string' || !customerId ||
    typeof subscriptionId !== 'string' || !subscriptionId ||
    typeof action !== 'string' || !VALID_ACTIONS.includes(action as Action)
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!checkRateLimit(appKey)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = createServerClient()

  const { data: keyData } = await supabase
    .from('founder_app_keys')
    .select('user_id, encrypted_app_secret')
    .eq('app_key', appKey)
    .maybeSingle()

  if (!keyData) {
    return NextResponse.json({ error: 'Invalid app key' }, { status: 400 })
  }

  const keyRow = keyData as AppKeyRow
  const userId = keyRow.user_id
  const appSecret = decryptToken(keyRow.encrypted_app_secret)

  const { data: hmacConfigData } = await supabase
    .from('cancel_flow_configs')
    .select('require_hmac')
    .eq('user_id', userId)
    .maybeSingle()

  const requireHmac = (hmacConfigData as { require_hmac: boolean } | null)?.require_hmac ?? false

  if (requireHmac) {
    if (typeof authHash !== 'string' || !authHash || !verifyHmac(customerId, authHash, appSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', userId)
    .maybeSingle()

  if (!connectionData) {
    return NextResponse.json({ error: 'Stripe not connected' }, { status: 400 })
  }

  const stripeKey = decryptToken((connectionData as ConnectionRow).encrypted_access_token)
  const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  // Find or create monitored_customer
  const { data: existingCustomer } = await supabase
    .from('monitored_customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .eq('user_id', userId)
    .maybeSingle()

  let monitoredCustomerId: string

  if (existingCustomer) {
    monitoredCustomerId = (existingCustomer as IdRow).id
  } else {
    const { data: newCustomer, error: insertError } = await supabase
      .from('monitored_customers')
      .insert({ user_id: userId, stripe_customer_id: customerId, status: 'active' })
      .select('id')
      .single()

    if (insertError || !newCustomer) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    monitoredCustomerId = (newCustomer as IdRow).id
  }

  if (action === 'discount' || action === 'pause') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentOffer } = await supabase
      .from('cancellation_events')
      .select('id')
      .eq('monitored_customer_id', monitoredCustomerId)
      .in('outcome', ['discounted', 'paused'])
      .gte('created_at', thirtyDaysAgo)
      .limit(1)
      .maybeSingle()
    if (recentOffer) {
      return NextResponse.json(
        { error: 'An offer has already been applied to this account in the last 30 days.' },
        { status: 400 },
      )
    }
  }

  try {
    if (action === 'pause') {
      const resumesAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      await founderStripe.subscriptions.update(subscriptionId, {
        pause_collection: { behavior: 'void', resumes_at: resumesAt },
      })

      await supabase.from('cancellation_events').insert({
        user_id: userId,
        monitored_customer_id: monitoredCustomerId,
        outcome: 'paused',
      })

      return NextResponse.json({
        success: true,
        message: 'Your subscription has been paused for 1 month.',
      })
    }

    if (action === 'discount') {
      const { data: configData } = await supabase
        .from('cancel_flow_configs')
        .select('discount_percent, stripe_coupon_id')
        .eq('user_id', userId)
        .maybeSingle()

      const config = configData as ConfigRow | null

      if (!config?.stripe_coupon_id) {
        return NextResponse.json({ error: 'Discount not configured.' }, { status: 400 })
      }

      await founderStripe.subscriptions.update(subscriptionId, {
        discounts: [{ coupon: config.stripe_coupon_id }],
      })

      await supabase.from('cancellation_events').insert({
        user_id: userId,
        monitored_customer_id: monitoredCustomerId,
        outcome: 'discounted',
      })

      return NextResponse.json({
        success: true,
        message: `Your ${config.discount_percent}% discount has been applied for 3 months.`,
      })
    }

    if (action === 'cancel') {
      await founderStripe.subscriptions.cancel(subscriptionId)

      await supabase.from('cancellation_events').insert({
        user_id: userId,
        monitored_customer_id: monitoredCustomerId,
        outcome: 'cancelled',
      })

      return NextResponse.json({
        success: true,
        message: 'Your subscription has been cancelled.',
      })
    }
  } catch (err) {
    logger.error('Cancel flow action failed', {
      action,
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
