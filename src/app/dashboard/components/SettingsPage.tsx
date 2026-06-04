'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Check, AlertTriangle } from 'lucide-react'

type Connection = {
  stripe_account_id: string | null
  connected_at: string
  webhook_configured_at: string | null
  stripe_baseline_mrr: number
} | null

type GeneratedKey = { appKey: string; appSecret: string }

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function stripeState(connection: Connection): 'not_connected' | 'token_error' | 'connected' {
  if (!connection) return 'not_connected'
  const connectedLongAgo = Date.now() - new Date(connection.connected_at).getTime() > SEVEN_DAYS_MS
  if (
    connection.webhook_configured_at !== null &&
    connection.stripe_baseline_mrr === 0 &&
    connectedLongAgo
  ) {
    return 'token_error'
  }
  return 'connected'
}

export default function SettingsPage({
  connection,
  appKey: initialAppKey,
}: {
  connection: Connection
  appKey: string | null
}) {
  const router = useRouter()
  const state = stripeState(connection)

  const [appKey, setAppKey] = useState(initialAppKey)
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const scriptTag = appKey ? `<script src="${appUrl}/api/widget?key=${appKey}" async></script>` : ''
  const hmacSnippet = `const crypto = require('crypto')
const authHash = crypto
  .createHmac('sha256', process.env.APP_SECRET)
  .update(stripeCustomerId)
  .digest('hex')`

  async function handleGenerateKey() {
    setGenerating(true)
    setGenError(null)
    const res = await fetch('/api/app-keys/generate', { method: 'POST' })
    const data: unknown = await res.json()
    const payload = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
    if (!res.ok) {
      setGenError(typeof payload.error === 'string' ? payload.error : 'Failed to generate')
      setGenerating(false)
      return
    }
    if (typeof payload.appKey === 'string' && typeof payload.appSecret === 'string') {
      setGeneratedKey({ appKey: payload.appKey, appSecret: payload.appSecret })
      setAppKey(payload.appKey)
    }
    setGenerating(false)
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(scriptTag)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your Stripe connection and widget</p>
      </div>

      {/* Stripe Connection */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Stripe Connection</h2>
        </div>
        <div className="px-6 py-5">
          {state === 'connected' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-emerald-800">Connected</span>
              </div>
              <p className="text-xs text-slate-500">
                Account:{' '}
                <span className="font-mono text-slate-700">
                  {connection?.stripe_account_id ?? '—'}
                </span>
              </p>
              {connection?.webhook_configured_at ? (
                <p className="text-xs text-slate-500">
                  Webhook: <span className="text-emerald-600 font-medium">configured</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Webhook: <span className="text-amber-600 font-medium">not configured</span>
                </p>
              )}
            </div>
          )}

          {state === 'token_error' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm font-medium text-amber-800">Stripe key may be invalid</p>
              </div>
              <p className="text-xs text-slate-600">
                Your Stripe key may have been revoked or expired. Re-enter your restricted key to
                restore Unchurnly.
              </p>
              <Link
                href="/dashboard/connect"
                className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors border border-amber-200"
              >
                Re-authorize →
              </Link>
            </div>
          )}

          {state === 'not_connected' && (
            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="text-sm font-medium text-rose-800">Not connected</span>
              </div>
              <Link
                href="/dashboard/connect"
                className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Connect Stripe →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Widget Setup */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Widget Setup</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {!appKey ? (
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Generate an API key to embed the cancel flow widget in your app.
              </p>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {generating ? 'Generating…' : 'Generate API Keys'}
              </button>
              {genError && <p className="text-sm text-rose-500 mt-2">{genError}</p>}
            </div>
          ) : null}

          {generatedKey && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
              <p className="text-xs font-medium text-amber-800">
                Save your secret — it won&apos;t be shown again
              </p>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">App Key</p>
                <code className="text-xs font-mono text-slate-700 break-all">{generatedKey.appKey}</code>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">App Secret (save this now)</p>
                <code className="text-xs font-mono text-amber-800 break-all">{generatedKey.appSecret}</code>
              </div>
            </div>
          )}

          {appKey && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Add to your HTML {'<head>'}:</p>
                <div className="relative">
                  <pre className="text-sm font-mono text-slate-100 bg-slate-950 rounded-xl p-4 overflow-x-auto pr-14">
                    {scriptTag}
                  </pre>
                  <button
                    onClick={copyScript}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md transition-colors"
                    title="Copy"
                  >
                    {copied ? (
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
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Generate HMAC in your backend:</p>
                <pre className="text-sm font-mono text-slate-100 bg-slate-950 rounded-xl p-4 overflow-x-auto">
                  {hmacSnippet}
                </pre>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">On cancel button click:</p>
                <pre className="text-sm font-mono text-slate-100 bg-slate-950 rounded-xl p-4 overflow-x-auto">
                  {`window.unchurnly.init('show', {\n  customerId: stripeCustomerId,\n  authHash: authHash\n})`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Flow */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Cancel Flow</h2>
        <p className="text-sm text-slate-500 mb-3">
          The widget shows a retention modal when customers try to cancel. Configure which offers to
          show them.
        </p>
        <Link
          href="/dashboard/retention"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Configure offers →
        </Link>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Account</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
