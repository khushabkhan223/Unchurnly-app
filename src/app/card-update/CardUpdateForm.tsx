'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
        <p role="alert" className="text-sm text-destructive mt-3">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={isLoading || !stripe}
        className="w-full mt-4"
        size="lg"
      >
        {isLoading ? 'Processing…' : 'Update payment method'}
      </Button>
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Update your payment method</CardTitle>
        <CardDescription>
          Enter your new card details to keep your subscription active.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            customerId={customerId}
            userId={userId}
            setupIntentId={setupIntentId}
          />
        </Elements>
      </CardContent>
      <CardFooter />
    </Card>
  )
}
