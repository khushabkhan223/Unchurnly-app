import Stripe from 'stripe'
import { verifyCardUpdateToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import { decryptToken } from '@/lib/crypto'
import CardUpdateForm from './CardUpdateForm'

type Props = {
  searchParams: Promise<{ token?: string }>
}

type ConnectionRow = {
  encrypted_access_token: string
}

export default async function CardUpdatePage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return <ErrorPage />
  }

  const tokenData = await verifyCardUpdateToken(token)
  if (!tokenData) {
    return <ErrorPage />
  }

  const { customerId, userId } = tokenData

  const supabase = createServerClient()
  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', userId)
    .maybeSingle()

  if (!connectionData) {
    return <ErrorPage />
  }

  const connection = connectionData as ConnectionRow

  const stripeKey = decryptToken(connection.encrypted_access_token)
  const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  let setupIntent: Stripe.SetupIntent
  try {
    setupIntent = await founderStripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
    })
  } catch {
    return <ErrorPage />
  }

  if (!setupIntent.client_secret) {
    return <ErrorPage />
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <CardUpdateForm
        clientSecret={setupIntent.client_secret}
        publishableKey={publishableKey}
        customerId={customerId}
        userId={userId}
        setupIntentId={setupIntent.id}
      />
    </div>
  )
}

function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-sm text-center p-8">
        <h1 className="text-xl font-semibold text-foreground mb-3">Link unavailable</h1>
        <p className="text-muted-foreground">
          This link has expired or is invalid. Please contact support.
        </p>
      </div>
    </div>
  )
}
