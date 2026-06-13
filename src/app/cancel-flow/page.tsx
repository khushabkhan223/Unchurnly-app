import Stripe from 'stripe'
import { verifyHmac } from '@/lib/hmac'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import CancelFlowModal from './CancelFlowModal'
import ModalError from './ModalError'

type Props = {
  searchParams: Promise<{ key?: string; customerId?: string; authHash?: string }>
}

type AppKeyRow = { user_id: string; encrypted_app_secret: string }
type ConnectionRow = { encrypted_access_token: string }
type HmacConfigRow = { require_hmac: boolean }
type ConfigRow = {
  pause_enabled: boolean
  discount_enabled: boolean
  discount_percent: number
  downgrade_enabled: boolean
  stripe_coupon_id: string | null
}

const DEFAULT_CONFIG: ConfigRow = {
  pause_enabled: true,
  discount_enabled: true,
  discount_percent: 20,
  downgrade_enabled: false,
  stripe_coupon_id: null,
}

export default async function CancelFlowPage({ searchParams }: Props) {
  const params = await searchParams
  const { key, customerId, authHash } = params

  if (!key || !customerId) {
    return <ModalError message="Invalid request." />
  }

  const supabase = createServerClient()

  const { data: keyData } = await supabase
    .from('founder_app_keys')
    .select('user_id, encrypted_app_secret')
    .eq('app_key', key)
    .maybeSingle()

  if (!keyData) {
    return <ModalError message="This link is invalid." />
  }

  const keyRow = keyData as AppKeyRow
  const appSecret = decryptToken(keyRow.encrypted_app_secret)

  const { data: hmacConfigData } = await supabase
    .from('cancel_flow_configs')
    .select('require_hmac')
    .eq('user_id', keyRow.user_id)
    .maybeSingle()

  const requireHmac = (hmacConfigData as HmacConfigRow | null)?.require_hmac ?? false

  if (requireHmac) {
    if (!authHash || !verifyHmac(customerId, authHash, appSecret)) {
      return <ModalError message="Unauthorized." />
    }
  }

  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', keyRow.user_id)
    .maybeSingle()

  if (!connectionData) {
    return <ModalError message="Service not configured." />
  }

  const stripeKey = decryptToken((connectionData as ConnectionRow).encrypted_access_token)
  const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  let customerName = 'there'
  let subscriptionId = ''
  let planName = 'your plan'
  let amount = 0
  let currency = 'usd'

  try {
    const customer = await founderStripe.customers.retrieve(customerId)
    if (customer.deleted) {
      return <ModalError message="Customer not found." />
    }
    customerName = customer.name ?? customer.email ?? 'there'

    const [activeSubs, trialingSubs] = await Promise.all([
      founderStripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 }),
      founderStripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 1 }),
    ])

    const sub = activeSubs.data[0] ?? trialingSubs.data[0]
    if (!sub) {
      return <ModalError message="Your subscription could not be found. Please contact support." />
    }

    subscriptionId = sub.id
    const price = sub.items.data[0]?.price
    planName = price?.nickname ?? 'your plan'
    amount = price?.unit_amount ?? 0
    currency = price?.currency ?? 'usd'
  } catch {
    return <ModalError message="Unable to load subscription details." />
  }

  const { data: configData } = await supabase
    .from('cancel_flow_configs')
    .select('pause_enabled, discount_enabled, discount_percent, downgrade_enabled, stripe_coupon_id')
    .eq('user_id', keyRow.user_id)
    .maybeSingle()

  const config = configData ? (configData as ConfigRow) : DEFAULT_CONFIG

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: monitoredCustomer } = await supabase
    .from('monitored_customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .eq('user_id', keyRow.user_id)
    .maybeSingle()

  let hasActiveOffer = false
  if (monitoredCustomer) {
    const { data: recentOffer } = await supabase
      .from('cancellation_events')
      .select('id')
      .eq('monitored_customer_id', (monitoredCustomer as { id: string }).id)
      .in('outcome', ['discounted', 'paused'])
      .gte('created_at', thirtyDaysAgo)
      .limit(1)
      .maybeSingle()
    hasActiveOffer = !!recentOffer
  }

  return (
    <CancelFlowModal
      appKey={key}
      customerId={customerId}
      authHash={authHash ?? ''}
      subscriptionId={subscriptionId}
      customerName={customerName}
      planName={planName}
      amount={amount}
      currency={currency}
      config={config}
      hasActiveOffer={hasActiveOffer}
    />
  )
}
