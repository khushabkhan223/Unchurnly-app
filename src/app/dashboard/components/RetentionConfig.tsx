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
    <div className="space-y-5">
      {/* Offers card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Retention Offers</h2>
        </div>

        <div className="divide-y divide-border/50">
          {/* Pause */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Offer 1-month pause</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customer&apos;s billing pauses for 30 days, auto-resumes after
                </p>
              </div>
              <Switch checked={pauseEnabled} onCheckedChange={setPauseEnabled} />
            </div>
          </div>

          {/* Discount */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Offer discount</p>
                <p className="text-xs text-muted-foreground mt-0.5">Applied for 3 months via Stripe coupon</p>
              </div>
              <Switch checked={discountEnabled} onCheckedChange={setDiscountEnabled} />
            </div>
            {discountEnabled && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Discount %</label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            )}
          </div>

          {/* Support link */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Show support link for technical issues
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-emerald">Saved</span>}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </div>

      {/* Reason → Offer mapping */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Reason → Offer Mapping</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            What each customer sees based on their cancellation reason
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed" aria-label="Reason to offer mapping">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/2" />
            </colgroup>
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60">
                  REASON
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60">
                  OFFER SHOWN
                </th>
              </tr>
            </thead>
            <tbody>
              {REASON_MAP.map(({ reason, offer }) => (
                <tr
                  key={reason}
                  className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  <td className="px-4 py-3 text-sm text-foreground">{reason}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{offer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
