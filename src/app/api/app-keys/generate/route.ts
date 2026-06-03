import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { verifySessionToken } from '@/lib/session'
import { encryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'

type AppKeyRow = { app_key: string }

export async function POST() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = cookie ? await verifySessionToken(cookie) : null

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data: existing } = await supabase
    .from('founder_app_keys')
    .select('app_key')
    .eq('user_id', session.userId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ appKey: (existing as AppKeyRow).app_key })
  }

  const appKey = 'unchurnly_live_' + randomBytes(16).toString('hex')
  const appSecret = randomBytes(32).toString('hex')
  const encryptedAppSecret = encryptToken(appSecret)

  const { error } = await supabase.from('founder_app_keys').insert({
    user_id: session.userId,
    app_key: appKey,
    encrypted_app_secret: encryptedAppSecret,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 })
  }

  return NextResponse.json({ appKey, appSecret })
}
