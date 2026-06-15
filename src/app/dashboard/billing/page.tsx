import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import BillingPage from '../components/BillingPage'

type BillingRow = {
  subscription_status: string | null
  first_recovery_at: string | null
  subscribed_at: string | null
  grace_period_ends_at: string | null
}

export default async function Billing() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()

  const { data } = await supabase
    .from('users')
    .select('subscription_status, first_recovery_at, subscribed_at, grace_period_ends_at')
    .eq('id', session.userId)
    .maybeSingle()

  const row = data as BillingRow | null

  return (
    <BillingPage
      subscription_status={row?.subscription_status ?? null}
      first_recovery_at={row?.first_recovery_at ?? null}
      subscribed_at={row?.subscribed_at ?? null}
      grace_period_ends_at={row?.grace_period_ends_at ?? null}
    />
  )
}
