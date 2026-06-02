'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { setSessionCookie, clearSessionCookie } from '@/lib/session'

export async function createSession(accessToken: string): Promise<void> {
  const supabase = createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken)
  if (error || !user || !user.email) {
    throw new Error('Invalid session')
  }
  await setSessionCookie(user.id, user.email)
}

export async function signOut(): Promise<void> {
  await clearSessionCookie()
  redirect('/login')
}
