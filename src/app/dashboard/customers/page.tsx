import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import CustomersTable from '../components/CustomersTable'

export type CustomerEvent = {
  type: 'cancellation' | 'dunning'
  email: string
  offer: string
  outcome: string
  mrr: number
  date: string
}

type CancellationRow = {
  id: string
  outcome: string
  created_at: string
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

type SequenceRow = {
  id: string
  status: string
  created_at: string
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
}

function offerFromOutcome(outcome: string): string {
  if (outcome === 'paused') return 'Pause'
  if (outcome === 'discounted') return 'Discount'
  if (outcome === 'completed') return 'Recovered'
  if (outcome === 'active') return 'Dunning'
  return 'None'
}

export default async function CustomersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()

  const [ceResult, seqResult] = await Promise.all([
    supabase
      .from('cancellation_events')
      .select('id, outcome, created_at, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('dunning_sequences')
      .select('id, status, created_at, monitored_customers(mrr_amount, customer_email)')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const cancellations = (ceResult.data ?? []) as unknown as CancellationRow[]
  const sequences = (seqResult.data ?? []) as unknown as SequenceRow[]

  const events: CustomerEvent[] = [
    ...cancellations.map((e) => ({
      type: 'cancellation' as const,
      email: e.monitored_customers?.customer_email ?? '—',
      offer: offerFromOutcome(e.outcome),
      outcome: e.outcome,
      mrr: (e.monitored_customers?.mrr_amount ?? 0) / 100,
      date: e.created_at,
    })),
    ...sequences.map((s) => ({
      type: 'dunning' as const,
      email: s.monitored_customers?.customer_email ?? '—',
      offer: '—',
      outcome: s.status,
      mrr: (s.monitored_customers?.mrr_amount ?? 0) / 100,
      date: s.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return <CustomersTable events={events} />
}
