'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const VOICE_TAGS = [
  { emoji: '👔', label: 'Formal / Corporate' },
  { emoji: '⚡', label: 'Urgent / Direct' },
  { emoji: '🍿', label: 'Casual / Friendly' },
  { emoji: '🚀', label: 'Enthusiastic / Hype' },
  { emoji: '🔒', label: 'Clinical / Secure' },
  { emoji: '🛠️', label: 'Developer-to-Developer' },
]

type BusinessModel = 'B2B' | 'B2C' | 'Both'

export default function SettingsProfile({
  companyName: initialCompanyName,
  supportEmail: initialSupportEmail,
  businessModel: initialBusinessModel,
  brandVoice: initialBrandVoice,
}: {
  companyName: string | null
  supportEmail: string | null
  businessModel: string | null
  brandVoice: string | null
}) {
  const [companyName, setCompanyName] = useState(initialCompanyName ?? '')
  const [supportEmail, setSupportEmail] = useState(initialSupportEmail ?? '')
  const [selectedModel, setSelectedModel] = useState<BusinessModel>(
    (initialBusinessModel as BusinessModel) ?? 'B2B',
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    initialBrandVoice ? initialBrandVoice.split(', ').filter((t) => t.length > 0) : [],
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag)
      if (prev.length < 2) return [...prev, tag]
      return [prev[1], tag]
    })
  }

  async function handleSave() {
    if (selectedTags.length === 0) {
      setError('Select at least one brand voice.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName.trim(),
          support_email: supportEmail.trim(),
          business_model: selectedModel,
          brand_voice: selectedTags.join(', '),
        }),
      })
      if (!res.ok) {
        const data: unknown = await res.json()
        const p = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
        setError(typeof p.error === 'string' ? p.error : 'Failed to save.')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setSaving(false)
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Brand Profile</h2>
      </div>
      <div className="px-5 py-5 space-y-6">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-foreground mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Support Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-foreground mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="e.g. support@acme.com"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Business Model */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-2">
            Business Model
          </p>
          <div className="flex gap-2">
            {(['B2B', 'B2C', 'Both'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={cn(
                  'rounded-lg px-5 py-1.5 text-sm font-medium border transition-colors',
                  selectedModel === m
                    ? 'bg-emerald text-background border-emerald'
                    : 'border-border text-muted-foreground hover:border-emerald/50',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Voice */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-2">
            Brand Voice
          </p>
          <p className="text-xs text-muted-foreground">Pick 1 or 2 that best describe your tone.</p>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_TAGS.map(({ emoji, label }) => {
              const tag = `${emoji} ${label}`
              const selected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                    selected
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'border-border text-muted-foreground hover:border-emerald/30',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Save */}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved!
            </>
          ) : saving ? (
            'Saving…'
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}
