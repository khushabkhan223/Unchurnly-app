import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
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

type AppKeyRow = { user_id: string }
type ConnectionRow = { encrypted_access_token: string }
type OtpRow = { id: string; code: string }

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { appKey, email, code } =
    body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  if (
    typeof appKey !== 'string' || !appKey ||
    typeof email !== 'string' || !email ||
    typeof code !== 'string' || !code
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!checkRateLimit(`${appKey}:${email}`)) {
    return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })
  }

  const supabase = createServerClient()

  const { data: otpData } = await supabase
    .from('cancel_otps')
    .select('id, code')
    .eq('app_key', appKey)
    .eq('email', email)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!otpData) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 })
  }

  const otp = otpData as OtpRow

  if (otp.code !== code) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 })
  }

  await supabase.from('cancel_otps').update({ used: true }).eq('id', otp.id)

  const { data: keyData } = await supabase
    .from('founder_app_keys')
    .select('user_id')
    .eq('app_key', appKey)
    .maybeSingle()

  if (!keyData) {
    return NextResponse.json({ error: 'Invalid link.' }, { status: 404 })
  }

  const { user_id: userId } = keyData as AppKeyRow

  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', userId)
    .maybeSingle()

  if (!connectionData) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 400 })
  }

  const stripeKey = decryptToken((connectionData as ConnectionRow).encrypted_access_token)
  const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  try {
    const customers = await founderStripe.customers.list({ email, limit: 1 })
    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 })
    }

    const customer = customers.data[0]
    const customerId = customer.id
    const customerName = (customer as Stripe.Customer).name ?? customer.email ?? 'there'

    const [activeSubs, trialingSubs] = await Promise.all([
      founderStripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 }),
      founderStripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 1 }),
    ])

    const sub = activeSubs.data[0] ?? trialingSubs.data[0]
    if (!sub) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 })
    }

    const price = sub.items.data[0]?.price
    const planName = price?.nickname ?? 'your plan'
    const amount = price?.unit_amount ?? 0
    const currency = price?.currency ?? 'usd'

    return NextResponse.json({
      success: true,
      customerId,
      subscriptionId: sub.id,
      customerName,
      planName,
      amount,
      currency,
    })
  } catch (err) {
    logger.error('Failed to load Stripe data in verify-otp', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json({ error: 'Failed to load subscription details.' }, { status: 500 })
  }
}
