'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Copy, Check, AlertTriangle, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

type Connection = {
  stripe_account_id: string | null
  connected_at: string
  webhook_configured_at: string | null
  stripe_baseline_mrr: number
} | null

type GeneratedKey = { appKey: string; appSecret: string }
type InstallPath = 'choose' | 'widget' | 'nocode'

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
  const router = useRouter()

  const [appKey, setAppKey] = useState(initialAppKey)
  const [confirming, setConfirming] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [disconnectError, setDisconnectError] = useState<string | null>(null)
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [installPath, setInstallPath] = useState<InstallPath>('choose')
  const [hmacExpanded, setHmacExpanded] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const scriptTag = appKey
    ? `<script src="${appUrl}/api/widget?key=${appKey}" async></script>`
    : ''
  const cancelUrl = appKey ? `${appUrl}/cancel/${appKey}` : ''
  const initSnippet = `window.unchurnly.init('show', {\n  customerId: stripeCustomerId,\n  authHash: authHash\n})`
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
    const payload =
      typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
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

  async function handleDisconnect() {
    setDisconnecting(true)
    setDisconnectError(null)
    try {
      const res = await fetch('/api/stripe/disconnect', { method: 'POST' })
      if (!res.ok) {
        const data: unknown = await res.json()
        const p = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
        setDisconnectError(typeof p.error === 'string' ? p.error : 'Failed to disconnect.')
        setDisconnecting(false)
        return
      }
      router.refresh()
    } catch {
      setDisconnectError('Network error. Please try again.')
      setDisconnecting(false)
    }
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

  function CodeBlock({ code, copyId }: { code: string; copyId: string }) {
    return (
      <div className="relative">
        <pre className="overflow-x-auto rounded-md bg-popover p-4 pr-16 text-sm font-mono text-foreground">
          {code}
        </pre>
        <button
          onClick={() => copySnippet(code, copyId)}
          className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
    <div className="space-y-7">
      {/* ── Stripe Connection (unchanged) ─────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Stripe Connection</h2>
        </div>
        <div className="px-5 py-4">
          {state === 'connected' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald" />
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
                  Webhook: <span className="font-medium text-emerald">configured</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Webhook: <span className="font-medium text-amber-400">not configured</span>
                </p>
              )}
              {!confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="text-xs text-destructive transition-opacity hover:opacity-70"
                >
                  Disconnect Stripe
                </button>
              ) : (
                <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    Are you sure? This will stop all dunning and cancel flow automation until you reconnect.
                  </p>
                  {disconnectError && (
                    <p className="text-xs text-destructive">{disconnectError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {disconnecting ? 'Disconnecting…' : 'Yes, disconnect'}
                    </button>
                    <button
                      onClick={() => { setConfirming(false); setDisconnectError(null) }}
                      disabled={disconnecting}
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {state === 'token_error' && (
            <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm font-medium text-amber-300">Stripe key may be invalid</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Stripe key may have been revoked or expired. Re-enter your restricted key to
                restore Unchurnly.
              </p>
              <Link
                href="/dashboard/connect"
                className="mt-2 inline-block rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-opacity hover:opacity-80"
              >
                Re-authorize →
              </Link>
            </div>
          )}

          {state === 'not_connected' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
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

      {/* ── Cancel Flow Setup ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Cancel Flow Setup</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choose the integration path that fits your setup.
          </p>
        </div>

        <div className="px-5 py-4">
          {/* ── Choose path ─────────────────────────────────── */}
          {installPath === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setInstallPath('widget')}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary/40"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    They click Cancel in my app
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    You have a billing or account page with a Cancel button you control.
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              <button
                onClick={() => setInstallPath('nocode')}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary/40"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    I send them a link / I use Stripe&apos;s portal
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    You don&apos;t have your own cancel button — you redirect to Stripe or share a
                    link.
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* ── Widget path ─────────────────────────────────── */}
          {installPath === 'widget' && (
            <div className="space-y-7">
              <button
                onClick={() => setInstallPath('choose')}
                className="text-sm text-foreground transition-opacity hover:opacity-70"
              >
                ← Choose a different method
              </button>

              {generatedKey && (
                <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs font-medium text-amber-300">
                    Save your secret — it won&apos;t be shown again
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">App Key</p>
                    <code className="break-all text-xs font-mono text-foreground">
                      {generatedKey.appKey}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">App Secret (save this now)</p>
                    <code className="break-all text-xs font-mono text-amber-300">
                      {generatedKey.appSecret}
                    </code>
                  </div>
                </div>
              )}

              {!appKey ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generate an API key to get started.
                  </p>
                  <button
                    onClick={handleGenerateKey}
                    disabled={generating}
                    className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {generating ? 'Generating…' : 'Generate API Keys'}
                  </button>
                  {genError && <p className="text-sm text-destructive">{genError}</p>}
                </div>
              ) : (
                <div className="space-y-7">
                  {/* Step 1 */}
                  <div className="space-y-3">
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
                  <div className="space-y-3">
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
                  <div className="border-t border-border pt-6">
                    <button
                      onClick={() => setHmacExpanded((v) => !v)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {hmacExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Hide HMAC verification
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Want extra security? Enable HMAC verification →
                        </>
                      )}
                    </button>
                    {hmacExpanded && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          HMAC prevents customers from triggering the widget for other accounts.
                          Enable it in Cancel Flows → Settings after setup.
                        </p>
                        <CodeBlock code={hmacSnippet} copyId="hmac" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── No-code path ─────────────────────────────────── */}
          {installPath === 'nocode' && (
            <div className="space-y-7">
              <button
                onClick={() => setInstallPath('choose')}
                className="text-sm text-foreground transition-opacity hover:opacity-70"
              >
                ← Choose a different method
              </button>

              {!appKey ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generate an API key to get your cancel URL.
                  </p>
                  <button
                    onClick={handleGenerateKey}
                    disabled={generating}
                    className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {generating ? 'Generating…' : 'Generate API Keys'}
                  </button>
                  {genError && <p className="text-sm text-destructive">{genError}</p>}
                </div>
              ) : (
                <div className="space-y-7">
                  {/* Option 1 — Stripe portal */}
                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">
                      Using Stripe&apos;s hosted billing portal?
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                      <li>Go to Stripe Dashboard → Settings → Billing → Customer portal</li>
                      <li>Under Cancellations, enable &quot;Redirect customers to a URL&quot;</li>
                      <li>Paste this URL:</li>
                    </ol>
                    <CodeBlock code={cancelUrl} copyId="cancelUrl" />
                    <p className="text-xs text-muted-foreground">
                      When customers click Cancel in Stripe&apos;s portal, they&apos;ll be
                      redirected to your Unchurnly cancel flow automatically.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  {/* Option 2 — Share a link */}
                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Share a cancel link</p>
                    <p className="text-xs text-muted-foreground">
                      Paste it in emails, help docs, or any no-code tool. Customers verify their
                      email to access the flow.
                    </p>
                    <CodeBlock code={cancelUrl} copyId="cancelUrl2" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Cancel Flow ────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="px-5 py-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Cancel Flow</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            The widget shows a retention modal when customers try to cancel. Configure which offers
            to show them.
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
