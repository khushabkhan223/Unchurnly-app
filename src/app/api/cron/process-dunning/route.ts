import { NextResponse } from 'next/server'
import { type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase'
import { generateAndSendDunning } from '@/lib/dunning-ai'
import { signCardUpdateToken } from '@/lib/session'
import { logger } from '@/lib/logger'

type MonitoredCustomerData = {
  customer_email: string | null
  customer_name: string | null
  plan_name: string | null
  mrr_amount: number | null
  stripe_customer_id: string
}

type DunningEmailData = {
  id: string
  day_number: number
  status: string
}

type SequenceRow = {
  id: string
  user_id: string
  monitored_customer_id: string
  started_at: string
  monitored_customers: MonitoredCustomerData | null
  dunning_emails: DunningEmailData[]
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const { data: sequencesData, error: seqError } = await supabase
    .from('dunning_sequences')
    .select(`
      id,
      user_id,
      monitored_customer_id,
      started_at,
      monitored_customers ( customer_email, customer_name, plan_name, mrr_amount, stripe_customer_id ),
      dunning_emails ( id, day_number, status )
    `)
    .eq('status', 'active')

  if (seqError) {
    logger.error('Failed to fetch active sequences', { reason: seqError.message })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const sequences = (sequencesData ?? []) as unknown as SequenceRow[]
  const stats = { processed: 0, sent: 0, failed: 0, skipped: 0 }
  const debugUrls: { hasAppUrl: boolean }[] = []

  for (const sequence of sequences) {
    stats.processed++

    const daysSinceStart = Math.floor(
      (Date.now() - new Date(sequence.started_at).getTime()) / 86_400_000
    )

    const dueEmails = (sequence.dunning_emails ?? []).filter(
      (e) => e.day_number <= daysSinceStart + 1 && e.status === 'pending'
    )

    for (const email of dueEmails) {
      const customer = sequence.monitored_customers

      if (!customer?.customer_email) {
        await supabase
          .from('dunning_emails')
          .update({ status: 'failed' })
          .eq('id', email.id)
        stats.skipped++
        stats.failed++
        continue
      }

      try {
        const token = await signCardUpdateToken(
          customer.stripe_customer_id,
          sequence.user_id
        )
        const cardUpdateUrl = `${appUrl}/card-update?token=${token}`

        const attemptByDay: Record<number, number> = { 1: 1, 3: 2, 7: 3, 14: 4 }
        const attemptCount = attemptByDay[email.day_number] ?? 1
        const planName = customer.plan_name ?? 'your subscription'
        const amountDue = customer.mrr_amount ?? 0

        const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL
        logger.info('cron: card update url constructed', { hasAppUrl, urlPrefix: cardUpdateUrl.slice(0, 30) })
        debugUrls.push({ hasAppUrl })

        await generateAndSendDunning(
          sequence.user_id,
          planName,
          amountDue,
          attemptCount,
          customer.customer_email,
          cardUpdateUrl
        )

        await supabase
          .from('dunning_emails')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', email.id)
        stats.sent++
      } catch (err) {
        logger.error('Error processing dunning email', {
          reason: err instanceof Error ? err.message : 'unknown',
          day: email.day_number,
        })
        await supabase
          .from('dunning_emails')
          .update({ status: 'failed' })
          .eq('id', email.id)
        stats.failed++
      }
    }

    await maybeCompleteSequence(supabase, sequence.id)
  }

  return NextResponse.json({
    ...stats,
    _debug: {
      urlsConstructed: debugUrls.length,
      missingAppUrl: debugUrls.filter((d) => !d.hasAppUrl).length,
    },
  })
}

async function maybeCompleteSequence(
  supabase: SupabaseClient,
  sequenceId: string
): Promise<void> {
  const { data: emails } = await supabase
    .from('dunning_emails')
    .select('status')
    .eq('dunning_sequence_id', sequenceId)

  if (!emails) return

  const allDone = (emails as { status: string }[]).every(
    (e) => e.status === 'sent' || e.status === 'failed'
  )

  if (allDone) {
    await supabase
      .from('dunning_sequences')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sequenceId)
  }
}
