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
  recovered_mrr_cents: number | null
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

type ImpressionRow = { id: string; created_at: string }

type ConnectionRow = {
  stripe_baseline_mrr: number
  webhook_configured_at: string | null
}

type UserRow = { widget_banner_dismissed_at: string | null; widget_installed: boolean }

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [connResult, seqResult, ceResult, impResult, userResult] = await Promise.all([
    supabase
      .from('stripe_connections')
      .select('stripe_baseline_mrr, webhook_configured_at')
      .eq('user_id', session.userId)
      .maybeSingle(),
    supabase
      .from('dunning_sequences')
      .select('id, status, started_at, created_at, recovered_mrr_cents, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .gte('created_at', ninetyDaysAgo),
    supabase
      .from('cancellation_events')
      .select('id, outcome, created_at, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .gte('created_at', ninetyDaysAgo),
    supabase
      .from('widget_impressions')
      .select('id, created_at')
      .eq('user_id', session.userId)
      .gte('created_at', ninetyDaysAgo),
    supabase
      .from('users')
      .select('widget_banner_dismissed_at, widget_installed')
      .eq('id', session.userId)
      .maybeSingle(),
  ])

  const connection = connResult.data ? (connResult.data as ConnectionRow) : null
  // Last 90 days — covers the chart's widest range; card stats below re-scope to the last 30 days
  const sequences = (seqResult.data ?? []) as unknown as SequenceRow[]
  const cancellations = (ceResult.data ?? []) as unknown as CancellationRow[]
  const impressions = (impResult.data ?? []) as ImpressionRow[]
  const userData = userResult.data ? (userResult.data as UserRow) : null
  const widget_installed = userData?.widget_installed ?? false

  // Card stats stay scoped to the last 30 days, same as before
  const sequences30 = sequences.filter((s) => s.created_at >= thirtyDaysAgo)
  const cancellations30 = cancellations.filter((e) => e.created_at >= thirtyDaysAgo)
  const impressions30 = impressions.filter((i) => i.created_at >= thirtyDaysAgo)

  const savedEvents30 = cancellations30.filter((e) =>
    ['paused', 'discounted'].includes(e.outcome)
  )
  const recoveredSequences30 = sequences30.filter((s) => s.status === 'recovered')

  const mrrSavedFromCancellations = savedEvents30.reduce(
    (sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100,
    0
  )
  const mrrSavedFromDunning = recoveredSequences30.reduce(
    (sum, s) => sum + (s.recovered_mrr_cents ?? 0) / 100,
    0
  )
  const mrr_saved = mrrSavedFromCancellations + mrrSavedFromDunning

  const cancellations_saved = cancellations30.filter((e) => e.outcome !== 'cancelled').length
  const cancellations_lost = cancellations30.filter((e) => e.outcome === 'cancelled').length
  const total_events = cancellations30.length

  const offer_acceptance_rate =
    total_events > 0 ? Math.round((cancellations_saved / total_events) * 1000) / 10 : 0
  const active_sequences = sequences30.filter((s) => s.status === 'active').length
  const roi_multiplier = mrr_saved > 0 ? Math.round((mrr_saved / 49) * 10) / 10 : 0
  const has_events = total_events > 0 || sequences30.length > 0

  const show_widget_banner = !widget_installed && !userData?.widget_banner_dismissed_at

  // Build daily chart data (last 90 days); client slices to 7/30/90
  const savedEvents = cancellations.filter((e) =>
    ['paused', 'discounted'].includes(e.outcome)
  )
  const today = new Date()
  const daily_data = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (89 - i))
    const dateStr = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const mrr_day = savedEvents
      .filter((e) => e.created_at.slice(0, 10) === dateStr)
      .reduce((sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100, 0)
    const imp_day = impressions.filter((i) => i.created_at.slice(0, 10) === dateStr).length
    return { date: label, mrr_saved: Math.round(mrr_day * 100) / 100, impressions: imp_day }
  })

  // Recent events feed (last 10 combined, scoped to the last 30 days)
  const recentEvents = [
    ...cancellations30.map((e) => ({
      type: 'cancellation' as const,
      email: e.monitored_customers?.customer_email ?? '—',
      outcome: e.outcome,
      mrr: (e.monitored_customers?.mrr_amount ?? 0) / 100,
      date: e.created_at,
    })),
    ...sequences30.map((s) => ({
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
    widget_impressions_30d: impressions30.length,
    cancellations_saved,
    cancellations_lost,
    stripe_connected: !!connection,
    webhook_configured: !!connection?.webhook_configured_at,
    widget_installed,
    has_events,
    show_widget_banner,
    daily_data,
    recent_events: recentEvents,
  })
}
