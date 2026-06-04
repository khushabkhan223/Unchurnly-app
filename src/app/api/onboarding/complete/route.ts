import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, setSessionCookie } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json().catch(() => ({}))
  const widgetInstalled =
    typeof body === 'object' && body !== null && (body as Record<string, unknown>).widgetInstalled === true

  const supabase = createServerClient()
  await supabase
    .from('users')
    .update({ onboarding_completed: true, widget_installed: widgetInstalled })
    .eq('id', session.userId)

  await setSessionCookie(session.userId, session.email, true)

  return NextResponse.json({ success: true })
}
