import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'
import Sidebar from './components/Sidebar'
import { DashboardHeader } from './components/DashboardHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null

  if (!session) redirect('/login')

  const supabase = createServerClient()
  const { data: userData } = await supabase
    .from('users')
    .select('widget_installed, company_name')
    .eq('id', session.userId)
    .maybeSingle()

  const widgetInstalled = userData?.widget_installed ?? false
  const companyName = userData?.company_name ?? null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userEmail={session.email} widgetInstalled={widgetInstalled} companyName={companyName} />
      <main className="flex-1 flex flex-col min-h-0">
        <DashboardHeader />
        <div className="flex-1 overflow-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
