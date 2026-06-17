'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@/lib/supabase'

type DayData = { date: string; mrr_saved: number; impressions: number }
type ChartRange = 7 | 30 | 90
type RecentEvent = {
  type: 'cancellation' | 'dunning'
  email: string
  outcome: string
  mrr: number
  date: string
}

type Props = {
  mrr_baseline: number
  mrr_saved: number
  roi_multiplier: number
  offer_acceptance_rate: number
  active_sequences: number
  widget_impressions_30d: number
  cancellations_saved: number
  cancellations_lost: number
  stripe_connected: boolean
  webhook_configured: boolean
  initialWidgetInstalled: boolean
  has_events: boolean
  initialShowBanner: boolean
  userId: string
  daily_data: DayData[]
  recent_events: RecentEvent[]
  first_recovery_at: string | null
  subscription_status: string | null
  grace_period_ends_at: string | null
}

const DEMO: Omit<
  Props,
  | 'stripe_connected'
  | 'webhook_configured'
  | 'initialWidgetInstalled'
  | 'has_events'
  | 'initialShowBanner'
  | 'userId'
  | 'daily_data'
  | 'recent_events'
  | 'mrr_baseline'
  | 'first_recovery_at'
  | 'subscription_status'
  | 'grace_period_ends_at'
> = {
  mrr_saved: 1240,
  roi_multiplier: 25.3,
  offer_acceptance_rate: 31.2,
  active_sequences: 4,
  widget_impressions_30d: 847,
  cancellations_saved: 18,
  cancellations_lost: 7,
}

