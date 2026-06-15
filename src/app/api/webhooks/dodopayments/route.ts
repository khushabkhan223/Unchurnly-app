import { Webhook } from 'svix'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

type DodoCustomer = {
  email?: string
  customer_id?: string
}

type DodoSubscriptionData = {
  subscription_id?: string
  customer?: DodoCustomer
  next_billing_date?: string
}

type DodoWebhookPayload = {
  type: string
  data: DodoSubscriptionData
}

type UserRow = { id: string }

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text()

  const secret = process.env.DODO_WEBHOOK_SECRET
  if (!secret) {
    logger.error('DODO_WEBHOOK_SECRET not configured')
    return new Response('Server Error', { status: 500 })
  }

  const svixId = request.headers.get('webhook-id')
  const svixTimestamp = request.headers.get('webhook-timestamp')
  const svixSignature = request.headers.get('webhook-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Bad Request', { status: 400 })
  }

  let payload: DodoWebhookPayload
  try {
    const wh = new Webhook(secret)
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as DodoWebhookPayload
  } catch (err) {
    logger.error('Dodo webhook signature verification failed', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return new Response('Bad Request', { status: 400 })
  }

  const supabase = createServerClient()
  const { type, data } = payload

  try {
    const customerEmail = data?.customer?.email
    if (!customerEmail) {
      return new Response(null, { status: 200 })
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle()

    if (!userRow) {
      return new Response(null, { status: 200 })
    }

    const userId = (userRow as UserRow).id
    const now = new Date().toISOString()

    switch (type) {
      case 'subscription.active':
      case 'subscription.renewed':
        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscribed_at: now,
            dodo_subscription_id: data.subscription_id ?? null,
            dodo_customer_id: data.customer?.customer_id ?? null,
            grace_period_ends_at: null,
          })
          .eq('id', userId)
        break

      case 'subscription.cancelled':
        await supabase
          .from('users')
          .update({
            subscription_status: 'cancelled',
            grace_period_ends_at: data.next_billing_date ?? null,
          })
          .eq('id', userId)
        break

      case 'subscription.on_hold':
        await supabase.from('users').update({ subscription_status: 'on_hold' }).eq('id', userId)
        break

      case 'subscription.expired':
        await supabase.from('users').update({ subscription_status: 'expired' }).eq('id', userId)
        break

      default:
        break
    }

    logger.info('Dodo webhook processed', { type, userId })
  } catch (err) {
    logger.error('Dodo webhook processing failed', {
      type,
      reason: err instanceof Error ? err.message : 'unknown',
    })
  }

  return new Response(null, { status: 200 })
}
