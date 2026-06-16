import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { decryptToken } from '@/lib/crypto'
import { logger } from '@/lib/logger'

type ConnectionRow = {
  encrypted_access_token: string
}

export async function POST(request: Request) {
  try {
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
    logger.info('set-default: connection found', { userId })

    const stripeKey = decryptToken(connection.encrypted_access_token)
    const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

    const setupIntent = await founderStripe.setupIntents.retrieve(setupIntentId)
    logger.info('set-default: setup intent retrieved', {
      status: setupIntent.status,
      hasPaymentMethod: !!setupIntent.payment_method
    })

    const rawPm = setupIntent.payment_method
    const paymentMethodId = typeof rawPm === 'string' ? rawPm : rawPm?.id ?? null
    logger.info('set-default: payment method extracted', {
      hasId: !!paymentMethodId
    })

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'No payment method found on setup intent' },
        { status: 400 }
      )
    }

    try {
      await founderStripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
      logger.info('set-default: customer updated successfully')
    } catch (updateErr) {
      logger.error('set-default: customers.update failed', {
        message: updateErr instanceof Error ? updateErr.message : String(updateErr)
      })
      console.error('customers.update error:', updateErr)
      return NextResponse.json({
        error: 'Failed to set default payment method: ' +
          (updateErr instanceof Error ? updateErr.message : String(updateErr))
      }, { status: 400 })
    }

    // Retry any open/incomplete invoices for this customer
    try {
      logger.info('set-default: attempting invoice retry', { customerId })
      const openInvoices = await founderStripe.invoices.list({
        customer: customerId,
        status: 'open',
        limit: 5
      })
      logger.info('set-default: invoices found', {
        count: openInvoices.data.length,
        statuses: openInvoices.data.map(i => i.status)
      })

      for (const invoice of openInvoices.data) {
        await founderStripe.invoices.pay(invoice.id, {
          payment_method: paymentMethodId
        })
      }
    } catch (err) {
      // Log but don't fail — the card was still saved successfully
      logger.warn('Invoice retry after card update failed', {
        reason: err instanceof Error ? err.message : 'unknown'
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('set-default catastrophic error', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.slice(0, 500) : undefined
    })
    console.error('set-default error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    )
  }
}
