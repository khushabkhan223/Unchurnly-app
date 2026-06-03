import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

type AppKeyRow = { app_key: string }

export async function GET() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = cookie ? await verifySessionToken(cookie) : null

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data } = await supabase
    .from('founder_app_keys')
    .select('app_key')
    .eq('user_id', session.userId)
    .maybeSingle()

  return NextResponse.json({ appKey: data ? (data as AppKeyRow).app_key : null })
}
