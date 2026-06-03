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
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Retention</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure cancel flow offers shown to customers</p>
      </div>

      {/* Offers card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-200">Cancellation Offers</p>
        </div>

        <div className="divide-y divide-zinc-800">
          {/* Pause */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-zinc-200">Offer 1-month pause</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Customer's billing pauses for 30 days, auto-resumes after
                </p>
              </div>
              <Switch checked={pauseEnabled} onCheckedChange={setPauseEnabled} />
            </div>
          </div>

          {/* Discount */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-zinc-200">Offer discount</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Applied for 3 months via Stripe coupon
                </p>
              </div>
              <Switch checked={discountEnabled} onCheckedChange={setDiscountEnabled} />
            </div>
            {discountEnabled && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-zinc-400">Discount %</label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-zinc-500">%</span>
              </div>
            )}
          </div>

          {/* Support link */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Show support link for technical issues
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Shown when customer selects "Technical issues"
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
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-green-500">Saved</span>}
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      </div>

      {/* Reason → Offer mapping */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-200">Reason → Offer mapping</p>
          <p className="text-xs text-zinc-500 mt-0.5">What each customer sees based on their cancellation reason</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">Reason</th>
                <th className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">Offer shown</th>
              </tr>
            </thead>
            <tbody>
              {REASON_MAP.map(({ reason, offer }) => (
                <tr key={reason} className="border-b border-zinc-800/50">
                  <td className="px-6 py-3 text-zinc-300">{reason}</td>
                  <td className="px-6 py-3 text-zinc-400">{offer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
