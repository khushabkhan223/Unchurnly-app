import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyHmac } from '@/lib/hmac'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { posthogServer } from '@/lib/posthog-server'

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

  try {
    const stripeCustomer = await founderStripe.customers.retrieve(customerId)
    if (stripeCustomer && !stripeCustomer.deleted) {
      const subscriptions = await founderStripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      })

      let mrrAmount: number | null = null
      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0]
        let cents = 0
        for (const item of sub.items.data) {
          const price = item.price
          if (!price?.unit_amount) continue
          const qty = item.quantity ?? 1
          const interval = price.recurring?.interval
          let monthly = price.unit_amount * qty
          if (interval === 'year') monthly = monthly / 12
          else if (interval === 'week') monthly = monthly * 4.33
          else if (interval === 'day') monthly = monthly * 30
          cents += monthly
        }
        mrrAmount = Math.round(cents)
      }

      await supabase
        .from('monitored_customers')
        .update({
          customer_email: stripeCustomer.email,
          customer_name: stripeCustomer.name,
          mrr_amount: mrrAmount,
        })
        .eq('stripe_customer_id', customerId)
        .eq('user_id', userId)
    }
  } catch (err) {
    logger.warn('Failed to fetch customer details for cancel flow', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    // Continue — cancel flow action must not be blocked by this
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

      const { data: pauseFirstCheck } = await supabase
        .from('users')
        .select('first_recovery_at')
        .eq('id', userId)
        .is('first_recovery_at', null)
        .maybeSingle()

      await supabase
        .from('users')
        .update({
          first_recovery_at: new Date().toISOString(),
          grace_period_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', userId)
        .is('first_recovery_at', null)

      if (pauseFirstCheck) {
        posthogServer.capture({ distinctId: userId, event: 'first_recovery', properties: { type: 'cancel_flow' } })
      }

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

      const { data: discountFirstCheck } = await supabase
        .from('users')
        .select('first_recovery_at')
        .eq('id', userId)
        .is('first_recovery_at', null)
        .maybeSingle()

      await supabase
        .from('users')
        .update({
          first_recovery_at: new Date().toISOString(),
          grace_period_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', userId)
        .is('first_recovery_at', null)

      if (discountFirstCheck) {
        posthogServer.capture({ distinctId: userId, event: 'first_recovery', properties: { type: 'cancel_flow' } })
      }

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
