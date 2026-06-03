import Stripe from 'stripe'
import { verifyHmac } from '@/lib/hmac'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import CancelFlowModal from './CancelFlowModal'

type Props = {
  searchParams: Promise<{ key?: string; customerId?: string; authHash?: string }>
}

type AppKeyRow = { user_id: string; encrypted_app_secret: string }
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

export default async function CancelFlowPage({ searchParams }: Props) {
  const params = await searchParams
  const { key, customerId, authHash } = params

  if (!key || !customerId || !authHash) {
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

  if (!verifyHmac(customerId, authHash, appSecret)) {
    return <ModalError message="Unauthorized." />
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

    const subs = await founderStripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    const sub = subs.data[0]
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
    .eq('user_id', keyRow.user_id)
    .maybeSingle()

  const config = configData ? (configData as ConfigRow) : DEFAULT_CONFIG

  return (
    <CancelFlowModal
      appKey={key}
      customerId={customerId}
      authHash={authHash}
      subscriptionId={subscriptionId}
      customerName={customerName}
      planName={planName}
      amount={amount}
      currency={currency}
      config={config}
    />
  )
}

function ModalError({ message }: { message: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '24px',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <p style={{ color: '#6b7280', margin: 0 }}>{message}</p>
      <button
        onClick={() => window.parent.postMessage('unchurnly:close', '*')}
        style={{
          background: 'none',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '6px 16px',
          cursor: 'pointer',
          color: '#374151',
        }}
      >
        Close
      </button>
    </div>
  )
}
