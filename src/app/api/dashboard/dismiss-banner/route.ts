import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  await supabase
    .from('users')
    .update({ widget_banner_dismissed_at: new Date().toISOString() })
    .eq('id', session.userId)

  return NextResponse.json({ success: true })
}
