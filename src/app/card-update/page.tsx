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
  stripe_publishable_key: string | null
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
    .select('encrypted_access_token, stripe_publishable_key')
    .eq('user_id', userId)
    .maybeSingle()

  if (!connectionData) {
    return <ErrorPage />
  }

  const connection = connectionData as ConnectionRow

  if (!connection.stripe_publishable_key) {
    return <ReconnectPage />
  }

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

  const publishableKey = connection.stripe_publishable_key

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Link unavailable</h1>
        <p className="text-sm text-gray-500">
          This link has expired or is invalid. Please contact support.
        </p>
      </div>
    </div>
  )
}

function ReconnectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Account setup required</h1>
        <p className="text-sm text-gray-500">
          This account needs to update its Stripe connection. Please contact{' '}
          <a href="mailto:support@unchurnly.com" className="underline">
            support@unchurnly.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
