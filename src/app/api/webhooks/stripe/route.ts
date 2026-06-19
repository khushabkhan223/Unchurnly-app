import Stripe from 'stripe'
import { type SupabaseClient } from '@supabase/supabase-js'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { generateAndSendDunning } from '@/lib/dunning-ai'
import { signCardUpdateToken } from '@/lib/session'

type StripeConnectionRow = {
  encrypted_webhook_secret: string | null
  encrypted_access_token: string
  stripe_baseline_mrr: number
}

type IdRow = { id: string }
type MrrRow = { stripe_baseline_mrr: number }

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
    .select('encrypted_webhook_secret, encrypted_access_token, stripe_baseline_mrr')
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
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabase, uid, event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, uid, event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, uid, event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, uid, event)
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

// Normalizes a list of subscription items to a total monthly dollar amount
function subItemsToMonthlyDollars(
  items: Array<{ price?: { unit_amount?: number | null; recurring?: { interval?: string } | null } | null; quantity?: number | null }>
): number {
  let totalCents = 0
  for (const item of items) {
    const unitAmount = item.price?.unit_amount
    if (!unitAmount) continue
    const qty = item.quantity ?? 1
    const interval = item.price?.recurring?.interval
    let monthly = unitAmount * qty
    if (interval === 'year') monthly = monthly / 12
    else if (interval === 'week') monthly = monthly * 4.33
    else if (interval === 'day') monthly = monthly * 30
    totalCents += monthly
  }
  return totalCents / 100
}

async function getCurrentMrr(supabase: SupabaseClient, uid: string): Promise<number> {
  const { data } = await supabase
    .from('stripe_connections')
    .select('stripe_baseline_mrr')
    .eq('user_id', uid)
    .maybeSingle()
  return data ? (data as MrrRow).stripe_baseline_mrr : 0
}

async function updateMrr(supabase: SupabaseClient, uid: string, mrr: number): Promise<void> {
  await supabase
    .from('stripe_connections')
    .update({ stripe_baseline_mrr: Math.max(0, mrr) })
    .eq('user_id', uid)
}

async function handleInvoicePaymentSucceeded(
  supabase: SupabaseClient,
  uid: string,
  invoice: Stripe.Invoice
): Promise<void> {
  const rawCustomer = invoice.customer
  if (!rawCustomer) return
  const customerId = typeof rawCustomer === 'string' ? rawCustomer : rawCustomer.id

  const { data: customer } = await supabase
    .from('monitored_customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .eq('user_id', uid)
    .maybeSingle()

  if (!customer) return

  const monitoredCustomerId = (customer as IdRow).id

  const { data: activeSeq } = await supabase
    .from('dunning_sequences')
    .select('id')
    .eq('monitored_customer_id', monitoredCustomerId)
    .eq('status', 'active')
    .maybeSingle()

  if (!activeSeq) return

  await supabase
    .from('dunning_sequences')
    .update({
      status: 'recovered',
      recovered_at: new Date().toISOString(),
      recovered_mrr_cents: invoice.amount_paid,
    })
    .eq('id', (activeSeq as IdRow).id)

  await supabase
    .from('users')
    .update({
      first_recovery_at: new Date().toISOString(),
      grace_period_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', uid)
    .is('first_recovery_at', null)

  logger.info('Dunning sequence marked recovered', {
    sequenceId: (activeSeq as IdRow).id,
    recovered_mrr_cents: invoice.amount_paid,
  })
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

  // Extract customer details directly from invoice payload
  const invoiceCustomerEmail = typeof invoice.customer_email === 'string'
    ? invoice.customer_email : null
  const invoiceCustomerName = typeof invoice.customer_name === 'string'
    ? invoice.customer_name : null
  const invoicePlanName = invoice.lines?.data?.[0]?.description ?? null
  const invoiceMrrAmount = invoice.amount_due ?? null

  // Update monitored_customer with extracted details
  await supabase
    .from('monitored_customers')
    .update({
      customer_email: invoiceCustomerEmail,
      customer_name: invoiceCustomerName,
      plan_name: invoicePlanName,
      mrr_amount: invoiceMrrAmount,
    })
    .eq('id', monitoredCustomerId)

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

  const customerEmail = invoice.customer_email
  if (customerEmail) {
    const planName = invoice.lines.data[0]?.description ?? 'your subscription'
    const amountDue = invoice.amount_due
    const attemptCount = invoice.attempt_count ?? 1
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    try {
      const token = await signCardUpdateToken(customerId, uid)
      const cardUpdateUrl = `${appUrl}/card-update?token=${token}`
      await generateAndSendDunning(uid, planName, amountDue, attemptCount, customerEmail, cardUpdateUrl)
    } catch (err) {
      logger.error('generateAndSendDunning failed', {
        reason: err instanceof Error ? err.message : 'unknown',
      })
    }
    await supabase
      .from('dunning_emails')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('dunning_sequence_id', sequenceId)
      .eq('day_number', 1)
  }
}

async function handleSubscriptionCreated(
  supabase: SupabaseClient,
  uid: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const delta = subItemsToMonthlyDollars(subscription.items.data)
  if (delta === 0) return
  const current = await getCurrentMrr(supabase, uid)
  await updateMrr(supabase, uid, current + delta)
}

async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  uid: string,
  event: Stripe.Event
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription
  const prevAttrs = event.data.previous_attributes as Record<string, unknown> | undefined

  // Only adjust MRR if items (prices) actually changed
  if (!prevAttrs?.items) return

  const newValue = subItemsToMonthlyDollars(sub.items.data)

  // Extract old items from previous_attributes — narrow carefully
  type RawItem = {
    price?: { unit_amount?: number | null; recurring?: { interval?: string } | null } | null
    quantity?: number | null
  }
  type RawItemsList = { data?: RawItem[] }
  const oldItems = (prevAttrs.items as RawItemsList | undefined)?.data ?? []
  const oldValue = subItemsToMonthlyDollars(oldItems)

  const delta = newValue - oldValue
  if (delta === 0) return

  const current = await getCurrentMrr(supabase, uid)
  await updateMrr(supabase, uid, current + delta)
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

  // Subtract this subscription's value from MRR baseline
  const delta = subItemsToMonthlyDollars(subscription.items.data)
  if (delta > 0) {
    const current = await getCurrentMrr(supabase, uid)
    await updateMrr(supabase, uid, current - delta)
  }
}