function fmt$(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtDate(d: string): string {
  const p = new Date(d)
  return isNaN(p.getTime()) ? '' : p.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function outcomeBadgeClass(outcome: string) {
  if (['paused', 'discounted', 'completed'].includes(outcome))
    return 'border-emerald/30 text-emerald bg-emerald/5'
  if (outcome === 'cancelled')
    return 'border-destructive/30 text-destructive bg-destructive/5'
  if (outcome === 'active')
    return 'border-accent/30 text-accent bg-accent/5'
  return 'border-border text-muted-foreground bg-card'
}

function outcomeLabel(outcome: string) {
  const map: Record<string, string> = {
    paused: 'Paused',
    discounted: 'Discounted',
    cancelled: 'Cancelled',
    completed: 'Recovered',
    active: 'Active',
    downgraded: 'Downgraded',
  }
  return map[outcome] ?? outcome
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-semibold text-foreground">
          {fmt$(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function AnalyticsDashboard(props: Props) {
  const {
    stripe_connected,
    has_events,
    daily_data,
    recent_events,
    mrr_baseline,
    initialShowBanner,
    userId,
    first_recovery_at,
    subscription_status,
    grace_period_ends_at,
  } = props

  const isDemo = !stripe_connected && !has_events
  const d = isDemo ? { ...props, ...DEMO } : props

  const failed_est = mrr_baseline * 0.05
  const annual_at_risk = failed_est * 12
  const recovery_est = annual_at_risk * 0.7

  const hasRealRecoveryData = !isDemo && d.mrr_saved > 0 && failed_est > 0
  const recovery_pct = hasRealRecoveryData
    ? Math.min(100, Math.round((d.mrr_saved / failed_est) * 100))
    : 70

  const [bannerVisible, setBannerVisible] = useState(initialShowBanner)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [chartRange, setChartRange] = useState<ChartRange>(30)
  const visibleDailyData = daily_data.slice(-chartRange)
  const tickGap = chartRange === 7 ? 1 : chartRange === 30 ? 2 : 5
  const lastIndex = visibleDailyData.length - 1
  const tickIndices: number[] = []
  for (let i = lastIndex; i >= 0; i -= tickGap) tickIndices.push(i)
  tickIndices.reverse()
  const tickValues = tickIndices.map((i) => visibleDailyData[i]?.date)

  const showBillingBanner =
    first_recovery_at !== null &&
    subscription_status !== 'active' &&
    (grace_period_ends_at === null || new Date(grace_period_ends_at) > new Date())

  const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK ?? '#'

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`widget_status_${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.new.widget_installed === true && !payload.old.widget_installed) {
            setBannerVisible(false)
            setShowSuccessToast(true)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function handleDismiss() {
    setBannerVisible(false)
    try {
      await fetch('/api/dashboard/dismiss-banner', { method: 'POST' })
    } catch {
      // Low-stakes: banner already hidden in UI; persist failure is non-critical
    }
  }

  return (
    <div className="space-y-5">
      {/* Billing prompt — first recovery, not yet subscribed */}
      {showBillingBanner && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
          <p className="flex-1 text-sm text-blue-300">
            Your first recovery just happened! Start your $49/month plan to keep Unchurnly protecting your revenue.
          </p>
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start plan →
          </a>
        </div>
      )}

      {/* Widget not installed banner */}
      {bannerVisible && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          <p className="flex-1 text-sm text-amber-300">
            Cancel flow widget not installed. Customers who try to cancel won&apos;t see your retention offer.
          </p>
          <a
            href="/dashboard/settings"
            className="whitespace-nowrap text-sm text-amber-400 underline transition-colors hover:text-amber-300"
          >
            Install widget →
          </a>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="ml-1 -mr-1 rounded p-1.5 text-amber-600 transition-colors hover:text-amber-400 active:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Widget verified success toast */}
      {showSuccessToast && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4"
        >
          <div className="rounded-full bg-emerald-500/20 p-1">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-300">Widget verified!</h3>
            <p className="text-xs text-emerald-500">
              Your cancel flow is live. Customers who try to cancel will now see your retention offer.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            aria-label="Dismiss"
            className="-mr-1 rounded p-1.5 text-emerald-600 transition-colors hover:text-emerald-400 active:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
            DEMO
          </span>
          <p className="flex-1 text-sm text-blue-300">
            You&apos;re viewing sample data. Connect Stripe to see real metrics.
          </p>
          <a
            href="/dashboard/settings"
            className="whitespace-nowrap text-sm text-blue-400 underline transition-colors hover:text-blue-300"
          >
            Connect Stripe →
          </a>
        </div>
      )}

      {/* Metric cards row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="MRR Protected"
          value={fmt$(d.mrr_saved)}
          sub="recovered this month"
          accent="green"
        />
        <MetricCard
          label="Recovery ROI"
          value={`${d.roi_multiplier}×`}
          sub="vs. $49/mo subscription"
          accent="blue"
        />
        <MetricCard
          label="Offer Acceptance"
          value={`${d.offer_acceptance_rate}%`}
          sub="of cancel attempts retained"
          accent="blue"
        />
        <MetricCard
          label="Active Recoveries"
          value={String(d.active_sequences)}
          sub="dunning sequences in progress"
          accent="default"
        />
      </div>

      {/* Chart + At Risk */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Recovery Activity chart */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Recovery Activity — Last {chartRange} days
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-accent" />
              <span className="text-[10px] font-medium text-muted-foreground">MRR Recovered</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {([7, 30, 90] as ChartRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setChartRange(r)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  chartRange === r
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600'
                )}
              >
                {r} days
              </button>
            ))}
          </div>
          {visibleDailyData.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: 200 }}>
              <p className="text-sm text-muted-foreground">No recovery data for this period.</p>
            </div>
          ) : (
            <div
              role="img"
              aria-label={`Recovery activity chart showing MRR saved over the last ${chartRange} days`}
            >
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={visibleDailyData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.16 260)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="oklch(0.62 0.16 260)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="0"
                    stroke="oklch(1 0 0 / 6%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'oklch(0.5 0 0)', fontFamily: 'inherit' }}
                    tickLine={false}
                    axisLine={false}
                    ticks={tickValues}
                    tickFormatter={fmtDate}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'oklch(0.5 0 0)', fontFamily: 'inherit' }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: 'oklch(1 0 0 / 15%)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr_saved"
                    stroke="oklch(0.62 0.16 260)"
                    strokeWidth={1.5}
                    fill="url(#blueGradient)"
                    dot={false}
                    activeDot={{
                      r: 3,
                      fill: 'oklch(0.62 0.16 260)',
                      stroke: 'oklch(0.11 0 0)',
                      strokeWidth: 2,
                    }}
                    name="MRR Saved ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* At Risk panel */}
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              At Risk This Month
            </p>
          </div>

          {mrr_baseline > 0 ? (
            <>
              <div className="space-y-4">
                <RiskRow label="Monthly at risk (est. 5%)" value={fmt$(failed_est)} />
                <RiskRow label="Annual exposure" value={fmt$(annual_at_risk)} />
                <RiskRow label="Recoverable (est.)" value={fmt$(recovery_est)} />
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {hasRealRecoveryData ? 'Recovery rate this month' : 'Industry avg. recovery'}
                </p>
                <p className="font-mono text-xs font-semibold text-foreground">{recovery_pct}%</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 py-4">
              <p className="text-sm text-muted-foreground">
                Connect Stripe to see your recovery forecast.
              </p>
              <a
                href="/dashboard/settings"
                className="text-sm text-emerald underline-offset-4 hover:underline font-medium transition-opacity hover:opacity-80"
              >
                Connect Stripe →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Activity table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <p className="text-sm font-semibold text-foreground">Recent Activity</p>
          <span className="text-[10px] text-muted-foreground">Last 10 events</span>
        </div>

        {recent_events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Activity className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-foreground">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              Cancellations and payment recoveries will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed" aria-label="Recent customer activity">
              <colgroup>
                <col className="w-[38%]" />
                <col className="w-[16%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60">CUSTOMER</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60">TYPE</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60">OUTCOME</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold tracking-widest text-muted-foreground/60">MRR</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold tracking-widest text-muted-foreground/60">DATE</th>
                </tr>
              </thead>
              <tbody>
                {recent_events.map((ev, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3">
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {ev.email || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {ev.type === 'cancellation' ? 'Cancellation' : 'Dunning'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold',
                          outcomeBadgeClass(ev.outcome),
                        )}
                      >
                        {outcomeLabel(ev.outcome)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs font-semibold text-emerald">
                        {ev.mrr > 0 ? fmt$(ev.mrr) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-muted-foreground">
                        {ev.date ? (fmtDate(ev.date) || '—') : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  sub,
  accent = 'default',
}: {
  label: string
  value: string
  sub: string
  accent?: 'green' | 'blue' | 'default'
}) {
  const accentClass = {
    green: 'text-emerald',
    blue: 'text-blue-accent',
    default: 'text-foreground',
  }[accent]

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-border/80">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className={cn('font-mono text-3xl font-semibold tracking-tight leading-none', accentClass)}>
        {value}
      </p>
      <p className="text-xs leading-snug text-muted-foreground">{sub}</p>
    </div>
  )
}

function RiskRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}
