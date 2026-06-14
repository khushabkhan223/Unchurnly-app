'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative px-8 py-8">
      <button
        onClick={close}
        aria-label="Close"
        className="absolute top-4 right-4 bg-transparent border-none text-gray-400 hover:text-gray-600 cursor-pointer text-xl leading-none"
      >
        ×
      </button>

        {step === 'reason' && (
          <div className="flex flex-col w-full max-w-md">
            <p className="text-xl font-semibold text-gray-900 mb-1 m-0">
              Before you go, {customerName}…
            </p>
            <p className="text-sm text-gray-400 mb-6 m-0">
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
                className="w-full text-left px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all mt-2 cursor-pointer flex justify-between items-center"
              >
                {label}
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
            <button
              onClick={() => handleAction('cancel')}
              disabled={isLoading}
              className="mt-8 text-xs text-gray-400 hover:text-gray-500 underline-offset-2 hover:underline bg-transparent border-none cursor-pointer p-0 self-start"
            >
              Just cancel
            </button>
            {error && (
              <p role="alert" className="text-red-600 text-xs mt-2 m-0">
                {error}
              </p>
            )}
          </div>
        )}

        {step === 'offer' && (
          <div className="flex flex-col w-full max-w-md">
            {hasActiveOffer && (offerType === 'pause' || offerType === 'discount') ? (
              <>
                <p className="text-sm text-gray-500 m-0">
                  A retention offer was already applied to your account recently.
                </p>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isLoading}
                  className="text-sm text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline mt-3 block text-center bg-transparent border-none cursor-pointer w-full p-0"
                >
                  {isLoading ? 'Processing…' : 'Cancel my subscription'}
                </button>
              </>
            ) : null}

            {!hasActiveOffer && offerType === 'pause' && (
              <>
                <p className="text-xl font-semibold text-gray-900 mb-1 m-0">Take a break instead</p>
                <p className="text-sm text-gray-400 mt-1 m-0">
                  Pause your {planName} subscription for 1 month. Your account stays intact and
                  resumes automatically — no action needed.
                </p>
                <button
                  onClick={() => handleAction('pause')}
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-gray-800 transition-colors mt-4 cursor-pointer border-none"
                >
                  {isLoading ? 'Processing…' : 'Pause for 1 month'}
                </button>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isLoading}
                  className="text-sm text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline mt-3 block text-center bg-transparent border-none cursor-pointer w-full p-0"
                >
                  No thanks, cancel my subscription
                </button>
              </>
            )}

            {!hasActiveOffer && offerType === 'discount' && (
              <>
                <p className="text-xl font-semibold text-gray-900 mb-1 m-0">
                  How about {config.discount_percent}% off?
                </p>
                <p className="text-sm text-gray-400 mt-1 m-0">
                  Stay on {planName} at {config.discount_percent}% off for the next 3 months.
                  Your discount applies to your next billing cycle automatically.
                </p>
                <button
                  onClick={() => handleAction('discount')}
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-gray-800 transition-colors mt-4 cursor-pointer border-none"
                >
                  {isLoading ? 'Processing…' : `Get ${config.discount_percent}% off`}
                </button>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isLoading}
                  className="text-sm text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline mt-3 block text-center bg-transparent border-none cursor-pointer w-full p-0"
                >
                  No thanks, cancel my subscription
                </button>
              </>
            )}

            {offerType === 'support' && (
              <>
                <p className="text-xl font-semibold text-gray-900 mb-1 m-0">Let us help fix this</p>
                <p className="text-sm text-gray-400 mt-1 m-0">
                  Having technical issues? Our support team can help resolve this quickly.
                  Please reach out and we'll get it sorted — most issues are fixed within 24 hours.
                </p>
                <button
                  onClick={close}
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-gray-800 transition-colors mt-4 cursor-pointer border-none"
                >
                  Contact support
                </button>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isLoading}
                  className="text-sm text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline mt-3 block text-center bg-transparent border-none cursor-pointer w-full p-0"
                >
                  {isLoading ? 'Processing…' : 'Cancel my subscription anyway'}
                </button>
              </>
            )}

            {offerType === null && (
              <>
                <p className="text-xl font-semibold text-gray-900 mb-1 m-0">
                  We're sorry to see you go
                </p>
                <p className="text-sm text-gray-400 mt-1 m-0">
                  We'll cancel your {planName} subscription. You'll keep access until the end
                  of your current billing period.
                </p>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isLoading}
                  className="text-sm text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline mt-3 block text-center bg-transparent border-none cursor-pointer w-full p-0"
                >
                  {isLoading ? 'Processing…' : 'Cancel my subscription'}
                </button>
              </>
            )}

            {error && (
              <p role="alert" className="text-red-600 text-xs mt-2 m-0">
                {error}
              </p>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 text-center py-4 w-full max-w-md">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 m-0">You're all set</p>
            <p className="text-sm text-gray-400 m-0">{doneMessage}</p>
            <button
              onClick={close}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-gray-800 transition-colors mt-2 cursor-pointer border-none"
            >
              Close
            </button>
          </div>
        )}
    </div>
  )
}
