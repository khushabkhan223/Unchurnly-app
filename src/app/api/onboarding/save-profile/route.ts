import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json()
  const payload =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}

  const { business_description, business_model, brand_voice } = payload

  if (
    typeof business_description !== 'string' || !business_description.trim() ||
    typeof business_model !== 'string' || !business_model.trim() ||
    typeof brand_voice !== 'string' || !brand_voice.trim()
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerClient()
  await supabase
    .from('users')
    .update({ business_description, business_model, brand_voice })
    .eq('id', session.userId)

  return NextResponse.json({ success: true })
}
