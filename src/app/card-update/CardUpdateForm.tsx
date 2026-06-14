'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

type CardUpdateFormProps = {
  clientSecret: string
  publishableKey: string
  customerId: string
  userId: string
  setupIntentId: string
}

type CheckoutFormProps = {
  customerId: string
  userId: string
  setupIntentId: string
}

function CheckoutForm({ customerId, userId, setupIntentId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setError(null)

    const { error: setupError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/card-update/success',
      },
      redirect: 'if_required',
    })

    if (setupError) {
      setError(setupError.message ?? 'Something went wrong. Please try again.')
      setIsLoading(false)
      return
    }

    await fetch('/api/card-update/set-default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setupIntentId, customerId, userId }),
    })

    router.push('/card-update/success')
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <p role="alert" className="text-sm text-red-500 mt-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading || !stripe}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-4 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing…' : 'Update payment method'}
      </button>
    </form>
  )
}

export default function CardUpdateForm({
  clientSecret,
  publishableKey,
  customerId,
  userId,
  setupIntentId,
}: CardUpdateFormProps) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Update your payment method</h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your new card details to keep your subscription active.
      </p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          customerId={customerId}
          userId={userId}
          setupIntentId={setupIntentId}
        />
      </Elements>
    </div>
  )
}
