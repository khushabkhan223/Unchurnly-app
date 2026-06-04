import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import AnalyticsDashboard from './components/AnalyticsDashboard'

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

type UserRow = { widget_banner_dismissed_at: string | null; widget_installed: boolean }

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [connResult, seqResult, ceResult, impResult, userResult] = await Promise.all([
    supabase
      .from('stripe_connections')
      .select('stripe_baseline_mrr, webhook_configured_at')
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
    supabase
      .from('users')
      .select('widget_banner_dismissed_at, widget_installed')
      .eq('id', session.userId)
      .maybeSingle(),
  ])

  const connection = connResult.data ? (connResult.data as ConnectionRow) : null
  const sequences = (seqResult.data ?? []) as unknown as SequenceRow[]
  const cancellations = (ceResult.data ?? []) as unknown as CancellationRow[]
  const impressions = (impResult.data ?? []) as ImpressionRow[]
  const userData = userResult.data ? (userResult.data as UserRow) : null
  const widget_installed = userData?.widget_installed ?? false

  const savedEvents = cancellations.filter((e) =>
    ['paused', 'discounted'].includes(e.outcome)
  )
  const completedSequences = sequences.filter((s) => s.status === 'completed')

  const mrrSaved =
    savedEvents.reduce((sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100, 0) +
    completedSequences.reduce((sum, s) => sum + (s.monitored_customers?.mrr_amount ?? 0) / 100, 0)

  const cancellations_saved = cancellations.filter((e) => e.outcome !== 'cancelled').length
  const cancellations_lost = cancellations.filter((e) => e.outcome === 'cancelled').length
  const total_events = cancellations.length
  const offer_acceptance_rate =
    total_events > 0 ? Math.round((cancellations_saved / total_events) * 1000) / 10 : 0
  const active_sequences = sequences.filter((s) => s.status === 'active').length
  const roi_multiplier = mrrSaved > 0 ? Math.round((mrrSaved / 49) * 10) / 10 : 0
  const has_events = total_events > 0 || sequences.length > 0

  const show_widget_banner = !widget_installed && !userData?.widget_banner_dismissed_at

  const daily_data = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const mrr_day = savedEvents
      .filter((e) => e.created_at.slice(0, 10) === dateStr)
      .reduce((sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100, 0)
    const imp_day = impressions.filter((imp) => imp.created_at.slice(0, 10) === dateStr).length
    return { date: label, mrr_saved: Math.round(mrr_day * 100) / 100, impressions: imp_day }
  })

  const recent_events = [
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

  return (
    <AnalyticsDashboard
      mrr_baseline={connection?.stripe_baseline_mrr ?? 0}
      mrr_saved={mrrSaved}
      roi_multiplier={roi_multiplier}
      offer_acceptance_rate={offer_acceptance_rate}
      active_sequences={active_sequences}
      widget_impressions_30d={impressions.length}
      cancellations_saved={cancellations_saved}
      cancellations_lost={cancellations_lost}
      stripe_connected={!!connection}
      webhook_configured={!!connection?.webhook_configured_at}
      initialWidgetInstalled={widget_installed}
      has_events={has_events}
      initialShowBanner={show_widget_banner}
      userId={session.userId}
      daily_data={daily_data}
      recent_events={recent_events}
    />
  )
}
