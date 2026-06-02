import Stripe from 'stripe'
import { type SupabaseClient } from '@supabase/supabase-js'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

type StripeConnectionRow = {
  encrypted_webhook_secret: string | null
}

type IdRow = { id: string }

export async function POST(request: Request) {
  // Raw body MUST come before any other read operation
  const rawBody = Buffer.from(await request.arrayBuffer())

  const uid = new URL(request.url).searchParams.get('uid')
  if (!uid) {
    return new Response('Bad Request', { status: 400 })
  }

  const supabase = createServerClient()

  const { data: connectionData, error: connectionError } = await supabase
    .from('stripe_connections')
    .select('encrypted_webhook_secret')
    .eq('user_id', uid)
    .maybeSingle()

  if (connectionError || !connectionData) {
    return new Response('Bad Request', { status: 400 })
  }

  const connection = connectionData as StripeConnectionRow

  if (!connection.encrypted_webhook_secret) {
    return new Response('Bad Request', { status: 400 })
  }

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return new Response('Bad Request', { status: 400 })
  }

  const platformKey = process.env.STRIPE_SECRET_KEY
  if (!platformKey) {
    logger.error('STRIPE_SECRET_KEY not configured')
    return new Response('Server Error', { status: 500 })
  }

  let event: Stripe.Event
  try {
    const secret = decryptToken(connection.encrypted_webhook_secret)
    const stripeHelper = new Stripe(platformKey, { apiVersion: '2026-04-22.dahlia' })
    event = stripeHelper.webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    logger.warn('Webhook signature verification failed', { uid })
    return new Response('Bad Request', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, uid, event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, uid, event.data.object as Stripe.Subscription)
        break
    }
  } catch (err) {
    logger.error('Webhook event processing failed', {
      type: event.type,
      reason: err instanceof Error ? err.message : 'unknown',
    })
  }

  return new Response(null, { status: 200 })
}

async function handleInvoicePaymentFailed(
  supabase: SupabaseClient,
  uid: string,
  invoice: Stripe.Invoice
): Promise<void> {
  const rawCustomer = invoice.customer
  if (!rawCustomer) return
  const customerId = typeof rawCustomer === 'string' ? rawCustomer : rawCustomer.id

  const rawSub = invoice.parent?.subscription_details?.subscription
  const subscriptionId = !rawSub
    ? null
    : typeof rawSub === 'string'
      ? rawSub
      : rawSub.id

  const { data: existing } = await supabase
    .from('monitored_customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .eq('user_id', uid)
    .maybeSingle()

  let monitoredCustomerId: string

  if (existing) {
    monitoredCustomerId = (existing as IdRow).id
  } else {
    const { data: created, error: insertError } = await supabase
      .from('monitored_customers')
      .insert({
        user_id: uid,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
      })
      .select('id')
      .single()

    if (insertError || !created) {
      logger.error('Failed to create monitored_customer', {
        reason: insertError?.message ?? 'no data returned',
      })
      return
    }
    monitoredCustomerId = (created as IdRow).id
  }

  const { data: activeSeq } = await supabase
    .from('dunning_sequences')
    .select('id')
    .eq('monitored_customer_id', monitoredCustomerId)
    .eq('status', 'active')
    .maybeSingle()

  if (activeSeq) return

  const { data: sequence, error: seqError } = await supabase
    .from('dunning_sequences')
    .insert({
      user_id: uid,
      monitored_customer_id: monitoredCustomerId,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (seqError || !sequence) {
    logger.error('Failed to create dunning_sequence', {
      reason: seqError?.message ?? 'no data returned',
    })
    return
  }

  const sequenceId = (sequence as IdRow).id

  await supabase.from('dunning_emails').insert([
    { dunning_sequence_id: sequenceId, day_number: 1, status: 'pending' },
    { dunning_sequence_id: sequenceId, day_number: 3, status: 'pending' },
    { dunning_sequence_id: sequenceId, day_number: 7, status: 'pending' },
    { dunning_sequence_id: sequenceId, day_number: 14, status: 'pending' },
  ])
}

async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  uid: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const rawCustomer = subscription.customer
  const customerId = typeof rawCustomer === 'string' ? rawCustomer : rawCustomer.id

  const { data: customer } = await supabase
    .from('monitored_customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .eq('user_id', uid)
    .maybeSingle()

  if (!customer) return

  const monitoredCustomerId = (customer as IdRow).id

  await supabase
    .from('monitored_customers')
    .update({ status: 'cancelled' })
    .eq('id', monitoredCustomerId)

  await supabase
    .from('dunning_sequences')
    .update({ status: 'cancelled' })
    .eq('monitored_customer_id', monitoredCustomerId)
    .eq('status', 'active')
}
