import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import AnalyticsDashboard from './components/AnalyticsDashboard'

type CancellationRow = {
  id: string
  outcome: string
  created_at: string
  monitored_customer_id: string
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

type SequenceRow = {
  id: string
  status: string
  started_at: string
  created_at: string
  recovered_at: string | null
  recovered_mrr_cents: number | null
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

type ImpressionRow = { id: string; created_at: string }

type ConnectionRow = {
  stripe_baseline_mrr: number
  webhook_configured_at: string | null
}

type UserRow = {
  widget_banner_dismissed_at: string | null
  widget_installed: boolean
}

type BillingRow = {
  first_recovery_at: string | null
  subscription_status: string | null
  grace_period_ends_at: string | null
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [connResult, seqResult, ceResult, impResult, userResult, billingResult] = await Promise.all([
    supabase
      .from('stripe_connections')
      .select('stripe_baseline_mrr, webhook_configured_at')
      .eq('user_id', session.userId)
      .maybeSingle(),
    supabase
      .from('dunning_sequences')
      .select('id, status, started_at, created_at, recovered_at, recovered_mrr_cents, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .gte('created_at', ninetyDaysAgo),
    supabase
      .from('cancellation_events')
      .select('id, outcome, created_at, monitored_customer_id, monitored_customers(mrr_amount, customer_email)')
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
    supabase
      .from('users')
      .select('first_recovery_at, subscription_status, grace_period_ends_at')
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

  if (billingResult.error) {
    logger.error('Failed to fetch billing fields from users table', {
      reason: billingResult.error.message,
      code: billingResult.error.code,
    })
  }
  const billingData = billingResult.data ? (billingResult.data as BillingRow) : null

  // Card stats stay scoped to the last 30 days, same as before
  const sequences30 = sequences.filter((s) => s.created_at >= thirtyDaysAgo)
  const cancellations30 = cancellations.filter((e) => e.created_at >= thirtyDaysAgo)
  const impressions30 = impressions.filter((i) => i.created_at >= thirtyDaysAgo)

  // Latest-outcome-per-customer: only count a save if no later 'cancelled' event superseded it
  const latestByCustomer = new Map<string, CancellationRow>()
  for (const e of cancellations) {
    const existing = latestByCustomer.get(e.monitored_customer_id)
    if (!existing || e.created_at > existing.created_at) {
      latestByCustomer.set(e.monitored_customer_id, e)
    }
  }
  const trulySavedCustomerIds = new Set(
    [...latestByCustomer.entries()]
      .filter(([, e]) => ['paused', 'discounted'].includes(e.outcome))
      .map(([id]) => id)
  )

  const savedEvents30 = cancellations30.filter((e) =>
    ['paused', 'discounted'].includes(e.outcome) &&
    trulySavedCustomerIds.has(e.monitored_customer_id)
  )
  const recoveredSequences30 = sequences30.filter((s) => s.status === 'recovered')

  const mrrSaved =
    savedEvents30.reduce((sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100, 0) +
    recoveredSequences30.reduce((sum, s) => sum + (s.recovered_mrr_cents ?? 0) / 100, 0)

  const cancellations_saved = cancellations30.filter((e) => e.outcome !== 'cancelled').length
  const cancellations_lost = cancellations30.filter((e) => e.outcome === 'cancelled').length
  const total_events = cancellations30.length
  const offer_acceptance_rate =
    total_events > 0 ? Math.round((cancellations_saved / total_events) * 1000) / 10 : 0
  const active_sequences = sequences30.filter((s) => s.status === 'active').length
  const roi_multiplier = mrrSaved > 0 ? Math.round((mrrSaved / 49) * 10) / 10 : 0
  const has_events = total_events > 0 || sequences30.length > 0

  const show_widget_banner = !widget_installed && !userData?.widget_banner_dismissed_at

  // Chart data spans the full 90 days fetched above; the client slices to 7/30/90
  const savedEvents = cancellations.filter((e) =>
    ['paused', 'discounted'].includes(e.outcome) &&
    trulySavedCustomerIds.has(e.monitored_customer_id)
  )
  const today = new Date()
  const daily_data = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (89 - i))
    const dateStr = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const mrr_day =
      savedEvents
        .filter((e) => e.created_at.slice(0, 10) === dateStr)
        .reduce((sum, e) => sum + (e.monitored_customers?.mrr_amount ?? 0) / 100, 0) +
      sequences
        .filter((s) => s.status === 'recovered' && s.recovered_at?.slice(0, 10) === dateStr)
        .reduce((sum, s) => sum + (s.recovered_mrr_cents ?? 0) / 100, 0)
    const imp_day = impressions.filter((imp) => imp.created_at.slice(0, 10) === dateStr).length
    return { date: label, mrr_saved: Math.round(mrr_day * 100) / 100, impressions: imp_day }
  })

  const recent_events = [
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

  return (
    <AnalyticsDashboard
      mrr_baseline={connection?.stripe_baseline_mrr ?? 0}
      mrr_saved={mrrSaved}
      roi_multiplier={roi_multiplier}
      offer_acceptance_rate={offer_acceptance_rate}
      active_sequences={active_sequences}
      widget_impressions_30d={impressions30.length}
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
      first_recovery_at={billingData?.first_recovery_at ?? null}
      subscription_status={billingData?.subscription_status ?? null}
      grace_period_ends_at={billingData?.grace_period_ends_at ?? null}
    />
  )
}
