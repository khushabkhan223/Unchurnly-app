'use client'

import Link from 'next/link'
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
import { CheckCircle, Circle } from 'lucide-react'

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
  widget_installed: boolean
  has_events: boolean
  daily_data: DayData[]
  recent_events: RecentEvent[]
}

const DEMO: Omit<Props, 'stripe_connected' | 'webhook_configured' | 'widget_installed' | 'has_events' | 'daily_data' | 'recent_events' | 'mrr_baseline'> = {
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

function outcomeColor(outcome: string) {
  if (['paused', 'discounted', 'completed'].includes(outcome)) return 'text-green-500'
  if (outcome === 'cancelled') return 'text-red-500'
  if (outcome === 'active') return 'text-indigo-400'
  return 'text-zinc-400'
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
    webhook_configured,
    widget_installed,
    has_events,
    daily_data,
    recent_events,
    mrr_baseline,
  } = props

  const isDemo = !stripe_connected && !has_events
  const d = isDemo ? { ...props, ...DEMO } : props

  const showSetup = !stripe_connected || !widget_installed || !has_events
  const setupItems = [
    { label: 'Connect your Stripe account', done: stripe_connected },
    { label: 'Install the widget in your app', done: widget_installed },
    { label: 'First event received', done: has_events },
  ]

  const failed_est = mrr_baseline * 0.05
  const annual_at_risk = failed_est * 12
  const recovery_est = annual_at_risk * 0.70

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Last 30 days</p>
      </div>

      {/* Setup checklist */}
      {showSetup && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
          <p className="text-sm font-medium text-zinc-200 mb-3">Complete your setup</p>
          <ul className="space-y-2 mb-4">
            {setupItems.map(({ label, done }) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
                <span className={done ? 'text-zinc-400 line-through' : 'text-zinc-300'}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/settings"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <span className="text-xs font-semibold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
            DEMO
          </span>
          <p className="text-sm text-zinc-400">
            Viewing sample data — connect Stripe to see your real numbers
          </p>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="MRR Saved"
          value={fmt$(d.mrr_saved)}
          sub="this month"
          valueClass="text-green-500"
        />
        <KpiCard
          label="ROI on Unchurnly"
          value={`${d.roi_multiplier}x`}
          sub="return on $49/mo"
          valueClass="text-indigo-400"
        />
        <KpiCard
          label="Offer Acceptance"
          value={`${d.offer_acceptance_rate}%`}
          sub="of cancel attempts saved"
          valueClass="text-zinc-50"
        />
        <KpiCard
          label="Active Dunning"
          value={String(d.active_sequences)}
          sub="sequences running"
          valueClass="text-zinc-50"
        />
      </div>

      {/* Recovery potential */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium text-zinc-300 mb-4">Your recovery potential</p>
        {mrr_baseline > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Monthly at risk (est. 5%)</p>
              <p className="font-mono text-lg text-red-400">{fmt$(failed_est)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Annual at risk</p>
              <p className="font-mono text-lg text-zinc-200">{fmt$(annual_at_risk)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Unchurnly recovers (est. 70%)</p>
              <p className="font-mono text-lg text-green-500">{fmt$(recovery_est)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Connect Stripe to calculate your recovery potential.
          </p>
        )}
      </div>

      {/* Chart — always rendered per spec */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium text-zinc-300 mb-4">Last 30 days</p>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily_data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717A', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={5}
              />
              <YAxis
                tick={{ fill: '#71717A', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181B',
                  border: '1px solid #27272A',
                  borderRadius: '8px',
                  color: '#FAFAFA',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#71717A', paddingTop: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="mrr_saved"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                name="MRR Saved ($)"
              />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#71717A"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Widget Opens"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent events */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-300">Recent events</p>
        </div>
        {recent_events.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-600 text-center">
            No events yet. Events appear here once customers interact with the widget.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Customer', 'Type', 'Outcome', 'MRR', 'Date'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent_events.map((ev, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-zinc-300 max-w-[180px] truncate">{ev.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ev.type === 'cancellation'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {ev.type === 'cancellation' ? 'Cancellation' : 'Dunning'}
                      </span>
                    </td>
                    <td className={`px-6 py-3 font-medium ${outcomeColor(ev.outcome)}`}>
                      {outcomeLabel(ev.outcome)}
                    </td>
                    <td className="px-6 py-3 font-mono text-zinc-400">
                      {ev.mrr > 0 ? fmt$(ev.mrr) : '—'}
                    </td>
                    <td className="px-6 py-3 text-zinc-500">
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
}: {
  label: string
  value: string
  sub: string
  valueClass: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      <p className={`font-mono text-3xl font-semibold ${valueClass}`}>{value}</p>
      <p className="text-xs text-zinc-600 mt-1">{sub}</p>
    </div>
  )
}
