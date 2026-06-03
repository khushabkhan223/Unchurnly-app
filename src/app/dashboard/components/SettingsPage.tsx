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
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure your Stripe connection and widget</p>
      </div>

      {/* Stripe Connection */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-200">Stripe Connection</p>
        </div>
        <div className="px-6 py-5">
          {state === 'connected' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-zinc-200">Connected</span>
              </div>
              <p className="text-xs text-zinc-500">
                Account: <span className="font-mono text-zinc-400">{connection?.stripe_account_id ?? '—'}</span>
              </p>
              {connection?.webhook_configured_at ? (
                <p className="text-xs text-zinc-500">
                  Webhook:{' '}
                  <span className="text-green-500 font-medium">configured</span>
                </p>
              ) : (
                <p className="text-xs text-zinc-500">
                  Webhook:{' '}
                  <span className="text-yellow-500 font-medium">not configured</span>
                </p>
              )}
            </div>
          )}

          {state === 'token_error' && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                <p className="text-sm font-medium text-yellow-400">Stripe key may be invalid</p>
              </div>
              <p className="text-xs text-zinc-400">
                Your Stripe key may have been revoked or expired. Re-enter your restricted key to
                restore Unchurnly.
              </p>
              <Link
                href="/dashboard/connect"
                className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition-colors border border-yellow-500/20"
              >
                Re-authorize →
              </Link>
            </div>
          )}

          {state === 'not_connected' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-zinc-300">Not connected</span>
              </div>
              <Link
                href="/dashboard/connect"
                className="inline-block px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors"
              >
                Connect Stripe →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Widget Setup */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-200">Widget Setup</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {!appKey ? (
            <div>
              <p className="text-sm text-zinc-400 mb-3">
                Generate an API key to embed the cancel flow widget in your app.
              </p>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {generating ? 'Generating…' : 'Generate API Keys'}
              </button>
              {genError && <p className="text-sm text-red-400 mt-2">{genError}</p>}
            </div>
          ) : null}

          {generatedKey && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
              <p className="text-xs font-medium text-yellow-400">
                Save your secret — it won't be shown again
              </p>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">App Key</p>
                <code className="text-xs font-mono text-zinc-300 break-all">{generatedKey.appKey}</code>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">App Secret (save this now)</p>
                <code className="text-xs font-mono text-yellow-300 break-all">{generatedKey.appSecret}</code>
              </div>
            </div>
          )}

          {appKey && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Add to your HTML {'<head>'}:</p>
                <div className="relative">
                  <pre className="text-xs font-mono text-zinc-300 bg-zinc-800 rounded-lg p-4 overflow-x-auto pr-12">
                    {scriptTag}
                  </pre>
                  <button
                    onClick={copyScript}
                    className="absolute top-3 right-3 p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
                    title="Copy"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">Generate HMAC in your backend:</p>
                <pre className="text-xs font-mono text-zinc-300 bg-zinc-800 rounded-lg p-4 overflow-x-auto">
                  {hmacSnippet}
                </pre>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">On cancel button click:</p>
                <pre className="text-xs font-mono text-zinc-300 bg-zinc-800 rounded-lg p-4 overflow-x-auto">
                  {`window.unchurnly.init('show', {\n  customerId: stripeCustomerId,\n  authHash: authHash\n})`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Flow */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium text-zinc-200 mb-2">Cancel Flow</p>
        <p className="text-sm text-zinc-400 mb-3">
          The widget shows a retention modal when customers try to cancel. Configure which offers to
          show them.
        </p>
        <Link
          href="/dashboard/retention"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Configure offers →
        </Link>
      </div>

      {/* Account / Danger Zone */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium text-zinc-200 mb-3">Account</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-zinc-600 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
