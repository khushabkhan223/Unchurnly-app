import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { currentPassword, password } =
    body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  if (typeof currentPassword !== 'string' || !currentPassword) {
    return NextResponse.json({ error: 'Current password is required.' }, { status: 400 })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters.' },
      { status: 400 }
    )
  }

  // Verify the current password before allowing the change
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { error: signInError } = await authClient.auth.signInWithPassword({
    email: session.email,
    password: currentPassword,
  })
  if (signInError) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.admin.updateUserById(session.userId, { password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
