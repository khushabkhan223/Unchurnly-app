import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { setSessionCookie } from '@/lib/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!token_hash || type !== 'email') {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
  }

  const supabase = createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.verifyOtp({ token_hash, type: 'email' })

  if (error || !user || !user.email) {
    return NextResponse.redirect(new URL('/login?error=auth', request.url))
  }

  await setSessionCookie(user.id, user.email)
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
