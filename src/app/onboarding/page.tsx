'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Copy, Check } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'

const VOICE_TAGS = [
  { emoji: '👔', label: 'Formal / Corporate' },
  { emoji: '⚡', label: 'Urgent / Direct' },
  { emoji: '🍿', label: 'Casual / Friendly' },
  { emoji: '🚀', label: 'Enthusiastic / Hype' },
  { emoji: '🔒', label: 'Clinical / Secure' },
  { emoji: '🛠️', label: 'Developer-to-Developer' },
]

type InstallTab = 'script' | 'hmac' | 'init'

const TAB_LABELS: Record<InstallTab, string> = {
  script: '① Script Tag',
  hmac: '② Auth Hash',
  init: '③ Trigger Widget',
}

const TAB_GUIDE: Record<InstallTab, { where: string; code: string }> = {
  script: {
    where:
      'Paste this once into the <head> of your app. In Next.js, add it to app/layout.tsx inside the <head> tag. In plain HTML, put it just before </head> in index.html. In React (CRA), use public/index.html. It loads asynchronously — zero impact on page speed.',
    code: '',
  },
  hmac: {
    where:
      'Run this on your server, never in the browser — it uses your secret APP_SECRET key. Place it in the route or function that renders your billing/account page, where you already have the customer\'s Stripe ID available. Embed the resulting authHash in your page (e.g. a hidden data attribute or server-rendered prop) so the frontend can read it.',
    code: `const crypto = require('crypto')
const authHash = crypto
  .createHmac('sha256', process.env.APP_SECRET)
  .update(stripeCustomerId)
  .digest('hex')`,
  },
  init: {
    where:
      'Call this in the click handler of your Cancel Plan or Downgrade button on the frontend. Pass the stripeCustomerId and the authHash you generated server-side. The widget opens as a fullscreen overlay — no redirect, no page change. Your customers stay on your app.',
    code: `window.unchurnly.init('show', {
  customerId: stripeCustomerId,
  authHash: authHash
})`,
  },
}

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
  const [appKey, setAppKey] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<InstallTab>('script')
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
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
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
        typeof p.error === 'string' ? p.error : 'Connection failed. Please try again.'
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

  const step1Valid = companyName.trim().length > 0 && supportEmail.trim().length > 0 && selectedTags.length > 0

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center pt-16 px-4">
      {/* Wordmark */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">U</span>
        </div>
        <span className="text-slate-900 font-semibold text-lg">Unchurnly</span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map((n) => (
          <div
            key={n}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              n <= step ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-slate-400">Step {step} of 3</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-lg">

        {/* ── STEP 1 ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Set up your brand profile</h1>
              <p className="text-sm text-slate-500 mt-1">
                This helps us write recovery emails that sound like you.
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g., Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
              />
            </div>

            {/* Support Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Support Email
              </label>
              <input
                type="email"
                placeholder="e.g., support@acme.com"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Used as the reply-to address on recovery emails so customers can reach you directly.
              </p>
            </div>

            {/* Business Model */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Business Model
              </p>
              <div className="flex gap-2">
                {(['B2B', 'B2C', 'Both'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModel(m)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedModel === m
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Voice */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Brand Voice
              </p>
              <p className="text-xs text-slate-500 mb-3">
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
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!step1Valid || isSavingProfile}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSavingProfile ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Connect Stripe to unlock your recovery engine
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Unchurnly reads your subscription data to personalize every recovery email and
                calculate your savings potential.
              </p>
            </div>

            {stripeConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-800 text-sm">Stripe connected</p>
                    <p className="text-xs text-emerald-600">
                      Your subscription data is now syncing.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Continue →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 space-y-1.5">
                  <p className="font-medium text-slate-700">How to create a restricted key:</p>
                  <p>Stripe Dashboard → Developers → API Keys → Create restricted key</p>
                  <p className="text-slate-400 text-xs">
                    Permissions: Customers (read), Subscriptions (write), Invoices (read), Webhook
                    endpoints (write), Coupons (write)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Restricted API Key
                  </label>
                  <input
                    type="password"
                    placeholder="rk_live_..."
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    autoComplete="off"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                  />
                </div>

                {stripeError && <p className="text-sm text-rose-500">{stripeError}</p>}

                <button
                  onClick={handleConnectStripe}
                  disabled={isConnecting || !stripeKey.trim()}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isConnecting ? 'Validating…' : 'Connect Stripe →'}
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 py-1 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Install the cancel flow widget
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Three copy-paste steps. Most founders finish in under 5 minutes.
              </p>
            </div>

            {/* Connection status badge */}
            <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border text-sm font-medium transition-colors ${
              widgetConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {widgetConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Status: ✅ Connection verified!</span>
                </>
              ) : (
                <>
                  <span className="w-4 h-4 shrink-0 flex items-center justify-center text-base leading-none">⏳</span>
                  <span>Status: Listening for your site&apos;s snippet…</span>
                </>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(Object.keys(TAB_LABELS) as InstallTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="space-y-3">
              {/* Guidance text */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {TAB_GUIDE[activeTab].where}
              </p>

              {/* Code block */}
              <div className="relative">
                <pre className="text-xs font-mono text-slate-100 bg-slate-950 rounded-xl p-4 overflow-x-auto pr-20 leading-relaxed">
                  {activeTab === 'script' ? scriptTag : TAB_GUIDE[activeTab].code}
                </pre>
                <button
                  onClick={() =>
                    copySnippet(
                      activeTab === 'script' ? scriptTag : TAB_GUIDE[activeTab].code,
                      activeTab
                    )
                  }
                  className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md transition-colors"
                >
                  {copied === activeTab ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tab navigation hints */}
              <div className="flex justify-between pt-1">
                <button
                  onClick={() => {
                    const tabs: InstallTab[] = ['script', 'hmac', 'init']
                    const i = tabs.indexOf(activeTab)
                    if (i > 0) setActiveTab(tabs[i - 1])
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-0"
                  disabled={activeTab === 'script'}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const tabs: InstallTab[] = ['script', 'hmac', 'init']
                    const i = tabs.indexOf(activeTab)
                    if (i < tabs.length - 1) setActiveTab(tabs[i + 1])
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-0"
                  disabled={activeTab === 'init'}
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => handleComplete(true)}
                disabled={isCompleting}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isCompleting ? 'Setting up…' : "I've installed it →"}
              </button>
              <button
                onClick={() => handleComplete(false)}
                disabled={isCompleting}
                className="w-full text-sm text-slate-400 hover:text-slate-600 py-1.5 transition-colors disabled:opacity-50"
              >
                I&apos;ll do this later →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
