import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

type CancellationRow = {
  id: string
  outcome: string
  created_at: string
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

type SequenceRow = {
  id: string
  status: string
  started_at: string
  created_at: string
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

type ImpressionRow = { id: string; created_at: string }

type ConnectionRow = {
  stripe_baseline_mrr: number
  webhook_configured_at: string | null
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [connResult, keyResult, seqResult, ceResult, impResult] = await Promise.all([
    supabase
      .from('stripe_connections')
      .select('stripe_baseline_mrr, webhook_configured_at')
      .eq('user_id', session.userId)
      .maybeSingle(),
    supabase
      .from('founder_app_keys')
      .select('app_key')
      .eq('user_id', session.userId)
      .maybeSingle(),
    supabase
      .from('dunning_sequences')
      .select('id, status, started_at, created_at, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('cancellation_events')
      .select('id, outcome, created_at, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('widget_impressions')
      .select('id, created_at')
      .eq('user_id', session.userId)
      .gte('created_at', thirtyDaysAgo),
  ])

  const connection = connResult.data ? (connResult.data as ConnectionRow) : null
  const sequences = (seqResult.data ?? []) as unknown as SequenceRow[]
  const cancellations = (ceResult.data ?? []) as unknown as CancellationRow[]
  const impressions = (impResult.data ?? []) as ImpressionRow[]

  const savedEvents = cancellations.filter((e) =>
    ['paused', 'discounted'].includes(e.outcome)
  )
  const completedSequences = sequences.filter((s) => s.status === 'completed')

  const mrrSavedFromCancellations = savedEvents.reduce(
    (sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100,
    0
  )
  const mrrSavedFromDunning = completedSequences.reduce(
    (sum, s) => sum + (s.monitored_customers?.mrr_amount ?? 0) / 100,
    0
  )
  const mrr_saved = mrrSavedFromCancellations + mrrSavedFromDunning

  const cancellations_saved = cancellations.filter((e) => e.outcome !== 'cancelled').length
  const cancellations_lost = cancellations.filter((e) => e.outcome === 'cancelled').length
  const total_events = cancellations.length

  const offer_acceptance_rate =
    total_events > 0 ? Math.round((cancellations_saved / total_events) * 1000) / 10 : 0
  const active_sequences = sequences.filter((s) => s.status === 'active').length
  const roi_multiplier = mrr_saved > 0 ? Math.round((mrr_saved / 49) * 10) / 10 : 0
  const has_events = total_events > 0 || sequences.length > 0

  // Build daily chart data (last 30 days)
  const daily_data = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const mrr_day = savedEvents
      .filter((e) => e.created_at.slice(0, 10) === dateStr)
      .reduce((sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100, 0)
    const imp_day = impressions.filter((i) => i.created_at.slice(0, 10) === dateStr).length
    return { date: label, mrr_saved: Math.round(mrr_day * 100) / 100, impressions: imp_day }
  })

  // Recent events feed (last 10 combined)
  const recentEvents = [
    ...cancellations.map((e) => ({
      type: 'cancellation' as const,
      email: e.monitored_customers?.customer_email ?? '—',
      outcome: e.outcome,
      mrr: (e.monitored_customers?.mrr_amount ?? 0) / 100,
      date: e.created_at,
    })),
    ...sequences.map((s) => ({
      type: 'dunning' as const,
      email: s.monitored_customers?.customer_email ?? '—',
      outcome: s.status,
      mrr: (s.monitored_customers?.mrr_amount ?? 0) / 100,
      date: s.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return NextResponse.json({
    mrr_baseline: connection?.stripe_baseline_mrr ?? 0,
    mrr_saved,
    roi_multiplier,
    offer_acceptance_rate,
    active_sequences,
    widget_impressions_30d: impressions.length,
    cancellations_saved,
    cancellations_lost,
    stripe_connected: !!connection,
    webhook_configured: !!connection?.webhook_configured_at,
    widget_installed: !!keyResult.data,
    has_events,
    daily_data,
    recent_events: recentEvents,
  })
}
