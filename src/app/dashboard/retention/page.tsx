import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import RetentionConfig from '../components/RetentionConfig'

type ConfigRow = {
  pause_enabled: boolean
  discount_enabled: boolean
  discount_percent: number
  downgrade_enabled: boolean
  stripe_coupon_id: string | null
  support_url: string | null
}

const DEFAULTS: ConfigRow = {
  pause_enabled: true,
  discount_enabled: true,
  discount_percent: 20,
  downgrade_enabled: false,
  stripe_coupon_id: null,
  support_url: null,
}

export default async function RetentionPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()
  const { data } = await supabase
    .from('cancel_flow_configs')
    .select('pause_enabled, discount_enabled, discount_percent, downgrade_enabled, stripe_coupon_id, support_url')
    .eq('user_id', session.userId)
    .maybeSingle()

  const config = data ? (data as ConfigRow) : DEFAULTS

  return <RetentionConfig config={config} />
}
