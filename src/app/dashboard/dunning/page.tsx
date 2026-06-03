import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import DunningTable from '../components/DunningTable'

export type DunningEmail = {
  day_number: number
  status: string
  sent_at: string | null
}

export type DunningSequence = {
  id: string
  email: string
  status: string
  mrr: number
  emails_sent: number
  started_at: string
  dunning_emails: DunningEmail[]
}

type RawSequence = {
  id: string
  status: string
  started_at: string
  completed_at: string | null
  created_at: string
  monitored_customers: { mrr_amount: number | null; customer_email: string | null } | null
  dunning_emails: DunningEmail[]
}

export default async function DunningPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()

  const { data } = await supabase
    .from('dunning_sequences')
    .select(
      'id, status, started_at, completed_at, created_at, monitored_customers(mrr_amount, customer_email), dunning_emails(day_number, status, sent_at)'
    )
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(200)

  const rawSequences = (data ?? []) as unknown as RawSequence[]

  const sequences: DunningSequence[] = rawSequences.map((s) => ({
    id: s.id,
    email: s.monitored_customers?.customer_email ?? '—',
    status: s.status,
    mrr: (s.monitored_customers?.mrr_amount ?? 0) / 100,
    emails_sent: s.dunning_emails.filter((e) => e.status === 'sent').length,
    started_at: s.started_at,
    dunning_emails: s.dunning_emails,
  }))

  return <DunningTable sequences={sequences} />
}
