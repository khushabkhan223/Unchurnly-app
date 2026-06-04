'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Zap,
  Target,
  AlertCircle,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

type DayData = { date: string; mrr_saved: number; impressions: number }
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

function outcomeBadgeClass(outcome: string) {
  if (['paused', 'discounted', 'completed'].includes(outcome))
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (outcome === 'cancelled') return 'bg-rose-50 text-rose-700 border border-rose-100'
  if (outcome === 'active') return 'bg-blue-50 text-blue-700 border border-blue-100'
  return 'bg-slate-100 text-slate-600'
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

export default function AnalyticsDashboard(props: Props) {
  const {
    stripe_connected,
    has_events,
    daily_data,
    recent_events,
    mrr_baseline,
    initialShowBanner,
    initialWidgetInstalled,
    userId,
  } = props

  const isDemo = !stripe_connected && !has_events
  const d = isDemo ? { ...props, ...DEMO } : props

  const failed_est = mrr_baseline * 0.05
  const annual_at_risk = failed_est * 12
  const recovery_est = annual_at_risk * 0.7

  const [bannerVisible, setBannerVisible] = useState(initialShowBanner)
  const [, setWidgetInstalled] = useState(initialWidgetInstalled)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`widget_status_${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.new.widget_installed === true && !payload.old.widget_installed) {
            setWidgetInstalled(true)
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
    await fetch('/api/dashboard/dismiss-banner', { method: 'POST' })
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Revenue recovery and retention performance</p>
      </div>

      {/* Widget not installed banner */}
      {bannerVisible && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <span className="font-semibold">Widget not installed.</span>{' '}
            Unchurnly can&apos;t intercept cancellations until the widget is active in your app.
          </p>
          <a
            href="/dashboard/settings"
            className="text-amber-700 text-sm font-medium hover:text-amber-900 whitespace-nowrap transition-colors"
          >
            Install now →
          </a>
          <button
            onClick={handleDismiss}
            className="text-amber-400 hover:text-amber-600 ml-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Widget verified success toast */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-1 bg-emerald-500 rounded-full">
            <CheckCircle className="w-5 h-5 text-white shrink-0" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-900">Widget verified!</h3>
            <p className="text-xs text-emerald-700">
              Unchurnly has detected your widget and is now monitoring cancel attempts live.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-emerald-400 hover:text-emerald-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Demo banner */}
      {isDemo && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
            DEMO
          </span>
          <p className="text-sm text-slate-600">
            You&apos;re viewing sample data. Connect Stripe to see real metrics.
          </p>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="MRR Saved"
          value={fmt$(d.mrr_saved)}
          sub="this month"
          valueClass="text-emerald-600"
          icon={TrendingUp}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <KpiCard
          label="ROI on Unchurnly"
          value={`${d.roi_multiplier}x`}
          sub="return on $49/mo"
          valueClass="text-blue-600"
          icon={Zap}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KpiCard
          label="Offer Acceptance"
          value={`${d.offer_acceptance_rate}%`}
          sub="of cancel attempts saved"
          valueClass="text-slate-900"
          icon={Target}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <KpiCard
          label="Active Dunning"
          value={String(d.active_sequences)}
          sub="sequences running"
          valueClass="text-slate-900"
          icon={AlertCircle}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Recovery potential */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Recovery Potential</h2>
        </div>
        {mrr_baseline > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Monthly at risk (est. 5%)</p>
              <p className="font-mono text-2xl font-bold text-blue-700">{fmt$(failed_est)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Annual at risk</p>
              <p className="font-mono text-2xl font-bold text-blue-700">{fmt$(annual_at_risk)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Unchurnly recovers (est. 70%)</p>
              <p className="font-mono text-2xl font-bold text-blue-700">{fmt$(recovery_est)}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 gap-2">
            <p className="text-slate-500 text-sm">
              Connect Stripe to unlock your recovery forecast
            </p>
            <a
              href="/dashboard/settings"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 underline-offset-4 hover:underline"
            >
              Connect Stripe →
            </a>
          </div>
        )}
      </div>

      {/* Chart — always rendered */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Activity — Last 30 days</h2>
        <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily_data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={5}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#475569' }}
                itemStyle={{ color: '#475569' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="mrr_saved"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                name="MRR Saved ($)"
              />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#cbd5e1"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="Widget Opens"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
        </div>
        {recent_events.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-slate-900 font-medium text-sm">No activity yet</p>
            <p className="text-slate-500 text-sm">
              Events appear here once customers interact with the widget.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Customer', 'Type', 'Outcome', 'MRR', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent_events.map((ev, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-900 font-medium max-w-[180px] truncate">
                      {ev.email}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          ev.type === 'cancellation'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}
                      >
                        {ev.type === 'cancellation' ? 'Cancellation' : 'Dunning'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${outcomeBadgeClass(ev.outcome)}`}
                      >
                        {outcomeLabel(ev.outcome)}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">
                      {ev.mrr > 0 ? fmt$(ev.mrr) : '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {new Date(ev.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
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

function KpiCard({
  label,
  value,
  sub,
  valueClass,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string
  sub: string
  valueClass: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-5xl font-bold font-mono leading-none ${valueClass}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}
