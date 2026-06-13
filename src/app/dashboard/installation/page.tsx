import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import InstallationPage from '../components/InstallationPage'

type ConnectionRow = {
  stripe_account_id: string | null
  connected_at: string
  webhook_configured_at: string | null
  stripe_baseline_mrr: number
}

type AppKeyRow = { app_key: string }

export default async function Installation() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()

  const [connResult, keyResult] = await Promise.all([
    supabase
      .from('stripe_connections')
      .select('stripe_account_id, connected_at, webhook_configured_at, stripe_baseline_mrr')
      .eq('user_id', session.userId)
      .maybeSingle(),
    supabase
      .from('founder_app_keys')
      .select('app_key')
      .eq('user_id', session.userId)
      .maybeSingle(),
  ])

  const connection = connResult.data ? (connResult.data as ConnectionRow) : null
  const appKey = keyResult.data ? (keyResult.data as AppKeyRow).app_key : null

  return <InstallationPage connection={connection} appKey={appKey} />
}
