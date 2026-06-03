import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { decryptToken } from '@/lib/crypto'

type ConnectionRow = {
  encrypted_access_token: string
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { setupIntentId, customerId, userId } =
    body !== null && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {}

  if (
    typeof setupIntentId !== 'string' || !setupIntentId ||
    typeof customerId !== 'string' || !customerId ||
    typeof userId !== 'string' || !userId
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', userId)
    .maybeSingle()

  if (!connectionData) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 400 })
  }

  const connection = connectionData as ConnectionRow

  try {
    const stripeKey = decryptToken(connection.encrypted_access_token)
    const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

    const setupIntent = await founderStripe.setupIntents.retrieve(setupIntentId)
    const paymentMethodId = setupIntent.payment_method

    if (!paymentMethodId || typeof paymentMethodId !== 'string') {
      return NextResponse.json(
        { error: 'No payment method on setup intent' },
        { status: 400 }
      )
    }

    await founderStripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
