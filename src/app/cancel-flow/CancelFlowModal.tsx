'use client'

import { useState } from 'react'

type Config = {
  pause_enabled: boolean
  discount_enabled: boolean
  discount_percent: number
  downgrade_enabled: boolean
  stripe_coupon_id: string | null
}

type Props = {
  appKey: string
  customerId: string
  authHash: string
  subscriptionId: string
  customerName: string
  planName: string
  amount: number
  currency: string
  config: Config
  hasActiveOffer: boolean
}

type Step = 'reason' | 'offer' | 'done'
type Reason = 'too_expensive' | 'not_using' | 'better_alternative' | 'technical_issues' | 'taking_a_break'
type OfferType = 'pause' | 'discount' | 'support' | null
type Action = 'pause' | 'discount' | 'cancel'

function getOfferType(reason: Reason, config: Config): OfferType {
  if (reason === 'too_expensive') return config.discount_enabled ? 'discount' : null
  if (reason === 'not_using') return config.pause_enabled ? 'pause' : null
  if (reason === 'taking_a_break') return config.pause_enabled ? 'pause' : null
  if (reason === 'technical_issues') return 'support'
  if (reason === 'better_alternative') {
    if (config.discount_enabled) return 'discount'
    if (config.pause_enabled) return 'pause'
    return null
  }
  return null
}

export default function CancelFlowModal({
  appKey,
  customerId,
  authHash,
  subscriptionId,
  customerName,
  planName,
  config,
  hasActiveOffer,
}: Props) {
  const [step, setStep] = useState<Step>('reason')
  const [offerType, setOfferType] = useState<OfferType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  function close() {
    window.parent.postMessage('unchurnly:close', '*')
  }

  function selectReason(reason: Reason) {
    const offer = getOfferType(reason, config)
    setOfferType(offer)
    setStep('offer')
  }

  async function handleAction(action: Action) {
    setIsLoading(true)
    setError(null)

    const res = await fetch('/api/cancel-flow/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appKey, customerId, authHash, subscriptionId, action }),
    })

    const data: unknown = await res.json()
    const payload = data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : {}

    if (!res.ok) {
      setError(typeof payload.error === 'string' ? payload.error : 'Something went wrong.')
      setIsLoading(false)
      return
    }

    setDoneMessage(typeof payload.message === 'string' ? payload.message : 'Done.')
    setStep('done')
    setIsLoading(false)
  }

  const containerStyle: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    padding: '24px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxSizing: 'border-box',
    overflowY: 'auto',
  }

  const btnBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'left',
    transition: 'background 0.15s',
  }

  const btnOutline: React.CSSProperties = {
    ...btnBase,
    background: '#fff',
    border: '1px solid #e5e7eb',
    color: '#111827',
  }

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: '#2563eb',
    border: 'none',
    color: '#fff',
    textAlign: 'center',
  }

  const btnDestructive: React.CSSProperties = {
    ...btnBase,
    background: 'none',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    textAlign: 'center',
  }

  return (
    <div style={containerStyle}>
      {/* Close button */}
      <button
        onClick={close}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: '#9ca3af',
          lineHeight: 1,
        }}
      >
        ×
      </button>

      {step === 'reason' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '18px', color: '#111827' }}>
            Before you go, {customerName}…
          </p>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '14px' }}>
            Why are you thinking of cancelling?
          </p>
          {(
            [
              ['too_expensive', "It's too expensive"],
              ['not_using', "I'm not using it enough"],
              ['better_alternative', 'I found a better alternative'],
              ['technical_issues', "I'm having technical issues"],
              ['taking_a_break', 'Just taking a break'],
            ] as [Reason, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => selectReason(value)}
              style={btnOutline}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => handleAction('cancel')}
            disabled={isLoading}
            style={{ ...btnDestructive, marginTop: '8px', textAlign: 'center' }}
          >
            Just cancel
          </button>
          {error && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0' }}>
              {error}
            </p>
          )}
        </div>
      )}

      {step === 'offer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {hasActiveOffer && (offerType === 'pause' || offerType === 'discount') ? (
            <>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                A retention offer was already applied to your account recently.
              </p>
              <button
                onClick={() => handleAction('cancel')}
                disabled={isLoading}
                style={btnDestructive}
              >
                {isLoading ? 'Processing…' : 'Cancel my subscription'}
              </button>
            </>
          ) : null}
          {!hasActiveOffer && offerType === 'pause' && (
            <>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '17px', color: '#111827' }}>
                Take a break instead
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Pause your {planName} subscription for 1 month. Your account stays intact and
                resumes automatically — no action needed.
              </p>
              <button
                onClick={() => handleAction('pause')}
                disabled={isLoading}
                style={btnPrimary}
              >
                {isLoading ? 'Processing…' : 'Pause for 1 month'}
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={isLoading}
                style={btnDestructive}
              >
                No thanks, cancel my subscription
              </button>
            </>
          )}

          {!hasActiveOffer && offerType === 'discount' && (
            <>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '17px', color: '#111827' }}>
                How about {config.discount_percent}% off?
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Stay on {planName} at {config.discount_percent}% off for the next 3 months.
                Your discount applies to your next billing cycle automatically.
              </p>
              <button
                onClick={() => handleAction('discount')}
                disabled={isLoading}
                style={btnPrimary}
              >
                {isLoading ? 'Processing…' : `Get ${config.discount_percent}% off`}
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={isLoading}
                style={btnDestructive}
              >
                No thanks, cancel my subscription
              </button>
            </>
          )}

          {offerType === 'support' && (
            <>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '17px', color: '#111827' }}>
                Let us help fix this
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Having technical issues? Our support team can help resolve this quickly.
                Please reach out and we'll get it sorted — most issues are fixed within 24 hours.
              </p>
              <button
                onClick={close}
                style={btnPrimary}
              >
                Contact support
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={isLoading}
                style={btnDestructive}
              >
                {isLoading ? 'Processing…' : 'Cancel my subscription anyway'}
              </button>
            </>
          )}

          {offerType === null && (
            <>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '17px', color: '#111827' }}>
                We're sorry to see you go
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                We'll cancel your {planName} subscription. You'll keep access until the end
                of your current billing period.
              </p>
              <button
                onClick={() => handleAction('cancel')}
                disabled={isLoading}
                style={btnDestructive}
              >
                {isLoading ? 'Processing…' : 'Cancel my subscription'}
              </button>
            </>
          )}

          {error && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0' }}>
              {error}
            </p>
          )}
        </div>
      )}

      {step === 'done' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 600, fontSize: '17px', color: '#111827', margin: 0 }}>
            You're all set
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{doneMessage}</p>
          <button onClick={close} style={{ ...btnOutline, width: 'auto', padding: '8px 24px' }}>
            Close
          </button>
        </div>
      )}
    </div>
  )
}
