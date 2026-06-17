import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calculateMrr } from '@/lib/mrr'
import { logger } from '@/lib/logger'

type ConnectionRow = { user_id: string; encrypted_access_token: string }

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient()

  const { data: connections, error } = await supabase
    .from('stripe_connections')
    .select('user_id, encrypted_access_token')
    .not('encrypted_access_token', 'is', null)

  if (error) {
    logger.error('Failed to fetch stripe_connections for MRR refresh', { reason: error.message })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const rows = (connections ?? []) as ConnectionRow[]
  let updated = 0
  let failed = 0

  for (const row of rows) {
    try {
      const mrr = await calculateMrr(row.encrypted_access_token, row.user_id)
      const { error: updateError } = await supabase
        .from('stripe_connections')
        .update({ stripe_baseline_mrr: mrr })
        .eq('user_id', row.user_id)

      if (updateError) throw new Error(updateError.message)
      updated++
    } catch (err) {
      logger.error('MRR refresh failed for connection', {
        reason: err instanceof Error ? err.message : 'unknown',
      })
      failed++
    }
  }

  return NextResponse.json({ updated, failed })
}
