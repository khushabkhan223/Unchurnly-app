import Stripe from 'stripe'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import CancelFlowModal from '@/app/cancel-flow/CancelFlowModal'
import ModalError from '@/app/cancel-flow/ModalError'
import EmailVerifyFlow from './EmailVerifyFlow'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
type RateLimitEntry = { count: number; windowStart: number }
const rateLimitMap = new Map<string, RateLimitEntry>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  for (const [k, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(k)
  }
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

type Props = {
  params: Promise<{ appKey: string }>
  searchParams: Promise<{ customer?: string }>
}

type AppKeyRow = { user_id: string }
type ConnectionRow = { encrypted_access_token: string }
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

export default async function CancelPage({ params, searchParams }: Props) {
  const { appKey } = await params
  const { customer } = await searchParams

  if (!appKey) {
    return <ModalError message="Invalid link." />
  }

  if (!checkRateLimit(appKey)) {
    return <ModalError message="Too many requests. Please try again later." />
  }

  const supabase = createServerClient()

  const { data: keyData } = await supabase
    .from('founder_app_keys')
    .select('user_id')
    .eq('app_key', appKey)
    .maybeSingle()

  if (!keyData) {
    return <ModalError message="This link is invalid." />
  }

  const { user_id: userId } = keyData as AppKeyRow

  if (!customer) {
    return <EmailVerifyFlow appKey={appKey} />
  }

  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', userId)
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
    const customerData = await founderStripe.customers.retrieve(customer)
    if (customerData.deleted) {
      return <ModalError message="Customer not found." />
    }
    customerName = customerData.name ?? customerData.email ?? 'there'

    const [activeSubs, trialingSubs] = await Promise.all([
      founderStripe.subscriptions.list({ customer, status: 'active', limit: 1 }),
      founderStripe.subscriptions.list({ customer, status: 'trialing', limit: 1 }),
    ])

    const sub = activeSubs.data[0] ?? trialingSubs.data[0]
    if (!sub) {
      return <ModalError message="No active subscription found." />
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
    .eq('user_id', userId)
    .maybeSingle()

  const config = configData ? (configData as ConfigRow) : DEFAULT_CONFIG

  return (
    <CancelFlowModal
      appKey={appKey}
      customerId={customer}
      authHash=""
      subscriptionId={subscriptionId}
      customerName={customerName}
      planName={planName}
      amount={amount}
      currency={currency}
      config={config}
      hasActiveOffer={false}
    />
  )
}
