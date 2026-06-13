import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import SettingsProfile from '../components/SettingsProfile'

type ProfileRow = {
  company_name: string | null
  support_email: string | null
  business_model: string | null
  brand_voice: string | null
}

export default async function Settings() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) redirect('/login')

  const supabase = createServerClient()

  const { data } = await supabase
    .from('users')
    .select('company_name, support_email, business_model, brand_voice')
    .eq('id', session.userId)
    .maybeSingle()

  const profile = data as ProfileRow | null

  return (
    <SettingsProfile
      companyName={profile?.company_name ?? null}
      supportEmail={profile?.support_email ?? null}
      businessModel={profile?.business_model ?? null}
      brandVoice={profile?.brand_voice ?? null}
    />
  )
}
