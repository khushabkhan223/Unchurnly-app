'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Copy, Check, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

const VOICE_TAGS = [
  { emoji: '👔', label: 'Formal / Corporate' },
  { emoji: '⚡', label: 'Urgent / Direct' },
  { emoji: '🍿', label: 'Casual / Friendly' },
  { emoji: '🚀', label: 'Enthusiastic / Hype' },
  { emoji: '🔒', label: 'Clinical / Secure' },
  { emoji: '🛠️', label: 'Developer-to-Developer' },
]

type Step3Sub = 'choose' | 'widget' | 'nocode'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1
  const [companyName, setCompanyName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [selectedModel, setSelectedModel] = useState<'B2B' | 'B2C' | 'Both'>('B2B')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Step 2
  const [stripeKey, setStripeKey] = useState('')
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)

  // Step 3
  const [step3Sub, setStep3Sub] = useState<Step3Sub>('choose')
  const [hmacExpanded, setHmacExpanded] = useState(false)
  const [appKey, setAppKey] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [widgetConnected, setWidgetConnected] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Load app key + userId on step 3
  useEffect(() => {
    if (step !== 3) return
    async function loadKey() {
      const res = await fetch('/api/app-keys')
      const data: unknown = await res.json()
      const payload =
        typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}

      if (typeof payload.userId === 'string') setUserId(payload.userId)

      if (typeof payload.appKey === 'string' && payload.appKey) {
        setAppKey(payload.appKey)
        return
      }

      const genRes = await fetch('/api/app-keys/generate', { method: 'POST' })
      const genData: unknown = await genRes.json()
      const genPayload =
        typeof genData === 'object' && genData !== null
          ? (genData as Record<string, unknown>)
          : {}
      if (typeof genPayload.appKey === 'string') setAppKey(genPayload.appKey)
    }
    loadKey()
  }, [step])

  // Realtime listener for widget ping detection
  useEffect(() => {
    if (step !== 3 || !userId) return
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`onboarding_widget_${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload: { new: Record<string, unknown> }) => {
          if (payload.new.widget_installed === true) setWidgetConnected(true)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [step, userId])

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag)
      if (prev.length < 2) return [...prev, tag]
      return [prev[1], tag]
    })
  }

  async function handleSaveProfile() {
    setIsSavingProfile(true)
    await fetch('/api/onboarding/save-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_model: selectedModel,
        brand_voice: selectedTags.join(', '),
        company_name: companyName.trim(),
        support_email: supportEmail.trim(),
      }),
    })
    setIsSavingProfile(false)
    setStep(2)
  }

  async function handleConnectStripe() {
    setIsConnecting(true)
    setStripeError(null)
    const res = await fetch('/api/stripe/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restrictedKey: stripeKey }),
    })
    if (!res.ok) {
      const data: unknown = await res.json()
      const p =
        typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
      setStripeError(
        typeof p.error === 'string' ? p.error : 'Connection failed. Please try again.',
      )
      setIsConnecting(false)
      return
    }
    setStripeConnected(true)
    setIsConnecting(false)
  }

  async function handleComplete(widgetInstalled: boolean) {
    setIsCompleting(true)
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgetInstalled }),
    })
    router.push('/dashboard')
  }

  async function copySnippet(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const scriptTag = appKey
    ? `<script src="${appUrl}/api/widget?key=${appKey}" async></script>`
    : 'Generating key…'
  const cancelUrl = appKey ? `${appUrl}/cancel/${appKey}` : 'Loading…'
  const hmacSnippet = `const crypto = require('crypto')
const authHash = crypto
  .createHmac('sha256', process.env.APP_SECRET)
  .update(stripeCustomerId)
  .digest('hex')`
  const initSnippet = `window.unchurnly.init('show', {
  customerId: stripeCustomerId,
  authHash: authHash
})`

  const step1Valid =
    companyName.trim().length > 0 && supportEmail.trim().length > 0 && selectedTags.length > 0

  function CodeBlock({ code, copyId }: { code: string; copyId: string }) {
    return (
      <div className="relative">
        <pre className="rounded-md bg-popover p-4 text-sm font-mono text-foreground overflow-x-auto pr-16">
          {code}
        </pre>
        <button
          onClick={() => copySnippet(code, copyId)}
          className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied === copyId ? (
            <>
              <Check className="h-3 w-3 text-emerald" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-16 px-4">
      {/* Wordmark */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
          U
        </div>
        <span className="text-foreground font-semibold text-lg">Unchurnly</span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map((n) => (
          <div
            key={n}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              n <= step ? 'bg-emerald' : 'bg-border'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Step {step} of 3</span>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-lg">

        {/* ── STEP 1 ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Set up your brand profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                This helps us write recovery emails that sound like you.
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g., Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Support Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                Support Email
              </label>
              <input
                type="email"
                placeholder="e.g., support@acme.com"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Used as the reply-to address on recovery emails so customers can reach you directly.
              </p>
            </div>

            {/* Business Model */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Business Model
              </p>
              <div className="flex gap-2">
                {(['B2B', 'B2C', 'Both'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModel(m)}
                    className={`px-5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedModel === m
                        ? 'bg-emerald text-background border-emerald'
                        : 'border-border text-muted-foreground hover:border-emerald/50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Voice */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Brand Voice
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Pick 1 or 2 that best describe your product&apos;s tone.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_TAGS.map(({ emoji, label }) => {
                  const tag = `${emoji} ${label}`
                  const selected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2.5 rounded-lg text-sm transition-colors text-left w-full border ${
                        selected
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'border-border text-muted-foreground hover:border-emerald/30'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!step1Valid || isSavingProfile}
              className="w-full px-4 py-2.5 bg-emerald text-background text-sm font-medium rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {isSavingProfile ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Connect Stripe to unlock your recovery engine
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Unchurnly reads your subscription data to personalize every recovery email and
                calculate your savings potential.
              </p>
            </div>

            {stripeConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-emerald shrink-0" />
                  <div>
                    <p className="font-medium text-emerald text-sm">Stripe connected</p>
                    <p className="text-xs text-muted-foreground">
                      Your subscription data is now syncing.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full px-4 py-2.5 bg-emerald text-background text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
                >
                  Continue →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1.5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">How to create a restricted key:</p>
                  <p>Stripe Dashboard → Developers → API Keys → Create restricted key</p>
                  <p className="text-xs text-muted-foreground/70">
                    Permissions: Customers (read), Subscriptions (write), Invoices (read), Webhook
                    endpoints (write), Coupons (write)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Restricted API Key
                  </label>
                  <input
                    type="password"
                    placeholder="rk_live_..."
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    autoComplete="off"
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {stripeError && <p className="text-sm text-destructive">{stripeError}</p>}

                <button
                  onClick={handleConnectStripe}
                  disabled={isConnecting || !stripeKey.trim()}
                  className="w-full px-4 py-2.5 bg-emerald text-background text-sm font-medium rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                  {isConnecting ? 'Validating…' : 'Connect Stripe →'}
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                >
                  Skip for now
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground py-0.5 transition-colors text-left"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────── */}
        {step === 3 && (
          <>
            {/* Sub-step: choose */}
            {step3Sub === 'choose' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    How do your customers cancel their subscription?
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    This helps us show you the right setup.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setStep3Sub('widget')}
                    className="w-full border border-border rounded-lg p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary/40 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        They click Cancel in my app
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You have a billing or account page with a Cancel button you control.
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>

                  <button
                    onClick={() => setStep3Sub('nocode')}
                    className="w-full border border-border rounded-lg p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary/40 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        I send them a link / I use Stripe&apos;s portal
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You don&apos;t have your own cancel button — you redirect to Stripe or share a link.
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Sub-step: widget (3.1a) */}
            {step3Sub === 'widget' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Add the widget to your app</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Two copy-paste steps. Takes under 2 minutes.
                  </p>
                </div>

                {/* Connection status badge */}
                {widgetConnected ? (
                  <div className="flex items-center gap-2 bg-emerald/10 border border-emerald/30 rounded-lg px-4 py-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald shrink-0" />
                    <span className="text-sm font-medium text-emerald">
                      Widget detected — your site is connected!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald/5 border border-emerald/20 rounded-lg px-4 py-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald motion-safe:animate-pulse shrink-0" />
                    <span className="text-sm text-emerald">Waiting for widget signal…</span>
                  </div>
                )}

                {/* Step 1 */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    1 — Add this script to your HTML &lt;head&gt;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paste this once into your app&apos;s HTML head. In Next.js, add it to{' '}
                    <code className="font-mono">app/layout.tsx</code>. In React, add it to{' '}
                    <code className="font-mono">public/index.html</code>.
                  </p>
                  <CodeBlock code={scriptTag} copyId="script" />
                </div>

                {/* Step 2 */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    2 — Trigger the widget on your Cancel button
                  </p>
                  <p className="text-xs text-muted-foreground">
                    On your Cancel button&apos;s click handler, call this. Replace{' '}
                    <code className="font-mono">stripeCustomerId</code> with the actual Stripe
                    customer ID of the logged-in user.
                  </p>
                  <CodeBlock code={initSnippet} copyId="init" />
                </div>

                {/* HMAC collapsible */}
                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => setHmacExpanded((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {hmacExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Hide HMAC verification
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Want extra security? Enable HMAC verification
                      </>
                    )}
                  </button>
                  {hmacExpanded && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        HMAC prevents customers from triggering the widget for other accounts.
                        Enable it in Cancel Flows → Settings after setup.
                      </p>
                      <CodeBlock code={hmacSnippet} copyId="hmac" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handleComplete(true)}
                    disabled={isCompleting}
                    className="w-full px-4 py-2.5 bg-emerald text-background text-sm font-medium rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
                  >
                    {isCompleting ? 'Setting up…' : "I've added the widget →"}
                  </button>
                  <button
                    onClick={() => handleComplete(false)}
                    disabled={isCompleting}
                    className="w-full text-sm text-muted-foreground hover:text-foreground py-1 transition-colors disabled:opacity-50"
                  >
                    I&apos;ll do this later →
                  </button>
                  <button
                    onClick={() => setStep3Sub('choose')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Sub-step: nocode (3.1b) */}
            {step3Sub === 'nocode' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Choose your setup method</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    No code required for either option.
                  </p>
                </div>

                {/* Option 1 — Stripe portal */}
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Using Stripe&apos;s hosted billing portal?
                  </p>
                  <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                    <li>Go to Stripe Dashboard → Settings → Billing → Customer portal</li>
                    <li>Under Cancellations, enable &quot;Redirect customers to a URL&quot;</li>
                    <li>Paste this URL:</li>
                  </ol>
                  <CodeBlock code={cancelUrl} copyId="cancelUrl" />
                  <p className="text-xs text-muted-foreground">
                    When customers click Cancel in Stripe&apos;s portal, they&apos;ll be redirected
                    to your Unchurnly cancel flow automatically.
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                {/* Option 2 — Share a link */}
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Share a cancel link</p>
                  <p className="text-xs text-muted-foreground">
                    Paste it in emails, help docs, or any no-code tool. Customers verify their
                    email to access the flow.
                  </p>
                  <CodeBlock code={cancelUrl} copyId="cancelUrl2" />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handleComplete(false)}
                    disabled={isCompleting}
                    className="w-full px-4 py-2.5 bg-emerald text-background text-sm font-medium rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
                  >
                    {isCompleting ? 'Setting up…' : "I'm all set →"}
                  </button>
                  <button
                    onClick={() => setStep3Sub('choose')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
