'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

type Config = {
  pause_enabled: boolean
  discount_enabled: boolean
  discount_percent: number
  downgrade_enabled: boolean
  stripe_coupon_id: string | null
  support_url: string | null
}

const REASON_MAP = [
  { reason: 'Too expensive', offer: 'Discount' },
  { reason: 'Not using it', offer: 'Pause (1 month)' },
  { reason: 'Taking a break', offer: 'Pause (1 month)' },
  { reason: 'Technical issues', offer: 'Support link' },
  { reason: 'Better alternative', offer: 'Best available offer' },
]

export default function RetentionConfig({ config }: { config: Config }) {
  const [pauseEnabled, setPauseEnabled] = useState(config.pause_enabled)
  const [discountEnabled, setDiscountEnabled] = useState(config.discount_enabled)
  const [discountPercent, setDiscountPercent] = useState(config.discount_percent)
  const [supportEnabled, setSupportEnabled] = useState(!!config.support_url)
  const [supportUrl, setSupportUrl] = useState(config.support_url ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)

    const res = await fetch('/api/cancel-flow/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pause_enabled: pauseEnabled,
        discount_enabled: discountEnabled,
        discount_percent: discountPercent,
        downgrade_enabled: false,
        support_url: supportEnabled && supportUrl ? supportUrl : null,
      }),
    })

    const data: unknown = await res.json()
    const payload = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}

    if (!res.ok) {
      setError(typeof payload.error === 'string' ? payload.error : 'Failed to save')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cancel Flows</h1>
        <p className="text-sm text-slate-500 mt-1">Configure offers shown to customers who try to cancel</p>
      </div>

      {/* Offers card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Retention Offers</h2>
        </div>

        <div className="divide-y divide-slate-50">
          {/* Pause */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Offer 1-month pause</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer&apos;s billing pauses for 30 days, auto-resumes after
                </p>
              </div>
              <Switch checked={pauseEnabled} onCheckedChange={setPauseEnabled} />
            </div>
          </div>

          {/* Discount */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Offer discount</p>
                <p className="text-xs text-slate-500 mt-0.5">Applied for 3 months via Stripe coupon</p>
              </div>
              <Switch checked={discountEnabled} onCheckedChange={setDiscountEnabled} />
            </div>
            {discountEnabled && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-slate-500">Discount %</label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            )}
          </div>

          {/* Support link */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Show support link for technical issues
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shown when customer selects &quot;Technical issues&quot;
                </p>
              </div>
              <Switch checked={supportEnabled} onCheckedChange={setSupportEnabled} />
            </div>
            {supportEnabled && (
              <div className="mt-3">
                <input
                  type="url"
                  placeholder="https://support.yourapp.com"
                  value={supportUrl}
                  onChange={(e) => setSupportUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
          {error && <span className="text-sm text-rose-500">{error}</span>}
        </div>
      </div>

      {/* Reason → Offer mapping */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Reason → Offer Mapping</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            What each customer sees based on their cancellation reason
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Offer shown
                </th>
              </tr>
            </thead>
            <tbody>
              {REASON_MAP.map(({ reason, offer }) => (
                <tr key={reason} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-700">{reason}</td>
                  <td className="px-6 py-3 text-slate-500">{offer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
