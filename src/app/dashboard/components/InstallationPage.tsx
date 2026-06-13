'use client'

import { useState } from 'react'
import Link from 'next/link'
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

export default function InstallationPage({
  connection,
  appKey: initialAppKey,
}: {
  connection: Connection
  appKey: string | null
}) {
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
      // clipboard unavailable
    }
  }

  return (
    <div className="space-y-5">
      {/* Stripe Connection */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Stripe Connection</h2>
        </div>
        <div className="px-5 py-4">
          {state === 'connected' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald shrink-0" />
                <span className="text-sm font-medium text-emerald-400">Connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Account:{' '}
                <span className="font-mono text-foreground">
                  {connection?.stripe_account_id ?? '—'}
                </span>
              </p>
              {connection?.webhook_configured_at ? (
                <p className="text-xs text-muted-foreground">
                  Webhook: <span className="text-emerald font-medium">configured</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Webhook: <span className="text-amber-400 font-medium">not configured</span>
                </p>
              )}
            </div>
          )}

          {state === 'token_error' && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm font-medium text-amber-300">Stripe key may be invalid</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Stripe key may have been revoked or expired. Re-enter your restricted key to
                restore Unchurnly.
              </p>
              <Link
                href="/dashboard/connect"
                className="inline-block mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-opacity hover:opacity-80"
              >
                Re-authorize →
              </Link>
            </div>
          )}

          {state === 'not_connected' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                <span className="text-sm font-medium text-destructive">Not connected</span>
              </div>
              <Link
                href="/dashboard/connect"
                className="inline-block rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Connect Stripe →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Widget Setup */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Widget Setup</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          {!appKey ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate an API key to embed the cancel flow widget in your app.
              </p>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {generating ? 'Generating…' : 'Generate API Keys'}
              </button>
              {genError && <p className="text-sm text-destructive mt-2">{genError}</p>}
            </div>
          ) : null}

          {generatedKey && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 space-y-2">
              <p className="text-xs font-medium text-amber-300">
                Save your secret — it won&apos;t be shown again
              </p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">App Key</p>
                <code className="text-xs font-mono text-foreground break-all">{generatedKey.appKey}</code>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">App Secret (save this now)</p>
                <code className="text-xs font-mono text-amber-300 break-all">{generatedKey.appSecret}</code>
              </div>
            </div>
          )}

          {appKey && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Add to your HTML {'<head>'}:</p>
                <div className="relative">
                  <pre className="rounded-md bg-popover p-4 text-sm font-mono text-foreground overflow-x-auto pr-14">
                    {scriptTag}
                  </pre>
                  <button
                    onClick={copyScript}
                    className="absolute top-3 right-3 flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/80"
                    title="Copy"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
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
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Generate HMAC in your backend:</p>
                <pre className="rounded-md bg-popover p-4 text-sm font-mono text-foreground overflow-x-auto">
                  {hmacSnippet}
                </pre>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">On cancel button click:</p>
                <pre className="rounded-md bg-popover p-4 text-sm font-mono text-foreground overflow-x-auto">
                  {`window.unchurnly.init('show', {\n  customerId: stripeCustomerId,\n  authHash: authHash\n})`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Flow */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">Cancel Flow</h2>
          <p className="text-sm text-muted-foreground mb-3">
            The widget shows a retention modal when customers try to cancel. Configure which offers to
            show them.
          </p>
          <Link
            href="/dashboard/retention"
            className="text-sm font-medium text-emerald transition-opacity hover:opacity-80"
          >
            Configure offers →
          </Link>
        </div>
      </div>
    </div>
  )
}
