import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import { decryptToken } from '@/lib/crypto'
import { logger } from '@/lib/logger'

type ConnectionRow = { encrypted_access_token: string; webhook_endpoint_id: string | null }

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()

  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token, webhook_endpoint_id')
    .eq('user_id', session.userId)
    .maybeSingle()

  if (!connectionData) {
    return NextResponse.json({ error: 'No Stripe connection found.' }, { status: 400 })
  }

  const conn = connectionData as ConnectionRow

  try {
    const stripeKey = decryptToken(conn.encrypted_access_token)
    const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })
    if (conn.webhook_endpoint_id) {
      try {
        await founderStripe.webhookEndpoints.del(conn.webhook_endpoint_id)
      } catch (err) {
        logger.warn('Failed to delete Stripe webhook endpoint during disconnect', {
          reason: err instanceof Error ? err.message : 'unknown',
        })
        // Continue — local cleanup must still proceed
      }
    }
  } catch (err) {
    logger.warn('Failed to create Stripe client during disconnect', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    // Continue — still delete the DB row
  }

  const { error: deleteError } = await supabase
    .from('stripe_connections')
    .delete()
    .eq('user_id', session.userId)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to disconnect. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
