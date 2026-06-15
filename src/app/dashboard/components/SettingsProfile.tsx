'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const VOICE_TAGS = [
  'Formal / Corporate',
  'Urgent / Direct',
  'Casual / Friendly',
  'Enthusiastic / Hype',
  'Clinical / Secure',
  'Developer-to-Developer',
]

function stripEmoji(str: string): string {
  return str
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .trim()
}

type BusinessModel = 'B2B' | 'B2C' | 'Both'

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </p>
  )
}

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
    initialBrandVoice
      ? initialBrandVoice.split(', ').map(stripEmoji).filter((t) => t.length > 0)
      : [],
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
          brand_voice: selectedTags.map(stripEmoji).join(', '),
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
    <div className="w-1/2 overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <SectionLabel>Brand Profile</SectionLabel>
      </div>

      {/* Company details */}
      <div className="border-b border-border px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Support Email
          </label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="e.g. support@acme.com"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Business Model */}
      <div className="border-b border-border px-6 py-5">
        <SectionLabel>Business Model</SectionLabel>
        <div className="mt-3 flex divide-x divide-border overflow-hidden rounded-lg border border-border">
          {(['B2B', 'B2C', 'Both'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={cn(
                'flex-1 py-2 text-sm font-medium transition-colors',
                selectedModel === m
                  ? 'bg-emerald text-background'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Voice */}
      <div className="border-b border-border px-6 py-5">
        <SectionLabel>Brand Voice</SectionLabel>
        <p className="mt-1.5 text-xs text-muted-foreground/60">
          Pick 1 or 2 that match your tone.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {VOICE_TAGS.map((tag) => {
            const selected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left transition-colors',
                  selected
                    ? 'border-white/20 bg-white/8 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-white/4 hover:text-foreground',
                )}
              >
                <span className="text-xs font-medium leading-snug">{tag}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-60',
            saved
              ? 'bg-emerald/10 text-emerald'
              : 'bg-emerald text-background hover:opacity-90',
          )}
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}
