import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { verifySessionToken } from '@/lib/session'
import { encryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { calculateMrr } from '@/lib/mrr'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = cookie ? await verifySessionToken(cookie) : null

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let restrictedKey: unknown
  let publishableKey: unknown
  try {
    const body = await request.json()
    restrictedKey = body.restrictedKey
    publishableKey = body.publishableKey
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof restrictedKey !== 'string' || !/^rk_(test|live)_/.test(restrictedKey)) {
    return NextResponse.json({ error: 'Invalid key format' }, { status: 400 })
  }

  if (typeof publishableKey !== 'string' || !/^pk_(test|live)_/.test(publishableKey)) {
    return NextResponse.json({ error: 'Publishable key must start with pk_test_ or pk_live_' }, { status: 400 })
  }

  const restrictedEnv = restrictedKey.startsWith('rk_test_') ? 'test' : 'live'
  const publishableEnv = publishableKey.startsWith('pk_test_') ? 'test' : 'live'
  if (restrictedEnv !== publishableEnv) {
    return NextResponse.json({ error: 'Restricted and publishable keys must both be test or both be live' }, { status: 400 })
  }

  const founderStripe = new Stripe(restrictedKey, { apiVersion: '2026-04-22.dahlia' })

  try {
    await founderStripe.customers.list({ limit: 1 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid key or insufficient permissions' },
      { status: 400 }
    )
  }

  const accountId = restrictedKey.startsWith('rk_live_') ? 'direct_live' : 'direct_test'

  let webhookConfigured = false
  let webhookFields: {
    encrypted_webhook_secret: string | null
    webhook_endpoint_id: string | null
    webhook_configured_at: string | null
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    logger.warn('NEXT_PUBLIC_APP_URL not set — skipping webhook registration')
    webhookFields = {
      encrypted_webhook_secret: null,
      webhook_endpoint_id: null,
      webhook_configured_at: null,
    }
  } else {
    try {
      const webhookEndpoint = await founderStripe.webhookEndpoints.create({
        url: `${appUrl}/api/webhooks/stripe?uid=${session.userId}`,
        enabled_events: [
          'invoice.payment_failed',
          'invoice.payment_succeeded',
          'customer.subscription.deleted',
          'customer.subscription.created',
          'customer.subscription.updated',
        ],
        description: 'Unchurnly dunning automation',
      })
      if (!webhookEndpoint.secret) {
        throw new Error('Stripe webhook secret missing from creation response')
      }
      webhookFields = {
        encrypted_webhook_secret: encryptToken(webhookEndpoint.secret),
        webhook_endpoint_id: webhookEndpoint.id,
        webhook_configured_at: new Date().toISOString(),
      }
      webhookConfigured = true
    } catch (err) {
      logger.warn('Webhook endpoint creation failed', {
        reason: err instanceof Error ? err.message : 'unknown',
      })
      webhookFields = {
        encrypted_webhook_secret: null,
        webhook_endpoint_id: null,
        webhook_configured_at: null,
      }
    }
  }

  const encryptedToken = encryptToken(restrictedKey)
  const supabase = createServerClient()

  const { error: dbError } = await supabase.from('stripe_connections').upsert(
    {
      user_id: session.userId,
      encrypted_access_token: encryptedToken,
      stripe_account_id: accountId,
      stripe_publishable_key: publishableKey as string,
      connected_at: new Date().toISOString(),
      ...webhookFields,
    },
    { onConflict: 'user_id' }
  )

  if (dbError) {
    return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
  }

  // Seed MRR in the background — non-critical, never blocks the response
  calculateMrr(encryptedToken, session.userId).then(async (mrr) => {
    if (mrr > 0) {
      await createServerClient()
        .from('stripe_connections')
        .update({ stripe_baseline_mrr: mrr })
        .eq('user_id', session.userId)
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, webhookConfigured })
}
